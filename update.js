const fs = require("fs");
const listfile = "hosts.txt";

let listurls = [
	"https://v.firebog.net/hosts/AdguardDNS.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/easylist/list.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/easyprivacy/list.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/molinero.dev/list.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/mozilla-shavar-analytics/list.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/mozilla-shavar-advertising/list.txt",
	"https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext",
	"https://raw.githubusercontent.com/mintbird/Thailand-Pihole-Blocklist/main/list.txt",
	"https://raw.githubusercontent.com/hectorm/hmirror/master/data/ublock/list.txt",
];

const getScript = (url) => {
	return new Promise((resolve, reject) => {
		const http = require("http"),
			https = require("https");

		let client = http;

		if (url.toString().indexOf("https") === 0) {
			client = https;
		}

		client
			.get(url, (resp) => {
				let data = "";

				// A chunk of data has been recieved.
				resp.on("data", (chunk) => {
					data += chunk;
				});

				// The whole response has been received. Print out the result.
				resp.on("end", () => {
					resolve(data);
				});
			})
			.on("error", (err) => {
				reject(err);
			});
	});
};

// Clear list file
fs.truncate(listfile, 0, function () {
	console.log("Clear list file");
});

// Download list
((urls) => {
	Promise.all(urls.map((url) => getScript(url))).then((values) => {
		console.log("Finish download list", values.length);

		// Start with string
		let rawlist = values.join("\n");

		// Use linux EOL
		rawlist = rawlist.replaceAll("\r\n", "\n");

		// Now it's an array for processing
		rawlist = rawlist.split("\n");

		// Remove duplicates
		rawlist = [...new Set(rawlist)];

		// Remove empty string
		rawlist = rawlist.filter((n) => n);

		// Remove comments
		rawlist = rawlist.filter((n) => !n.trim().startsWith("#"));

		// Convert to hosts file format
		rawlist = rawlist.map((domain) => {
			if (domain.indexOf("127.0.0.1 ") == -1) {
				return "127.0.0.1 ".concat(domain);
			}

			return domain;
		});

		// Convert to string for writing
		rawlist = rawlist.join("\n");

		// Write into file
		fs.appendFile(listfile, rawlist, function (err) {
			if (err) throw err;
			console.log("Saved!");
		});
	});
})(listurls);
