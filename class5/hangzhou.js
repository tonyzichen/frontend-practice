const form = document.querySelector('#place-form');
const nameInput = document.querySelector('#place-name');
const areaInput = document.querySelector('#place-area');
const typeInput = document.querySelector('#place-type');
const ratingInput = document.querySelector('#place-rating');
const list = document.querySelector('#place-list');
const tip = document.querySelector('#tip');

let places = [];

function render() {
  list.replaceChildren();

  if (places.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'empty';
    cell.textContent = '还没有收藏地点，添加第一条杭州记录吧。';
    row.appendChild(cell);
    list.appendChild(row);
    return;
  }

  places.forEach((place) => {
    const row = document.createElement('tr');
    [place.name, place.area, place.type, `${place.rating} / 5`].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
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

  places.push({ name, area, type: typeInput.value, rating });
  form.reset();
  tip.textContent = '';
  render();
});

render();
