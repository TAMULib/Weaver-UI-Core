#! /usr/bin/env node

const process = require('process');
const server = require('./server/server.js');
const build = require('./build/build.js');
const clean = require('./clean/clean.js');

const command = process.argv[2];

const commandArgsArr = process.argv.slice(2, process.argv.length);
const commandArgs = {};

for (let i = 0; i < commandArgsArr.length; i++) {
  let cmd = commandArgsArr[i];
  if (cmd[0] === '-') {
    let nextEntry = commandArgsArr[i + 1];
    if (nextEntry && nextEntry[0] !== '-') {
      commandArgs[cmd] = nextEntry;
    } else {
      commandArgs[cmd] = true;
    }
  }
}

const commands = {
  server,
  build,
  clean
};

if (command in commands) {
  // If the command exists, run it
  commands[command].run(commandArgs);
} else if (command === '-h' || command === '--help') {
  // If the command did not exists but is the '-h' flag, run help on all commands
  console.log('Commands: ');
  const cmdkeys = Object.keys(commands);

  for (let i in cmdkeys) {
    const cmd = commands[cmdkeys[i]];
    cmd.help();
  }
} else {
  // Finally, show an error
  console.log(`Error: ${command} not found.`);
  console.log('-h for help');
}
