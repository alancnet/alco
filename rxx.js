const { Observable } = require('rxjs')
const extend = require('./extend')

const arrayFlatten = x => [].concat.apply([], x)
const stringFlatten = x => x.join('')

const rxx = extend(Observable, {
  splitBy: function (delim) {
    const buffer = []
    return this.filter(x => x !== null).flatMap((chunk) => {
      const output = []
      var l = 0
      var r
      while ((r = chunk.indexOf(delim, l)) !== -1) {
        var sub = chunk.slice(l, r)
        buffer.push(sub)
        // complete message here
        const message =
          (typeof chunk === 'string' ? stringFlatten : arrayFlatten)(
            buffer.splice(0)
          )
        output.push(message)
        l = r + 1
      }
      buffer.push(chunk.slice(l))
      return output
    })
  },
  flattenParallel: function (limit) {
    return rxx(Observable.create((observer) => {
      var count = 0
      var complete = false
      const queue = []
      const subscriptions = []
      const removeSubscription = (sub) => {
        const i = subscriptions.indexOf(sub)
        if (i !== -1) {
          subscriptions.splice(i, 1)
        }
      }

      function evalState () {
        if (count < limit) {
          const current = queue.pop()
          if (current) {
            count = count + 1
            const newSub = current.subscribe(
                function (x) {
                  observer.next(x)
                },
                function (err) {
                  observer.error(err)
                },
                function () {
                  count = count - 1
                  removeSubscription(newSub)
                  evalState()
                }
              )
            subscriptions.push(newSub)
          } else {
            if (count === 0 && complete) {
              observer.complete()
            }
          }
        }
      }
      this.subscribe(
          function (x) {
            queue.push(x)
            evalState()
          },
          function (err) {
            observer.error(err)
          },
          function () {
            complete = true
            evalState()
          }
        )
      return () => {
        subscriptions.forEach((sub) => sub.dispose())
      }
    }))
  },
  onPause: function (action, ms = 0) {
    return rxx(Observable.create(observer => {
      let timer = setTimeout(action, ms)
      this.subscribe(
        v => {
          if (timer) clearTimeout(timer)
          timer = setTimeout(action, ms)
          observer.next(v)
        },
        e => {
          if (timer) clearTimeout(timer)
          observer.error(e)
        },
        () => {
          if (timer) clearTimeout(timer)
          observer.complete()
        }
      )
    }))

    //states:
    //  Live - Something emitted since last tick
    //  Paused - Nothing emitted since last tick
    //  Idle - Nothing emitted since last signal

  },
  flatMap: function(mapper) {
    return rxx(this.base.flatMap((value, index) => mapper(value, index, this)))
  },
  map: function(mapper) {
    return rxx(this.base.map((value, index) => mapper(value, index, this)))
  }

})

module.exports = rxx
