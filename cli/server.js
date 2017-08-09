var fs = require('fs');
var process = require('process');
const path = require('path');

var express = require('express');
var app = express();

function run(args) {
  if(!args["-h"]) {
    
    var root = process.cwd() + path.sep+'app';
    app.use(express.static('app'));
    app.all("/*", function (req, res) {
      res.sendFile("index.html", { root: root});
    });

    var port = args["-p"] ? args["-p"] : 8080;
    
    var server = app.listen(port, function () {
      console.log('listening on port', server.address().port);
    });

  } else {
    help();
  }
}

function help() {
  console.log("Server help text.");
}

exports.run = run;
exports.help = help;