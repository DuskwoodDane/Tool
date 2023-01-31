    //  (1) 常规例子
class Singleton {
  constructor(name) {
    this.name = name;
    this.instance = null;
  }

  getName() {
    return this.name;
  }

  static getInstance(name) {
    if (this.instance) return this.instance;
    this.instance = new Singleton(name);
    return this.instance;
  }
}

// a === b   a.name = Tom  b.name = Tom
const a = Singleton.getInstance('Tom');
const b = Singleton.getInstance('Jerry');

console.log('a', a === b, a, b)