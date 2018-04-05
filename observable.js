const rx = require('rxjs')
const rxx = require('./rxx')
const readline = require('readline')

const fromReadLine = (rl) => rx.Observable.create(obs => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }
  rl
    .on('line', obs.next.bind(obs))
    .on('close', obs.complete.bind(obs))
  return () => rl.close()
})
const fromStream = (stream) => rx.Observable.create(obs => {
  stream.setEncoding('utf8')
  stream.on('readable', () => obs.next(process.stdin.read()))
  stream.on('end', () => obs.complete())
  return () => stream.end()
})
const fromStdin = () => fromStream(process.stdin)
const fromStdinLines = () => rxx(fromStdin()).splitBy('\n').base
const onDemand = (fetcher) => {
  let observer = null;
  const observable = rx.Observable.create(o => {
    if (observer) throw new Error('Demand Observable can have only one observer')
    observer = o
    return () => {
      observer = null
    }
  })
  observable.demand = () => {
    fetcher()
    .then(
      v => observer && (
        v === undefined
        ? observer.complete()
        : observer.next(v)
      ),
      e => observer && observer.error(e),
      () => observer && observer.complete()
    )
  }
  return observable
}

module.exports = {fromReadLine, fromStdin, fromStream, fromStdinLines, onDemand}
