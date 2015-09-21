var fs = require("fs");
var apylUrls = require("./lib/2012-dl").apylUrls;
var _ = require("lodash");
var Q = require("q");

Q.all(require("./data/2012-apyg-urls.json")
	.map((url) => apylUrls(url)))
	.then((urls) => fs.writeFileSync("./data/2012-apyl-urls.json", JSON.stringify(_.flattenDeep(urls), null, 4)))
	.done();
