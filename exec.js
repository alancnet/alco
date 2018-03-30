const { Observable } = require('rxjs')
const rxx = require('./rxx')
const childProcess = require('child_process')

const exec = (cmd, options) => new Observable(observer => {
  const child = childProcess.exec(cmd, options || {})
  var closeCount = 0
  const close = () => {
    if (closeCount++) observer.complete()
  }
  child.stdout.on('close', close)
  child.stdout.on('data', data => observer.next({
    type: 'out',
    data: data
  }))
  child.stderr.on('close', close)
  child.stderr.on('data', data => observer.next({
    type: 'err',
    data: data
  }))
  return () => child.kill()
})

const execByLine = (cmd, options) =>
  exec(cmd, options)
    .groupBy(x => x.type)
    .flatMap(g => rxx(g)
      .map(x => x.data)
      .splitBy('\n')
      .map(x => ({
        type: g.key,
        data: x
      }))
      .base
    )

module.exports = { exec, execByLine }
