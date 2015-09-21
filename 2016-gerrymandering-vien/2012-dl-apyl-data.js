var fs = require("fs");
var apylData = require("./lib/2012-dl").apylData;
var _ = require("lodash");
var Bluebird = require("bluebird");

var page = process.env.PAGE;

if (!page) {
	console.error("No PAGE");
	process.exit(1);
}

Bluebird.map(require("./data/2012-apyl-urls.json").slice((page - 1) * 100, page * 100), (url) => apylData(url), {concurrency: 10})
	.then((urls) => fs.writeFileSync("./data/2012-all-results-" + page + ".json", JSON.stringify(_.flattenDeep(urls), null, 4)))
	.done();
