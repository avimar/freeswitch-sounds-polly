const parser = require('fast-xml-parser');
const allPhrases = require('fs').readFileSync('./phrases_en.xml', {encoding: 'utf8'});

function parseAttribute (val, attrName) {
	if(attrName="filename") return val.replace('.wav','');
	else return val;
	}

var jsonObj = parser.parse(allPhrases, {ignoreAttributes :false, attributeNamePrefix:'',   attrValueProcessor: parseAttribute });
jsonObj = jsonObj.language.en;//un-nest to our actual data

//remove the unnecessary .prompt in every section 
var keys = Object.keys(jsonObj);
keys.forEach(function(value){
	jsonObj[value] = jsonObj[value].prompt;
	})

//remove where there's at type -- music or tone.
jsonObj.conference = jsonObj.conference.filter(data => !data.type);

//console.log(require('util').inspect(jsonObj, {showHidden: false, depth: null, colors:true}))

module.exports = jsonObj;