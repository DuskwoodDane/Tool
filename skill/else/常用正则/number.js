
// 数字  \d匹配所有数字 对应[0-9]
const rule1 = /^\d*$/

// 数字(不能包含空字符)
const rule2 = /^[0-9]*\S$/

// n位的(数字/字符) /^d{n}$/  {n}前面的值为n限制的对象
const rule3 = /^[0-9]{3}$/

// 至少n位的数字
const rule4 = /^[0-9]{3,}$/

//  m-n位  ^d{m,n}$  包括m和n
const rule5 = /^[0-9]{1,3}$/

// 零和非零开头的数字 ^(0|[1-9][0-9]*)$ (该校验只要为数字必通过，可将0或其他数字之一作为判断条件 )
const rule6 = /^(0|[1-9][0-9]*)$/

// 非零开头的最多带两位小数的数字 ^([1-9][0-9]*)+(.[0-9]{1,2})?$
const rule7 = /^([1-9[0-9]*)+(.[0-9]{1,2})?$/

// 带1-2位小数的正数或负数 ^(-)?d+(.d{1,2})?$
const rule8 = /^(-)?\d+(.\d{1,2})?$/

// 正数、负数、和小数 ^(-|+)?d+(.d+)?$
const rule9 = /^(-|[+])?\d+(.\d+)?$/

// 非零的正负整数
const rule10 = /^(-|[+])?[1-9]\d*$/