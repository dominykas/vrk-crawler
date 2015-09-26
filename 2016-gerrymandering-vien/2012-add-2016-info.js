var _ = require("lodash");
var fs = require("fs");
var normalize = require("./lib/normalize");

var allResults = require("./data/2012-all-results.json").concat(require("./data/2012-emigrantai.json"));

var changesApyg = require("./data/2016-vrk-changes.json");
var changesApyl = require("./data/2014-apyl-merge.json");

var changes = _(changesApyg).concat(changesApyl)
	.map(function (i) {
		return {
			apygOld: normalize(i.apygOld),
			apygOldNum: parseInt(i.apygOldNum, 10),
			apylOld: normalize(i.apylOld),
			apylOldNum: parseInt(i.apylOldNum, 10),
			apygNew: normalize(i.apygNew),
			apygNewNum: parseInt(i.apygNewNum, 10),
			apylNew: normalize(i.apylNew),
			apylNewNum: parseInt(i.apylNewNum, 10)
		}
	})
	.value();

var changesMap = _(changes)
	.groupBy("apygOld")
	.mapValues((g) => _.indexBy(g, (i) => i.apylOldNum + "-" + i.apylOld))
	.value();

var notFound = [];

var fullInfo = allResults
	.filter((row) => row.apyl.trim() != "Balsai suskaičiuoti rinkimų apygardoje (Nr.0) apylinkė")
	.map(function (row) {
		var apygMatches = row.apyg.match(/(.*) \(Nr.(\d+)\) apygarda$/);
		if (!apygMatches) {
			console.error("Could not parse apyg", row.apyg);
			process.exit();
		}

		var apylMatches = row.apyl.trim().match(/(.*) \(Nr.(\d+)\) apylinkė$/);
		if (!apylMatches) {
			console.error("Could not parse apyl", row.apyl);
			process.exit();
		}

		var parsedNames = {
			apygOld: normalize(apygMatches[1]),
			apygOldNum: parseInt(apygMatches[2], 10),
			apylOld: normalize(apylMatches[1]),
			apylOldNum: parseInt(apylMatches[2], 10)
		};

		var change;
		var apylMap = changesMap[parsedNames.apygOld];
		if (apylMap) {
			change = apylMap[parsedNames.apylOldNum + "-" + parsedNames.apylOld];
		}
		if (change) {
			change.used = true;
		}
		if (!change) {
			notFound.push(parsedNames);
		}

		return _.merge({}, parsedNames, change, row);
	});

//var uniqNotFound = _(notFound).uniq((s) => JSON.stringify(s)).groupBy("apygOld").mapValues((g)=>({ nf: g, an: g[0].apygOldNum, a: g[0].apygOld })).value();
//console.log(uniqNotFound);
//console.log(_.size(uniqNotFound));
//var notUsed = _(changes).reject("used").groupBy("apygOld").mapValues((g, k) => ({ nu: g, an: g[0].apygOldNum, a: g[0].apygOld })).value();
//console.log(notUsed);
//console.log(_.size(notUsed));


//console.log(fullInfo);

//_.forEach(_.sortBy(_.merge(uniqNotFound, notUsed), "an"), function (v) {
//	console.log(v.a);
//	if (v.nf) console.log("Nebėra:", v.nf.map((a) => `${a.apylOld} (${a.apylOldNum})`).join(", "));
//	if (v.nu) console.log("Nebuvo:", v.nu.map((a) => `${a.apylOld} (${a.apylOldNum})`).join(", "));
//	console.log();
//});

var resultsOld = _(fullInfo)
	.groupBy("apygOld")
	.mapValues(function (i, k) {
		return _(i)
			.groupBy("candidateUrl")
			.map(function (c) {
				return {
					apyg: k,
					candidate: c[0].candidate,
					candidateUrl: c[0].candidateUrl,
					totalBefore: _.sum(c, "totalVotes"),
					totalAfter: _.sum(c.filter((x) => x.apygNew == x.apygOld), "totalVotes")
				}
			})
			.sortBy("totalBefore", "desc")
			.map(function (i, n) {
				return _.merge(i, { posBefore: n+1 })
			})
			.sortBy("totalAfter", "desc")
			.map(function (i, n) {
				return _.merge(i, { posAfter: n+1 })
			})
			.value();
	})
	.toArray()
	.flattenDeep()
	.value();

var votesMoved = _(fullInfo)
	.filter(function (i) {
		return i.apygNew != i.apygOld
	})
	.groupBy("apygNew")
	.mapValues(function (i) {
		//console.log(i);
		return _(i)
			.groupBy("candidateUrl")
			.map(function (c) {
				return {
					apygOld: c[0].apygOld,
					apygNew: c[0].apygNew,
					candidate: c[0].candidate,
					candidateUrl: c[0].candidateUrl,
					votes: _.sum(c, "totalVotes")
				}
			})
			.value();
	})
	.toArray()
	.flattenDeep()
	.value();

fs.writeFileSync("./data/output-results-in-old.json", JSON.stringify(resultsOld, null, 4));
fs.writeFileSync("./data/output-results-moved.json", JSON.stringify(votesMoved, null, 4));
