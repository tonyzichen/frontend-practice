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

console.log('清洗后：', cleanData(costs));
console.log('合法数据：', getValidData(cleanData(costs)));
console.log('总消费：', getTotal(getValidData(cleanData(costs))));
console.log('排序后：', sortData(getValidData(cleanData(costs))));
