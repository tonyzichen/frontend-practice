// 杭州一日游消费记录：数据用“数组 + 对象”保存
const costs = [
  { place: '西湖游船', category: '交通', amount: '55元' },
  { place: '灵隐寺门票', category: '门票', amount: '45元' },
  { place: '龙井茶点', category: '餐饮', amount: '68.5元' },
  { place: '河坊街小吃', category: '餐饮', amount: '36元' },
  { place: '地铁往返', category: '交通', amount: '12元' },
  { place: '错误数据', category: '其他', amount: 'abc元' }
];

// 把“55元”变成数字55。没有数字时返回NaN，表示非法数据。
function getNumber(text) {
  const result = String(text).match(/\d+(\.\d+)?/);
  if (result === null) {
    return NaN;
  }
  return Number(result[0]);
}

// 用map清洗每一条记录，并把金额改成数字。
function cleanData(list) {
  return list.map(function (item) {
    return {
      place: item.place,
      category: item.category,
      amount: getNumber(item.amount)
    };
  });
}

// 用filter留下金额合法且大于0的记录。
function getValidData(list) {
  return list.filter(function (item) {
    return Number.isFinite(item.amount) && item.amount > 0;
  });
}

// 用reduce计算总消费。
function getTotal(list) {
  return list.reduce(function (total, item) {
    return total + item.amount;
  }, 0);
}

// 先按类别排序；类别相同时，再按金额从高到低排序。
function sortData(list) {
  return list.slice().sort(function (a, b) {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return b.amount - a.amount;
  });
}

// 生成输出文字。
function makeReport(budgetText, list) {
  const budget = getNumber(budgetText);
  if (!Number.isFinite(budget) || budget <= 0) {
    return '预算输入错误，请输入大于0的数字，例如300';
  }

  const cleanedData = cleanData(list);
  const validData = getValidData(cleanedData);
  const invalidCount = cleanedData.length - validData.length;
  const total = getTotal(validData);
  const sortedData = sortData(validData);
  const lines = sortedData.map(function (item) {
    return item.category + '：' + item.place + '，' + item.amount.toFixed(2) + '元';
  });

  let result = '杭州一日游消费报告\n';
  result += '预算：' + budget.toFixed(2) + '元\n';
  result += '总消费：' + total.toFixed(2) + '元\n';
  result += total > budget
    ? '超出预算：' + (total - budget).toFixed(2) + '元\n'
    : '剩余预算：' + (budget - total).toFixed(2) + '元\n';
  result += '\n消费明细（类别、金额双排序）：\n' + lines.join('\n');
  result += '\n\n已忽略非法记录：' + invalidCount + '条';
  return result;
}

// for循环和reduce完成同一个统计，用于性能实验。
function totalByFor(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total += list[i].amount;
  }
  return total;
}

function totalByReduce(list) {
  return list.reduce(function (total, item) {
    return total + item.amount;
  }, 0);
}

// 直接设置预算，打开网页时不会弹出输入框。
const budget = '300元';
const cleanedData = cleanData(costs);
const validData = getValidData(cleanedData);
const report = makeReport(budget, costs);

console.log(report);
document.querySelector('#output').textContent = report;

// sort结论：返回负数时a在前，正数时b在前，0表示顺序不变。
console.log('sort研究：先按类别，再按金额从高到低。');

// 性能实验：实际耗时会因电脑和浏览器不同而不同。
const testData = [];
for (let i = 0; i < 10000; i++) {
  testData.push(validData[i % validData.length]);
}
console.time('for循环');
console.log('for结果：', totalByFor(testData));
console.timeEnd('for循环');
console.time('reduce');
console.log('reduce结果：', totalByReduce(testData));
console.timeEnd('reduce');
