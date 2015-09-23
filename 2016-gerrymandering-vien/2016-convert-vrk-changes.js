var fs = require("fs");
var csvParse = require("csv-parse");

csvParse(fs.readFileSync("./data/2015_09_15_perkelta.csv"), function (err, csv) {
	fs.writeFileSync("./data/2016-vrk-changes.json", JSON.stringify(csv.map(function (row) {
		return {
			apygNum: row[1],
			apygNew: row[2],
			apygOld: row[5],
			apyl: row[4]
		}
	}), null, 4));
});
