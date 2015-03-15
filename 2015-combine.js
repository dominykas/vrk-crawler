var fs = require("fs"),
	_ = require("lodash");

var t1 = _.indexBy(JSON.parse(fs.readFileSync("res-2015/t1.json")), "munip"),
	t2 = JSON.parse(fs.readFileSync("res-2015/t2.json"));

var res = _(t2).map(function (v) {

	var r1 = _.indexBy(t1[v.munip].res, "cand");

	return [
		v.munip,
		+(t1[v.munip].res[0].cand != v.res[0].cand),

		"",

		v.res[0].cand,
		v.res[0].party,
		+r1[v.res[0].cand].votes,
		+v.res[0].votes,
		((+v.res[0].votes) - (+r1[v.res[0].cand].votes)),

		"",

		v.res[1].cand,
		v.res[1].party,
		+r1[v.res[1].cand].votes,
		+v.res[1].votes,
		((+v.res[1].votes) - (+r1[v.res[1].cand].votes)),
	].join("\t");
}).value().join("\n");

console.log(res);