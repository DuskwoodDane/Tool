/**
 * 需求：
 *    用户名不能为空
 *    密码长度不能少于6位
 *    手机号码必须符合格式
 */

const strategies = {
  isNotEmpty: (value, msg) => {
    return Boolean(!value) ? msg : false
  },
  minLength: (value, len, msg) => {
    return value.length >= len ? false : msg
  },
  isMobile: (value, msg) => {
    if (!/^1[3|5|8][0-9]{9}$/.test(value)) {
      return msg
    }
    return false
  }
}

class Validator {
  constructor() {
    this.cache = []; // 保存校验规则
  }

  add(value, rule, errorMsg) {
    const ary = rule.split(':') // 将rule规则名与参数分开
    this.cache.push(() => {
      const strategy = ary.shift(); // 获取rule规则名
      ary.unshift(value);
      ary.push(errorMsg)
      return strategies[strategy].apply(this, ary);
    })
  }

  start() {
    for (let i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
      const res = validatorFunc();
      if (res) return res
    }
  }
}

// 为false则验证通过
const validForm = () => {
  const validator = new Validator();
  validator.add('432325', 'isNotEmpty', '账号不能为空');
  validator.add('25255356', 'minLength:6', '密码长度最低为6');
  validator.add('13125356531', 'isMobile', '请输入正确的手机格式');
  const res = validator.start();
  return res;
}

console.log('result==', validForm())
