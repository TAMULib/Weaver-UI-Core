var fs = require('fs');
var process = require('process');
var path = require('path');

var express = require('express');
var https = require('https');
var app = express();
var router = express.Router();

var args = process.argv.slice(2, process.argv.length);

var port = args[0] ? args[0] : 8080;
var base = args[1] ? args[1] : '/';

var root = process.cwd() + path.sep + 'app';

router.use(express.static('app'));

router.use(function (req, res, next) {
    if (req.get("X-Requested-With")) {
        res.status(404).send('Not found');
        throw new Error(getTime() + ": Resource requested and not found at -- " + req.url);
    } else {
        res.sendFile("index.html", {
            root: root
        });
    }
});

app.use(base, router);

var sslCert = "ssl.crt";
var sslKey = "ssl.key";
var useSSL = true;

try {
    fs.accessSync(sslCert, fs.constants.R_OK);
    fs.accessSync(sslKey, fs.constants.R_OK);
} catch (err) {
    useSSL = false;
}

if (useSSL) {
    var credentials = {
        cert: fs.readFileSync(sslCert),
        key: fs.readFileSync(sslKey)
    };

    var ssl = https.createServer(credentials, app);

    ssl.listen(port, function () {
        console.log(getTime() + ': Listening with SSL on port ' + port + ' at ' + base);
    });
} else {
    app.listen(port, function () {
        console.log(getTime() + ': Listening on port ' + port + ' at ' + base);
    });
}

function getTime() {
    return new Date().toISOString().
        replace(/T/, ' '). // replace T with a space
        replace(/\..+/, ''); // delete the dot and everything after
}
