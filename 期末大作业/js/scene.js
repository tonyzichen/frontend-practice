// 用基本几何体表示地标；尺寸只用于课堂模型示意。
$(function () {
  const landmarks = {
    westlake: { x: 0, y: 0.6, z: 0 },
    leifengta: { x: 4.6, y: 1.5, z: -4.2 },
    duanqiao: { x: -2.8, y: 0.3, z: 3.4 },
  };
  const landmarkIds = ["westlake", "leifengta", "duanqiao"];
  const container = document.querySelector("#westlake-scene");
  let scene = null;
  let camera = null;
  let renderer = null;
  let controls = null;
  let lake = null;
  let pagoda = null;
  let bridge = null;
  let boat = null;
  let clock = null;
  let animationTime = 0;
  let paused = false;
  let stopped = false;
  let animationFrame = 0;

  function showFallback(message) {
    HZ.showMessage("#scene-status", message + " 地标文字与其他功能仍可使用。", "error");
    $("#westlake-scene").html(
      '<div class="scene-fallback">西湖 · 雷峰塔 · 断桥<br><small>湖畔、塔影与古桥的静态地标示意</small></div>',
    );
    $("#reset-scene,#pause-scene").prop("disabled", true);
  }

  function showLandmarkButtons() {
    $("[data-landmark]").each(function () {
      $(this).attr(
        "aria-pressed",
        String(this.dataset.landmark === HZ.state.selectedPlaceId),
      );
    });
  }

  function focusLandmark(id) {
    if (!controls || !landmarkIds.includes(id)) {
      return;
    }
    const point = landmarks[id];
    controls.target.set(point.x, point.y, point.z);
    camera.position.set(point.x + 7, point.y + 5, point.z + 8);
  }

  function selectLandmark(id) {
    if (!landmarkIds.includes(id)) {
      return;
    }
    HZ.state.selectedPlaceId = id;
    HZ.saveData();
    showLandmarkButtons();
    focusLandmark(id);
  }

  function createLake() {
    // 岸地与湖面
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x2f4a3a }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    lake = new THREE.Mesh(
      new THREE.CircleGeometry(7.5, 64),
      new THREE.MeshStandardMaterial({
        color: 0x2d7783,
        roughness: 0.25,
        metalness: 0.35,
      }),
    );
    lake.rotation.x = -Math.PI / 2;
    lake.position.y = 0.02;
    lake.userData.placeId = "westlake";
    scene.add(lake);
  }

  function createPagoda() {
    // 雷峰塔：石座＋三层塔身＋塔刹
    pagoda = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a063 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3b28 });
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.9, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x6b7d7f }),
    );
    base.position.y = 0.25;
    pagoda.add(base);

    let levelY = 0.5;
    const levels = [
      { radius: 1.35, height: 0.7 },
      { radius: 1.05, height: 0.6 },
      { radius: 0.75, height: 0.5 },
    ];
    for (let index = 0; index < levels.length; index++) {
      const radius = levels[index].radius;
      const height = levels[index].height;
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.8, radius, height, 10),
        bodyMaterial,
      );
      body.position.y = levelY + height / 2;
      pagoda.add(body);
      levelY += height;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(radius * 1.25, 0.32, 10),
        roofMaterial,
      );
      roof.position.y = levelY + 0.16;
      pagoda.add(roof);
      levelY += 0.32;
    }

    const spireMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5d76e,
      emissive: 0xf5d76e,
      emissiveIntensity: 0.8,
    });
    const spire = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      spireMaterial,
    );
    spire.position.y = levelY + 0.15;
    pagoda.add(spire);
    pagoda.position.set(4.6, 0, -4.2);
    // 塔由多个网格组成，每个网格都标记为雷峰塔。
    pagoda.traverse(function (object) {
      object.userData.placeId = "leifengta";
    });

    scene.add(pagoda);
  }

  function createBridge() {
    // 断桥
    bridge = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.18, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xe8e3d5 }),
    );
    bridge.position.set(-2.8, 0.22, 3.4);
    bridge.rotation.y = Math.PI / 7;
    bridge.userData.placeId = "duanqiao";
    scene.add(bridge);
  }

  function createMoon() {
    // 月亮
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfdf6d8,
        emissive: 0xfdf6d8,
        emissiveIntensity: 0.85,
      }),
    );
    moon.position.set(-8, 7.5, -9);
    scene.add(moon);
  }

  function createBoat() {
    // 一叶小船
    boat = new THREE.Group();
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.16, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x8a5a33 }),
    );
    hull.position.y = 0.1;
    boat.add(hull);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.22, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xd9cba8 }),
    );
    cabin.position.set(-0.1, 0.26, 0);
    boat.add(cabin);
    boat.position.set(0, 0.05, 1.5);
    scene.add(boat);
  }

  function createHills() {
    const hills = [
      { x: -9, z: -8, radius: 3.4, height: 5.2 },
      { x: -2.5, z: -10, radius: 2.6, height: 4.2 },
      { x: 4.5, z: -8.5, radius: 3, height: 4.6 },
      { x: 10, z: -6, radius: 2.2, height: 3.4 },
    ];
    for (let index = 0; index < hills.length; index++) {
      const hillData = hills[index];
      const hill = new THREE.Mesh(
        new THREE.ConeGeometry(hillData.radius, hillData.height, 24),
        new THREE.MeshStandardMaterial({ color: 0x24505c }),
      );
      hill.position.set(hillData.x, hillData.height / 2, hillData.z);
      scene.add(hill);
    }
  }

  function animate() {
    if (stopped) {
      return;
    }
    const delta = clock.getDelta();
    if (!paused) {
      // 只累计播放时间，暂停期间的小船位置保持不变。
      animationTime += delta;
      boat.position.x = Math.sin(animationTime * 0.35) * 4.2;
      boat.position.y = 0.05 + Math.sin(animationTime * 1.2) * 0.03;
    }
    controls.update();
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function bindSceneEvents() {
    window.addEventListener("resize", function () {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    const raycaster = new THREE.Raycaster();
    let pointerStart = null;

    renderer.domElement.addEventListener("pointerdown", function (event) {
      pointerStart = { x: event.clientX, y: event.clientY };
    });

    renderer.domElement.addEventListener("pointerup", function (event) {
      if (!pointerStart) {
        return;
      }
      const distanceX = event.clientX - pointerStart.x;
      const distanceY = event.clientY - pointerStart.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      pointerStart = null;
      // 移动超过 6 像素视为拖动，避免旋转模型时误选地标。
      if (distance > 6) {
        return;
      }
      const canvasRect = renderer.domElement.getBoundingClientRect();
      const relativeX = event.clientX - canvasRect.left;
      const relativeY = event.clientY - canvasRect.top;
      // 射线检测需要 -1 到 1 的坐标，Y 方向与屏幕坐标相反。
      const mouseX = (relativeX / canvasRect.width) * 2 - 1;
      const mouseY = 1 - (relativeY / canvasRect.height) * 2;
      const mouse = new THREE.Vector2(mouseX, mouseY);
      raycaster.setFromCamera(mouse, camera);
      // true 表示也检查塔内部的各层网格。
      const hits = raycaster.intersectObjects([pagoda, bridge, lake], true);
      if (hits.length > 0) {
        selectLandmark(hits[0].object.userData.placeId);
      }
    });

    renderer.domElement.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      stopped = true;
      cancelAnimationFrame(animationFrame);
      showFallback("三维显示中断，请刷新页面。");
    });

    $("#reset-scene").on("click", function () {
      camera.position.set(9, 6, 12);
      controls.target.set(0, 0.6, 0);
    });

    $("#pause-scene").on("click", function () {
      // 清掉切换前的时间差，避免后台暂停时没有动画帧而积累时间。
      clock.getDelta();
      paused = !paused;
      let buttonText = "暂停动画";
      if (paused) {
        buttonText = "继续动画";
      }
      $(this).text(buttonText).attr("aria-pressed", String(paused));
    });
  }

  function initScene() {
    if (!container || typeof THREE === "undefined" || !THREE.OrbitControls) {
      throw new Error("本地 Three.js 或 OrbitControls 库不可用。");
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14333f);
    scene.fog = new THREE.Fog(0x14333f, 18, 42);

    camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(9, 6, 12);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.minDistance = 5;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const moonlight = new THREE.DirectionalLight(0xfff4d6, 0.9);
    moonlight.position.set(6, 10, 4);
    scene.add(moonlight);

    createLake();
    createHills();
    createPagoda();
    createBridge();
    createMoon();
    createBoat();
    clock = new THREE.Clock();
    bindSceneEvents();
    focusLandmark(HZ.state.selectedPlaceId);
    HZ.showMessage("#scene-status", "三维场景加载完成，可以旋转、缩放或选择地标。", "success");
    animate();
  }

  $("[data-landmark]").on("click", function () {
    selectLandmark(this.dataset.landmark);
  });

  const requestedPlace = new URLSearchParams(location.search).get("place");
  if (landmarkIds.includes(requestedPlace)) {
    selectLandmark(requestedPlace);
  }
  showLandmarkButtons();
  try {
    initScene();
  } catch (error) {
    showFallback("无法显示三维场景：" + error.message);
  }
});
