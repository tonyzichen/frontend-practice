$(function () {
  let placeList = [];

  function showSummary() {
    const state = HZ.state;
    const total = HZ.totalExpenses();
    $("#home-summary").html(
      `<span><b>${state.favorites.length}</b> 我的收藏</span>
       <span><b>${state.itinerary.length}</b> 行程站点</span>
       <span><b>¥ ${HZ.format(total)}</b> 记录支出</span>`,
    );
  }

  function showFeatured() {
    let html = "";
    const count = Math.min(3, placeList.length);
    for (let index = 0; index < count; index++) {
      html += HZ.gridCard(placeList[index]);
    }
    $("#featured").html(html);
  }

  // 动态生成的按钮用事件委托处理，操作后直接刷新首页。
  $(document).on("click", "[data-action]", function () {
    if (HZ.changeCard(this.dataset.action, this.dataset.id)) {
      showSummary();
      showFeatured();
    }
  });

  showSummary();
  HZ.showMessage("#featured-status", "正在加载景点…");

  async function loadFeatured() {
    try {
      placeList = await HZ.loadPlaces();
      showFeatured();
      HZ.showMessage("#featured-status", "");
      if (placeList.length === 0) {
        HZ.showMessage("#featured-status", "暂无景点资料。");
      }
    } catch (error) {
      HZ.showMessage("#featured-status", error.message + " 请检查运行说明后刷新页面。", "error");
    }
  }

  loadFeatured();
});
