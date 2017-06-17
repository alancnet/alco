const rx = require('rxjs')
const rxx = require('./rxx')
const fromReadLine = (rl) => rx.Observable.create(obs => rl
  .on('line', obs.next.bind(obs))
  .on('close', obs.complete.bind(obs))
)
const fromStream = (stream) => rx.Observable.create(obs => {
  stream.setEncoding('utf8')
  stream.on('readable', () => obs.next(process.stdin.read()))
  stream.on('end', () => obs.complete())
})
const fromStdin = () => fromStream(process.stdin)
const fromStdinLines = () => rxx(fromStdin()).splitBy('\n').base
module.exports = {fromReadLine, fromStdin, fromStream, fromStdinLines}
