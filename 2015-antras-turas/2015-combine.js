var fs = require("fs"),
	_ = require("lodash");

function combine(t1, t2) {
	return _(t2).map(function (v) {

		var r1 = _.indexBy(t1[v.munip].res, "cand");

		return [
			v.munip,

			+(t1[v.munip].res[0].cand != v.res[0].cand),

			v.res[0].cand,
			v.res[0].party,
			+r1[v.res[0].cand].votes,
			+v.res[0].votes,
			((+v.res[0].votes) - (+r1[v.res[0].cand].votes)),
			((+v.res[0].votes) - (+r1[v.res[0].cand].votes)) / (+r1[v.res[0].cand].votes),

			"",

			v.res[1].cand,
			v.res[1].party,
			+r1[v.res[1].cand].votes,
			+v.res[1].votes,
			((+v.res[1].votes) - (+r1[v.res[1].cand].votes)),
			((+v.res[1].votes) - (+r1[v.res[1].cand].votes)) / (+r1[v.res[0].cand].votes)

		].join("\t");
	}).value().join("\n");
}

fs.writeFileSync("res-2015/combined.tsv", combine(
	_.indexBy(JSON.parse(fs.readFileSync("res-2015/t1.json")), "munip"),
	JSON.parse(fs.readFileSync("res-2015/t2.json"))));

fs.writeFileSync("res-2015/k-combined.tsv", combine(
	_.indexBy(JSON.parse(fs.readFileSync("res-2015/k-t1.json")), "munip"),
	JSON.parse(fs.readFileSync("res-2015/k-t2.json"))));
