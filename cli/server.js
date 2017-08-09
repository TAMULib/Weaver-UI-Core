const fs = require('fs');
const process = require('process');
const path = require('path');

const express = require('express');
const app = express();
const router = express.Router();


// The run command
function run(args) {
    if (!args["-h"]) {

        const port = args["-p"] ? args["-p"] : 8080;
        const base = args["-b"] ? args["-b"] : '/';

        const root = process.cwd() + path.sep + 'app';

        router.use(express.static('app'));

        router.use(function (req, res, next) {
            if (req.get("X-Requested-With")) {
                res.status(404).send('Not found');
            } else {
                res.sendFile("index.html", {
                    root: root
                });
            }
        });

        app.use(base, router);

        app.listen(port, function () {
            console.log('listening on port ' + port + ' at ' + base);
        });

    } else {
        help();
    }
}

// The help text
function help() {
    console.log("wrv server [-h, -p [port], -b [base url]]");
}

exports.run = run;
exports.help = help;
