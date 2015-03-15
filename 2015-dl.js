var jsdom = require("jsdom"),
	Q = require("q"),
	fs = require("fs");

function fetch(url) {
	return Q.ninvoke(jsdom, "env", url, ["http://code.jquery.com/jquery.js"]);
}

function munip(url) {
	return fetch(url).then(function (w) {
		var $ = w.$;

		return $(".partydata3 td:first-child a").toArray().slice(0,2).map(function (lnk) {
			return {
				cand: $(lnk).text(),
				party: $($(lnk).closest("tr").find("td")[1]).text(),
				votes: $($(lnk).closest("tr").find("td")[4]).text()
			}
		})
	});
}

function round(url) {
	return fetch(url).then(function (w) {

		var $ = w.$;

		var promises = [];
		$(".partydata3 td:first-child a").each(function (i, a) {
			promises.push(promises.push(munip(a.href).then(function (res) {
				return {
					munip: $(a).text(),
					res: res
				}
			})));
		});

		return Q.all(promises);
	});
}

round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_daugiamand_apygardose/rezultatai_daugiamand_apygardose1turas.html')
	.then(function (t) {
		fs.writeFileSync("res-2015/t1.json", JSON.stringify(t));
	});

round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_vienmand_apygardose2/rezultatai_vienmand_apygardose2turas.html')
	.then(function (t) {
		fs.writeFileSync("res-2015/t2.json", JSON.stringify(t2));
	});
