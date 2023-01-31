/**
 * 需求：
 * 很多公司的年终奖是根据员工的工资基数和年底绩效情况来发放的。
 * 例如，
 * 绩效为S的人年终奖有4倍工资，
 * 绩效为A的人年终奖有3倍工资，
 * 而绩效为B的人年终奖是2倍工资。
 * 假设财务部要求我们提供一段代码，来方便他们计算员工的年终奖
 */


const strategies = {
  'S': (salary) => salary * 4,
  'A': (salary) => salary * 3,
  'B': (salary) => salary * 2
}


const calculateBonus = (level, salary) => strategies[level](salary);

console.log(calculateBonus('S', 10000)); // 40000
console.log(calculateBonus('A', 2000)); // 6000
console.log(calculateBonus('B', 1000)); // 2000