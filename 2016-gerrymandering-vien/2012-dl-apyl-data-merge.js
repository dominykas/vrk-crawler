var _ = require("lodash");
var fs = require("fs");

var all = [];
for (var i = 1; i <= 21; i++) {
	all.push(require("./data/2012-all-results-" + i + ".json"));
}

fs.writeFileSync("./data/2012-all-results.json", JSON.stringify(_.flattenDeep(all), null, 4));
