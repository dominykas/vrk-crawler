var fs = require("fs");
var csvParse = require("csv-parse");
var normalize = require("./lib/normalize");

csvParse(fs.readFileSync("./data/2015_09_15_perkelta.csv"), function (err, csv) {
	fs.writeFileSync("./data/2016-vrk-changes.json", JSON.stringify(csv.map(function (row) {
		return {
			apygOld: normalize(row[8]),
			apygOldNum: parseInt(row[7], 10),
			apylOld: normalize(row[2]),
			apylOldNum: parseInt(row[1], 10),
			apygNew: normalize(row[11]),
			apygNewNum: parseInt(row[10], 10),
			apylNew: normalize(row[2]),
			apylNewNum: parseInt(row[1], 10)
		}
	}), null, 4));
});
