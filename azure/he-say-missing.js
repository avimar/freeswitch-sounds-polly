// Files mod_say_he asks for that he-avri did not have yet: [text, file name, folder]
// Generate with: node azure/generate-he.js make azure/he-say-missing.js
module.exports = [
	["בְּמִסְפָּר", "in_number", "digits"]

	, ["שָׁעָה", "hour", "time"]
	, ["שָׁעוֹת", "hours", "time"]
	, ["דַּקָּה", "minute", "time"]
	, ["דַּקּוֹת", "minutes", "time"]
	, ["שְׁנִיָּה", "second", "time"]
	, ["שְׁנִיּוֹת", "seconds", "time"]
	, ["הַיּוֹם", "today", "time"]
	, ["אֶתְמוֹל", "yesterday", "time"]
	, ["בְּ", "at", "time"] // said before the month: "15 בְּינואר"
	, ["בְּשָׁעָה", "at-hour", "time"]
	, ["לִפְנֵי הַצָּהֳרַיִם", "a-m", "time"]
	, ["אַחַר הַצָּהֳרַיִם", "p-m", "time"]

	// day-0 is Sunday
	, ["יוֹם רִאשׁוֹן", "day-0", "time"]
	, ["יוֹם שֵׁנִי", "day-1", "time"]
	, ["יוֹם שְׁלִישִׁי", "day-2", "time"]
	, ["יוֹם רְבִיעִי", "day-3", "time"]
	, ["יוֹם חֲמִישִׁי", "day-4", "time"]
	, ["יוֹם שִׁשִּׁי", "day-5", "time"]
	, ["שַׁבָּת", "day-6", "time"]

	// mon-0 is January
	, ["יָנוּאָר", "mon-0", "time"]
	, ["פֶבְּרוּאָר", "mon-1", "time"]
	, ["מֶרְץ", "mon-2", "time"]
	, ["אַפְּרִיל", "mon-3", "time"]
	, ["מַאי", "mon-4", "time"]
	, ["יוּנִי", "mon-5", "time"]
	, ["יוּלִי", "mon-6", "time"]
	, ["אוֹגוּסְט", "mon-7", "time"]
	, ["סֶפְּטֶמְבֶּר", "mon-8", "time"]
	, ["אוֹקְטוֹבֶּר", "mon-9", "time"]
	, ["נוֹבֶמְבֶּר", "mon-10", "time"]
	, ["דֶּצֶמְבֶּר", "mon-11", "time"]
];
