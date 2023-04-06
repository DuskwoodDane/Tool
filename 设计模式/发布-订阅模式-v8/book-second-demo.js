
const salesOffices = {} // 定义售楼处

salesOffices.clientList = {} // 缓存列表，存放订阅者的回调函数

salesOffices.listen = function (key, fn) { // 增加订阅者
  
  if (!this.clientList[key]) { // 设置key为消息增加分类
    this.clientList[key] = [];
  }
  this.clientList[key].push(fn) // 订阅的消息添加进缓存列表
  console.log('555', key, this.clientList)
}

salesOffices.trigger = function () {
  const key = Array.prototype.shift.call(arguments);

  const fns = this.clientList[key];
  if (!fns || fns.length === 0) return;

  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i];
    fn.apply(this, [...arguments]);
  }
}

salesOffices.listen('a200', (name, price, square) => {
  console.log(name, 'price=>', price, square + 'square');
})

salesOffices.listen('a200', (name, price, square) => {
  console.log(name, '666=>', price, square + 'why');
})

salesOffices.listen('a300', (name, price, square) => {
  console.log(name, 'price=>', price, square + 'square');
})

salesOffices.trigger('a200', 'Tom', 20000000, 88);
salesOffices.trigger('a300', 'Jerry', 30000000, 110);
