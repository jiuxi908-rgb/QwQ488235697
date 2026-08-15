/* ui_nav.js — 底部五大导航控制器
 * 江湖 / 人物 / 武学 / 背包 / 更多
 */
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
      } else if (tab === "char") {
        openChar();
      } else if (tab === "skill") {
        openSkill();
      } else if (tab === "bag") {
        openBag();
      } else if (tab === "more") {
        openMore();
      }
    } catch (e) {
      console.warn("[ui_nav]", e);
    }
    if (g.Game && typeof g.Game.emit === "function") {
      g.Game.emit("nav:change", tab);
    }
  }

  function openChar() {
    if (g.MobileUI && typeof g.MobileUI.showCharacterPage === "function") {
      return g.MobileUI.showCharacterPage();
    }
    if (typeof g.modalChar === "function") return g.modalChar();
    if (typeof g.showCharacter === "function") return g.showCharacter();
  }

  function openSkill() {
    if (typeof g.modalSkills === "function") return g.modalSkills();
    if (typeof g.showSkills === "function") return g.showSkills();
    const btn = qs('[data-action="skill"], .btn-skill');
    if (btn) btn.click();
  }

  function openBag() {
    if (typeof g.modalBag === "function") return g.modalBag();
    if (typeof g.showBag === "function") return g.showBag();
    const btn = qs("#bagBtn, [data-action=\"bag\"]");
    if (btn) btn.click();
  }

  function openMore() {
    if (typeof g.showMoreMenu === "function") return g.showMoreMenu();
    const root = qs("#modalRoot");
    if (!root) return;
    root.innerHTML = `
      <div class="modal-mask" id="moreMask">
        <div class="modal-panel">
          <div class="modal-head">
            <b class="section-title">更多</b>
            <button class="modal-close" type="button" id="moreClose">×</button>
          </div>
          <div class="row" style="flex-direction:column;align-items:stretch;gap:8px">
            <button class="btn" data-more="quest">任务</button>
            <button class="btn" data-more="sect">门派</button>
            <button class="btn" data-more="favor">关系</button>
            <button class="btn" data-more="map">天下地图</button>
            <button class="btn" data-more="save">存档</button>
            <button class="btn" data-more="setting">设置</button>
          </div>
        </div>
      </div>`;
    qs("#moreClose").onclick = () => { root.innerHTML = ""; };
    qs("#moreMask").onclick = (e) => { if (e.target.id === "moreMask") root.innerHTML = ""; };
    qsa("[data-more]").forEach(b => {
      b.onclick = () => {
        const k = b.dataset.more;
        root.innerHTML = "";
        if (k === "quest" && typeof g.modalQuests === "function") g.modalQuests();
        else if (k === "quest" && typeof g.showQuests === "function") g.showQuests();
        else if (k === "sect" && typeof g.modalSect === "function") g.modalSect();
        else if (k === "sect" && typeof g.showSect === "function") g.showSect();
        else if (k === "favor" && typeof g.modalFavor === "function") g.modalFavor();
        else if (k === "favor" && typeof g.showFavor === "function") g.showFavor();
        else if (k === "map" && typeof g.openWorldMap === "function") g.openWorldMap();
        else if (k === "map" && typeof g.renderWorldMap === "function") g.renderWorldMap();
        else if (k === "save" && typeof g.modalSaveSlots === "function") g.modalSaveSlots();
        else if (k === "save" && typeof g.showSaveSlots === "function") g.showSaveSlots();
        else if (k === "setting") alert("设置页：主题/音效/清除缓存 后续接入");
        else alert(k + " 入口稍后接入");
      };
    });
  }

  function bind() {
    const nav = qs("#bottomNav");
    if (!nav) return;
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      setActive(btn.dataset.tab);
    });
  }

  g.UINav = {
    setActive,
    getCurrent: () => current,
    openChar,
    openSkill,
    openBag,
    openMore
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})(typeof window !== "undefined" ? window : this);
