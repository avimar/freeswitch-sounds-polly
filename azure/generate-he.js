// Make he-avri sound files with the same voice as azure.js: Azure he-IL-AvriNeural, +20% rate by default.
// The 24000 file is kept as Azure returns it. The 16000 and 8000 copies are trimmed and resampled from it.
//
//   node azure/generate-he.js make <list.js> [pack folder, default he-avri]
//       A list is [text, file name, folder, rate?] rows, e.g. azure/he-say-missing.js.
//       Existing files are skipped, so a rerun only fills gaps.
//   node azure/generate-he.js retrim [folder ...]
//       Rebuild the 16000 and 8000 copies from 24000 for these he-avri folders (default: digits currency time).
//
// Trim: cut quiet (-45 dB) lead and tail, keep 30 ms each side so words don't clip.
// The "and" prefixes (va, ve, uu) and "at" keep no tail, so they run into the next word.
// Tried 2026-09-24: cutting the prefix off the front of a whole word ("ve'echad" minus "echad") sounded worse
// than these standalone recordings, so they stay.
// Needs ffmpeg on PATH. Reads azure_key and azure_region from creds.ini at runtime.
const fs = require('fs');
const path = require('path');
const ini = require('ini');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const AND_PREFIXES = ['va', 've', 'uu', 'at'];

function readCreds() {
	const config = ini.parse(fs.readFileSync(path.join(root, 'creds.ini'), 'utf-8'));
	if (!config.default.azure_key || !config.default.azure_region) throw new Error('Missing `azure_key` / `azure_region` in creds.ini');
	return config.default;
}

function escapeXml(text) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function synthesize(creds, text, rate) {
	const ssml = `<speak version="1.0" xml:lang="he-il"><voice name="he-IL-AvriNeural"><prosody rate="${rate}">${escapeXml(text)}</prosody></voice></speak>`;
	const response = await fetch(`https://${creds.azure_region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
		method: 'POST',
		headers: {
			'Ocp-Apim-Subscription-Key': creds.azure_key,
			'User-Agent': 'BestFone-Sound-Generation',
			'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
			'Content-Type': 'application/ssml+xml'
		},
		body: ssml
	});
	if (!response.ok) throw new Error(`Azure TTS ${response.status}: ${await response.text()}`);
	return Buffer.from(await response.arrayBuffer());
}

function trimAndResample(input, output, rate, name) {
	const tail = AND_PREFIXES.includes(name.split('.')[0]) ? '0' : '0.03'; // "va.v1" is a take of va
	const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,'
		+ `silenceremove=start_periods=1:start_threshold=-45dB:start_silence=${tail},areverse`;
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-af', trim, '-ar', String(rate), '-ac', '1', '-c:a', 'pcm_s16le', output]);
}

function makeCopies(packDir, folder, name) {
	const file24 = path.join(packDir, folder, '24000', name + '.wav');
	for (const rate of [16000, 8000]) {
		fs.mkdirSync(path.join(packDir, folder, String(rate)), { recursive: true });
		trimAndResample(file24, path.join(packDir, folder, String(rate), name + '.wav'), rate, name);
	}
}

async function make(listFile, pack) {
	const creds = readCreds();
	const packDir = path.join(root, pack || 'he-avri');
	const list = require(path.resolve(listFile));

	for (const [text, name, folder, rate] of list) {
		const file24 = path.join(packDir, folder, '24000', name + '.wav');
		if (fs.existsSync(file24)) {
			console.log(`skip  ${folder}/${name} (exists)`);
			continue;
		}
		fs.mkdirSync(path.dirname(file24), { recursive: true });
		fs.writeFileSync(file24, await synthesize(creds, text, rate || '+20%'));
		makeCopies(packDir, folder, name);
		console.log(`made  ${folder}/${name}  ${text}  ${rate || '+20%'}`);
	}
}

function retrim(folders) {
	const packDir = path.join(root, 'he-avri');
	for (const folder of folders.length ? folders : ['digits', 'currency', 'time']) {
		const names = fs.readdirSync(path.join(packDir, folder, '24000')).filter(f => f.endsWith('.wav')).map(f => f.slice(0, -4));
		for (const name of names) makeCopies(packDir, folder, name);
		console.log(`retrimmed ${names.length} files in ${folder}`);
	}
}

async function main() {
	const [command, ...args] = process.argv.slice(2);
	if (command === 'make' && args[0]) return make(args[0], args[1]);
	if (command === 'retrim') return retrim(args);
	throw new Error('Usage: node azure/generate-he.js make <list.js> [pack folder] | retrim [folder ...]');
}

main().catch(function (err) {
	console.error(err.message);
	process.exit(1);
});
