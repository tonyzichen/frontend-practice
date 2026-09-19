// 景点探索页：从 data/places.json 加载景点，支持关键字搜索与类型筛选
const toolbar = document.querySelector('#explore-toolbar');
const searchInput = document.querySelector('#place-search');
const resultCount = document.querySelector('#result-count');
const placeGrid = document.querySelector('#place-list');
const emptyState = document.querySelector('#empty-state');

let places = [];
let keyword = '';
let activeType = '全部';

function renderPlaces() {
  const kw = keyword.trim().toLowerCase();
  const visiblePlaces = places.filter((place) => {
    const matchType = activeType === '全部' || place.type === activeType;
    const matchKeyword =
      kw === '' ||
      [place.name, place.type, place.tag, place.location, place.ticket, place.description]
        .join(' ')
        .toLowerCase()
        .includes(kw);
    return matchType && matchKeyword;
  });

  placeGrid.innerHTML = visiblePlaces
    .map(
      (place) => `
        <article class="place-card">
          <span>${place.type} · ${place.tag}</span>
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <span>${place.location} · ${place.ticket}</span>
        </article>`
    )
    .join('');

  resultCount.textContent = `找到 ${visiblePlaces.length} 处景点`;
  emptyState.hidden = visiblePlaces.length !== 0;
}

searchInput.addEventListener('input', () => {
  keyword = searchInput.value;
  renderPlaces();
});

toolbar.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-type]');
  if (!button) return;

  activeType = button.dataset.type;
  toolbar.querySelectorAll('button[data-type]').forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('button-primary', isActive);
    item.classList.toggle('button-secondary', !isActive);
  });
  renderPlaces();
});

fetch('data/places.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    places = data.places;
    renderPlaces();
  })
  .catch(() => {
    resultCount.textContent = '景点信息暂时加载不出来，请刷新重试。';
  });
