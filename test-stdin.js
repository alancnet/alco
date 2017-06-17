const { observable } = require('.')

observable.fromStdinLines()
.subscribe(console.log, console.error)
