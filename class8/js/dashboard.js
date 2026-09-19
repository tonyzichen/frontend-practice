// 数据看板：加载客流数据渲染概览卡片、柱状图与折线图，并搭建可交互的三维西湖场景
const statusEl = document.querySelector('#dashboard-status');
const sourceEl = document.querySelector('#chart-source');
const statGrid = document.querySelector('#stat-cards');
const spotChartEl = document.querySelector('#spot-chart');
const trendChartEl = document.querySelector('#trend-chart');

let spotChart = null;
let trendChart = null;

// ── 概览卡片：从数据里提炼三个关键数字 ──
const renderStats = (data) => {
  const spots = data.bySpot.spots;
  const total = spots.reduce((sum, spot) => sum + spot.visitors, 0);
  const top = spots.reduce((a, b) => (a.visitors >= b.visitors ? a : b));
  const latest = data.monthly.series[data.monthly.series.length - 1];
  const peakIndex = latest.data.indexOf(Math.max(...latest.data));
  const cards = [
    {
      value: `${total.toLocaleString()} 万`,
      label: '热门景点年客流合计',
      note: `六个主要景点全年总人次（${data.bySpot.unit}）`
    },
    {
      value: top.name,
      label: '人气最高的景点',
      note: `年客流约 ${top.visitors.toLocaleString()} 万人次`
    },
    {
      value: `${latest.data[peakIndex]} 万`,
      label: `${latest.name}客流峰值`,
      note: `全年最高，出现在 ${data.monthly.months[peakIndex]}`
    }
  ];
  statGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="info-card">
          <span class="card-number" aria-hidden="true">${card.value}</span>
          <h3>${card.label}</h3>
          <p>${card.note}</p>
        </article>`
    )
    .join('');
};

// ── 柱状图：各景点年客流量对比 ──
const renderSpotChart = (data) => {
  if (spotChart === null) {
    spotChart = echarts.init(spotChartEl);
  }
  spotChart.setOption({
    title: { text: data.bySpot.title, left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: 64, right: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      data: data.bySpot.spots.map((spot) => spot.name),
      axisLabel: { interval: 0 }
    },
    yAxis: { type: 'value', name: data.bySpot.unit },
    series: [
      {
        name: '年客流量',
        type: 'bar',
        data: data.bySpot.spots.map((spot) => spot.visitors),
        itemStyle: { color: '#2d7783' },
        barMaxWidth: 42
      }
    ]
  });
};

// ── 折线图：近两年月度客流走势 ──
const renderTrendChart = (data) => {
  if (trendChart === null) {
    trendChart = echarts.init(trendChartEl);
  }
  trendChart.setOption({
    title: { text: data.monthly.title, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 64, right: 24, bottom: 64 },
    xAxis: { type: 'category', data: data.monthly.months },
    yAxis: { type: 'value', name: data.monthly.unit },
    series: data.monthly.series.map((line, index) => ({
      name: line.name,
      type: 'line',
      smooth: true,
      data: line.data,
      itemStyle: { color: index === 0 ? '#9db8bf' : '#2d7783' },
      lineStyle: { width: 2 }
    }))
  });
};

// ── 数据加载 ──
const loadDashboard = async () => {
  statusEl.style.display = 'block';
  statusEl.textContent = '正在加载客流数据…';
  try {
    const response = await fetch('data/visitors.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    sourceEl.textContent = `数据来源：${data.source}`;
    if (data.bySpot.spots.length === 0) {
      statusEl.textContent = '暂无客流数据';
      return;
    }
    statusEl.style.display = 'none';
    renderStats(data);
    renderSpotChart(data);
    renderTrendChart(data);
  } catch (error) {
    statusEl.textContent = '客流数据暂时加载不出来，请刷新重试。';
  }
};

window.addEventListener('resize', () => {
  if (spotChart) spotChart.resize();
  if (trendChart) trendChart.resize();
});

// ── 三维西湖：湖面、远山、雷峰塔、断桥、月亮与漂移的小船 ──
const initWestLakeScene = () => {
  const container = document.querySelector('#westlake-scene');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14333f);
  scene.fog = new THREE.Fog(0x14333f, 18, 42);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(9, 6, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const moonlight = new THREE.DirectionalLight(0xfff4d6, 0.9);
  moonlight.position.set(6, 10, 4);
  scene.add(moonlight);

  // 岸地与湖面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x2f4a3a })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(7.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x2d7783, roughness: 0.25, metalness: 0.35 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = 0.02;
  scene.add(lake);

  // 远山
  [
    [-9, -8, 3.4, 5.2],
    [-2.5, -10, 2.6, 4.2],
    [4.5, -8.5, 3.0, 4.6],
    [10, -6, 2.2, 3.4]
  ].forEach(([x, z, radius, height]) => {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 24),
      new THREE.MeshStandardMaterial({ color: 0x24505c })
    );
    hill.position.set(x, height / 2, z);
    scene.add(hill);
  });

  // 雷峰塔：石座＋三层塔身＋塔刹
  const pagoda = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc9a063 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a3b28 });
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.9, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x6b7d7f })
  );
  base.position.y = 0.25;
  pagoda.add(base);

  let levelY = 0.5;
  [
    [1.35, 0.7],
    [1.05, 0.6],
    [0.75, 0.5]
  ].forEach(([radius, height]) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, height, 10), bodyMat);
    body.position.y = levelY + height / 2;
    pagoda.add(body);
    levelY += height;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(radius * 1.25, 0.32, 10), roofMat);
    roof.position.y = levelY + 0.16;
    pagoda.add(roof);
    levelY += 0.32;
  });

  const spireMat = new THREE.MeshStandardMaterial({
    color: 0xf5d76e,
    emissive: 0xf5d76e,
    emissiveIntensity: 0.8
  });
  const spire = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), spireMat);
  spire.position.y = levelY + 0.15;
  pagoda.add(spire);
  pagoda.position.set(4.6, 0, -4.2);
  scene.add(pagoda);

  // 断桥
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.18, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xe8e3d5 })
  );
  bridge.position.set(-2.8, 0.22, 3.4);
  bridge.rotation.y = Math.PI / 7;
  scene.add(bridge);

  // 月亮
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xfdf6d8, emissive: 0xfdf6d8, emissiveIntensity: 0.85 })
  );
  moon.position.set(-8, 7.5, -9);
  scene.add(moon);

  // 一叶小船
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.16, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x8a5a33 })
  );
  hull.position.y = 0.1;
  boat.add(hull);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.22, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xd9cba8 })
  );
  cabin.position.set(-0.1, 0.26, 0);
  boat.add(cabin);
  boat.position.set(0, 0.05, 1.5);
  scene.add(boat);

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    boat.position.x = Math.sin(t * 0.35) * 4.2;
    boat.position.y = 0.05 + Math.sin(t * 1.2) * 0.03;
    boat.rotation.z = Math.sin(t * 0.9) * 0.04;
    spireMat.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.35;
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
};

loadDashboard();
initWestLakeScene();
