const fs      = require ('fs');
const path    = require ('path')
const ini     = require ('ini');
/*
Unified Speech Services for free trials on Azure.com. 5,000 transactions per month, 20 per minute. Trial keys will expire after a 30 day period, after which you can create a Cognitive Services account on Azure portal. As part of the bundle, this trial only includes the following: Speech-to-Text, Text-to-Speech, Speech Translation.


to trim silence from the end (what about start?)
https://digitalcardboard.com/blog/2009/08/25/the-sox-of-silence/comment-page-2/
sox in.wav out.wav reverse silence 1 0.0 1% reverse
sox in.wav out.wav silence 1 0.0 1% reverse silence 1 0.0 1% reverse <--start too?
This still leaves a bit of silence.

https://github.com/ArtskydJ/sox-stream


[
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (he-IL, HilaNeural)',
    DisplayName: 'Hila',
    LocalName: 'הילה',
    ShortName: 'he-IL-HilaNeural',
    Gender: 'Female',
    Locale: 'he-IL',
    LocaleName: 'Hebrew (Israel)',
    SampleRateHertz: '48000',
    VoiceType: 'Neural',
    Status: 'GA',
    WordsPerMinute: '113'
  },
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (he-IL, AvriNeural)',
    DisplayName: 'Avri',
    LocalName: 'אברי',
    ShortName: 'he-IL-AvriNeural',
    Gender: 'Male',
    Locale: 'he-IL',
    LocaleName: 'Hebrew (Israel)',
    SampleRateHertz: '48000',
    VoiceType: 'Neural',
    Status: 'GA',
    WordsPerMinute: '106'
  }
]


*/
//https://northeurope.api.cognitive.microsoft.com/

const credentialPath = path.join(__dirname, '../creds.ini')
const credentialFileContents = fs.readFileSync(credentialPath, 'utf-8');
var config = ini.parse(credentialFileContents);

var subscriptionKey = config.default.azure_key;
var region=config.default.azure_region;
if(!subscriptionKey || !region) throw new Error('Missing Azure credentials `azure_key` `azure_region` in creds.ini file.');


const Promise = require('bluebird');

const exec = require('util').promisify(require('child_process').exec); //for using Sox


const sox = require('sox-stream');
var PassThrough = require('stream').PassThrough;

const removeSilencePadding16 = sox({
	output: { type: 'wav',rate: 16000 }
	,effects: [ //silence [−l] above-periods [duration threshold[d|%]
		'silence 1 0.0 0%'
		,'reverse'  //reverse to do the end, too.
		,'silence 1 0.0 0%'
		,'reverse' ///reverse it back
		]
	});
const removeSilencePadding8 = sox({
	output: { type: 'wav',rate: 8000 }
	,effects: [ //silence [−l] above-periods [duration threshold[d|%]
		'silence 1 0.0 0%'
		,'reverse'  //reverse to do the end, too.
		,'silence 1 0.0 0%'
		,'reverse' ///reverse it back
		]
	});
const downsample16000 = sox({
	output: {rate: 16000, type: 'wav' }
	});
const downsample8000 = sox({
	output: {rate: 8000, type: 'wav' }
	});

//Hebrew: "he-IL-Asaf"
//English, neural: "en-US-GuyNeural"


// Requires request and request-promise for HTTP requests
// e.g. npm install request request-promise
const rp = require('request-promise');
// Requires fs to write synthesized speech to a file

// Requires readline-sync to read command line inputs
//const readline = require('readline-sync');
// Requires xmlbuilder to build the SSML body
const xmlbuilder = require('xmlbuilder');


// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://'+region+'.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

