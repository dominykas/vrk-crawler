var _ = require("lodash");
var normalize = require("./lib/normalize");

var allResults = require("./data/2012-all-results.json");
var changes = require("./data/2016-vrk-changes.json");

var changesMap = _(changes)
	.groupBy("apygOld")
	.mapValues((g) => _.indexBy(g, "apyl"))
	.value();

var notFound = [];

var fullInfo = allResults.map(function (row) {
	var apygMatches = row.apyg.match(/(.*) \(Nr.(\d+)\) apygarda$/);
	if (!apygMatches) {
		console.error("Could not parse apyg", row.apyg);
		process.exit();
	}

	var apylMatches = row.apyl.match(/(.*) \(Nr.(\d+)\) apylink..$/);
	if (!apylMatches) {
		console.error("Could not parse apyl", row.apyl);
		process.exit();
	}

	var parsedNames = {
		apygOld: normalize(apygMatches[1]),
		apygOldNum: parseInt(apygMatches[2], 10),
		apylName: normalize(apylMatches[1]),
		apylNum: parseInt(apylMatches[2], 10)
	};

	var change;
	var apylMap = changesMap[parsedNames.apygOld];
	if (apylMap) {
		change = apylMap[parsedNames.apylName];
	}
	if (change) {
		change.used = true;
	}
	if (!change) {
		notFound.push(parsedNames);
	}

	return _.merge({}, parsedNames, change, row);
});

var uniqNotFound = _(notFound).uniq((s) => JSON.stringify(s)).groupBy("apygOld").mapValues((g)=>({ nf: g, an: g[0].apygOldNum, a: g[0].apygOld })).value();
console.log(uniqNotFound);
console.log(_.size(uniqNotFound));
var notUsed = _(changes).reject("used").groupBy("apygOld").mapValues((g, k) => ({ nu: g, an: g[0].apygOldNum, a: g[0].apygOld })).value();
console.log(notUsed);
console.log(_.size(notUsed));


//console.log(fullInfo);

_.forEach(_.sortBy(_.merge(uniqNotFound, notUsed), "an"), function (v) {
	console.log(v.a);
	if (v.nf) console.log("Nebėra:", v.nf.map((a) => `${a.apylName} (${a.apylNum})`).join(", "));
	if (v.nu) console.log("Nebuvo:", v.nu.map((a) => `${a.apyl} (${a.apylNum})`).join(", "));
	console.log();
});
