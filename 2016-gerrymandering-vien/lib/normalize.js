module.exports = function (name) {
	return name.replace(/ \- /g, "-").replace(/\. /g, ".").trim();
};
