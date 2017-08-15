#! /usr/bin/env node

const process = require('process');
const fs = require('fs');

const command = process.argv[2];

const commandArgsArr = process.argv.slice(2, process.argv.length);
const commandArgs = {};

for(var i = 0; i < commandArgsArr.length; i++) {
  const cmd = commandArgsArr[i];
  if(cmd[0] === '-') {
    var nextEntry = commandArgsArr[i + 1];
    if(nextEntry && nextEntry[0] !== '-') {
      commandArgs[cmd] = nextEntry;
    } else {
      commandArgs[cmd] = true;
    }
  } 
}

const commands = {
  server: require('./server.js')
}

if(commands[command]) {
  //If the command exists, run it
  commands[command].run(commandArgs);
} else if (command === '-h') {
  // If the command did not exists but is the '-h' flag, run help on all commands
  console.log('COMMANDS:');
  var cmdkeys = Object.keys(commands);

  for(var i in cmdkeys) {
    var cmd = commands[cmdkeys[i]];
    cmd.help();
  }
} else {
  // Finnally, show an error 
  console.log('ERROR: '+ command +' not found.');
  console.log('-h for help');
}

