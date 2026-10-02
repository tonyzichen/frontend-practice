// 公共工具和多个页面都会用到的固定选项。
const HZ = {};
const categories = ["交通", "门票", "餐饮", "其他"];

// 只检查月份名称是否合法，不限制客流数据的排列顺序。
function validMonth(value) {
  return typeof value === "string" && /^([1-9]|1[0-2])月$/.test(value);
}

function validCents(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 100000000;
}

function notify(message) {
  $("#action-status").text(message);
}

// 拼接 HTML 时，防止文字中的符号被解析为标签。
function escapeHtml(value) {
  const symbols = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  if (value === null || value === undefined) {
    value = "";
  }
  return String(value).replace(/[&<>"']/g, function (character) {
    return symbols[character];
  });
}

function parseMoney(value) {
  const text = String(value).trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) {
    throw new Error("金额应为非负数字，最多两位小数。");
  }
  const amountCents = Math.round(Number(text) * 100);
  if (!validCents(amountCents)) {
    throw new Error("金额不能超过 1000000 元。");
  }
  return amountCents;
}

function formatMoney(amountCents) {
  return (amountCents / 100).toFixed(2);
}

// await 等待 Ajax 请求完成，失败时抛出错误，由页面显示提示。
async function loadJson(url) {
  if (location.protocol === "file:") {
    throw new Error("请按运行说明启动本地服务，不要直接双击 HTML。");
  }
  let text;
  try {
    text = await $.ajax({
      url: url,
      dataType: "text",
      timeout: 10000,
      cache: false,
    });
  } catch (request) {
    let message = "数据加载失败，请检查本地服务和文件路径。";
    if (request.statusText === "timeout") {
      message = "加载超时，请检查本地服务后重试。";
    } else if (request.status) {
      message += " HTTP " + request.status;
    }
    throw new Error(message);
  }
  // 单独解析 JSON，区分请求失败与数据格式错误。
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("JSON 格式错误，请检查数据文件。");
  }
}

// 各页面使用的公共工具。
HZ.notify = notify;
HZ.escape = escapeHtml;
HZ.money = parseMoney;
HZ.format = formatMoney;
HZ.loadJson = loadJson;

$(".menu-button").on("click", function () {
  const open = this.getAttribute("aria-expanded") !== "true";
  $(this).attr("aria-expanded", String(open));
  $("#site-nav").toggleClass("is-open", open);
});
