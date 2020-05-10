/* Based on via: https://gist.github.com/pete-rai/dc894c13f11de6e9634eb3379fb39c3b
first install the following node modules:
	   npm install aws4
	   npm install ini
	   npm install wav -- for creating the WAV header for the PCM files
	   npm install bluebird -- to run one conversion at a time, or up it to more.

also sure that you have an accessible file which contains your aws
credentials in this form:
	   [default]
	   aws_access_key_id = YOUR_ACCESS_KEY_ID
	   aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
	   aws_region = eu-west-1
*/

const aws4    = require ('aws4');
const https   = require ('https');
const query   = require ('querystring');
const fs      = require ('fs');
const path    = require ('path')
const ini     = require ('ini');
const Promise = require('bluebird'); //for running with limit concurrency, a standard forEach will queue all at once and amazon will return errors
const FileWriter = require('wav').FileWriter;
const exec = require('util').promisify(require('child_process').exec); //for using Sox


function Polly (credentials,region){
	this._chars={standard:0, neural:0};
	this._filesToGenerate=0;
	var config = ini.parse (fs.readFileSync (credentials, 'utf-8'));
	region = region ? region : config.default.aws_region; //use the ini if we don't pass in a region, giving the file preference to change on the fly
	this._key = { accessKeyId: config.default.aws_access_key_id, secretAccessKey: config.default.aws_secret_access_key };
	this._req = { service: 'polly', region: region, signQuery: true };
	//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly.html

	this._say = {
		OutputFormat: 'pcm'  //pcm, mp3, ogg_vorbis
		, VoiceId: 'Matthew' // see https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
		, Engine: 'neural' // neural || standard 
		,SampleRate: '16000' //8000, or upto 16000 for pcm
		//The valid values for mp3 and ogg_vorbis are "8000", "16000", "22050", and "24000". The default value for standard voices is "22050". The default value for neural voices is "24000".
		//Valid values for pcm are "8000" and "16000" The default value is "16000".

		//English British: Brian
		//English American: Joey
		//English American: Matthew -- both Conversational and Newscaster https://docs.aws.amazon.com/polly/latest/dg/ntts-speakingstyles.html
		//English American, Neural, Female: Joanna
		//,TextType: 'ssml' //ssml / text
		};
	console.log("Initialized with voice",this._say.VoiceId,this._say.Engine);

	this.generatePath = function(file, folder){
		var extension;
		if(this._say.OutputFormat=="pcm") extension='.wav';
		else if(this._say.OutputFormat=="ogg_vorbis") extension='.ogg';
		else extension='.'+this._say.OutputFormat;

		var savePathFile = this._say.VoiceId + '-' + this._say.Engine + '/';
		if(folder) savePathFile = savePathFile + folder + '/';//add folder if we set one
		savePathFile = savePathFile + (this._say.SampleRate||16000)+'/'+ file + extension;
		//console.log(savePathFile);
		return savePathFile;
		}
	this.saveFile = async function (text, file, folder, options={}){
		var savePathFile = await this.generatePath(file, folder);
		if(options.skipExisting) {
			const alreadyExists=await fs.promises.access(savePathFile).then(s=>true).catch(s=>false);//throws if not exists, otherwise no value
			if(alreadyExists) {
				console.log('skipping '+savePathFile);
				return;
				}
			}
		
		this._chars[this._say.Engine]+=text.length;
		if(options.dryRun) {
			console.log('would generate '+savePathFile);
			this._filesToGenerate++;
			return;
			}

		var parent = this;
		return new Promise(async function (resolve, reject) {
			//make sure folder exists
			await fs.promises.mkdir(path.dirname(savePathFile), { recursive: true })

			var saveFileStream;
			if(parent._say.OutputFormat=="pcm"){//if PCM, then save as .wav with proper headers
				saveFileStream = new FileWriter(savePathFile, {
					sampleRate: parent._say.SampleRate||16000,//it's set to 8k or default 16k
					channels: 1
					});
				}
			else saveFileStream = fs.createWriteStream(savePathFile);

			parent._say.Text = text;
			//this._say.Text = '<speak><amazon:domain name="news">'+utterance+'</amazon:domain></speak> '; //<amazon:domain name="conversational">
			//this._say.Text = '<speak><amazon:effect phonation="soft">'+utterance+'</amazon:effect></speak>';
			parent._req.path = '/v1/speech?' + query.stringify (parent._say);


			//console.log(parent._req, parent._key, parent._say)
			https.request (aws4.sign (parent._req, parent._key), function (audio){
				if (audio.statusCode !== 200) {
					console.error(audio.body);
					throw new Error(`Request Failed. Status Code: ${audio.statusCode}`)
					}
				audio.pipe (saveFileStream)
					.on('finish',function(s){
						console.log('finished',savePathFile,text);
						resolve();
						})
					.on('error',reject);
				})
			.end();
		});
	}
}







