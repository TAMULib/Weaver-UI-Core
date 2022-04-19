const fs = require("fs");
const path = require("path");

const rmdir = function(dir) {
  const list = fs.readdirSync(dir);
    for(let i = 0; i < list.length; i++) {
      const filename = path.join(dir, list[i]);
      const stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
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