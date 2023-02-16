
console.log(1111)

// 中央调度
const PubSub = {
  message: { // 存放所有订阅者

  }, 
  publish(type) {
    console.log('ttt==', type, this.message)
    if (!this.message[type]) return;
    this.message[type].forEach(item => item())
  },
  subscribe(type, cb) {
    if (!this.message[type]) {
      this.message[type] = [cb]
      return
    }
    this.message[type].push(cb)
  }
}

const testA = () => {
  console.log('subA--')
}

const testB = () => {
  console.log('subB--')
}


// 添加订阅者
PubSub.subscribe('A', testA)
PubSub.subscribe('A', () => {
  console.log('subA--2222')
})
PubSub.subscribe('B', testB)

// 发布
PubSub.publish('A')
