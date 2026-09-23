// Retakes of he-avri files that sounded wrong glued together (2026-09-24 review).
// Made into he-avri-variants/ for listening; the chosen take gets copied over the he-avri file.
// Generate with: node azure/generate-he.js make azure/he-say-variants.js he-avri-variants
// [text, file name, folder, rate]
// Chosen and copied into he-avri: shney.v1, 2.v2, 19.v3, minutes.v1 (round 2); p-m.v2, a-m.v2 (round 3).
// Round 3 kept the current 9, 14 and the-hour is still undecided.
module.exports = [
	// shney: the shin was missing
	["שְׁנֵי", "shney.v1", "digits", "+20%"]
	, ["שְׁנֵי", "shney.v2", "digits", "+0%"]
	, ["שני", "shney.v3", "digits", "+0%"]

	// 2 (feminine): stuttered "shtee-ei-yim"
	, ["שְׁתַּיִם", "2.v1", "digits", "+0%"]
	, ["שתיים", "2.v2", "digits", "+20%"]
	, ["שתיים", "2.v3", "digits", "+0%"]

	// 19 (feminine): "esrah" instead of "esrei"
	, ["תְּשַׁע עֶשְׂרֵה", "19.v1", "digits", "+20%"]
	, ["תשע עשרה", "19.v2", "digits", "+20%"]
	, ["תְּשַׁע-עֶשְׂרֵה", "19.v3", "digits", "+0%"]

	// minutes: "dakavot"
	, ["דקות", "minutes.v1", "time", "+20%"]
	, ["דַּקוֹת", "minutes.v2", "time", "+20%"]
	, ["דקות", "minutes.v3", "time", "+0%"]

	// p-m / a-m: too fast next to the other words
	, ["אַחַר הַצָּהֳרַיִם", "p-m.v1", "time", "+0%"]
	, ["אחר הצהריים", "p-m.v2", "time", "+0%"]
	, ["אחר הצהריים", "p-m.v3", "time", "+10%"]
	, ["לִפְנֵי הַצָּהֳרַיִם", "a-m.v1", "time", "+0%"]
	, ["לפני הצהריים", "a-m.v2", "time", "+0%"]

	// round 3: 14 (feminine) said "esrah", 9 (feminine) sounded different. Same style as the chosen 19.v3
	, ["אַרְבַּע-עֶשְׂרֵה", "14.v1", "digits", "+0%"]
	, ["ארבע עשרה", "14.v2", "digits", "+20%"]
	, ["תֵּשַׁע", "9.v1", "digits", "+0%"]
	, ["תשע", "9.v2", "digits", "+20%"]

	// round 4: 2010 (feminine 10) marked bad, no note
	, ["עֶשֶׂר", "10.v1", "digits", "+0%"]
	, ["עשר", "10.v2", "digits", "+20%"]

	// "the time is": a possible replacement intro for the current time
	, ["הַשָּׁעָה", "the-hour.v1", "time", "+20%"]
	, ["השעה", "the-hour.v2", "time", "+0%"]
];
