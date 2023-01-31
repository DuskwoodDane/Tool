
const getSingle = function (fn) {
  let result;
  return (...args) => result || (result = fn.apply(this, args));
}

const createUserInstance = getSingle((username) => {
  return { username }
});

const createBoxMainInstance = getSingle((width, height) => {
  return  { width, height }
});

// 测试

// a === b  c === d  a !== c

let a = createUserInstance('Tom');
let b = createUserInstance('Jerry');

let c = createBoxMainInstance(15, 20);
let d = createBoxMainInstance(30, 40);

console.log(a === b, a, b)
console.log(c === d, a === c, c, d)

// 惰性单例模式(指在需要的时候才创建对象实例)
var createLoginLayer = (function(){
  var div;
  // div存在则直接返回，不存在则创建
  return function(){
    if (!div ){
      div = document.createElement( 'div' );
      div.innerHTML = '我是登录浮窗';
      div.style.display = 'none';
      document.body.appendChild( div );
    }

    return div;
  }
})();
document.getElementById('loginBtn').onclick = function(){
  var loginLayer = createLoginLayer();
  loginLayer.style.display = 'block';
};
document.getElementById('hidden').onclick = function(){
  var loginLayer = createLoginLayer();
  loginLayer.style.display = 'none';
};

