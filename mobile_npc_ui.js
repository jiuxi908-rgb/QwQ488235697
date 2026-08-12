/* =========================================
 * mobile_npc_ui.js
 * NPC关系页移动端增强层
 * 不改 npc_logic.js / favor.js / favor_ui.js 的业务逻辑。
 * ========================================= */
(function (g) {
  "use strict";

  const M = g.MobileUI || (g.MobileUI = {});
  const esc = M.esc || function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  const mobile = () => window.matchMedia
    ? window.matchMedia("(max-width:600px)").matches
    : window.innerWidth <= 600;

  function getPlayer() {
    return (g.state && g.state.player) || g.playerData || (g.game && g.game.player) || null;
  }

  function getNPCList() {
    if (typeof g.getNPCList === "function") {
      try {
        const list = g.getNPCList();
        if (Array.isArray(list)) return list;
      } catch (_) {}
    }
    if (Array.isArray(g.npcs)) return g.npcs.slice();
    if (Array.isArray(g.NPCS)) return g.NPCS.slice();
    if (Array.isArray(g.NPC_LIST)) return g.NPC_LIST.slice();
    return [];
  }

  function getFavorValue(player, id) {
    if (typeof g.getFavor === "function") {
      try { return Number(g.getFavor(player, id)) || 0; } catch (_) {}
    }
    return Number((player && player.favor && player.favor[id]) || 0);
  }

  function getRank(value) {
    if (typeof g.favorRank === "function") {
      try { return g.favorRank(value) || { name: "陌生", color: "#b9a58a" }; } catch (_) {}
    }
    return { name: value >= 95 ? "倾心" : value >= 80 ? "莫逆" : value >= 60 ? "知己" : value >= 40 ? "交好" : value >= 20 ? "相识" : "陌生", color: "#b9a58a" };
  }

  function isBonded(player, id) {
    const bonds = player && player.bonds || {};
    return !!(bonds && typeof bonds === "object" && bonds[id]);
  }

  function npcAvatar(npc) {
    try {
      if (typeof g.npcAvatar === "function") return g.npcAvatar(npc);
      if (typeof g.avatarHtml === "function") return g.avatarHtml(npc, "md");
      if (npc.avatar) return '<img src="' + esc(npc.avatar) + '" alt="">';
    } catch (_) {}
    return '<span class="mnpc-avatar-fallback">' + esc((npc.name || "?").slice(0, 1)) + '</span>';
  }

  M.getNPCData = function () {
    const p = getPlayer() || {};
    return getNPCList().filter(npc => npc && npc.id).map(npc => {
      const favor = Math.max(0, Math.min(100, getFavorValue(p, npc.id)));
      const rank = getRank(favor);
      return {
        ...npc,
        favor,
        rank: rank.name,
        rankColor: rank.color || "#b9a58a",
        bonded: isBonded(p, npc.id),
        progress: favor / 100,
        location: npc.loc || npc.region || npc.location || "未知地点",
        avatarHtml: npcAvatar(npc)
      };
    }).sort((a, b) => b.favor - a.favor);
  };

  function injectStyle() {
    if (document.getElementById("mobile-npc-ui-style")) return;
    const style = document.createElement("style");
    style.id = "mobile-npc-ui-style";
    style.textContent = `
      .mobile-npc-relation{display:none}
      @media(max-width:600px){
        .mobile-npc-relation{display:block;padding:8px 0 72px}
        .mobile-npc-list{display:grid;grid-template-columns:1fr;gap:8px}
        .mobile-npc-card{background:linear-gradient(180deg,#30261f,#211a15);border:1px solid #4b3a2d;border-radius:9px;padding:10px;min-height:112px;display:grid;grid-template-columns:58px 1fr;gap:9px;box-shadow:2px 3px 0 #0a0806}
        .mobile-npc-avatar{width:56px;height:56px;border:2px solid #6b503a;border-radius:7px;background:#090705;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:22px;color:#d9ad62}
        .mobile-npc-avatar img,.mobile-npc-avatar canvas{width:100%;height:100%;object-fit:cover;image-rendering:auto}
        .mnpc-avatar-fallback{font-weight:800}
        .mobile-npc-main{min-width:0}
        .mobile-npc-head{display:flex;align-items:center;gap:6px;min-height:28px}
        .mobile-npc-name{font-size:16px;font-weight:800;color:#f5e8cf;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mobile-npc-title{font-size:11px;color:#b9a58a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mobile-npc-loc{font-size:11px;color:#9f8c75;margin-top:2px}
        .mobile-npc-rank{font-size:11px;font-weight:800;margin-left:auto;white-space:nowrap}
        .mobile-npc-bar{height:7px;background:#100d0b;border:1px solid #3d3027;margin-top:7px;overflow:hidden;border-radius:4px}
        .mobile-npc-bar i{display:block;height:100%;transition:width .2s ease}
        .mobile-npc-meta{display:flex;justify-content:space-between;gap:6px;margin-top:4px;font-size:11px;color:#b9a58a}
        .mobile-npc-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}
        .mobile-npc-actions .btn{min-height:44px!important;touch-action:manipulation}
        .mobile-npc-bond{padding:2px 5px;border:1px solid #e8a0a0;color:#e8a0a0;border-radius:4px;font-size:10px;white-space:nowrap}
        .mobile-npc-empty{text-align:center;padding:24px;color:#9f8c75}
        .mobile-npc-header{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
        .mobile-npc-header .btn{min-height:44px}
      }
      @media(min-width:601px){.mobile-npc-relation{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function renderCards(host) {
    if (!mobile() || !host) return false;
    const data = M.getNPCData();
    host.querySelectorAll(".mobile-npc-relation").forEach(x => x.remove());
    const wrap = document.createElement("section");
    wrap.className = "mobile-npc-relation";
    wrap.innerHTML = '<div class="mobile-npc-header"><div><div class="section-title">NPC关系</div><div class="small">按好感度从高到低排列</div></div><button class="btn" data-npc-refresh>刷新</button></div><div class="mobile-npc-list">' +
      (data.length ? data.map(npc => {
        const color = esc(npc.rankColor);
        return '<article class="mobile-npc-card" data-npc-id="' + esc(npc.id) + '">' +
          '<div class="mobile-npc-avatar" style="border-color:' + color + '">' + npc.avatarHtml + '</div>' +
          '<div class="mobile-npc-main">' +
          '<div class="mobile-npc-head"><span class="mobile-npc-name">' + esc(npc.name) + '</span>' +
          (npc.bonded ? '<span class="mobile-npc-bond">已结缘</span>' : '') +
          '<span class="mobile-npc-rank" style="color:' + color + '">' + esc(npc.rank) + '</span></div>' +
          '<div class="mobile-npc-title">' + esc(npc.title || "") + '</div>' +
          '<div class="mobile-npc-loc">' + esc(npc.location) + '</div>' +
          '<div class="mobile-npc-bar"><i style="width:' + (npc.progress * 100) + '%;background:' + color + '"></i></div>' +
          '<div class="mobile-npc-meta"><span>好感度</span><b style="color:' + color + '">' + npc.favor + ' / 100</b></div>' +
          '<div class="mobile-npc-actions"><button class="btn primary" data-npc-open="' + esc(npc.id) + '">详情 / 对话</button><button class="btn" data-npc-gift="' + esc(npc.id) + '">送礼</button></div>' +
          '</div></article>';
      }).join("") : '<div class="mobile-npc-empty">当前没有可交互 NPC。</div>') +
      '</div>';
    host.appendChild(wrap);

    wrap.querySelector("[data-npc-refresh]").onclick = () => renderCards(host);
    wrap.querySelectorAll("[data-npc-open]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        if (typeof g.modalNpc === "function") g.modalNpc(btn.dataset.npcOpen);
      };
    });
    wrap.querySelectorAll("[data-npc-gift]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const p = getPlayer();
        const npc = typeof g.findPerson === "function" ? g.findPerson(btn.dataset.npcGift) : null;
        if (!p || !npc || typeof g.giftNpc !== "function") return;
        const result = g.giftNpc(p, npc);
        if (result && result.msg && p.logs) p.logs.unshift(result.msg);
        if (typeof g.saveGame === "function" && g.state) g.saveGame(g.state);
        renderCards(host);
      };
    });
    wrap.querySelectorAll(".mobile-npc-card").forEach(card => {
      card.onclick = e => {
        if (e.target.closest("button")) return;
        const id = card.dataset.npcId;
        if (typeof g.modalNpc === "function") g.modalNpc(id);
      };
    });
    return true;
  }

  M.renderNPCMobile = function (target) {
    const host = typeof target === "string" ? document.querySelector(target) : target;
    return renderCards(host || document.querySelector("[data-page='npc'],[data-page='relation'],#npcRelation,.npc-relation-page,.npc-list"));
  };

  M.openNPCRelationPage = function () {
    if (typeof g.openModal !== "function") return false;
    const holder = document.createElement("div");
    holder.id = "mobile-npc-relation-holder";
    holder.innerHTML = '<div class="mobile-npc-relation" style="display:block"><div id="mobile-npc-relation-content"></div></div>';
    g.openModal('<div class="modal-head"><h2 class="section-title">NPC关系</h2><button class="modal-close" id="mobileNpcRelationClose">关闭</button></div><div id="mobileNpcRelationMount"></div>');
    const mount = document.getElementById("mobileNpcRelationMount");
    if (!mount) return false;
    renderCards(mount);
    const close = document.getElementById("mobileNpcRelationClose");
    if (close && typeof g.closeModal === "function") close.onclick = () => g.closeModal();
    return true;
  };

  function installHooks() {
    if (M._npcHooksInstalled) return;
    M._npcHooksInstalled = true;
    if (g.Game && typeof g.Game.on === "function") {
      ["favor:changed", "npc:updated", "save:after", "player:loaded"].forEach(ev => g.Game.on(ev, () => {
        if (mobile()) setTimeout(() => M.renderNPCMobile(), 0);
      }));
    }
    if (g.Game && typeof g.Game.hook === "function") {
      g.Game.hook("openModal", function (next) {
        return function () {
          const result = next.apply(this, arguments);
          setTimeout(() => {
            if (mobile()) M.renderNPCMobile();
          }, 0);
          return result;
        };
      });
    }
  }

  injectStyle();
  installHooks();
  M.isMobile = M.isMobile || mobile;
  window.MobileUI = M;
})(typeof window !== "undefined" ? window : this);
