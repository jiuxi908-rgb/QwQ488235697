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

  function openMore() {
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
            <button class="btn" data-more="loc">当前地点</button>
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
        if (k === "quest") {
          if (typeof g.modalQuests === "function") g.modalQuests();
          else if (typeof g.showQuests === "function") g.showQuests();
          else alert("任务入口稍后接入");
        } else if (k === "sect") {
          if (typeof g.modalSect === "function") g.modalSect();
          else if (typeof g.showSect === "function") g.showSect();
          else alert("门派入口稍后接入");
        } else if (k === "favor") {
          if (g.MobileUI && typeof g.MobileUI.openNPCRelationPage === "function") g.MobileUI.openNPCRelationPage();
          else if (typeof g.openNpcProfile === "function") g.openNpcProfile();
          else if (typeof g.modalFavor === "function") g.modalFavor();
        } else if (k === "map") {
          if (typeof g.openWorldMap === "function") g.openWorldMap();
          else if (typeof g.renderWorldMap === "function") g.renderWorldMap();
          else if (typeof g.renderGame === "function") g.renderGame();
        } else if (k === "loc") {
          const loc = (g.state && g.state.player && g.state.player.location) || "qinghe";
          if (typeof g.openLocationPanel === "function") g.openLocationPanel(loc);
        } else if (k === "save") {
          if (typeof g.modalSaveSlots === "function") g.modalSaveSlots();
          else if (typeof g.showSaveSlots === "function") g.showSaveSlots();
          else alert("存档界面稍后接入");
        } else if (k === "setting") {
          alert("设置：主题/音效/清除缓存 — 后续版本");
        }
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

  g.UINav = { setActive, getCurrent: () => current, openChar, openSkill, openBag, openMore };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})(typeof window !== "undefined" ? window : this);
