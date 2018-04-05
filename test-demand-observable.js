const { Observable } = require('rxjs')
const rxx = require('./rxx')
const {onDemand} = require('./observable')



var i = 0
const obs = onDemand(() => new Promise((resolve, reject) => {
  if (i++ === 5) resolve()
  setTimeout(() => resolve(new Date()), 200)
}))


rxx(obs
  .flatMap(x => new Promise((resolve, reject) => {
    setTimeout(() => resolve(x), 1000)
  }))
).onPause(() => obs.demand())
.subscribe(console.log)


console.log(obs)
