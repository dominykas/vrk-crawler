var fs = require("fs");
var apygUrls = require("./lib/2012-dl").apygUrls;
var _ = require("lodash");

apygUrls().then((urls) => fs.writeFileSync("./data/2012-apyg-urls.json", JSON.stringify(_.flattenDeep(urls), null, 4))).done();
