var fs = require('fs');
var process = require('process');
var path = require('path');

var express = require('express');
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


app.listen(port, function () {
    console.log(getTime() + ': Listening on port ' + port + ' at ' + base);
});

function getTime() {
    return new Date().toISOString().
    replace(/T/, ' '). // replace T with a space
    replace(/\..+/, ''); // delete the dot and everything after
}