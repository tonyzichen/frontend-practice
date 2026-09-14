const form = document.querySelector('#place-form');
const nameInput = document.querySelector('#place-name');
const areaInput = document.querySelector('#place-area');
const typeInput = document.querySelector('#place-type');
const ratingInput = document.querySelector('#place-rating');
const list = document.querySelector('#place-list');
const tip = document.querySelector('#tip');
const filters = document.querySelector('#filters');

let places = [];
let currentFilter = 'all';

function render() {
  list.replaceChildren();
  const shownPlaces = places.filter((place) => currentFilter === 'all' || place.status === currentFilter);

  if (shownPlaces.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty';
    cell.textContent = places.length === 0 ? '还没有收藏地点，添加第一条杭州记录吧。' : '当前筛选条件下没有地点。';
    row.appendChild(cell);
    list.appendChild(row);
    return;
  }

  shownPlaces.forEach((place) => {
    const row = document.createElement('tr');
    [place.name, place.area, place.type, `${place.rating} / 5`].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    const statusCell = document.createElement('td');
    statusCell.textContent = place.status === 'visited' ? '已打卡' : '想去';
    row.appendChild(statusCell);
    const actionCell = document.createElement('td');
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.dataset.action = 'toggle';
    toggleButton.dataset.id = place.id;
    toggleButton.textContent = place.status === 'visited' ? '设为想去' : '标记打卡';
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = place.id;
    deleteButton.textContent = '删除';
    actionCell.append(toggleButton, deleteButton);
    row.appendChild(actionCell);
    list.appendChild(row);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const area = areaInput.value.trim();
  const rating = Number(ratingInput.value);

  if (!name || !area || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    tip.textContent = '请填写地点名称、所在区域，并输入 0 到 5 之间的评分。';
    return;
  }

  places.push({ id: `place-${Date.now()}`, name, area, type: typeInput.value, rating, status: 'want' });
  form.reset();
  tip.textContent = '';
  render();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  if (button.dataset.action === 'toggle') {
    places = places.map((place) => place.id === button.dataset.id
      ? { ...place, status: place.status === 'visited' ? 'want' : 'visited' }
      : place);
  }
  if (button.dataset.action === 'delete') {
    places = places.filter((place) => place.id !== button.dataset.id);
  }
  render();
});

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  currentFilter = button.dataset.filter;
  filters.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  render();
});

render();
