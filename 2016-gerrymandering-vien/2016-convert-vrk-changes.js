var fs = require("fs");
var csvParse = require("csv-parse");
var normalize = require("./lib/normalize");

csvParse(fs.readFileSync("./data/2015_09_15_perkelta.csv"), function (err, csv) {
	fs.writeFileSync("./data/2016-vrk-changes.json", JSON.stringify(csv.map(function (row) {
		return {
			apygNew: normalize(row[11]),
			apygNewNum: parseInt(row[10], 10),
			apygOld: normalize(row[8]),
			apygOldNum: parseInt(row[7], 10),
			apyl: normalize(row[2]),
			apylNum: parseInt(row[1], 10)
		}
	}), null, 4));
});
