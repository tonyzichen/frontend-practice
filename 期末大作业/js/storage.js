// 本地个人记录：读取、检查、保存和费用合计。
const storageKey = "hangzhou-center-v1";
let canSave = true;

// 个人记录由存储文件初始化，供各页面读取和修改。
HZ.state = {
  selectedPlaceId: null,
  selectedMonth: "10月",
  favorites: [],
  itinerary: [],
  budgetCents: 30000,
  expenses: [],
};

// 先检查读到的数据，再把它放入个人记录。
function validSavedData(data) {
  if (!data || !HZ.validCents(data.budgetCents)) {
    return false;
  }
  if (!HZ.validMonth(data.selectedMonth)) {
    return false;
  }
  if (
    data.selectedPlaceId !== null &&
    typeof data.selectedPlaceId !== "string"
  ) {
    return false;
  }
  if (
    !Array.isArray(data.favorites) ||
    !Array.isArray(data.itinerary) ||
    !Array.isArray(data.expenses)
  ) {
    return false;
  }
  for (let index = 0; index < data.favorites.length; index++) {
    const favorite = data.favorites[index];
    if (!favorite || typeof favorite.placeId !== "string") {
      return false;
    }
    if (favorite.status !== "want" && favorite.status !== "visited") {
      return false;
    }
  }
  for (let index = 0; index < data.itinerary.length; index++) {
    if (typeof data.itinerary[index] !== "string") {
      return false;
    }
  }
  for (let index = 0; index < data.expenses.length; index++) {
    const expense = data.expenses[index];
    if (!expense || typeof expense.id !== "string") {
      return false;
    }
    if (typeof expense.label !== "string" || !expense.label.trim()) {
      return false;
    }
    if (
      !HZ.categories.includes(expense.category) ||
      !HZ.validCents(expense.amountCents)
    ) {
      return false;
    }
    if (expense.placeId !== null && typeof expense.placeId !== "string") {
      return false;
    }
  }
  return true;
}

// 只有行程页提供导出入口，其他页面只说明未保存更改的有效范围。
function getUnsavedHint() {
  let message = "未保存的更改仅在当前页面有效，刷新或离开页面后将丢失。";
  if (document.getElementById("export-button")) {
    message += "请在离开前点击「导出 JSON」备份。";
  }
  return message;
}

function showStorageMessage(message, type = "warning") {
  HZ.showMessage("#storage-status", message, type);
}

function readSavedData() {
  try {
    const savedText = localStorage.getItem(storageKey);
    if (!savedText) {
      return;
    }
    const data = JSON.parse(savedText);
    if (!validSavedData(data)) {
      throw new Error("本地数据格式错误");
    }
    HZ.state.selectedPlaceId = data.selectedPlaceId;
    HZ.state.selectedMonth = data.selectedMonth;
    HZ.state.itinerary = data.itinerary;
    HZ.state.budgetCents = data.budgetCents;
    HZ.state.expenses = data.expenses;
    for (let index = 0; index < data.favorites.length; index++) {
      HZ.state.favorites.push({
        placeId: data.favorites[index].placeId,
        status: data.favorites[index].status,
      });
    }
  } catch (error) {
    canSave = false;
    showStorageMessage(
      "本地记录读取失败，暂时使用空清单。原记录未覆盖。" + getUnsavedHint(),
    );
  }
}

// 保存成功返回 true；禁止保存或写入失败返回 false。
function saveData() {
  if (!canSave) {
    showStorageMessage("本地记录暂时无法保存。" + getUnsavedHint());
    return false;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(HZ.state));
    showStorageMessage("");
    return true;
  } catch (error) {
    showStorageMessage("保存失败。" + getUnsavedHint(), "error");
    return false;
  }
}

function totalExpenses() {
  let total = 0;
  for (let index = 0; index < HZ.state.expenses.length; index++) {
    total += HZ.state.expenses[index].amountCents;
  }
  return total;
}

HZ.saveData = saveData;
HZ.totalExpenses = totalExpenses;
HZ.unsavedHint = getUnsavedHint;

// 在页面显示数据前，先读取已保存的个人记录。
readSavedData();
