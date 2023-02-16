
/**
 * 各种行为类
 */

class Behavior {
  constructor(name) {
    this.name = name
  }
  run() {
    console.log(`${this.name} in run`)
  }
  eat() {
    console.log(`${this.name} in eat`)
  }
  error() {
    console.error('行为错误')
  }
}

/**
 * 代理类
 */
class ProxyBehavior {
  constructor(name) {
    this.superBehavior = new Behavior(name);
  }

  taskRun(flag = false) {
    if (flag) {
      this.superBehavior.run();
    } else {
      this.superBehavior.error();
    }
  }
  taskEat(flag = false) {
    if (flag) {
      this.superBehavior.eat();
    } else {
      this.superBehavior.error();
    }
  }
}

const proxyBehavior = new ProxyBehavior('Jerry');

