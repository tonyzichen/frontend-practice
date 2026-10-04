$(function () {
  let flow = null;
  let barChart = null;
  let lineChart = null;
  let expenseChart = null;
  let favoriteChart = null;

  function validateFlow(data) {
    if (!data || !Array.isArray(data.months) || !Array.isArray(data.series)) {
      throw new Error("客流数据缺少 months 或 series 数组。");
    }
    if (data.months.length === 0 || data.series.length === 0) {
      return false;
    }
    if (data.months.length !== 12) {
      throw new Error("客流数据需要 12 个月。");
    }
    const seenMonths = [];
    for (let index = 0; index < data.months.length; index++) {
      const month = data.months[index];
      if (!HZ.validMonth(month)) {
        throw new Error("客流月份名称不正确。");
      }
      if (seenMonths.includes(month)) {
        throw new Error("客流月份重复。");
      }
      seenMonths.push(month);
    }
    for (let index = 0; index < data.series.length; index++) {
      const series = data.series[index];
      if (
        !series ||
        typeof series.category !== "string" ||
        !Array.isArray(series.counts)
      ) {
        throw new Error("客流系列结构错误。");
      }
      if (series.counts.length === 0) {
        return false;
      }
      if (series.counts.length !== data.months.length) {
        throw new Error("客流数量与月份不对应。");
      }
      for (
        let monthIndex = 0;
        monthIndex < series.counts.length;
        monthIndex++
      ) {
        const count = series.counts[monthIndex];
        if (!Number.isFinite(count) || count < 0) {
          throw new Error("客流数量应为非负数字。");
        }
      }
    }
    if (
      typeof data.source !== "string" ||
      data.unit !== "万人次" ||
      typeof data.periodLabel !== "string"
    ) {
      throw new Error("客流数据缺少来源、单位或时段说明。");
    }
    return true;
  }

  const colors = {
    ink: "#354333",
    accent: "#789d67",
    line: "#dce7d7",
    gold: "#bc9355",
  };

  function getChart(id) {
    if (typeof echarts === "undefined") {
      return null;
    }
    return (
      echarts.getInstanceByDom(document.getElementById(id)) ||
      echarts.init(document.getElementById(id))
    );
  }

  function options(type) {
    return {
      animation: false,
      textStyle: { color: colors.ink },
      tooltip: {
        trigger: "axis",
        valueFormatter: function (value) {
          return value + " 万人次";
        },
      },
      grid: { left: 56, right: 18, top: 34, bottom: 48 },
      xAxis: {
        type: "category",
        data: flow.months,
        axisLabel: { color: colors.ink, fontSize: 11, interval: 0, rotate: 30 },
      },
      yAxis: {
        type: "value",
        min: 0,
        name: "万人次",
        axisLabel: { color: colors.ink },
        splitLine: { lineStyle: { color: colors.line } },
      },
      series: [
        {
          name: flow.series[0].category,
          type: type,
          smooth: false,
          barMaxWidth: 28,
          symbolSize: 7,
          data: monthData(),
          lineStyle: { color: colors.accent, width: 3 },
        },
      ],
    };
  }

  function initFlow() {
    if (!flow) {
      return;
    }
    const counts = flow.series[0].counts;
    let total = 0;
    let max = counts[0];
    let maxMonth = flow.months[0];
    for (let index = 0; index < counts.length; index++) {
      total += counts[index];
      if (counts[index] > max) {
        max = counts[index];
        maxMonth = flow.months[index];
      }
    }
    const statistics = [
      { value: total.toLocaleString(), title: "样例合计" },
      { value: (total / counts.length).toFixed(1), title: "月均客流" },
      { value: max + " / " + maxMonth, title: "峰值客流" },
    ];
    let cardsHtml = "";
    for (let index = 0; index < statistics.length; index++) {
      const statistic = statistics[index];
      cardsHtml += `<div class="col"><article class="info-card">
        <span class="card-number">${statistic.value}</span><h3>${statistic.title}</h3>
        <p>单位：万人次 · 课堂模拟</p></article></div>`;
    }
    $("#stat-cards").html(cardsHtml);
    let monthOptions = "";
    for (let index = 0; index < flow.months.length; index++) {
      monthOptions += `<option>${HZ.escape(flow.months[index])}</option>`;
    }
    $("#chart-month").html(monthOptions).prop("disabled", false);
    $("#chart-source").text(
      "来源：" +
        flow.source +
        "；时段：" +
        flow.periodLabel +
        "。不用于预测真实客流。",
    );
    updateMonth();
    barChart = getChart("spot-chart");
    lineChart = getChart("trend-chart");
    if (!barChart || !lineChart) {
      $("#dashboard-status").text(
        "图表库不可用，请检查 libs/echarts.min.js 后刷新页面。",
      );
      return;
    }
    barChart.setOption(options("bar"), true);
    lineChart.setOption(options("line"), true);
    barChart.on("click", chooseChartMonth);
    lineChart.on("click", chooseChartMonth);
  }

  function chooseChartMonth(parameters) {
    if (!flow.months.includes(parameters.name)) {
      return;
    }
    HZ.state.selectedMonth = parameters.name;
    HZ.saveData();
    updateMonth();
  }

  function monthData() {
    const data = [];
    for (let index = 0; index < flow.months.length; index++) {
      let color = colors.accent;
      if (flow.months[index] === HZ.state.selectedMonth) {
        color = colors.gold;
      }
      data.push({
        value: flow.series[0].counts[index],
        itemStyle: { color: color },
      });
    }
    return data;
  }

  function updateMonth() {
    if (!flow) {
      return;
    }
    const counts = flow.series[0].counts;
    $("#chart-month").val(HZ.state.selectedMonth);
    const monthIndex = flow.months.indexOf(HZ.state.selectedMonth);
    $("#month-note").text(
      `${HZ.state.selectedMonth}：${counts[monthIndex]} 万人次（课堂模拟数据）`,
    );
    const data = monthData();
    if (barChart) {
      barChart.setOption({ series: [{ data: data }] });
    }
    if (lineChart) {
      lineChart.setOption({ series: [{ data: data }] });
    }
  }

  function clearFlow() {
    flow = null;
    if (barChart) {
      barChart.clear();
    }
    if (lineChart) {
      lineChart.clear();
    }
    $("#stat-cards").empty();
    $("#chart-month").empty().prop("disabled", true);
    $("#month-note,#chart-source").empty();
  }

  async function loadFlow() {
    clearFlow();
    $("#dashboard-status").text("正在加载客流数据…");
    try {
      const data = await HZ.loadJson("data/visitors.json");
      if (!validateFlow(data)) {
        $("#dashboard-status").text("暂无客流数据，图表与统计已清空。");
        return;
      }
      flow = data;
      $("#dashboard-status").text("客流数据加载成功 · 12 个月");
      initFlow();
    } catch (error) {
      clearFlow();
      $("#dashboard-status").text(error.message);
    }
  }

  function showPersonalCharts() {
    const state = HZ.state;
    const amounts = [];
    const amountNotes = [];
    for (
      let categoryIndex = 0;
      categoryIndex < HZ.categories.length;
      categoryIndex++
    ) {
      const category = HZ.categories[categoryIndex];
      let totalCents = 0;
      for (
        let expenseIndex = 0;
        expenseIndex < state.expenses.length;
        expenseIndex++
      ) {
        const expenseRecord = state.expenses[expenseIndex];
        if (expenseRecord.category === category) {
          totalCents += expenseRecord.amountCents;
        }
      }
      amounts.push(totalCents / 100);
      amountNotes.push(category + " " + HZ.format(totalCents));
    }
    let want = 0;
    let visited = 0;
    for (let index = 0; index < state.favorites.length; index++) {
      if (state.favorites[index].status === "want") {
        want++;
      } else {
        visited++;
      }
    }
    expenseChart = getChart("expense-chart");
    favoriteChart = getChart("favorite-chart");
    let expenseNote = "暂无消费记录，去「我的行程」记录费用。";
    let favoriteNote = "暂无收藏记录，去景点探索添加收藏。";
    if (state.expenses.length > 0) {
      expenseNote = "来源：本人本地消费记录 · 元；" + amountNotes.join(" / ");
    }
    if (state.favorites.length > 0) {
      favoriteNote = `来源：本人本地收藏 · 想去 ${want} / 已打卡 ${visited}`;
    }
    $("#expense-chart-note").text(expenseNote);
    $("#favorite-chart-note").text(favoriteNote);
    if (expenseChart) {
      expenseChart.clear();
      if (state.expenses.length) {
        expenseChart.setOption({
          animation: false,
          textStyle: { color: colors.ink },
          grid: { left: 48, right: 20, top: 25, bottom: 35 },
          tooltip: {
            trigger: "axis",
            valueFormatter: function (value) {
              return "¥ " + value.toFixed(2);
            },
          },
          xAxis: {
            type: "value",
            min: 0,
            name: "元",
            splitLine: { lineStyle: { color: colors.line } },
          },
          yAxis: { type: "category", data: HZ.categories },
          series: [
            {
              type: "bar",
              data: amounts,
              itemStyle: { color: colors.accent },
              barMaxWidth: 30,
            },
          ],
        });
      }
    }
    if (favoriteChart) {
      favoriteChart.clear();
      if (state.favorites.length) {
        favoriteChart.setOption({
          animation: false,
          textStyle: { color: colors.ink },
          tooltip: { trigger: "item", formatter: "{b}：{c} 个" },
          legend: { bottom: 0, textStyle: { color: colors.ink } },
          series: [
            {
              type: "pie",
              radius: ["45%", "68%"],
              label: { color: colors.ink, formatter: "{b}：{c}" },
              data: [
                {
                  name: "想去",
                  value: want,
                  itemStyle: { color: colors.accent },
                },
                {
                  name: "已打卡",
                  value: visited,
                  itemStyle: { color: colors.gold },
                },
              ],
            },
          ],
        });
      }
    }
  }

  $("#chart-month").on("change", function () {
    HZ.state.selectedMonth = this.value;
    HZ.saveData();
    updateMonth();
  });

  window.addEventListener("resize", function () {
    if (barChart) {
      barChart.resize();
    }
    if (lineChart) {
      lineChart.resize();
    }
    if (expenseChart) {
      expenseChart.resize();
    }
    if (favoriteChart) {
      favoriteChart.resize();
    }
  });

  loadFlow();
  showPersonalCharts();
});
