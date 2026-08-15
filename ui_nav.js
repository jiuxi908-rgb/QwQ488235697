/* ui_nav.js — 底部五大导航控制器 */
(function (g) {
  "use strict";

  const TABS = ["world", "char", "skill", "bag", "more"];
  let current = "world";

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function setActive(tab) {
    if (!TABS.includes(tab)) return;
    current = tab;
    qsa("#bottomNav button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    try {
      if (tab === "world") {
        if (typeof g.closeModal === "function") g.closeModal();
        if (typeof g.renderGame === "function") g.renderGame();
      } else if (tab === "char") openChar();
      else if (tab === "skill") openSkill();
      else if (tab === "bag") openBag();
      else if (tab === "more") openMore();
    } catch (e) {
      console.warn("[ui_nav]", e);
    }
    if (g.Game && typeof g.Game.emit === "function") g.Game.emit("nav:change", tab);
  }

  function openChar() {
    if (g.MobileUI && typeof g.MobileUI.showCharacterPage === "function") return g.MobileUI.showCharacterPage();
    if (typeof g.modalChar === "function") return g.modalChar();
  }

  function openSkill() {
    if (typeof g.modalSkills === "function") return g.modalSkills();
  }

  function openBag() {
    if (typeof g.modalBag === "function") return g.modalBag();
  }

  function openSect() {
    var p = g.state && g.state.player;
    if (!p) return;
    if (typeof g.modalSect === "function") {
      // logic.js: modalSect(sect) — 优先当前门派
      var sect = null;
      if (p.sect && typeof g.getSectById === "function") sect = g.getSectById(p.sect);
      if (!sect && typeof g.sects !== "undefined" && Array.isArray(g.sects)) {
        sect = g.sects.find(function (s) { return s.id === p.sect; }) || g.sects[0];
      }
      if (sect) return g.modalSect(sect);
      // 无门派时尝试用地图点上门派
      if (typeof g.getMapById === "function") {
        var m = g.getMapById(p.location);
        if (m && m.sect && typeof g.getSectById === "function") {
          sect = g.getSectById(m.sect);
          if (sect) return g.modalSect(sect);
        }
      }
      alert("你尚未拜入门派，请先前往门派所在地。");
    }
  }

  function openMore() {
    const root = qs("#modalRoot");
    if (!root) return;
    root.innerHTML =
      '<div class="modal-mask" id="moreMask">' +
        '<div class="modal-panel">' +
          '<div class="modal-head">' +
            '<b class="section-title">更多</b>' +
            '<button class="modal-close" type="button" id="moreClose">×</button>' +
          '</div>' +
          '<div class="row" style="flex-direction:column;align-items:stretch;gap:8px">' +
            '<button class="btn" data-more="quest">任务</button>' +
            '<button class="btn" data-more="sect">门派</button>' +
            '<button class="btn" data-more="favor">关系</button>' +
            '<button class="btn" data-more="map">天下地图</button>' +
            '<button class="btn" data-more="loc">当前地点</button>' +
            '<button class="btn" data-more="save">存档</button>' +
            '<button class="btn" data-more="setting">设置</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    qs("#moreClose").onclick = function () { root.innerHTML = ""; };
    qs("#moreMask").onclick = function (e) {
      if (e.target.id === "moreMask") root.innerHTML = "";
    };

    qsa("[data-more]").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-more");
        root.innerHTML = "";
        if (k === "quest") {
          if (typeof g.modalQuests === "function") g.modalQuests("active");
          else alert("任务系统未加载");
        } else if (k === "sect") {
          openSect();
        } else if (k === "favor") {
          if (g.MobileUI && typeof g.MobileUI.openNPCRelationPage === "function") g.MobileUI.openNPCRelationPage();
          else if (typeof g.openNpcProfile === "function") g.openNpcProfile();
        } else if (k === "map") {
          if (typeof g.closeModal === "function") g.closeModal();
          if (typeof g.renderGame === "function") g.renderGame();
          setActive("world");
        } else if (k === "loc") {
          var loc = (g.state && g.state.player && g.state.player.location) || "qinghe";
          if (typeof g.openLocationPanel === "function") g.openLocationPanel(loc);
        } else if (k === "save") {
          if (typeof g.modalSaves === "function") g.modalSaves();
          else if (typeof g.modalLoadSlots === "function") g.modalLoadSlots();
          else alert("存档系统未加载");
        } else if (k === "setting") {
          openSettings();
        }
      };
    });
  }

  function openSettings() {
    var root = qs("#modalRoot");
    if (!root) return;
    root.innerHTML =
      '<div class="modal-mask" id="setMask">' +
        '<div class="modal-panel">' +
          '<div class="modal-head">' +
            '<b class="section-title">设置</b>' +
            '<button class="modal-close" type="button" id="setClose">×</button>' +
          '</div>' +
          '<p class="small">主题色已由 Design System 统一（深棕 + 金）。</p>' +
          '<div class="row" style="flex-direction:column;align-items:stretch;gap:8px;margin-top:10px">' +
            '<button class="btn" id="setClearCache">清除本地缓存（危险）</button>' +
            '<button class="btn" id="setReload">强制刷新页面</button>' +
          '</div>' +
          '<p class="small" style="margin-top:10px">版本：UI 重构阶段 · 底部导航 + 人物/地点/战斗壳</p>' +
        '</div>' +
      '</div>';
    qs("#setClose").onclick = function () { root.innerHTML = ""; };
    qs("#setMask").onclick = function (e) {
      if (e.target.id === "setMask") root.innerHTML = "";
    };
    qs("#setReload").onclick = function () { location.reload(); };
    qs("#setClearCache").onclick = function () {
      if (!confirm("将清除本站 localStorage 存档与缓存，确定？")) return;
      try {
        localStorage.clear();
        alert("已清除。页面将刷新。");
        location.reload();
      } catch (e) {
        alert("清除失败：" + e.message);
      }
    };
  }

  function bind() {
    var nav = qs("#bottomNav");
    if (!nav) return;
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      setActive(btn.dataset.tab);
    });
  }

  g.UINav = {
    setActive: setActive,
    getCurrent: function () { return current; },
    openChar: openChar,
    openSkill: openSkill,
    openBag: openBag,
    openMore: openMore,
    openSect: openSect
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})(typeof window !== "undefined" ? window : this);
