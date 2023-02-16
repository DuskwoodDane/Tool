
const contextObj = {}

const dom = document.querySelector('body')

const proxyBoxyContext = new Proxy(contextObj, {
  get(target, key) { 
    return target[key]
  },
  
  set(target, key, value) {
    if (key === 'data') {
      dom.innerHTML = value
    }
    target[key] = value
  }
})
