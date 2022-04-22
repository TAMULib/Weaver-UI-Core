const fs = require("fs");
const path = require("path");

const rmdir = (dir) => {
  fs.access(dir, (error) => {
    if (error) {
      console.log("Nothing to clean...")
    } else {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
};

const run = (args) => {
  console.log("Cleaning...");
  rmdir(path.resolve(process.cwd(), 'dist'));
}

const help = () => {
  console.log("wrv clean []");
}

exports.run = run;
exports.help = help;