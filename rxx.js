const rx = require('rx');
module.exports.assign = function() {
  const arrayFlatten = x => [].concat.apply([], x);
  const stringFlatten = x => x.join('')

  Object.assign(rx.Observable.prototype, {
    splitBy: function(delim) {
      const dl = delim.length || 1;
      const buffer = [];
      return this.filter(x => x !== null).flatMap((chunk) => {
        const output = [];
        var l = 0;
        while (r = chunk.indexOf(delim, l), r != -1) {
          var sub = chunk.slice(l, r);
          buffer.push(sub);
          // complete message here
          const message =
            (typeof chunk == 'string' ? stringFlatten : arrayFlatten)(
              buffer.splice(0)
            );
          output.push(message);
          l = r + 1;
        }
        return output;
      })
    }
  });
}
