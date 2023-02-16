
// 中央调度
const PubSub = {
  list: [], // 存放所有订阅者
  publish() {
    this.list.forEach(item => item())
   },
  subscribe(cb) {
    this.list.push(cb)
  }
}

const testA = () => {
  console.log('subA--')
}

const testB = () => {
  console.log('subB--')
}


// 添加订阅者
PubSub.subscribe(testA)
PubSub.subscribe(testB)

// 发布
PubSub.publish()
