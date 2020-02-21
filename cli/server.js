var fs = require('fs');
var process = require('process');
var path = require('path');

var forever = require('forever');

// The run command
function run(args) {
  if (!args["-h"]) {

    var start = !(args["--stop"] ? args["--stop"] : false);


    if (start) {
      startServer(args);
    } else {
      stopServer();
    }

  } else {
    help();
  }

}

function stopServer() {
  forever.stopAll();
}

function startServer(args) {
  var uid = args["--uid"] ? args["--uid"] : "weaver-webserver";
  var port = args["-p"] ? args["-p"] : 8080;
  var base = args["-b"] ? args["-b"] : '/';
  var prod = args["--prod"] ? args["--prod"] : false;

  var webserverLocation = process.cwd() + path.sep + "node_modules" + path.sep + "@wvr/core" + path.sep + "weaver-webserver.js";

  var child = null;

  if (prod) {
    child = forever.startDaemon(webserverLocation, {
      args: [port, base],
      uid: uid,
      logFile: process.cwd() + path.sep + "weaver-server.log"
    });
  } else {
    child = new(forever.Monitor)(webserverLocation, {
      args: [port, base],
      uid: uid
    });

    child.on('start', function (process, data) {
      console.log(getTime() + " Server now running at pid: " + child.childData.pid);
    });

    child.on('watch:restart', function (info) {
      console.error(getTime() + ': Restaring script because ' + info.file + ' changed');
    });

    child.on('restart', function (forever) {
      console.error(getTime() + ': Forever restarting script for ' + child.times + ' time');
      console.log(getTime() + " Server now running at pid: " + child.childData.pid);
    });

    child.on('exit:code', function (code) {
      console.error(getTime() + ': Forever detected script exited with code ' + code);
    });

    child.start();
  }

  forever.startServer(child);
}

// The help text
function help() {
  console.log("wrv server [-h, -p [port], -b [base url]]");
}

function getTime() {
  return new Date().toISOString().
  replace(/T/, ' '). // replace T with a space
  replace(/\..+/, ''); // delete the dot and everything after
}

exports.run = run;
exports.help = help;