var polly = new Polly ('./creds.ini');
process.on('exit', function (){
	console.log(polly._chars);
	const chars = polly._chars.standard + polly._chars.neural*4;
	console.log("Cost: $" + (chars/1000000*4).toFixed(4));
	if(this._filesToGenerate) console.log('DRY RUN: files to generate',this._filesToGenerate);
	});


//LOAD THE PHRASES FILE
//each category is an array, with objects of:  phrase & filename { phrase: 'And', filename: 'and' }
const allPhrases = require('./load-phrases-xml.js')('./phrases_en.xml');
const allTypes = Object.keys(allPhrases);
//list = [{phrase:"For information about FreeSWITCH, press", filename:"misc-information_about_freeswitch"}];
//list = [{phrase:'<speak>Some audio is difficult to hear in a moving vehicle, but <amazon:effect name="drc"> this audio is less difficult to hear in a moving vehicle.</amazon:effect> </speak>', filename:"test-drc"}];


/************ Activation code -- sets the category, list of files, and which function to run ******************/
//Do All Types:
Promise.mapSeries(allTypes, async function(category){
	console.log(category)
	var options = {
		category
		,dryRun: false
		,skipExisting: true
		}; 
	const tts = await runTTS(allPhrases[category], options);
	if(!options.dryRun) runConversion(allPhrases[category],options);

	}, {concurrency:3})
//const category= 'directory'
//var list = allPhrases['ivr'];
//list = require('./phrases-class.js');
//runTTS({dryRun:true,skipExisting:false});
//runTTS().then(runConversion);




/* Try these with SSML?
,"ivr-you_are_number_one" : "You are caller number one. Of course, *every* caller is number one in our book so you may be waiting a while."
,"ivr-terribly_wrong_awkward" : "Something went terribly, terribly wrong... (awkward!)"
,"ivr-it_was_that_bug" : "Well I'll be a monkey's bitch! It *was* that bug!"
*/

//const category="class";
/*list = [
		//['Please hold on the line for your class to start.','hold-wait-teacher','class']
		//,['You are currently the only person in this conference. Please wait for others to join.','hold-wait-for-others','class']
		//['<speak><amazon:effect phonation="soft">Question!</amazon:effect></speak>','question-askedSoft','class']// NON-neural!
		['Question!','question-askedSoft','class']
		];*/


function runTTS(list, options){
	return Promise.map(list
		, function(data){
			return polly.saveFile(data.phrase, data.filename, options.category, options);
			//console.log(data.phrase, data.filename, category);
			}
		, {concurrency:3});	
		}


function runConversion(list,options){
	return Promise.map(list
		,async function(data){
			try {
				const savePathFile = polly.generatePath(data.filename, options.category);
				const destinationPath = savePathFile.replace('16000','8000');

				const sourceExists=await fs.promises.access(savePathFile).then(s=>true).catch(s=>false);//throws if not exists, otherwise no value
				if(!sourceExists) return console.debug('ERROR for sox conversion: file not found '+savePathFile);
	
				if(options.skipExisting) {//skip converting when we have a remote file already
					const alreadyExists=await fs.promises.access(destinationPath).then(s=>true).catch(s=>false);//throws if not exists, otherwise no value
					if(alreadyExists) return console.log('skipping '+savePathFile);
					}

				await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });

				const command = `sox ${savePathFile} ${destinationPath} rate 8000`;
				console.log(command);
				const { stdout, stderr } = await exec(command);
				if(stdout) console.log('stdout:', stdout);
				if(stderr) console.log('stderr:', stderr);
				}
			catch (e) {
				console.error(e); // should contain code (exit code) and signal (that caused the termination).
				}
			}
		, {concurrency:3});	
	}