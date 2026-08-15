/* ui_npc.js — NPC 详情页统一视觉
 * 头像 / 身份 / 好感 / 性格 / 关系档案 / 操作
 * 不改 favor / npc_logic，只增强展示。
 */
(function (g) {
  "use strict";

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&").replace(/</g, "<")
      .replace(/>/g, ">").replace(/\"/g, """);
  }

  function inject() {
    if (document.getElementById("ui-npc-style")) return;
    const s = document.createElement("style");
    s.id = "ui-npc-style";
    s.textContent = `
      .npc-profile{
        background:linear-gradient(180deg,var(--panel-light,#30261f),#211a15);
        border:1px solid var(--line,#4b3a2d);
        border-radius:var(--radius,10px);
        padding:14px;margin:0 0 10px;
        box-shadow:var(--shadow-sm,2px 3px 0 #0a0806);
      }
      .npc-profile-hero{
        display:grid;grid-template-columns:88px 1fr;gap:12px;align-items:center;
      }
      .npc-profile-avatar{
        width:84px;height:84px;border:2px solid var(--line-strong,#6b503a);
        border-radius:8px;background:#090705;overflow:hidden;image-rendering:pixelated;
      }
      .npc-profile-avatar > *{width:100%;height:100%;display:block}
      .npc-profile-name{font-size:18px;font-weight:800;color:var(--text,#f5e8cf)}
      .npc-profile-title{font-size:12px;color:var(--muted,#b9a58a);margin-top:2px}
      .npc-profile-rank{
        display:inline-block;margin-top:6px;padding:3px 8px;
        border:1px solid var(--gold-dim,#8a6a45);color:var(--gold,#d9ad62);
        border-radius:4px;font-size:12px;font-weight:700;
      }
      .npc-profile-bar{
        height:8px;margin-top:8px;background:#100d0b;border:1px solid #3d3027;
        overflow:hidden;border-radius:2px;
      }
      .npc-profile-bar i{display:block;height:100%;background:var(--gold,#d9ad62)}
      .npc-profile-section{
        margin-top:12px;padding-top:10px;border-top:1px dashed var(--line,#4b3a2d);
      }
      .npc-profile-section h4{
        margin:0 0 6px;font-size:13px;color:var(--gold,#d9ad62);font-weight:800;
      }
      .npc-profile-actions{
        display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:12px;
      }
      .npc-profile-actions .btn{min-height:44px}
      .npc-archive-item{
        font-size:12px;color:var(--muted,#b9a58a);padding:4px 0;
        border-bottom:1px dotted #3d3027;
      }
      .npc-archive-item b{color:var(--text,#f5e8cf)}
      @media(max-width:420px){
        .npc-profile-actions{grid-template-columns:1fr 1fr}
      }
    `;
    document.head.appendChild(s);
  }

  function avatarHtml(npc) {
    try {
      if (typeof g.npcAvatar === "function") return g.npcAvatar(npc, "lg");
      if (typeof g.avatarHtml === "function") return g.avatarHtml(npc, "lg");
    } catch (_) {}
    return `<span style="display:grid;place-items:center;height:100%;font-size:28px;color:var(--gold)">${esc((npc.name || "?").slice(0, 1))}</span>`;
  }

  function getFavor(p, id) {
    if (typeof g.getFavor === "function") {
      try { return Number(g.getFavor(p, id)) || 0; } catch (_) {}
    }
    return Number((p.favor && p.favor[id]) || 0);
  }

  function getRank(v) {
    if (typeof g.favorRank === "function") {
      try { return g.favorRank(v) || { name: "陌生" }; } catch (_) {}
    }
    if (v >= 95) return { name: "倾心" };
    if (v >= 80) return { name: "莫逆" };
    if (v >= 60) return { name: "知己" };
    if (v >= 40) return { name: "交好" };
    if (v >= 20) return { name: "相识" };
    return { name: "陌生" };
  }

  function personality(npc) {
    if (npc.personality) return npc.personality;
    if (npc.trait) return npc.trait;
    if (npc.desc) return String(npc.desc).slice(0, 40);
    return "性情未详";
  }

  function archive(p, npc) {
    const items = [];
    const id = npc.id;
    if (p.flags && p.flags["met_" + id]) items.push({ t: "初遇", d: "你们已经见过面" });
    const fav = getFavor(p, id);
    if (fav >= 20) items.push({ t: "相识", d: "好感渐生" });
    if (fav >= 40) items.push({ t: "交好", d: "彼此信任加深" });
    if (fav >= 60) items.push({ t: "知己", d: "可共商要事" });
    if (p.bonds && p.bonds[id]) items.push({ t: "结缘", d: "已结下深厚羁绊" });
    if (!items.length) items.push({ t: "尚未深交", d: "还需要更多相处" });
    return items;
  }

  /** 渲染完整 NPC 档案 HTML */
  function renderProfile(npcId) {
    inject();
    const p = (g.state && g.state.player) || {};
    const npc = typeof g.findPerson === "function" ? g.findPerson(npcId) : null;
    if (!npc) return `<p class="small">未找到此人</p>`;

    const fav = Math.max(0, Math.min(100, getFavor(p, npc.id)));
    const rank = getRank(fav);
    const arch = archive(p, npc);

    return `
      <div class="npc-profile" data-npc="${esc(npc.id)}">
        <div class="npc-profile-hero">
          <div class="npc-profile-avatar">${avatarHtml(npc)}</div>
          <div>
            <div class="npc-profile-name">${esc(npc.name)}</div>
            <div class="npc-profile-title">${esc(npc.title || npc.role || "江湖人士")}</div>
            <div class="npc-profile-rank">${esc(rank.name)} · 好感 ${fav}</div>
            <div class="npc-profile-bar"><i style="width:${fav}%"></i></div>
          </div>
        </div>
        <div class="npc-profile-section">
          <h4>性格</h4>
          <p class="small">${esc(personality(npc))}</p>
        </div>
        <div class="npc-profile-section">
          <h4>关系档案</h4>
          ${arch.map(a => `<div class="npc-archive-item"><b>${esc(a.t)}</b> — ${esc(a.d)}</div>`).join("")}
        </div>
        <div class="npc-profile-actions">
          <button class="btn primary" data-npc-act="talk" data-id="${esc(npc.id)}">交谈</button>
          <button class="btn" data-npc-act="gift" data-id="${esc(npc.id)}">赠礼</button>
          <button class="btn" data-npc-act="party" data-id="${esc(npc.id)}">同行</button>
        </div>
      </div>`;
  }

  function bindProfileActions(root) {
    if (!root) return;
    root.querySelectorAll("[data-npc-act]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const act = btn.dataset.npcAct;
        if (act === "talk" && typeof g.modalNpc === "function") {
          // 回到原对话流
          g.modalNpc(id);
        } else if (act === "gift") {
          if (typeof g.modalNpc === "function") g.modalNpc(id);
        } else if (act === "party") {
          if (g.state && g.state.player) g.state.player.logs && g.state.player.logs.unshift("同行功能后续接入。");
        }
      };
    });
  }

  /** 打开档案页（可被导航「关系」调用） */
  function openNpcProfile(npcId) {
    if (!npcId) {
      // 无 ID 则打开关系列表
      if (g.MobileUI && typeof g.MobileUI.openNPCRelationPage === "function") {
        return g.MobileUI.openNPCRelationPage();
      }
      return;
    }
    const html = `
      <div class="modal-head">
        <b class="section-title">人物档案</b>
        <button class="modal-close" type="button" id="npcProfileClose">×</button>
      </div>
      ${renderProfile(npcId)}`;
    if (typeof g.openModal === "function") g.openModal(html);
    else {
      const root = document.querySelector("#modalRoot");
      if (root) root.innerHTML = `<div class="modal-mask" id="modalMask"><div class="modal-panel">${html}</div></div>`;
    }
    const close = document.getElementById("npcProfileClose");
    if (close && typeof g.closeModal === "function") close.onclick = () => g.closeModal();
    bindProfileActions(document.querySelector(".modal-panel") || document);
  }

  // 轻量增强：原 modalNpc 打开后，在顶部插入档案摘要
  function enhanceExistingModal() {
    const panel = document.querySelector("#modalPanel, .modal-panel");
    if (!panel) return;
    if (panel.querySelector(".npc-profile")) return;
    // 若有 NPC 标题痕迹，尝试注入
  }

  g.renderNpcProfile = renderProfile;
  g.openNpcProfile = openNpcProfile;
  g.UINpc = { render: renderProfile, open: openNpcProfile };

  inject();
})(typeof window !== "undefined" ? window : this);
