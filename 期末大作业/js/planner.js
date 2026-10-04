$(function () {
  let placeList = [];

  function showPlaceOptions() {
    let html = '<option value="">公共支出</option>';
    for (let index = 0; index < placeList.length; index++) {
      const place = placeList[index];
      html += `<option value="${HZ.escape(place.id)}">${HZ.escape(place.name)}</option>`;
    }
    $("#expense-place").html(html);
  }

  function showBudget() {
    const total = HZ.totalExpenses();
    const remaining = HZ.state.budgetCents - total;
    let remainingText = "剩余预算";
    let amountClass = "";
    if (remaining < 0) {
      remainingText = "超支";
      amountClass = "danger";
    }
    $("#budget-input").val(HZ.format(HZ.state.budgetCents));
    $("#budget-summary").html(
      `<span>总支出 <strong>¥ ${HZ.format(total)}</strong></span>
       <span>${remainingText} <strong class="${amountClass}">¥ ${HZ.format(Math.abs(remaining))}</strong></span>`,
    );
  }

  function showItinerary() {
    let html = "";
    const itinerary = HZ.state.itinerary;
    for (let index = 0; index < itinerary.length; index++) {
      const id = itinerary[index];
      const place = HZ.place(id);
      let placeName = "资料不可用的景点";
      let placeArea = id;
      let upDisabled = "";
      let downDisabled = "";
      if (place) {
        placeName = place.name;
        placeArea = place.area;
      }
      if (index === 0) {
        upDisabled = "disabled";
      }
      if (index === itinerary.length - 1) {
        downDisabled = "disabled";
      }
      const escapedId = HZ.escape(id);
      html += `<li><div>
        <strong>${index + 1}. ${HZ.escape(placeName)}</strong><span class="muted">${HZ.escape(placeArea)}</span>
        </div><div class="actions">
        <button data-plan="up" data-id="${escapedId}" ${upDisabled}>上移</button>
        <button data-plan="down" data-id="${escapedId}" ${downDisabled}>下移</button>
        <button data-plan="remove" data-id="${escapedId}">移除</button></div></li>`;
    }
    if (itinerary.length === 0) {
      html = '<li class="empty">还没有行程，先在景点探索中加入一站。</li>';
    }
    $("#itinerary-list").html(html);
  }

  function showFavorites() {
    let html = "";
    for (let index = 0; index < HZ.state.favorites.length; index++) {
      const favorite = HZ.state.favorites[index];
      const place = HZ.place(favorite.placeId);
      if (place) {
        html += HZ.gridCard(place);
      } else {
        html += `<p>景点 ${HZ.escape(favorite.placeId)} 资料不可用，收藏已保留。</p>`;
      }
    }
    if (HZ.state.favorites.length === 0) {
      html = '<p class="empty">暂无收藏，请先在景点探索中添加。</p>';
    }
    $("#favorites-list").html(html);
  }

  function showExpenses() {
    let html = "";
    for (let index = 0; index < HZ.state.expenses.length; index++) {
      const expense = HZ.state.expenses[index];
      const place = HZ.place(expense.placeId);
      let placeName = "公共支出";
      if (place) {
        placeName = place.name;
      }
      html += `<li><div><strong>${HZ.escape(expense.label)} · ¥ ${HZ.format(expense.amountCents)}</strong>
        <span class="muted">${HZ.escape(expense.category)} / ${HZ.escape(placeName)}</span></div>
        <button data-delete-expense="${HZ.escape(expense.id)}">删除</button></li>`;
    }
    if (HZ.state.expenses.length === 0) {
      html = '<li class="empty">没有消费记录，总支出为 0 元。</li>';
    }
    $("#expense-list").html(html);
  }

  function showPlanner() {
    $("#travel-month").val(HZ.state.selectedMonth);
    showBudget();
    showItinerary();
    showFavorites();
    showExpenses();
  }

  $(document).on("click", "[data-plan]", function () {
    const action = this.dataset.plan;
    const index = HZ.state.itinerary.indexOf(this.dataset.id);
    if (index < 0) {
      return;
    }
    if (action === "remove") {
      HZ.state.itinerary.splice(index, 1);
    } else {
      let nextIndex = index + 1;
      if (action === "up") {
        nextIndex = index - 1;
      }
      if (nextIndex < 0 || nextIndex >= HZ.state.itinerary.length) {
        return;
      }
      // 用临时变量交换两站的位置。
      const currentId = HZ.state.itinerary[index];
      HZ.state.itinerary[index] = HZ.state.itinerary[nextIndex];
      HZ.state.itinerary[nextIndex] = currentId;
    }
    HZ.saveData();
    showItinerary();
  });

  $(document).on("click", "[data-action]", function () {
    if (HZ.changeCard(this.dataset.action, this.dataset.id)) {
      showPlanner();
    }
  });

  let monthOptions = "";
  for (let month = 1; month <= 12; month++) {
    monthOptions += `<option>${month}月</option>`;
  }
  $("#travel-month")
    .html(monthOptions)
    .on("change", function () {
      HZ.state.selectedMonth = this.value;
      HZ.saveData();
    });

  $("#budget-form").on("submit", function (event) {
    event.preventDefault();
    try {
      HZ.state.budgetCents = HZ.money($("#budget-input").val());
      const saved = HZ.saveData();
      showBudget();
      $("#budget-message").text(
        saved
          ? "预算已更新并保存。"
          : "预算尚未保存。" + HZ.unsavedHint(),
      );
    } catch (error) {
      $("#budget-message").text(error.message);
    }
  });

  $("#expense-form").on("submit", function (event) {
    event.preventDefault();
    try {
      const label = $("#expense-label").val().trim();
      const amountCents = HZ.money($("#expense-amount").val());
      const placeId = $("#expense-place").val() || null;
      const category = $("#expense-category").val();
      if (!label || label.length > 40) {
        throw new Error("请填写 1—40 字的项目名称。");
      }
      if (placeId && !HZ.place(placeId)) {
        throw new Error("请选择有效景点。");
      }
      if (!HZ.categories.includes(category)) {
        throw new Error("请选择有效费用类别。");
      }
      // 时间戳加随机数，用来区分每条费用记录。
      const expenseId =
        "expense-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
      HZ.state.expenses.push({
        id: expenseId,
        label: label,
        amountCents: amountCents,
        placeId: placeId,
        category: category,
      });
      const saved = HZ.saveData();
      showBudget();
      showExpenses();
      $("#expense-form")[0].reset();
      $("#budget-message").text(
        saved
          ? "费用已添加并保存（允许 0 元）。"
          : "费用尚未保存。" + HZ.unsavedHint(),
      );
    } catch (error) {
      $("#budget-message").text(error.message);
    }
  });

  $(document).on("click", "[data-delete-expense]", function () {
    const expenseId = this.dataset.deleteExpense;
    for (let index = 0; index < HZ.state.expenses.length; index++) {
      if (HZ.state.expenses[index].id === expenseId) {
        HZ.state.expenses.splice(index, 1);
        break;
      }
    }
    HZ.saveData();
    showBudget();
    showExpenses();
  });

  $("#load-costs").on("click", async function () {
    try {
      const costList = await HZ.loadJson("data/cost.json");
      if (!Array.isArray(costList)) {
        throw new Error("样例数据应为数组。");
      }
      // 全部检查通过后再添加，避免只添加了一部分样例。
      let totalCostCents = 0;
      for (let index = 0; index < costList.length; index++) {
        const cost = costList[index];
        if (!cost || typeof cost.label !== "string" || !cost.label.trim()) {
          throw new Error("样例项目名称不正确。");
        }
        if (
          !HZ.categories.includes(cost.category) ||
          !HZ.validCents(cost.amountCents)
        ) {
          throw new Error("样例类别或金额不正确。");
        }
        if (cost.placeId !== null && !HZ.place(cost.placeId)) {
          throw new Error("样例关联景点不可用。");
        }
        totalCostCents += cost.amountCents;
      }
      for (let index = 0; index < costList.length; index++) {
        const cost = costList[index];
        // 沿用已保存记录的 ID 前缀，避免重复载入费用。
        const costId = "example-" + index;
        let included = false;
        for (
          let expenseIndex = 0;
          expenseIndex < HZ.state.expenses.length;
          expenseIndex++
        ) {
          if (HZ.state.expenses[expenseIndex].id === costId) {
            included = true;
            break;
          }
        }
        if (!included) {
          HZ.state.expenses.push({
            id: costId,
            label: cost.label,
            category: cost.category,
            amountCents: cost.amountCents,
            placeId: cost.placeId,
          });
        }
      }
      const saved = HZ.saveData();
      showBudget();
      showExpenses();
      $("#budget-message").text(
        `${saved ? "已载入并保存" : "仅在当前页面载入，尚未保存"} ${costList.length} 条课堂样例，合计 ${HZ.format(totalCostCents)} 元；重复点击不会重复添加。这些金额不是实时价格。${saved ? "" : HZ.unsavedHint()}`,
      );
    } catch (error) {
      $("#budget-message").text(error.message);
    }
  });

  $("#export-button").on("click", function () {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dataKind: "personal",
      selectedPlaceId: HZ.state.selectedPlaceId,
      selectedMonth: HZ.state.selectedMonth,
      favorites: HZ.state.favorites,
      itinerary: HZ.state.itinerary,
      budgetCents: HZ.state.budgetCents,
      expenses: HZ.state.expenses,
    };
    const text = JSON.stringify(exportData, null, 2);
    const file = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "hangzhou-journey.json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    // 下载发起后释放临时文件地址。
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    HZ.notify("已发起 JSON 下载，请在浏览器下载目录核对文件。");
  });

  $("#print-button").on("click", function () {
    window.print();
  });

  showPlanner();
  $("#planner-status").text("正在加载景点目录…");

  async function loadPlannerPlaces() {
    try {
      placeList = await HZ.loadPlaces();
      $("#planner-status").text("");
      if (placeList.length === 0) {
        $("#planner-status").text("景点目录为空，已有记录仍保留。");
      }
    } catch (error) {
      $("#planner-status").text(error.message);
    }
    showPlaceOptions();
    showPlanner();
  }

  loadPlannerPlaces();
});
