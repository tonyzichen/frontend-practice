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

function makeThreeScene() {
  const THREE = window.CourseTHREE;
  const box = document.querySelector('#three-scene');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9dce8);
  scene.fog = new THREE.Fog(0xb9dce8, 15, 35);

  const camera = new THREE.PerspectiveCamera(45, box.clientWidth / box.clientHeight, 0.1, 100);
  camera.position.set(8, 6, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(box.clientWidth, box.clientHeight);
  box.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6d8f86, 1.3));
  const light = new THREE.DirectionalLight(0xfff1cf, 1.3);
  light.position.set(-5, 10, 4);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 35),
    new THREE.MeshStandardMaterial({ color: 0x789b78 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(6, 48),
    new THREE.MeshStandardMaterial({ color: 0x4d9db0, roughness: 0.3 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = 0.03;
  lake.scale.set(1.3, 0.7, 1);
  scene.add(lake);

  [-5, 0, 5].forEach((x, i) => {
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 3 + i * 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x547b63 })
    );
    mountain.position.set(x, 1.5, -6);
    scene.add(mountain);
  });

  const pagoda = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 3.2, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xd4864d })
  );
  body.position.y = 1.6;
  pagoda.add(body);
  [1.1, 2, 2.9].forEach((y, i) => {
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.15 - i * 0.18, 0.35, 4),
      new THREE.MeshStandardMaterial({ color: 0x394b40 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = y;
    pagoda.add(roof);
  });
  pagoda.position.set(3.8, 0, -0.8);
  scene.add(pagoda);

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.3, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xe5c58b })
  );
  bridge.position.set(-0.8, 0.25, 2.2);
  scene.add(bridge);

  const boat = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x8a5a33 })
  );
  boat.position.set(0, 0.2, 0.5);
  scene.add(boat);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    boat.position.x = Math.sin(time * 0.5) * 3;
    pagoda.rotation.y = Math.sin(time * 0.5) * 0.08;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = box.clientWidth / box.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(box.clientWidth, box.clientHeight);
    if (barChart) barChart.resize();
  });
}

$(function () {
  loadData();
  makeThreeScene();

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
