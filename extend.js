const extend = (Class, behavior) => {
  const name = behavior.name || `Extended${Class.name}`
  const baseName = behavior.baseName || 'base'
  const ExtendedClass = function (instance) {
    if (!(this instanceof ExtendedClass)) return new ExtendedClass(instance)
    this[baseName] = instance
  }
  Object.defineProperty(ExtendedClass, 'name', {
    writable: false,
    value: name
  })
  const walkPrototype = (prototype) => {
    if (prototype) {
      Object.keys(prototype).forEach((key) => {
        const fn = prototype[key]
        if (typeof fn === 'function') {
          ExtendedClass.prototype[key] = function () {
            const ret = fn.apply(this[baseName], arguments)
            if (ret instanceof ExtendedClass) return ret
            if (ret instanceof Class) return new ExtendedClass(ret)
            else return ret
          }
        } else {
          Object.defineProperty(ExtendedClass.prototype, key, {
            get: function () {
              return this[baseName][key]
            },
            set: function (value) {
              this[baseName][key] = value
            }
          })
        }
      })
      walkPrototype(Object.getPrototypeOf(prototype))
    }
  }
  walkPrototype(Class.prototype)
  Object.keys(behavior).forEach((key) => {
    const fn = behavior[key]
    if (typeof fn === 'function') {
      ExtendedClass.prototype[key] = function () {
        const ret = fn.apply(this, arguments)
        if (ret instanceof ExtendedClass) return ret
        if (ret instanceof Class) return new ExtendedClass(ret)
        else return ret
      }
    }
  })
  return ExtendedClass
}

module.exports = extend
