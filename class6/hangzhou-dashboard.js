const hangzhouState = { data: null };
let hangzhouBarChart = null;
let hangzhouLineChart = null;

const renderHangzhouCards = (data) => {
  const visitorCounts = data.series[0].counts;
  const total = visitorCounts.reduce((sum, count) => sum + count, 0);
  const peak = Math.max(...visitorCounts);
  const peakMonth = data.months[visitorCounts.indexOf(peak)];
  const average = total / visitorCounts.length;

  const cards = [
    { title: '年度游客总量', value: total.toFixed(0) + ' 万人次', note: '统计范围：近 12 个月' },
    { title: '客流高峰月', value: peakMonth, note: '当月游客量：' + peak + ' 万人次' },
    { title: '月均游客量', value: average.toFixed(1) + ' 万人次', note: '按 12 个月平均计算' }
  ];

  $('#cards').empty();
  cards.forEach(card => {
    $('#cards').append(`
      <div class="col-md-4">
        <article class="card h-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title h6">${card.title}</h3>
            <p class="card-text fs-4 mb-1">${card.value}</p>
            <p class="card-text small text-muted mb-0">${card.note}</p>
          </div>
        </article>
      </div>
    `);
  });
};

const renderHangzhouBarChart = (data) => {
  if (hangzhouBarChart === null) {
    hangzhouBarChart = echarts.init(document.querySelector('#bar-chart'));
  }

  const visitorSeries = data.series[0];
  hangzhouBarChart.setOption({
    title: { text: '杭州西湖景区各月游客量', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.months,
      name: '月份'
    },
    yAxis: {
      type: 'value',
      name: '万人次',
      min: 0
    },
    series: [{
      name: visitorSeries.category,
      type: 'bar',
      data: visitorSeries.counts,
      itemStyle: { color: '#198754' }
    }]
  });
};


const renderHangzhouLineChart = (data) => {
  if (hangzhouLineChart !== null) {
    hangzhouLineChart.destroy();
  }

  const visitorSeries = data.series[0];
  hangzhouLineChart = new Chart(document.querySelector('#line-chart'), {
    type: 'line',
    data: {
      labels: data.months,
      datasets: [{
        label: visitorSeries.category + '（万人次）',
        data: visitorSeries.counts,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.15)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.25,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '杭州西湖景区月度客流趋势' },
        legend: { position: 'bottom' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '万人次' }
        },
        x: { title: { display: true, text: '月份' } }
      }
    }
  });
};

const loadHangzhouData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/hangzhou-westlake.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0 || data.months.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    hangzhouState.data = data;
    $('#sub-title').text(data.source + ' · 统计范围：近 12 个月');
    $('#status').hide();
    renderHangzhouCards(data);
    renderHangzhouBarChart(data);
    renderHangzhouLineChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

window.addEventListener('resize', () => {
  if (hangzhouBarChart) {
    hangzhouBarChart.resize();
  }
});

loadHangzhouData();
