(function () {
  "use strict";

  var STORAGE_KEY = "goods-assets-v1";
  var DAY_MS = 24 * 60 * 60 * 1000;

  var ICONS = {
    phone: { label: "手机", svg: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18"/>' },
    tv: { label: "电视", svg: '<rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/>' },
    audio: { label: "耳机", svg: '<path d="M4 17v-5a8 8 0 0 1 16 0v5"/><rect x="2" y="15" width="5" height="6" rx="1.5"/><rect x="17" y="15" width="5" height="6" rx="1.5"/>' },
    ac: { label: "空调", svg: '<rect x="2" y="5" width="20" height="8" rx="2"/><line x1="6" y1="17" x2="6" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="18" y1="17" x2="18" y2="21"/>' },
    fridge: { label: "冰箱", svg: '<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="6" y1="9" x2="18" y2="9"/><line x1="9" y1="5" x2="9" y2="6.5"/><line x1="9" y1="12" x2="9" y2="13.5"/>' },
    washer: { label: "洗衣机", svg: '<rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><circle cx="12" cy="14" r="2"/><circle cx="7" cy="5" r="1"/>' },
    laptop: { label: "电脑", svg: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><line x1="2" y1="20" x2="22" y2="20"/>' },
    camera: { label: "相机", svg: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>' },
    watch: { label: "手表", svg: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1"/><path d="M9 3h6M9 21h6"/>' },
    furniture: { label: "家具", svg: '<path d="M4 13V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="M4 13v6M20 13v6M4 17h16"/>' },
    bike: { label: "自行车", svg: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-9h4l4 9M10 8h4M9.5 17H14"/>' },
    other: { label: "其他", svg: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>' }
  };

  var state = {
    items: [],
    filter: "all",
    sortField: "date",
    sortDesc: true,
    editingId: null,
    currentView: "home"
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function daysSince(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diff = Math.floor((today - d) / DAY_MS) + 1;
    return diff < 1 ? 1 : diff;
  }

  function money(n) {
    return "¥" + n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.items = JSON.parse(raw);
        return;
      }
    } catch (e) {}
    state.items = seedData();
    save();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }

  function seedData() {
    var today = new Date();
    function dateAgo(days) {
      var d = new Date(today.getTime() - days * DAY_MS);
      return d.toISOString().slice(0, 10);
    }
    return [
      { id: uid(), name: "华为 Pura70 Pro", price: 4999, purchaseDate: dateAgo(554), icon: "phone", active: true, favorite: false },
      { id: uid(), name: "电视", price: 1459.28, purchaseDate: dateAgo(690), icon: "tv", active: true, favorite: false },
      { id: uid(), name: "iPhone 15", price: 6999, purchaseDate: dateAgo(1033), icon: "phone", active: true, favorite: true },
      { id: uid(), name: "FreeBuds 4", price: 399, purchaseDate: dateAgo(1199), icon: "audio", active: true, favorite: false },
      { id: uid(), name: "TCL 空调", price: 1569, purchaseDate: dateAgo(2446), icon: "ac", active: true, favorite: false },
      { id: uid(), name: "电视 (客厅)", price: 2199, purchaseDate: dateAgo(2152), icon: "tv", active: false, favorite: false },
      { id: uid(), name: "冰箱", price: 2599, purchaseDate: dateAgo(1600), icon: "fridge", active: true, favorite: false },
      { id: uid(), name: "洗衣机", price: 1649, purchaseDate: dateAgo(900), icon: "washer", active: false, favorite: false }
    ];
  }

  // ---------- Rendering ----------
  function computeMetrics(item) {
    var days = daysSince(item.purchaseDate);
    var daily = item.price / days;
    return { days: days, daily: daily };
  }

  function renderHero() {
    var totalAssets = 0, totalDaily = 0;
    state.items.forEach(function (it) {
      var m = computeMetrics(it);
      totalAssets += it.price;
      totalDaily += m.daily;
    });
    document.getElementById("totalAssets").textContent = money(totalAssets);
    document.getElementById("totalDaily").textContent = money(totalDaily);
    document.getElementById("itemCount").textContent = state.items.length ? "共 " + state.items.length + " 件" : "";
  }

  function filteredSorted() {
    var list = state.items.filter(function (it) {
      if (state.filter === "active") return it.active;
      if (state.filter === "favorite") return it.favorite;
      return true;
    });
    list = list.slice().sort(function (a, b) {
      var ma = computeMetrics(a), mb = computeMetrics(b);
      var va, vb;
      if (state.sortField === "days") { va = ma.days; vb = mb.days; }
      else if (state.sortField === "price") { va = a.price; vb = b.price; }
      else if (state.sortField === "daily") { va = ma.daily; vb = mb.daily; }
      else { va = a.purchaseDate; vb = b.purchaseDate; }
      if (va < vb) return state.sortDesc ? 1 : -1;
      if (va > vb) return state.sortDesc ? -1 : 1;
      return 0;
    });
    return list;
  }

  function renderGrid() {
    var grid = document.getElementById("grid");
    var list = filteredSorted();
    var empty = document.getElementById("emptyState");
    grid.innerHTML = "";
    empty.hidden = list.length !== 0;
    list.forEach(function (item) {
      var m = computeMetrics(item);
      var iconDef = ICONS[item.icon] || ICONS.other;
      var card = document.createElement("div");
      card.className = "card" + (item.active ? "" : " idle");
      card.dataset.id = item.id;
      card.innerHTML =
        '<div class="card-fav">' + (item.favorite ? favSvgFilled() : "") + "</div>" +
        '<div class="card-top">' +
          '<div class="card-icon"><svg viewBox="0 0 24 24">' + iconDef.svg + "</svg></div>" +
          '<div class="card-days">' + m.days + '<span class="card-days-unit">天</span></div>' +
        "</div>" +
        '<div class="card-info">' +
          '<div class="card-name">' + escapeHtml(item.name) + "</div>" +
          '<div class="card-bottom">' +
            '<span class="card-price">' + money(item.price) + "</span>" +
            '<span class="card-daily">' + money(m.daily) + "/天</span>" +
          "</div>" +
        "</div>";
      card.addEventListener("click", function () { openModal(item.id); });
      grid.appendChild(card);
    });
  }

  function favSvgFilled() {
    return '<svg viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4a5 5 0 0 1 6.5 2 5 5 0 0 1 6.5-2C22 4.5 23.6 8 22 11.7 19.5 16.4 12 21 12 21z"/></svg>';
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderStats() {
    document.getElementById("statCount").textContent = state.items.length;
    var totalAssets = 0, totalDaily = 0;
    state.items.forEach(function (it) {
      var m = computeMetrics(it);
      totalAssets += it.price;
      totalDaily += m.daily;
    });
    document.getElementById("statTotal").textContent = money(totalAssets);
    document.getElementById("statDaily").textContent = money(totalDaily);
    document.getElementById("statAvg").textContent = state.items.length ? money(totalAssets / state.items.length) : money(0);

    var barList = document.getElementById("barList");
    barList.innerHTML = "";
    var ranked = state.items.map(function (it) {
      return { name: it.name, daily: computeMetrics(it).daily };
    }).sort(function (a, b) { return b.daily - a.daily; }).slice(0, 6);

    if (!ranked.length) {
      barList.innerHTML = '<div class="bar-empty">暂无数据</div>';
      return;
    }
    var max = ranked[0].daily || 1;
    ranked.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "bar-row";
      var pct = Math.max(4, Math.round((r.daily / max) * 100));
      row.innerHTML =
        '<div class="bar-row-top"><span class="bar-row-name">' + escapeHtml(r.name) + '</span><span class="bar-row-val">' + money(r.daily) + "/天</span></div>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
      barList.appendChild(row);
    });
  }

  function renderAll() {
    renderHero();
    renderGrid();
    renderStats();
  }

  // ---------- Views ----------
  function switchView(view) {
    state.currentView = view;
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    document.getElementById("view-" + view).classList.add("active");
    document.querySelectorAll(".tab-item").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === view);
    });
  }

  // ---------- Modal ----------
  function populateIconSelect() {
    var sel = document.getElementById("fIcon");
    sel.innerHTML = "";
    Object.keys(ICONS).forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = ICONS[key].label;
      sel.appendChild(opt);
    });
  }

  function openModal(id) {
    state.editingId = id || null;
    var item = id ? state.items.find(function (it) { return it.id === id; }) : null;
    document.getElementById("modalTitle").textContent = item ? "编辑物品" : "添加物品";
    document.getElementById("deleteBtn").hidden = !item;
    document.getElementById("fName").value = item ? item.name : "";
    document.getElementById("fPrice").value = item ? item.price : "";
    document.getElementById("fDate").value = item ? item.purchaseDate : new Date().toISOString().slice(0, 10);
    document.getElementById("fIcon").value = item ? item.icon : "other";
    document.getElementById("fActive").checked = item ? item.active : true;
    document.getElementById("fFavorite").checked = item ? item.favorite : false;
    document.getElementById("modalMask").classList.add("open");
  }

  function closeModal() {
    document.getElementById("modalMask").classList.remove("open");
    state.editingId = null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var name = document.getElementById("fName").value.trim();
    var price = parseFloat(document.getElementById("fPrice").value);
    var date = document.getElementById("fDate").value;
    var icon = document.getElementById("fIcon").value;
    var active = document.getElementById("fActive").checked;
    var favorite = document.getElementById("fFavorite").checked;
    if (!name || isNaN(price) || !date) return;

    if (state.editingId) {
      var item = state.items.find(function (it) { return it.id === state.editingId; });
      item.name = name; item.price = price; item.purchaseDate = date;
      item.icon = icon; item.active = active; item.favorite = favorite;
    } else {
      state.items.unshift({ id: uid(), name: name, price: price, purchaseDate: date, icon: icon, active: active, favorite: favorite });
    }
    save();
    closeModal();
    renderAll();
  }

  function handleDelete() {
    if (!state.editingId) return;
    if (!confirm("确定删除这件物品吗？")) return;
    state.items = state.items.filter(function (it) { return it.id !== state.editingId; });
    save();
    closeModal();
    renderAll();
  }

  // ---------- Data export/import ----------
  function exportData() {
    var blob = new Blob([JSON.stringify(state.items, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "assets-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("invalid");
        state.items = data;
        save();
        renderAll();
        alert("导入成功");
      } catch (e) {
        alert("导入失败：文件格式不正确");
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!confirm("确定清空所有数据吗？此操作不可恢复。")) return;
    state.items = [];
    save();
    renderAll();
  }

  // ---------- Init ----------
  function init() {
    load();
    populateIconSelect();
    renderAll();

    document.getElementById("addBtn").addEventListener("click", function () { openModal(null); });
    document.getElementById("emptyAddBtn").addEventListener("click", function () { openModal(null); });
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalMask").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById("itemForm").addEventListener("submit", handleSubmit);
    document.getElementById("deleteBtn").addEventListener("click", handleDelete);

    document.getElementById("tabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".tab");
      if (!btn) return;
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      renderGrid();
    });

    document.getElementById("sortField").addEventListener("change", function (e) {
      state.sortField = e.target.value;
      renderGrid();
    });
    document.getElementById("sortDir").addEventListener("click", function () {
      state.sortDesc = !state.sortDesc;
      this.classList.toggle("desc", !state.sortDesc);
      renderGrid();
    });

    document.querySelectorAll(".tab-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.dataset.view;
        if (view === "favorite") {
          switchView("home");
          state.filter = "favorite";
          document.querySelectorAll(".tab").forEach(function (t) {
            t.classList.toggle("active", t.dataset.filter === "favorite");
          });
          renderGrid();
          document.querySelectorAll(".tab-item").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
        } else {
          switchView(view);
          if (view === "stats") renderStats();
        }
      });
    });

    document.getElementById("exportBtn").addEventListener("click", exportData);
    document.getElementById("importBtn").addEventListener("click", function () {
      document.getElementById("importFile").click();
    });
    document.getElementById("importFile").addEventListener("change", function (e) {
      if (e.target.files[0]) importData(e.target.files[0]);
      e.target.value = "";
    });
    document.getElementById("clearBtn").addEventListener("click", clearData);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
