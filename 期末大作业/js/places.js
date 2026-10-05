// 景点资料、卡片以及收藏和行程操作。
let places = [];

function validatePlaces(data) {
  if (!data || !Array.isArray(data.places)) {
    throw new Error("景点数据缺少 places 数组。");
  }
  const ids = [];
  const fields = ["id", "name", "type", "area", "description", "tag", "ticket"];
  for (let index = 0; index < data.places.length; index++) {
    const place = data.places[index];
    if (!place) {
      throw new Error("景点资料不完整。");
    }
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      if (typeof place[fields[fieldIndex]] !== "string") {
        throw new Error("景点资料不完整。");
      }
    }
    if (!place.id || !place.name) {
      throw new Error("景点资料不完整。");
    }
    if (ids.includes(place.id)) {
      throw new Error("景点 ID 重复。");
    }
    const sceneKeys = [null, "westlake", "leifengta", "duanqiao"];
    if (!sceneKeys.includes(place.sceneKey)) {
      throw new Error("景点的三维标记不正确。");
    }
    ids.push(place.id);
  }
}

async function loadPlaces() {
  places = [];
  const data = await HZ.loadJson("data/places.json");
  validatePlaces(data);
  places = data.places;
  return places;
}

function findPlace(id) {
  for (let index = 0; index < places.length; index++) {
    if (places[index].id === id) {
      return places[index];
    }
  }
  return null;
}

function findFavorite(id) {
  for (let index = 0; index < HZ.state.favorites.length; index++) {
    if (HZ.state.favorites[index].placeId === id) {
      return HZ.state.favorites[index];
    }
  }
  return null;
}

function makePlaceCard(place) {
  const favorite = HZ.favorite(place.id);
  const included = HZ.state.itinerary.includes(place.id);
  const placeId = HZ.escape(place.id);
  let favoriteText = "收藏";
  let favoritePressed = "false";
  let itineraryText = "加入行程";
  let itineraryDisabled = "";
  let statusText = "";
  if (favorite) {
    favoriteText = "取消收藏";
    favoritePressed = "true";
    statusText = " · 想去";
    if (favorite.status === "visited") {
      statusText = " · 已打卡";
    }
  }
  if (included) {
    itineraryText = "已加入行程";
    itineraryDisabled = "disabled";
  }
  let buttons = `
    <button
      data-action="favorite"
      data-id="${placeId}"
      class="chip"
      aria-pressed="${favoritePressed}"
    >
      ${favoriteText}
    </button>`;
  buttons += `
    <button
      data-action="itinerary"
      data-id="${placeId}"
      class="chip"
      ${itineraryDisabled}
    >
      ${itineraryText}
    </button>`;
  if (favorite) {
    let visitedText = "标记打卡";
    if (favorite.status === "visited") {
      visitedText = "设为想去";
    }
    buttons += `
      <button
        data-action="visited"
        data-id="${placeId}"
        class="quiet"
      >
        ${visitedText}
      </button>`;
  }
  if (place.sceneKey) {
    buttons += `
      <a
        class="quiet"
        href="scene.html?place=${encodeURIComponent(place.id)}#scene"
      >
        查看三维
      </a>`;
  }
  return `
    <div class="col">
      <article class="place-card">
        <div class="place-body">
          <p class="eyebrow">
            ${HZ.escape(place.type)} · ${HZ.escape(place.area)}${statusText}
          </p>
          <h3>${HZ.escape(place.name)}</h3>
          <p>${HZ.escape(place.description)}</p>
          <p class="muted small">${HZ.escape(place.ticket)}</p>
          <div class="actions">
            ${buttons}
          </div>
        </div>
      </article>
    </div>`;
}

// 首页、探索和行程页共用卡片操作，显示列表由各页面负责。
function changeCard(action, id) {
  const place = HZ.place(id);
  if (!place) {
    HZ.notify("景点资料不可用，请刷新页面。", "error");
    return false;
  }
  const favorite = HZ.favorite(id);
  if (action === "favorite") {
    if (favorite) {
      for (let index = 0; index < HZ.state.favorites.length; index++) {
        if (HZ.state.favorites[index].placeId === id) {
          HZ.state.favorites.splice(index, 1);
          break;
        }
      }
    } else {
      HZ.state.favorites.push({ placeId: id, status: "want" });
    }
  } else if (action === "visited" && favorite) {
    if (favorite.status === "want") {
      favorite.status = "visited";
    } else {
      favorite.status = "want";
    }
  } else if (action === "itinerary" && !HZ.state.itinerary.includes(id)) {
    HZ.state.itinerary.push(id);
  }
  const saved = HZ.saveData();
  let message = place.name + "：记录已更新。";
  if (action === "itinerary") {
    message = place.name + "：已加入行程。";
  }
  if (!saved) {
    message = place.name + "：更改尚未保存。" + HZ.unsavedHint();
  }
  HZ.notify(message, saved ? "success" : "warning");
  // 操作已应用到当前页面，即使保存失败也要刷新卡片。
  return true;
}

HZ.loadPlaces = loadPlaces;
HZ.place = findPlace;
HZ.favorite = findFavorite;
HZ.gridCard = makePlaceCard;
HZ.changeCard = changeCard;
