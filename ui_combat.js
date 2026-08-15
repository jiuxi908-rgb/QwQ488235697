/* ui_combat.js — 战斗独立视觉壳
 * 不改判定逻辑，只提供 openCombatPanel / updateCombatPanel 接口
 * 后续 combat.js 可调用这些函数渲染。
 */
(function (g) {
  "use strict";

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """)
      .replace(/'/g, "&#39;");
  }

  function bar(pct, cls) {
    pct = Math.max(0, Math.min(100, Number(pct) || 0));
    return `<div class="combat-bar ${cls || ""}"><i style="width:${pct}%"></i></div>`;
  }

  /**
   * opts: {
   *   foeName, foeHp, foeMaxHp, foeLv,
   *   playerName, playerHp, playerMaxHp, playerLv,
   *   log: string[],
   *   onAttack, onSkill, onDefend, onItem, onFlee
   * }
   */
  function openCombatPanel(opts) {
    opts = opts || {};
    const foePct = opts.foeMaxHp ? (opts.foeHp / opts.foeMaxHp * 100) : 100;
    const allyPct = opts.playerMaxHp ? (opts.playerHp / opts.playerMaxHp * 100) : 100;
    const logs = (opts.log || []).slice(-8).map(l => `<div>${esc(l)}</div>`).join("") || "<div>战斗开始</div>";

    const html = `
      <div class="modal-head">
        <b class="section-title">战斗</b>
        <button class="modal-close" type="button" id="combatClose">×</button>
      </div>
      <div class="combat-shell">
        <div class="combat-vs">
          <div>
            <div class="combat-name">${esc(opts.foeName || "敌人")}</div>
            <div class="small">Lv.${esc(opts.foeLv || "?")}</div>
            ${bar(foePct, "")}
            <div class="small">${esc(opts.foeHp || 0)}/${esc(opts.foeMaxHp || 0)}</div>
          </div>
          <div style="color:var(--danger);font-weight:800">VS</div>
          <div>
            <div class="combat-name">${esc(opts.playerName || "你")}</div>
            <div class="small">Lv.${esc(opts.playerLv || "?")}</div>
            ${bar(allyPct, "ally")}
            <div class="small">${esc(opts.playerHp || 0)}/${esc(opts.playerMaxHp || 0)}</div>
          </div>
        </div>
        <div class="combat-actions">
          <button class="btn primary" id="cAtk">攻击</button>
          <button class="btn" id="cSkill">武学</button>
          <button class="btn" id="cDef">防御</button>
          <button class="btn" id="cItem">道具</button>
        </div>
        <div class="combat-log" id="combatLog">${logs}</div>
        <button class="btn sm" id="cFlee" style="margin-top:8px;width:100%">逃离</button>
      </div>`;

    if (typeof g.openModal === "function") {
      g.openModal(html);
    } else {
      const root = document.querySelector("#modalRoot");
      if (root) root.innerHTML = `<div class="modal-mask" id="modalMask"><div class="modal-panel" id="modalPanel">${html}</div></div>`;
    }

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el && typeof fn === "function") el.onclick = fn;
    };
    bind("combatClose", () => { if (typeof g.closeModal === "function") g.closeModal(); });
    bind("cAtk", opts.onAttack);
    bind("cSkill", opts.onSkill);
    bind("cDef", opts.onDefend);
    bind("cItem", opts.onItem);
    bind("cFlee", opts.onFlee || (() => { if (typeof g.closeModal === "function") g.closeModal(); }));
  }

  function appendCombatLog(text) {
    const box = document.getElementById("combatLog");
    if (!box) return;
    const div = document.createElement("div");
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  g.openCombatPanel = openCombatPanel;
  g.appendCombatLog = appendCombatLog;
  g.UICombat = { open: openCombatPanel, log: appendCombatLog };
})(typeof window !== "undefined" ? window : this);
