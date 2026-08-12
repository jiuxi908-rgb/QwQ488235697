/* =========================================
 * mobile_ui.js
 * 手机二级界面增强层
 * 人物页：真实数据适配 + 移动端展示。
 * 原桌面业务逻辑不替换，只在手机端追加增强层。
 * ========================================= */
(function (g) {
  "use strict";

  const MOBILE_UI = g.MobileUI || {
    minTouch: 44,
    init() {},
    injectStyle() {},
    bindDelegates() {},
    esc(text) { return String(text == null ? '' : text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); },
    renderSkills() { return ''; },
    closeSheet(sheet) { if (sheet) sheet.remove(); }
  };

  const esc = MOBILE_UI.esc.bind(MOBILE_UI);
  const isMobile = () => window.matchMedia ? window.matchMedia('(max-width:600px)').matches : window.innerWidth <= 600;

  function getPlayer() {
    return (g.state && g.state.player) || (g.game && g.game.player) || g.playerData || null;
  }

  function getSkills(player) {
    if (!player) return [];
    const raw = player.skills;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      return Object.keys(raw).map(id => {
        const s = raw[id];
        if (s && typeof s === 'object') return Object.assign({ id }, s);
        return { id, name: String(s) };
      });
    }
    return [];
  }

  function calculateCombatPower(player) {
    if (!player) return 0;
    if (typeof g.calcCombatPower === 'function') {
      try { return Number(g.calcCombatPower(player)) || 0; } catch (_) {}
    }
    return Number(player.combatPower || player.power || 0) || 0;
  }

  function getRealm(player) {
    if (!player) return {};
    if (typeof g.getPlayerRank === 'function') {
      try { return g.getPlayerRank(player) || {}; } catch (_) {}
    }
    const id = Number(player.rankId || 0);
    const list = Array.isArray(g.PLAYER_RANKS) ? g.PLAYER_RANKS : [];
    return list[id] || { id, name: player.rankName || '未入流' };
  }

  function getRealmProgress(player) {
    if (!player) return { current: 0, next: null, need: 0, percent: 0 };
    if (typeof g.getPlayerRankProgress === 'function') {
      try { return g.getPlayerRankProgress(player); } catch (_) {}
    }
    return { current: calculateCombatPower(player), next: null, need: 0, percent: 0 };
  }

  /* 人物数据适配器：唯一职责是把真实游戏状态转换成 MobileUI 使用的数据结构。 */
  MOBILE_UI.getPlayerData = function () {
    const player = getPlayer() || {};
    const realm = getRealm(player);
    const progress = getRealmProgress(player);
    const stats = player.stats || {};

    return {
      id: player.id || player.uid || 'player',
      name: player.name || player.playerName || '未命名',
      avatar: player.avatar || player.avatarId || '',
      realmName: realm.name || player.rankName || '未入流',
      realmLevel: Number(realm.id ?? player.rankId ?? 0),
      combatPower: calculateCombatPower(player),
      realmProgress: Number(progress.percent || 0),
      nextRealmText: progress.next ? '下一境界' : '当前境界',
      nextRealmNeed: progress.next ? `还需约 ${Math.max(0, Number(progress.need || 0))}` : '已达当前人物境界上限',
      hp: Number(player.hp ?? 0),
      maxHp: Number(player.maxHp ?? 100),
      mp: Number(player.mp ?? 0),
      maxMp: Number(player.maxMp ?? 60),
      silver: Number(player.silver ?? player.money ?? 0),
      locationName: player.locationName || player.location || '未知地点',
      stats: {
        str: Number(stats.str ?? stats.arm ?? player.str ?? player.arm ?? 0),
        dex: Number(stats.dex ?? stats.agi ?? player.dex ?? player.agi ?? 0),
        int: Number(stats.int ?? stats.qi ?? player.int ?? player.qi ?? 0),
        con: Number(stats.con ?? stats.bone ?? player.con ?? player.bone ?? 0)
      },
      skills: getSkills(player)
    };
  };

  function injectCharacterStyle() {
    if (document.getElementById('mobile-character-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'mobile-character-ui-style';
    style.textContent = `
      .mui-character-mobile{display:none}
      @media(max-width:600px){
        .mui-character-mobile{display:block;width:100%;padding:8px 0 72px}
        .mui-character-mobile .mc-card{background:linear-gradient(180deg,#30261f,#211a15);border:1px solid #4b3a2d;border-radius:8px;padding:10px;margin:0 0 8px;box-shadow:2px 3px 0 #0a0806}
        .mui-character-mobile .mc-hero{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:center}
        .mui-character-mobile .mc-avatar{width:72px;height:72px;image-rendering:pixelated;border:2px solid #6b503a;background:#090705;overflow:hidden}
        .mui-character-mobile .mc-avatar>*{display:block;width:100%;height:100%}
        .mui-character-mobile .mc-name{font-size:19px;font-weight:800;color:#f5e8cf;line-height:1.25}
        .mui-character-mobile .mc-realm{display:inline-block;margin-top:4px;padding:3px 7px;border:1px solid #8a6a45;color:#d9ad62;border-radius:4px;font-size:12px}
        .mui-character-mobile .mc-power{float:right;color:#d9ad62;font-weight:800;font-size:15px}
        .mui-character-mobile .mc-label{font-size:11px;color:#b9a58a}
        .mui-character-mobile .mc-value{font-size:15px;font-weight:800;color:#f5e8cf}
        .mui-character-mobile .mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .mui-character-mobile .mc-stat{min-height:44px;padding:8px;background:#191310;border:1px solid #3d3027;border-radius:5px}
        .mui-character-mobile .mc-row{display:flex;align-items:center;justify-content:space-between;min-height:44px;gap:8px}
        .mui-character-mobile .mc-bar{height:7px;margin-top:6px;background:#100d0b;border:1px solid #3d3027;overflow:hidden}
        .mui-character-mobile .mc-bar i{display:block;height:100%;background:#7aae6a;transition:width .2s ease}
        .mui-character-mobile .mc-bar.mp i{background:#6c91b9}
        .mui-character-mobile .mc-progress{height:6px;margin-top:7px;background:#100d0b;border:1px solid #3d3027;overflow:hidden}
        .mui-character-mobile .mc-progress i{display:block;height:100%;background:#d9ad62}
        .mui-character-mobile .mc-section{font-size:13px;color:#d9ad62;font-weight:800;margin-bottom:7px}
        .mui-character-mobile .mc-skill{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:46px;border-top:1px dashed #4b3a2d}
        .mui-character-mobile .mc-skill-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mui-character-mobile .mc-skill-realm{text-align:right;color:#d9ad62;font-size:12px;white-space:nowrap}
        .mui-character-mobile .mc-note{font-size:11px;color:#9f8c75;line-height:1.5}
      }
      @media(min-width:601px){.mui-character-mobile{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function avatarHtml(data) {
    try {
      if (typeof g.playerAvatar === 'function') return g.playerAvatar(data.id || data.name || 'player', 'lg');
      if (typeof g.avatarHtml === 'function') return g.avatarHtml(data, 'lg');
    } catch (_) {}
    return data.avatar ? `<img src="${esc(data.avatar)}" alt="">` : '';
  }

  function findCharacterTarget() {
    return document.querySelector('#characterPanel,.character-panel,[data-page="character"],[data-panel="character"],.modal-panel');
  }

  function renderCharacterMobile(target, data) {
    const el = typeof target === 'string' ? document.querySelector(target) : (target || findCharacterTarget());
    if (!el || !isMobile()) return false;
    data = data || MOBILE_UI.getPlayerData();
    const stats = data.stats || {};
    const hp = Math.max(0, Number(data.hp || 0));
    const hpMax = Math.max(1, Number(data.maxHp || 100));
    const mp = Math.max(0, Number(data.mp || 0));
    const mpMax = Math.max(1, Number(data.maxMp || 60));
    const progress = Math.max(0, Math.min(100, Number(data.realmProgress || 0)));
    const skills = Array.isArray(data.skills) ? data.skills : [];

    el.querySelectorAll('.mui-character-mobile').forEach(n => n.remove());
    const host = document.createElement('div');
    host.innerHTML = `<div class="mui-character-mobile">
      <section class="mc-card mc-hero"><div class="mc-avatar">${avatarHtml(data)}</div><div><div class="mc-label">江湖人物</div><div class="mc-name">${esc(data.name)}<span class="mc-power">${esc(data.combatPower)}</span></div><div class="mc-realm">${esc(data.realmName)}</div><div class="mc-note">${esc(data.locationName)}</div></div></section>
      <section class="mc-card"><div class="mc-row"><span class="mc-section">人物境界</span><span class="mc-label">${esc(data.nextRealmText)}</span></div><div class="mc-row"><span class="mc-value">${esc(data.realmName)}</span><span class="mc-label">${esc(data.nextRealmNeed)}</span></div><div class="mc-progress"><i style="width:${progress}%"></i></div><div class="mc-note" style="margin-top:6px">人物境界影响学武门槛、展示与高境界遇敌修正；功法境界独立计算。</div></section>
      <section class="mc-card"><div class="mc-section">状态</div><div class="mc-grid"><div class="mc-stat"><div class="mc-row"><span class="mc-label">气血</span><span class="mc-value">${hp}/${hpMax}</span></div><div class="mc-bar"><i style="width:${Math.min(100,hp/hpMax*100)}%"></i></div></div><div class="mc-stat"><div class="mc-row"><span class="mc-label">内力</span><span class="mc-value">${mp}/${mpMax}</span></div><div class="mc-bar mp"><i style="width:${Math.min(100,mp/mpMax*100)}%"></i></div></div><div class="mc-stat"><span class="mc-label">银两</span><div class="mc-value">${esc(data.silver)}</div></div><div class="mc-stat"><span class="mc-label">综合战力</span><div class="mc-value">${esc(data.combatPower)}</div></div></div></section>
      <section class="mc-card"><div class="mc-section">基础属性</div><div class="mc-grid"><div class="mc-stat"><span class="mc-label">臂力</span><div class="mc-value">${esc(stats.str)}</div></div><div class="mc-stat"><span class="mc-label">身法</span><div class="mc-value">${esc(stats.dex)}</div></div><div class="mc-stat"><span class="mc-label">内力</span><div class="mc-value">${esc(stats.int)}</div></div><div class="mc-stat"><span class="mc-label">根骨</span><div class="mc-value">${esc(stats.con)}</div></div></div></section>
      <section class="mc-card"><div class="mc-section">武学摘要</div>${skills.length ? skills.slice(0,6).map(s=>`<div class="mc-skill"><div class="mc-skill-name">${esc(s.name || s.id || '未命名武学')}</div><div class="mc-skill-realm">${esc(s.realmName || s.realm || '初窥门径')}</div></div>`).join('') : '<div class="mc-note">尚未习得武学</div>'}</section>
    </div>`;
    el.appendChild(host.firstElementChild);
    return true;
  }

  function refreshCharacterMobile() {
    if (!isMobile()) return false;
    return renderCharacterMobile(findCharacterTarget(), MOBILE_UI.getPlayerData());
  }

  function installHooks() {
    if (!g.Game || typeof g.Game.on !== 'function') return;
    if (MOBILE_UI._characterHooksInstalled) return;
    MOBILE_UI._characterHooksInstalled = true;
    const refresh = () => setTimeout(refreshCharacterMobile, 0);
    g.Game.on('render:after', refresh);
    g.Game.on('realm:up', refresh);
    g.Game.on('player:loaded', refresh);
    g.Game.on('save:after', refresh);
    g.Game.on('skill:learned', refresh);
    g.Game.on('skill:trained', refresh);
    g.Game.on('character:changed', refresh);
  }

  injectCharacterStyle();
  installHooks();
  MOBILE_UI.renderCharacterMobile = renderCharacterMobile;
  MOBILE_UI.refreshCharacterMobile = refreshCharacterMobile;
  MOBILE_UI.isMobile = isMobile;
  window.MobileUI = MOBILE_UI;

  window.addEventListener('resize', () => setTimeout(refreshCharacterMobile, 0));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(refreshCharacterMobile, 0));
  else setTimeout(refreshCharacterMobile, 0);
})(typeof window !== 'undefined' ? window : this);
