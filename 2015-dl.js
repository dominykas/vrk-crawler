var jsdom = require("jsdom"),
	Q = require("q"),
	fs = require("fs");

function fetch(url) {
	return Q.ninvoke(jsdom, "env", url, ["http://code.jquery.com/jquery.js"]);
}

function munip(url, withParty) {
	return fetch(url).then(function (w) {
		var $ = w.$;

		return $(".partydata3 td:first-child a").toArray().slice(0,2).map(function (lnk) {
			var votesIdx = withParty ? 4 : 3;
			return {
				cand: $(lnk).text(),
				party: withParty ? $($(lnk).closest("tr").find("td")[1]).text() : "-",
				votes: $($(lnk).closest("tr").find("td")[votesIdx]).text()
			}
		})
	});
}

function round(url, withParth) {
	return fetch(url).then(function (w) {

		var $ = w.$;

		var promises = [];
		$(".partydata3 td:first-child a").each(function (i, a) {
			promises.push(munip(a.href, withParth).then(function (res) {
				return {
					munip: $(a).text(),
					res: res
				}
			}));
		});

		return Q.all(promises);
	});
}

var done = [];

// Lietuva
done.push(round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_daugiamand_apygardose/rezultatai_daugiamand_apygardose1turas.html')
	.then(function (t) {
		fs.writeFileSync("res-2015/t1.json", JSON.stringify(t));
	}));

done.push(round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_vienmand_apygardose2/rezultatai_vienmand_apygardose2turas.html')
	.then(function (t) {
		fs.writeFileSync("res-2015/t2.json", JSON.stringify(t));
	}));

// Kėdainiai
done.push(round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_vienmand_apygardose/apygardos_rezultatai_apylinkese7779.html', false)
	.then(function (t) {
		fs.writeFileSync("res-2015/k-t1.json", JSON.stringify(t));
	}));

done.push(round('http://www.2013.vrk.lt/2015_savivaldybiu_tarybu_rinkimai/output_lt/rezultatai_vienmand_apygardose2/apygardos_rezultatai_apylinkese7843.html', false)
	.then(function (t) {
		fs.writeFileSync("res-2015/k-t2.json", JSON.stringify(t));
	}));

Q.all(done).done();