function generatePath(file, folder, hz){
	const extension='.wav';
	var savePathFile = 'avri/';
	if(folder) savePathFile = savePathFile + folder + '/';//add folder if we set one
	//if(hz==24000) hz=32000;
	savePathFile = savePathFile + hz+'/'+ file + extension;
	//console.log(savePathFile);
	return savePathFile;
	}

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
async function textToSpeech(accessToken, text, saveAs, folder) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
		//.att('xml:lang', 'en-us')
		.att('xml:lang', 'he-il')
        .ele('voice')
		//.att('xml:lang', 'en-us').att('xml:gender', 'Male').att('name', 'en-US-GuyNeural')
		//.att('xml:lang', 'he-il').att('xml:gender', 'Male')
		.att('name', 'he-IL-AvriNeural')
		//.att('name','en-GB-George-Apollo')
		//.ele('prosody').att('rate','-25%') Hebrew is very fast!
		//.att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)')
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://'+region+'.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'BestFone-Sound-Generation',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm', //https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }
	const savePath=generatePath(saveAs,folder,24000);
	console.log(savePath);
	await fs.promises.mkdir(path.dirname(savePath), { recursive: true });

	const savePath16=savePath.replace('24000','16000');
	await fs.promises.mkdir(path.dirname(savePath16), { recursive: true });

	const savePath8=savePath.replace('24000','8000');
	await fs.promises.mkdir(path.dirname(savePath8), { recursive: true });


    let request = rp(options)
        .on('response', async function (response) {
            if (response.statusCode === 200) {
				const saveFileStream = request.pipe(fs.createWriteStream(savePath));//.pipe(PassThrough)
				//saveFileStream.pipe(fs.createWriteStream(savePath));
				saveFileStream.on('close',async function(){
					const command1 = `sox ${savePath} ${savePath16} rate 16000 silence 1 0.0 0% reverse silence 1 0.0 0% reverse`;
					const command2 =   `sox ${savePath} ${savePath8} rate 8000 silence 1 0.0 0% reverse silence 1 0.0 0% reverse`;
					console.log(command1);
					console.log(command2);
					const { stdout, stderr } = await exec(command1);
					if(stdout) console.log('stdout:', stdout);
					if(stderr) console.log('stderr:', stderr);
					const { stdout2, stderr2 } = await exec(command2);
					if(stdout2) console.log('stdout:', stdout2);
					if(stderr2) console.log('stderr:', stderr2);
					})
				console.log('\nYour file is ready.\n')
            }
        });
    return request;
}

// Use async and await to get the token before attempting
// to convert text to speech.
async function main() {
    // Reads subscription key from env variable.
    // You can replace this with a string containing your subscription key. If
    // you prefer not to read from an env variable.
    // e.g. const subscriptionKey = "your_key_here";
    if(!subscriptionKey) subscriptionKey = process.env.SPEECH_SERVICE_KEY;
    if(!subscriptionKey) throw new Error('Environment variable for your subscription key is not set.')

	// Prompts the user to input text.
	//const text = readline.question('What would you like to convert to speech? ');
	//const text = "Please enter your 7 digit class number."
	
	//var text ="אָנָא הִכַּנֵס אֶתּ מִסְפָּר הַכִּיתָּה שֶל 7 מִסְפָּרִים.";
	//const accessToken = await getAccessToken(subscriptionKey);
	//await textToSpeech(accessToken, text, 'enter7-digits-en-gb');

	//const text = "אנא הכנס את מספר הכיתה של 7 מספרים.";
	//const text ="אָנָא הִכַנֵס אֶת מִסְפַר הַכִיתָה שֶל 7 מִסְפָרִים.";
	//const 
	//const text = "אתה מושתק עכשיו";

	var convert = [
		/*["0", "אֶפֶס"]
		,["1", "אֶחַד"]
		,["2", "שְׁנַיִם"]
		,["3", "שְׁלוֹשָׁה"]
		,["4", "אַרְבָּעָה"]
		,["5", "חֲמִשָׁה"]
		,["6", "שִׁשָּׁה"]
		,["7", "שִׁבְעַה"]
		,["8", "שְׁמוֹנָה"]
		,["9", "תִּשְׁעָה"]
		,["#", "סולמית"]*/
		//["vi", "וְ"]
		//["30", "שְׁלוֹשִׁים"]

	];
	//convert = require('./he-digits');
	convert = require('./he-currency');
    try {
		const accessToken = await getAccessToken(subscriptionKey);
		//console.log(accessToken);
		if(accessToken) console.log('accessToken:', 'TRUE')


		console.log(convert)

		await Promise.mapSeries(convert, async function(arg){
			//console.log(arg)
			await textToSpeech(accessToken,arg[0],arg[1],'currency');
			})
        //await textToSpeech(accessToken, text, 'saveName');
    } catch (err) {
        console.log(`Something went wrong:`);
		console.error(err)
    }
}

main()

async function getVoiceList(language){
	const accessToken = await getAccessToken(subscriptionKey);
    let options = {
        method: 'GET',
        baseUrl: 'https://'+region+'.tts.speech.microsoft.com/',
        url: 'cognitiveservices/voices/list',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'BestFone-Sound-Generation',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm', //https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
            'Content-Type': 'application/ssml+xml'
        },
        //body: body
    	}
	var result = await rp(options);
	//console.log(result);
	result = JSON.parse(result)
	console.log('total length',result.length)
	if(language) result = result.filter(function(item) { return item.Locale === language;})
	console.log(result);
	}
//getVoiceList('he-IL');


/*
ivr/ivr-that_was_an_invalid_entry.wav
ivr/ivr-recording_started.wav
ivr/ivr-recording_stopped.wav

conference/conf-listeners_in_conference.wav -- should have?


voicemail/vm-abort.wav
conference/conf-goodbye.wav

*/