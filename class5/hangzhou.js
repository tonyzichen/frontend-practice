const STORAGE_KEY = 'hangzhou-place-notes-v1';
const seedPlaces = [
  { id: 'west-lake', name: '西湖断桥', area: '西湖区', type: '自然风光', rating: 4.9, note: '清晨湖面很安静，适合慢慢走。' },
  { id: 'hefeng', name: '河坊街', area: '上城区', type: '人文古迹', rating: 4.6, note: '老字号和街巷烟火气很有杭州味。' },
  { id: 'longjing', name: '龙井村', area: '西湖区', type: '城市漫步', rating: 4.8, note: '茶园层叠，雨后空气特别清新。' }
];

const form = document.querySelector('#place-form');
const list = document.querySelector('#place-list');
const message = document.querySelector('#form-message');
const searchInput = document.querySelector('#search-input');
const countSummary = document.querySelector('#count-summary');
const submitButton = document.querySelector('#submit-button');
let places = loadPlaces();
let editingId = null;

function loadPlaces() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [...seedPlaces];
  } catch (error) {
    showMessage('读取本地数据失败，已使用示例数据。');
    return [...seedPlaces];
  }
}

function savePlaces() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    return true;
  } catch (error) {
    showMessage('保存失败：浏览器存储空间不足，请导出数据后清理空间。');
    return false;
  }
}

function showMessage(text = '') { message.textContent = text; }

function render() {
  const keyword = searchInput.value.trim().toLowerCase();
  const visiblePlaces = places.filter((place) => [place.name, place.area, place.type, place.note].join(' ').toLowerCase().includes(keyword));
  list.replaceChildren();
  countSummary.textContent = `共 ${places.length} 条记录${keyword ? `，当前显示 ${visiblePlaces.length} 条` : ''}`;
  if (visiblePlaces.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty';
    cell.textContent = '没有找到匹配的杭州地点。';
    row.appendChild(cell);
    list.appendChild(row);
    return;
  }
  visiblePlaces.forEach((place) => {
    const row = document.createElement('tr');
    [place.name, place.area, place.type].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    const ratingCell = document.createElement('td');
    ratingCell.className = 'rating';
    ratingCell.textContent = `${place.rating} / 5`;
    row.appendChild(ratingCell);
    const noteCell = document.createElement('td');
    noteCell.textContent = place.note || '暂无记录';
    row.appendChild(noteCell);
    const actionsCell = document.createElement('td');
    actionsCell.className = 'row-actions';
    const editButton = document.createElement('button');
    editButton.type = 'button'; editButton.className = 'secondary'; editButton.dataset.action = 'edit'; editButton.dataset.id = place.id; editButton.textContent = '修改';
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button'; deleteButton.className = 'danger'; deleteButton.dataset.action = 'delete'; deleteButton.dataset.id = place.id; deleteButton.textContent = '删除';
    actionsCell.append(editButton, deleteButton); row.appendChild(actionsCell); list.appendChild(row);
  });
}

function resetForm() { form.reset(); editingId = null; submitButton.textContent = '添加收藏'; }

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#place-name').value.trim();
  const area = document.querySelector('#place-area').value.trim();
  const type = document.querySelector('#place-type').value;
  const rating = Number(document.querySelector('#place-rating').value);
  const note = document.querySelector('#place-note').value.trim();
  if (!name || !area || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    showMessage('请填写地点名称、区域，并输入 0 到 5 之间的评分。');
    return;
  }
  const place = { id: editingId || `place-${Date.now()}`, name, area, type, rating: Number(rating.toFixed(1)), note };
  if (editingId) places = places.map((item) => item.id === editingId ? place : item);
  else places = [place, ...places];
  if (savePlaces()) { showMessage(editingId ? '地点已修改。' : '地点已添加。'); resetForm(); render(); }
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const place = places.find((item) => item.id === button.dataset.id);
  if (!place) return;
  if (button.dataset.action === 'delete') {
    places = places.filter((item) => item.id !== place.id);
    savePlaces(); showMessage('地点已删除。'); render(); return;
  }
  editingId = place.id;
  document.querySelector('#place-name').value = place.name;
  document.querySelector('#place-area').value = place.area;
  document.querySelector('#place-type').value = place.type;
  document.querySelector('#place-rating').value = place.rating;
  document.querySelector('#place-note').value = place.note;
  submitButton.textContent = '保存修改';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

searchInput.addEventListener('input', render);
document.querySelector('#clear-button').addEventListener('click', () => {
  if (!places.length || !window.confirm('确定清空全部收藏吗？')) return;
  places = []; savePlaces(); showMessage('收藏已清空。'); render();
});

document.querySelector('#export-button').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(places, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'hangzhou-places.json'; link.click();
  URL.revokeObjectURL(url);
  showMessage('JSON 数据已开始下载。');
});

render();
