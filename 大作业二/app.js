function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value, tipElement) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (tipElement) tipElement.textContent = '保存失败：浏览器本地存储空间不足。';
    return false;
  }
}

// 一、杭州一日游预算
const COST_KEY = 'homework2-costs';
const BUDGET_KEY = 'homework2-budget';
const defaultCosts = [
  { id: 11, place: '西湖游船', category: '交通', amount: 55 },
  { id: 12, place: '灵隐寺门票', category: '门票', amount: 45 },
  { id: 13, place: '龙井茶点', category: '餐饮', amount: 68.5 },
  { id: 14, place: '河坊街小吃', category: '餐饮', amount: 36 },
  { id: 15, place: '地铁往返', category: '交通', amount: 12 }
];
let costs = readStorage(COST_KEY, defaultCosts);
let budget = readStorage(BUDGET_KEY, 300);
const budgetForm = document.querySelector('#budget-form');
const budgetInput = document.querySelector('#budget-input');
const budgetSummary = document.querySelector('#budget-summary');
const budgetTip = document.querySelector('#budget-tip');
const costList = document.querySelector('#cost-list');
budgetInput.value = budget;

function renderCosts() {
  costList.replaceChildren();
  const validCosts = costs.filter((item) => Number.isFinite(item.amount) && item.amount > 0);
  const sortedCosts = validCosts.slice().sort((a, b) => {
    if (a.category === b.category) return b.amount - a.amount;
    return a.category.localeCompare(b.category, 'zh-CN');
  });
  sortedCosts.forEach((item) => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = `${item.category}：${item.place}，${item.amount.toFixed(2)} 元`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'small-button danger';
    button.dataset.id = item.id;
    button.textContent = '删除';
    li.append(text, button);
    costList.appendChild(li);
  });
  if (sortedCosts.length === 0) costList.innerHTML = '<li class="empty">还没有消费记录</li>';

  const total = validCosts.reduce((sum, item) => sum + item.amount, 0);
  const difference = budget - total;
  const info = [
    `预算：${budget.toFixed(2)} 元`,
    `总消费：${total.toFixed(2)} 元`,
    difference >= 0 ? `剩余：${difference.toFixed(2)} 元` : `超出：${Math.abs(difference).toFixed(2)} 元`
  ];
  budgetSummary.replaceChildren(...info.map((text) => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }));
}

budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const place = document.querySelector('#cost-place').value.trim();
  const category = document.querySelector('#cost-category').value;
  const amount = Number(document.querySelector('#cost-amount').value);
  if (!place || !Number.isFinite(amount) || amount <= 0) {
    budgetTip.textContent = '请输入项目名称和大于 0 的金额。';
    return;
  }
  costs.push({ id: Date.now(), place, category, amount });
  writeStorage(COST_KEY, costs, budgetTip);
  budgetForm.reset();
  budgetTip.textContent = '消费记录添加成功。';
  renderCosts();
});

document.querySelector('#save-budget').addEventListener('click', () => {
  const newBudget = Number(budgetInput.value);
  if (!Number.isFinite(newBudget) || newBudget <= 0) {
    budgetTip.textContent = '预算必须是大于 0 的数字。';
    return;
  }
  budget = newBudget;
  writeStorage(BUDGET_KEY, budget, budgetTip);
  budgetTip.textContent = '预算已保存。';
  renderCosts();
});

costList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  costs = costs.filter((item) => item.id !== Number(button.dataset.id));
  writeStorage(COST_KEY, costs, budgetTip);
  renderCosts();
});

// 二、杭州地点收藏
const PLACE_KEY = 'homework2-places';
let places = readStorage(PLACE_KEY, []);
let currentPlaceFilter = 'all';
const placeForm = document.querySelector('#place-form');
const placeList = document.querySelector('#place-list');
const placeTip = document.querySelector('#place-tip');
const placeFilters = document.querySelector('#place-filters');

function renderPlaces() {
  placeList.replaceChildren();
  const shown = places.filter((item) => currentPlaceFilter === 'all' || item.status === currentPlaceFilter);
  if (shown.length === 0) {
    placeList.innerHTML = `<tr><td class="empty" colspan="6">${places.length ? '当前筛选条件下没有地点' : '还没有收藏地点'}</td></tr>`;
    return;
  }
  shown.forEach((place) => {
    const row = document.createElement('tr');
    [place.name, place.area, place.type, `${place.rating} / 5`, place.status === 'visited' ? '已打卡' : '想去'].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    const action = document.createElement('td');
    action.innerHTML = `<button type="button" data-action="toggle" data-id="${place.id}">${place.status === 'visited' ? '设为想去' : '标记打卡'}</button><button class="danger" type="button" data-action="delete" data-id="${place.id}">删除</button>`;
    row.appendChild(action);
    placeList.appendChild(row);
  });
}

placeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#place-name').value.trim();
  const area = document.querySelector('#place-area').value.trim();
  const type = document.querySelector('#place-type').value;
  const rating = Number(document.querySelector('#place-rating').value);
  if (!name || !area || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    placeTip.textContent = '请填写地点、区域和 0～5 之间的评分。';
    return;
  }
  places.push({ id: `place-${Date.now()}`, name, area, type, rating, status: 'want' });
  writeStorage(PLACE_KEY, places, placeTip);
  placeForm.reset();
  placeTip.textContent = '地点添加成功。';
  renderPlaces();
});

placeList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'toggle') {
    places = places.map((item) => item.id === button.dataset.id
      ? { ...item, status: item.status === 'visited' ? 'want' : 'visited' }
      : item);
  } else {
    places = places.filter((item) => item.id !== button.dataset.id);
  }
  writeStorage(PLACE_KEY, places, placeTip);
  renderPlaces();
});

placeFilters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  currentPlaceFilter = button.dataset.filter;
  placeFilters.querySelectorAll('button[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
  renderPlaces();
});

renderCosts();
renderPlaces();
