// 公共工具和多个页面都会用到的固定选项。
const HZ = {};
HZ.categories = ["交通", "门票", "餐饮", "其他"];

// 只检查月份名称是否合法，不限制客流数据的排列顺序。
function validMonth(value) {
  return typeof value === "string" && /^([1-9]|1[0-2])月$/.test(value);
}

function validCents(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 100000000;
}

// 所有页面共用同一种提示组件，文字和颜色共同区分状态。
function showMessage(selector, message, type = "info") {
  const labels = { info: "提示", success: "成功", warning: "警告", error: "错误" };
  if (!["info", "success", "warning", "error"].includes(type)) {
    type = "info";
  }
  $(selector)
    .addClass("notice")
    .attr("data-tone", type)
    .attr("role", type === "error" ? "alert" : "status")
    .attr("aria-live", type === "error" ? "assertive" : "polite")
    .attr("aria-atomic", "true")
    .text(message ? labels[type] + "：" + message : "")
    .prop("hidden", !message);
}

function notify(message, type = "success") {
  showMessage("#action-status", message, type);
}

let confirmationOpen = false;

// 自定义确认框：等待用户选择后返回布尔值，取消时不执行操作。
function confirmAction(title, message, confirmText) {
  if (confirmationOpen) {
    return Promise.resolve(false);
  }
  confirmationOpen = true;
  return new Promise(function (resolve) {
    const trigger = document.activeElement;
    const background = Array.from(document.body.children);
    const previousOverflow = document.body.style.overflow;
    const modal = document.createElement("div");
    modal.className = "confirm-modal";
    modal.innerHTML = `
      <section class="confirm-panel" role="dialog" aria-modal="true"
        aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <h2 id="confirm-title"></h2>
        <p id="confirm-description"></p>
        <div class="confirm-actions">
          <button type="button" class="button" data-confirm="cancel">取消</button>
          <button type="button" class="button confirm-danger" data-confirm="accept"></button>
        </div>
      </section>`;
    modal.querySelector("#confirm-title").textContent = title;
    modal.querySelector("#confirm-description").textContent = message;
    const cancel = modal.querySelector('[data-confirm="cancel"]');
    const accept = modal.querySelector('[data-confirm="accept"]');
    accept.textContent = confirmText;
    const previousInert = background.map(function (element) {
      const value = element.inert;
      element.inert = true;
      return value;
    });
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    function close(confirmed) {
      modal.remove();
      background.forEach(function (element, index) {
        element.inert = previousInert[index];
      });
      document.body.style.overflow = previousOverflow;
      confirmationOpen = false;
      if (trigger && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
      resolve(confirmed);
    }

    cancel.addEventListener("click", function () { close(false); });
    accept.addEventListener("click", function () { close(true); });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close(false);
    });
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      } else if (event.key === "Tab") {
        // 焦点留在弹窗中，Shift + Tab 也不会进入背景页面。
        event.preventDefault();
        if (document.activeElement === cancel) accept.focus();
        else cancel.focus();
      }
    });
    cancel.focus();
  });
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
  if (!HZ.validCents(amountCents)) {
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
HZ.validMonth = validMonth;
HZ.validCents = validCents;
HZ.notify = notify;
HZ.confirm = confirmAction;
HZ.showMessage = showMessage;
HZ.escape = escapeHtml;
HZ.money = parseMoney;
HZ.format = formatMoney;
HZ.loadJson = loadJson;

$(".menu-button").on("click", function () {
  const open = this.getAttribute("aria-expanded") !== "true";
  $(this).attr("aria-expanded", String(open));
  $("#site-nav").toggleClass("is-open", open);
});
