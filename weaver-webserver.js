const fs = require('fs');
const process = require('process');
const path = require('path');

const express = require('express');
const app = express();
const router = express.Router();

const args = process.argv.slice(2, process.argv.length);

const port = args[0] ? args[0] : 8080;
const base = args[1] ? args[1] : '/';

const root = process.cwd() + path.sep + 'app';

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
                replace(/T/, ' ').      // replace T with a space
                replace(/\..+/, '')     // delete the dot and everything after
}