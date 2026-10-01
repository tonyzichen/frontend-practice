$(function () {
  let placeList = [];
  let selectedType = "全部";
  function showPlaces() {
    const keyword = $("#place-search").val().trim().toLowerCase();
    const favoriteMode = $("#favorite-filter").val();
    let html = "";
    let count = 0;
    for (let index = 0; index < placeList.length; index++) {
      const place = placeList[index];
      const favorite = HZ.favorite(place.id);
      const matchType = selectedType === "全部" || place.type === selectedType;
      const searchText = (
        place.name +
        " " +
        place.type +
        " " +
        place.tag +
        " " +
        place.area +
        " " +
        place.description
      ).toLowerCase();
      const matchKeyword = searchText.includes(keyword);
      let matchFavorite = false;
      if (favoriteMode === "all") {
        matchFavorite = true;
      } else if (favoriteMode === "saved") {
        matchFavorite = favorite !== null;
      } else if (favorite && favorite.status === favoriteMode) {
        matchFavorite = true;
      }
      if (matchType && matchKeyword && matchFavorite) {
        html += HZ.gridCard(place);
        count++;
      }
    }
    $("#place-list").html(html);
    $("#result-count").text(`找到 ${count} / ${placeList.length} 处景点`);
    $("#empty-state").prop("hidden", count !== 0);
  }
  function selectType(type) {
    selectedType = type;
    $("[data-type]").each(function () {
      $(this).attr("aria-pressed", String(this.dataset.type === selectedType));
    });
    showPlaces();
  }
  async function loadFoods() {
    $("#food-list").empty();
    $("#food-status").text("正在加载美食…");
    try {
      const data = await HZ.loadJson("data/foods.json");
      if (!data || !Array.isArray(data.foods)) {
        throw new Error("美食数据结构错误。");
      }
      let html = "";
      for (let index = 0; index < data.foods.length; index++) {
        const food = data.foods[index];
        if (
          !food ||
          typeof food.name !== "string" ||
          typeof food.description !== "string"
        ) {
          throw new Error("美食数据结构错误。");
        }
        html += `<div class="col"><article class="info-card">
        <h3>${HZ.escape(food.name)}</h3><p>${HZ.escape(food.description)}</p>
        <a href="planner.html">记录餐饮费用 ↗</a></article></div>`;
      }
      $("#food-list").html(html);
      $("#food-status").text("");
      if (data.foods.length === 0) {
        $("#food-status").text("暂无美食资料。");
      }
    } catch (error) {
      $("#food-status").text(error.message);
    }
  }
  async function loadPlaceList() {
    try {
      placeList = await HZ.loadPlaces();
      showPlaces();
    } catch (error) {
      $("#result-count").text(error.message);
    }
  }
  $("#place-search").on("input", showPlaces);
  $("#favorite-filter").on("change", showPlaces);
  $("[data-type]").on("click", function () {
    selectType(this.dataset.type);
  });
  $("#clear-filter").on("click", function () {
    $("#place-search").val("");
    $("#favorite-filter").val("all");
    selectType("全部");
  });
  $(document).on("click", "[data-action]", function () {
    if (HZ.changeCard(this.dataset.action, this.dataset.id)) {
      showPlaces();
    }
  });
  $('[data-retry="foods"]').on("click", loadFoods);
  $("#result-count").text("正在加载景点…");
  loadPlaceList();
  loadFoods();
});
