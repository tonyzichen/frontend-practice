let allPlaces = [];
let currentType = '全部';
let barChart = null;
let lineChart = null;

// 景点
function showPlaces() {
  const keyword = $('#search').val().trim().toLowerCase();
  const result = allPlaces.filter((place) => {
    const typeOk = currentType === '全部' || place.type === currentType;
    const text = Object.values(place).join(' ').toLowerCase();
    return typeOk && text.includes(keyword);
  });

  $('#place-list').empty();
  result.forEach((place) => {
    $('#place-list').append(`
      <article class="place-card">
        <small>${place.type} · ${place.tag}</small>
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <small>${place.location} · ${place.ticket}</small>
      </article>
    `);
  });
  $('#load-status').text(`共找到 ${result.length} 处景点，点击卡片可以标记。`);
}

function drawCards(data) {
  const total = data.visitors.spots.reduce((sum, item) => sum + item.value, 0);
  const top = data.visitors.spots.reduce((a, b) => a.value > b.value ? a : b);
  const latest = data.visitors.series[1].data;
  const peak = Math.max(...latest);
  $('#chart-cards').html(`
    <div class="card"><strong>${total} 万</strong><span>六个景点年客流合计</span></div>
    <div class="card"><strong>${top.name}</strong><span>客流最多的景点</span></div>
    <div class="card"><strong>${peak} 万</strong><span>2025 年单月峰值</span></div>
  `);
}

//客流数据
function drawCharts(data) {
  const visitorData = data.visitors;
  barChart = echarts.init(document.querySelector('#bar-chart'));
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: visitorData.spots.map(item => item.name) },
    yAxis: { type: 'value', name: '万人次' },
    series: [{
      name: '年客流量',
      type: 'bar',
      data: visitorData.spots.map(item => item.value),
      itemStyle: { color: '#397b83' }
    }]
  });

  lineChart = new Chart(document.querySelector('#line-chart'), {
    type: 'line',
    data: {
      labels: visitorData.months,
      datasets: visitorData.series.map((item, index) => ({
        label: item.name,
        data: item.data,
        borderColor: index === 0 ? '#e28b45' : '#397b83',
        borderWidth: 2,
        tension: 0.25
      }))
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

async function loadData() {
  try {
    const response = await fetch('data/hangzhou.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    allPlaces = data.places;
    showPlaces();
    drawCards(data);
    drawCharts(data);
  } catch (error) {
    $('#load-status').text('数据加载失败，请使用本地服务器打开本项目。');
    console.error(error);
  }
}

$(function () {
  loadData();

  $('#search').on('input', showPlaces);
  $('.tools').on('click', 'button', function () {
    currentType = $(this).data('type');
    $('.tools button').removeClass('active');
    $(this).addClass('active');
    showPlaces();
  });
  $('#place-list').on('click', '.place-card', function () {
    $(this).toggleClass('selected');
  });
});
