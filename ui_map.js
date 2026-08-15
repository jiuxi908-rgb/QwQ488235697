/* ui_map.js — 地点交互面板
 * 地图负责“看世界”，点击地点后弹出本面板负责“交互”。
 * 不替换 world_map / map_grid 逻辑，只提供统一地点壳。
 */
(function (g) {
  "use strict";

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&").replace(/</g, "<")
      .replace(/>/g, ">");
  }

  function inject() {
    if (document.getElementById("ui-map-style")) return;
    const s = document.createElement("style");
    s.id = "ui-map-style";
    s.textContent = `
      .loc-panel{
        background:linear-gradient(180deg,var(--panel-light,#30261f),#1b1512);
        border:1px solid var(--line,#4b3a2d);
        border-radius:var(--radius,10px);
        padding:14px;
      }
      .loc-panel-title{
        font-size:18px;font-weight:800;color:var(--gold,#d9ad62);
        letter-spacing:2px;margin:0 0 6px;
      }
      .loc-panel-meta{
        display:flex;flex-wrap:wrap;gap:8px 12px;
        font-size:12px;color:var(--muted,#b9a58a);margin-bottom:10px;
      }
      .loc-panel-meta b{color:var(--text,#f5e8cf)}
      .loc-panel-section{margin-top:10px}
      .loc-panel-section h4{
        margin:0 0 6px;font-size:13px;color:var(--gold,#d9ad62);
      }
      .loc-visible{
        display:flex;flex-wrap:wrap;gap:6px;
      }
      .loc-chip{
        display:inline-flex;align-items:center;gap:4px;
        padding:6px 10px;min-height:36px;
        border:1px solid var(--line,#4b3a2d);border-radius:6px;
        background:#191310;font-size:12px;cursor:pointer;
      }
      .loc-chip:active{border-color:var(--gold,#d9ad62)}
      .loc-actions{
        display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px;
      }
      .loc-actions .btn{min-height:48px}
      @media(max-width:420px){
        .loc-actions{grid-template-columns:1fr 1fr}
      }
    `;
    document.head.appendChild(s);
  }

  function getLocInfo(locId) {
    let name = locId, desc = "", weather = "—", time = "—";
    if (typeof g.getMapById === "function") {
      try {
        const m = g.getMapById(locId);
        if (m) {
          name = m.name || name;
          desc = m.desc || m.tag || "";
        }
      } catch (_) {}
    }
    if (g.world && g.world.worldMap && g.world.worldMap.cities && g.world.worldMap.cities[locId]) {
      const c = g.world.worldMap.cities[locId];
      name = c.name || name;
      desc = c.desc || c.tag || desc;
    }
    const p = g.state && g.state.player;
    if (p && p.clock) {
      const shichen = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
      time = (shichen[p.clock.shichen] || "") + "时";
    }
    if (p && p.weather) weather = p.weather;
    return { id: locId, name, desc, weather, time };
  }

  function visibleThings(locId) {
    const list = [];
    // NPC 在此地点
    if (typeof g.findPeopleAt === "function") {
      try {
        const people = g.findPeopleAt(locId) || [];
        people.forEach(n => list.push({ type: "npc", id: n.id, label: n.name || n.id }));
      } catch (_) {}
    } else if (Array.isArray(g.npcs)) {
      g.npcs.filter(n => (n.loc || n.location) === locId).forEach(n => {
        list.push({ type: "npc", id: n.id, label: n.name || n.id });
      });
    }
    // 探索点占位
    list.push({ type: "explore", id: "explore", label: "可探索" });
    return list;
  }

  function openLocationPanel(locId) {
    inject();
    const info = getLocInfo(locId);
    const things = visibleThings(locId);

    const chips = things.map(t => {
      if (t.type === "npc") {
        return `<button type="button" class="loc-chip" data-loc-npc="${esc(t.id)}">● ${esc(t.label)}</button>`;
      }
      return `<span class="loc-chip">● ${esc(t.label)}</span>`;
    }).join("");

    const html = `
      <div class="modal-head">
        <b class="section-title">地点</b>
        <button class="modal-close" type="button" id="locClose">×</button>
      </div>
      <div class="loc-panel">
        <h2 class="loc-panel-title">${esc(info.name)}</h2>
        <div class="loc-panel-meta">
          <span>天气：<b>${esc(info.weather)}</b></span>
          <span>时间：<b>${esc(info.time)}</b></span>
        </div>
        ${info.desc ? `<p class="small">${esc(info.desc)}</p>` : ""}
        <div class="loc-panel-section">
          <h4>可见</h4>
          <div class="loc-visible">${chips || "<span class=\"small\">暂无特别事物</span>"}</div>
        </div>
        <div class="loc-actions">
          <button class="btn primary" id="locExplore">探索</button>
          <button class="btn" id="locObserve">观察</button>
          <button class="btn" id="locLeave">离开</button>
        </div>
      </div>`;

    if (typeof g.openModal === "function") g.openModal(html);
    else {
      const root = document.querySelector("#modalRoot");
      if (root) root.innerHTML = `<div class="modal-mask" id="modalMask"><div class="modal-panel">${html}</div></div>`;
    }

    const close = () => { if (typeof g.closeModal === "function") g.closeModal(); };
    const el = id => document.getElementById(id);
    if (el("locClose")) el("locClose").onclick = close;
    if (el("locLeave")) el("locLeave").onclick = close;

    if (el("locExplore")) {
      el("locExplore").onclick = () => {
        close();
        if (typeof g.exploreLocation === "function") g.exploreLocation(locId);
        else if (typeof g.doExplore === "function") g.doExplore();
        else if (g.state && g.state.player && g.state.player.logs) {
          g.state.player.logs.unshift("你在此处仔细探索一番。");
          if (typeof g.renderGame === "function") g.renderGame();
        }
      };
    }
    if (el("locObserve")) {
      el("locObserve").onclick = () => {
        if (g.state && g.state.player && g.state.player.logs) {
          g.state.player.logs.unshift("你静观四周，记下此地风物。");
        }
      };
    }
    document.querySelectorAll("[data-loc-npc]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.locNpc;
        if (typeof g.openNpcProfile === "function") g.openNpcProfile(id);
        else if (typeof g.modalNpc === "function") g.modalNpc(id);
      };
    });
  }

  g.openLocationPanel = openLocationPanel;
  g.UIMap = { openLocation: openLocationPanel };
  inject();
})(typeof window !== "undefined" ? window : this);
