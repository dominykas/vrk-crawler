var jsdom = require('jsdom'), Q = require('q'), fs = require('fs');

var bySortedValue  = function(obj) {
	// http://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
    var tuples = [];

    for (var key in obj) tuples.push([key, obj[key]]);

    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

	return tuples.filter(function(v){ return v[1] > 0; }).map(function(v){ return v[0]+': '+v[1]; });
}

var partijos = ['DDVP','DP','KP','LLRA','LSDP','LŽP','PJL','RP','TAIP','DK','EP','LICS','LRLS','LVŽS','NSULL','PTT','SLF','TS-LKD'];
var sarasai = {};
var pirmi = {'??':0};
var antri = {'??':0};

partijos.forEach(function(p){

	sarasai[p]=fs.readFileSync('./partijos/'+p+'.html').toString().toLowerCase();
	pirmi[p] = antri[p] = 0;

});

var getParty = function(k)
{
	var found = [];
	Object.keys(sarasai).forEach(function(p){
		if (sarasai[p].indexOf(k.toLowerCase()) > 0) {
			found.push(p);
		}
	});

	if (found.length == 0) {
		console.log("Be partijos?", k);
		return '??';
	}
	if (found.length > 1) {
		console.log("Kelios partijos?",k,found);
	}
	return found[0];
}

var apylinkesRez = function(href)
{
	var def = Q.defer();
	jsdom.env({
		html: 'http://www.vrk.lt/2012_seimo_rinkimai/output_lt/rezultatai_vienmand_apygardose/'+href,
		scripts: ["http://code.jquery.com/jquery.js"]
	}, function(e, w){

		var $ = w.$;
		
		var kand = $('.partydata td a[href^=rezultatai_sm_kand]');

		var ap = $('h2').html();
		var k1 = $(kand[0]).html();
		var p1 = getParty(k1);
		var k2 = $(kand[1]).html()
		var p2 = getParty(k2);

		pirmi[p1]++;
		antri[p2]++;
		
		var r = '';
		r+=(ap);
		r+="\r\n";
		r+=(k1+" "+$($(kand[0]).closest('tr').find('td')[4]).html()+" ("+p1+")");
		r+="\r\n";
		r+=(k2+" "+$($(kand[0]).closest('tr').find('td')[4]).html()+" ("+p2+")");
		r+="\r\n";
		def.resolve(r);
		console.log(ap);

	});
	return def.promise;
};

jsdom.env({
	html: 'http://www.vrk.lt/2012_seimo_rinkimai/output_lt/rezultatai_vienmand_apygardose/rezultatai_vienmand_apygardose1turas.html',
	scripts: ["http://code.jquery.com/jquery.js"]
}, function(e, w){

	var $ = w.$;
	
	var promises = [];
	$('td a[href^=rezultatai]').each(function(i, a){
		promises.push(apylinkesRez($(a).attr('href')));
	});

	Q.all(promises).then(function(rez){

		fs.writeFileSync('antr.txt', rez.join("\r\n"));

		console.log('-');
		console.log(bySortedValue(pirmi).join("\r\n"));
		console.log('-');
		console.log(bySortedValue(antri).join("\r\n"));
		console.log('-');

	}).end();

});

