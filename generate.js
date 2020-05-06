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
const ini     = require ('ini');
const Promise = require('bluebird'); //for running with limit concurrency, a standard forEach will queue all at once.
const FileWriter = require('wav').FileWriter;

function Polly (credentials,region){
	var config = ini.parse (fs.readFileSync (credentials, 'utf-8'));
	region = region ? region : config.default.aws_region; //use the ini if we don't pass in a region, giving the file preference to change on the fly
	this._key = { accessKeyId: config.default.aws_access_key_id, secretAccessKey: config.default.aws_secret_access_key };
	this._req = { service: 'polly', region: region, signQuery: true };
	//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly.html

	this._say = {
		OutputFormat: 'pcm'  //pcm, mp3, ogg_vorbis
		, VoiceId: 'Matthew' // see https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
		, Engine: 'neural' // neural || standard 
		//,SampleRate: '24000' //8000, or upto 16000 for pcm
		//The valid values for mp3 and ogg_vorbis are "8000", "16000", "22050", and "24000". The default value for standard voices is "22050". The default value for neural voices is "24000".
		//Valid values for pcm are "8000" and "16000" The default value is "16000".

		//English British: Brian
		//English American: Joey
		//English American: Matthew -- both Conversational and Newscaster https://docs.aws.amazon.com/polly/latest/dg/ntts-speakingstyles.html
		//,TextType: 'ssml' //ssml / text
		};

	this.saveFile = function (utterance, file){
		var parent = this;
		return new Promise(function (resolve, reject) {
			var extension;
			if(parent._say.OutputFormat=="pcm") extension='.wav';
			else if(parent._say.OutputFormat=="ogg_vorbis") extension='.ogg';
			else extension='.'+parent._say.OutputFormat;
			
			var path = parent._say.VoiceId + '-' + parent._say.Engine + '/' + file + extension;
			//(parent._say.SampleRate||16000)+'/'

			var saveFileStream;
			if(parent._say.OutputFormat=="pcm"){//if PCM, then save as .wav with proper headers
				saveFileStream = new FileWriter(path, {
					sampleRate: parent._say.SampleRate||16000,//it's set to 8k or default 16k
					channels: 1
					});
				}
			else saveFileStream = fs.createWriteStream(path);

			parent._say.Text = utterance;
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
						console.log('finished',utterance);
						resolve();
						})
					.on('error',reject);
				})
			.end();
		});
	}
}



var list = {
	"conf-muted": "You are now muted."
	,"conf-unmuted": "You are now unmuted."
	,"conf-goodbye": "goodbye"
	,"conf-enter_conf_number": "Please enter the conference number, followed by the pound key"
	,"conf-being_recorded": "This conference is being recorded."
	,"conf-bad-number": "Invalid conference number"
	,"conf-waiting-moderator": "Waiting for the teacher to start"
	,"conf-listeners_in_conference": "...listeners in this conference."
	,"conf-listener_in_conference": "...listener in this conference."
	,"conf-hand-raised":"Your hand is now raised"
	,"conf-hand-lowered": "Your hand is now lowered"
	,"you-are-number": "You are num-ber" //weird! it drops the B for some reason in "number"
	,"listeners": "listeners"
	,"listener": "listener"
	,"question-asked": "Question!"
	,"questions-removed": "questions removed"
	,"question-removed": "question removed"
	,"questions": "questions"
	,"no questions removed": "No questions removed"
	,"all-students-muted": "All students are now muted"
	,"line-open": "Line is now open"
	,"line-closed": "Line is now closed"
	//"question-askedSoft": '<speak><amazon:effect phonation="soft">Question!</amazon:effect></speak>' // NON-neural!
	};
const listDigits={
"0":"Zero"
,"1":"One"
,"2":"Two"
,"3":"Three"
,"4":"Four"
,"5":"Five"
,"6":"Six"
,"7":"Seven"
,"8":"Eight"
,"9":"Nine"
,"10":"Ten"
,"11":"Eleven"
,"12":"Twelve"
,"13":"Thirteen"
,"14":"Fourteen"
,"15":"Fifteen"
,"16":"Sixteen"
,"17":"Seventeen"
,"18":"Eightteen"
,"19":"Nineteen"
,"20":"Twenty"
,"30":"Thirty"
,"40":"Fourty"
,"50":"Fifty"
,"60":"Sixty"
,"70":"Seventy"
,"80":"Eighty"
,"90":"Ninety"
,"dot":"Dot"
,"h-1":"First"
,"h-2":"Second"
,"h-3":"Third"
,"h-4":"Fourth"
,"h-5":"Fifth"
,"h-6":"Sixth"
,"h-7":"Seventh"
,"h-8":"Eighth"
,"h-9":"Nineth"
,"h-10":"Tenth"
,"h-11":"Eleventh"
,"h-12":"Twelveth"
,"h-13":"Thirteenth"
,"h-14":"Fourteenth"
,"h-15":"Fifteenth"
,"h-16":"Sixteenth"
,"h-17":"Seventeenth"
,"h-18":"Eighteenth"
,"h-19":"Nineteenth"
,"h-20":"Twentieth"
,"h-30":"Thirtieth"
,"hundred":"Hundred"
,"thousand":"Thousand"
,"million":"Million"
,"period":"Period"
,"point":"Point"
,"pound":"Pound"
,"star":"Star"
}


var currency={
	"and": "And"
	,"cent": "Cent"
	,"central": "Central"
	,"cents-per-minute": "cents per minute"
	,"1-cent-per-minute": "1 cent per minute"
	,"cents": "Cents"
	,"dollar": "Dollar"
	,"dollars": "Dollars"
	,"minus": "Minus"
	,"negative": "Negative"
	};

var polly = new Polly ('./creds.ini', );

list = Object.entries(list);
//list.forEach(s=> polly.saveFile(s[1],s[0]));

const util = require('util');
const exec = util.promisify(require('child_process').exec);

/*  try {
    const { stdout, stderr } = await exec('ls');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
}*/

//list = [list[0]];




Promise.map(list
	, s=>polly.saveFile(s[1],s[0])
	//,s=>exec(`sox Matthew-neural/ivr/16000/${s[0]}.wav Matthew-neural/ivr/8000/${s[0]}.wav rate 8000`)
	, {concurrency:1});