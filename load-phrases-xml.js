function parseFile(file){
	const parser = require('fast-xml-parser');
	const allPhrases = require('fs').readFileSync(file, {encoding: 'utf8'});

	function parseAttribute (val, attrName) {
		if(attrName="filename") return val.replace('.wav','');
		else return val;
		}

	var jsonObj = parser.parse(allPhrases, {ignoreAttributes :false, attributeNamePrefix:'',   attrValueProcessor: parseAttribute });
	
	//un-nest to our actual data -- assuming: <language><SOME-LANGUAGE, e.g. en, es>
	jsonObj = jsonObj.language;
	const language = Object.keys(jsonObj);
	jsonObj=jsonObj[language[0]];

	//remove the unnecessary .prompt in every section 
	var keys = Object.keys(jsonObj);
	console.log(keys);
	keys.forEach(function(value){
		jsonObj[value] = jsonObj[value].prompt;
		})

	//remove where there's at type -- music or tone.
	jsonObj.conference = jsonObj.conference.filter(data => !data.type);

	//console.log(require('util').inspect(jsonObj, {showHidden: false, depth: null, colors:true}))
	return jsonObj;
	}
module.exports = parseFile;