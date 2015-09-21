var jsdom = require("jsdom");
var Q = require("q");
var Bluebird = require("bluebird");
var fs = require("fs");
var _ = require("lodash");

var apygCount = 0, apylCount = 0;

function fetch(url) {
	console.log("Loading...", url);
	return Q.ninvoke(jsdom, "env", url, ["http://code.jquery.com/jquery.js"])
		.then(function (w) {
			return w.$
		});
}

function apygUrls() {
	return fetch("http://www.vrk.lt/statiniai/puslapiai/2012_seimo_rinkimai/output_lt/rezultatai_vienmand_apygardose/rezultatai_vienmand_apygardose1turas.html")
		.then(function ($) {
			return $($(".partydata")[2]).find("td:first-child a").map(function (i, a) {
				return a.href;
			}).toArray();
		});
}

function apylUrls(apygUrl) {
	return fetch(apygUrl)
		.then(function ($) {
			apygCount++;
			console.log("Received apyg", apygUrl, {apygCount: apygCount, apylCount: apylCount});
			return $($(".partydata")[3]).find("td:first-child a").map(function (i, a) {
				return a.href;
			}).toArray();
		});
}

function apylData(apylUrl) {
	return fetch(apylUrl)
		.then(function ($) {
			apylCount++;
			console.log("Received apyl", apylUrl, {apygCount: apygCount, apylCount: apylCount});
			return $($(".partydata")[1])
				.find("td:first-child a")
				.map(function (i, a) {
					var $p = $(a).closest("tr");
					return {
						apyl: $($("h2")[0]).text(),
						candidate: $p.find("td:first-child a").text(),
						candidateUrl: $p.find("td:first-child a")[0].href,
						totalVotes: $p.find("td:nth-child(4)").text()
					}
				})
				.toArray()
		})
}

apygUrls()
	.then(function (urls) {
		return Bluebird.map(urls, (url) => apylUrls(url), { concurrency: 10});
	})
	.then(function (urls) {
		urls = _.flatten(urls);
		return Bluebird.map(urls, (url) => apylData(url), { concurrency: 10});
	})
	.then(function (res) {
		fs.writeFileSync("all-results-2012.json", JSON.stringify(_.flattenDeep(res), null, 4));
	})
	.done();
