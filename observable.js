const rx = require('rx');
const readline = require('readline');
const fromReadLine = (rl) => rx.Observable.create(obs => rl
  .on('line', obs.onNext.bind(obs))
  .on('close', obs.onCompleted.bind(obs))
);
const fromStdin = fromReadLine(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));
module.exports = {fromReadLine, fromStdin};

