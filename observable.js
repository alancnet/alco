const rx = require('rx');
require('./rxx').assign();
const readline = require('readline');
const fromReadLine = (rl) => rx.Observable.create(obs => rl
  .on('line', obs.onNext.bind(obs))
  .on('close', obs.onCompleted.bind(obs))
);
const fromStdin = () => rx.Observable.create(obs => {
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => obs.onNext(process.stdin.read()))
  process.stdin.on('end', () => obs.onCompleted())
});
const fromStdinLines = () => fromStdin.splitBy('\n')
module.exports = {fromReadLine, fromStdin};
