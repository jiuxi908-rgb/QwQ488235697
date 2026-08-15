/* =========================================
 * mobile_ui.js
 * 手机二级界面增强层 + 人物页重做
 * 人物页：信息层级清晰（头像/境界/状态/属性/装备/武学）
 * 武学页：移动端卡片/触控增强
 * 背包页：移动端卡片网格增强
 * 原桌面业务逻辑不替换，只在手机端追加增强层。
 * ========================================= */
(function (g) {
  "use strict";

  const MOBILE_UI = g.MobileUI || {
    minTouch: 44,
    init() {}, injectStyle() {}, bindDelegates() {},
    esc(text) {
      return String(text == null ? '' : text)
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#39;');
    },
    renderSkills() { return ''; },
    closeSheet(sheet) { if (sheet) sheet.remove(); }
  };
  const esc = MOBILE_UI.esc.bind(MOBILE_UI);
  const isMobile = () => window.matchMedia ? window.matchMedia('(max-width:600px)').matches : window.innerWidth <= 600;

  function getPlayer() { return (g.state && g.state.player) || (g.game && g.game.player) || g.playerData || null; }
  function getSkills(player) {
    if (!player) return [];
    const raw = player.skills;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') return Object.keys(raw).map(id => raw[id] && typeof raw[id] === 'object' ? Object.assign({id}, raw[id]) : {id,name:String(raw[id])});
    return [];
  }
  function calculateCombatPower(player) {
    if (!player) return 0;
    if (typeof g.calcCombatPower === 'function') { try { return Number(g.calcCombatPower(player)) || 0; } catch (_) {} }
    return Number(player.combatPower || player.power || 0) || 0;
  }
  function getRealm(player) {
    if (!player) return {};
    if (typeof g.getPlayerRank === 'function') { try { return g.getPlayerRank(player) || {}; } catch (_) {} }
    const id = Number(player.rankId || 0), list = Array.isArray(g.PLAYER_RANKS) ? g.PLAYER_RANKS : [];
    return list[id] || {id,name:player.rankName || '未入流'};
  }
  function getRealmProgress(player) {
    if (!player) return {current:0,next:null,need:0,percent:0};
    if (typeof g.getPlayerRankProgress === 'function') { try { return g.getPlayerRankProgress(player); } catch (_) {} }
    return {current:calculateCombatPower(player),next:null,need:0,percent:0};
  }
  function getEquipSlots(player) {
    const eq = (player && player.equip) || {};
    const slots = [
      { key: 'weapon', label: '武器', id: eq.weapon },
      { key: 'armor', label: '防具', id: eq.armor },
      { key: 'accessory', label: '饰品', id: eq.accessory }
    ];
    return slots.map(s => {
      const item = s.id && typeof g.getItemById === 'function' ? g.getItemById(s.id) : null;
      return {
        key: s.key,
        label: s.label,
        name: item ? item.name : '空',
        rarity: item ? (item.rarity || '凡品') : '',
        stars: item ? (item.rarity === '绝品' ? '★★★' : item.rarity === '精品' ? '★★' : item.rarity === '良品' ? '★' : '') : ''
      };
    });
  }

  MOBILE_UI.getPlayerData = function () {
    const player = getPlayer() || {}, realm = getRealm(player), progress = getRealmProgress(player), stats = player.stats || {};
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
      skills: getSkills(player),
      equip: getEquipSlots(player)
    };
  };

  function injectCharacterStyle() {
    if (document.getElementById('mobile-character-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'mobile-character-ui-style';
    style.textContent = `
      .mui-character-mobile{display:none}
      @media(max-width:600px){
        .mui-character-mobile{display:block;width:100%;padding:8px 0 80px}
        .mui-character-mobile .mc-card{
          background:linear-gradient(180deg,var(--panel-light,#30261f),#211a15);
          border:1px solid var(--line,#4b3a2d);
          border-radius:var(--radius-sm,8px);
          padding:12px;
          margin:0 0 10px;
          box-shadow:var(--shadow-sm,2px 3px 0 #0a0806);
        }
        .mui-character-mobile .mc-hero{
          display:grid;grid-template-columns:84px 1fr;gap:12px;align-items:center;
        }
        .mui-character-mobile .mc-avatar{
          width:80px;height:80px;image-rendering:pixelated;
          border:2px solid var(--line-strong,#6b503a);background:#090705;overflow:hidden;border-radius:6px;
        }
        .mui-character-mobile .mc-avatar>*{display:block;width:100%;height:100%}
        .mui-character-mobile .mc-name{font-size:var(--fs-xl,19px);font-weight:800;color:var(--text,#f5e8cf);line-height:1.25}
        .mui-character-mobile .mc-realm{
          display:inline-block;margin-top:5px;padding:3px 8px;
          border:1px solid var(--gold-dim,#8a6a45);color:var(--gold,#d9ad62);
          border-radius:4px;font-size:var(--fs-sm,12px);font-weight:700;
        }
        .mui-character-mobile .mc-power{float:right;color:var(--gold,#d9ad62);font-weight:800;font-size:16px}
        .mui-character-mobile .mc-label{font-size:11px;color:var(--muted,#b9a58a)}
        .mui-character-mobile .mc-value{font-size:15px;font-weight:800;color:var(--text,#f5e8cf)}
        .mui-character-mobile .mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .mui-character-mobile .mc-stat{
          min-height:48px;padding:10px;background:#191310;
          border:1px solid #3d3027;border-radius:6px;
        }
        .mui-character-mobile .mc-row{
          display:flex;align-items:center;justify-content:space-between;
          min-height:44px;gap:8px;
        }
        .mui-character-mobile .mc-bar{
          height:8px;margin-top:6px;background:#100d0b;
          border:1px solid #3d3027;overflow:hidden;border-radius:2px;
        }
        .mui-character-mobile .mc-bar i{display:block;height:100%;background:var(--success,#7aae6a);transition:width .2s ease}
        .mui-character-mobile .mc-bar.mp i{background:var(--info,#6c91b9)}
        .mui-character-mobile .mc-progress{
          height:7px;margin-top:8px;background:#100d0b;
          border:1px solid #3d3027;overflow:hidden;border-radius:2px;
        }
        .mui-character-mobile .mc-progress i{display:block;height:100%;background:var(--gold,#d9ad62)}
        .mui-character-mobile .mc-section{
          font-size:13px;color:var(--gold,#d9ad62);font-weight:800;margin-bottom:8px;
          letter-spacing:1px;
        }
        .mui-character-mobile .mc-skill{
          display:flex;align-items:center;justify-content:space-between;gap:8px;
          min-height:44px;border-top:1px dashed var(--line,#4b3a2d);padding:6px 0;
        }
        .mui-character-mobile .mc-skill-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mui-character-mobile .mc-skill-realm{text-align:right;color:var(--gold,#d9ad62);font-size:12px;white-space:nowrap}
        .mui-character-mobile .mc-note{font-size:11px;color:#9f8c75;line-height:1.5}
        .mui-character-mobile .mc-equip-row{
          display:flex;align-items:center;justify-content:space-between;
          min-height:44px;padding:6px 0;border-top:1px dashed var(--line,#4b3a2d);
        }
        .mui-character-mobile .mc-equip-name{font-weight:700}
        .mui-character-mobile .mc-equip-empty{color:var(--muted,#b9a58a);font-weight:400}
        .mui-character-mobile .mc-stars{color:var(--gold,#d9ad62);font-size:12px;margin-left:6px}
      }
      @media(min-width:601px){.mui-character-mobile{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function injectSkillMobileStyle() {
    if (document.getElementById('mobile-skill-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'mobile-skill-ui-style';
    style.textContent = `@media(max-width:600px){
      .modal-panel:has(.skill-card) .skill-card{margin:8px 0!important;padding:11px!important;border-radius:8px!important;overflow:hidden}
      .modal-panel:has(.skill-card) .skill-card .quest-head{display:flex;align-items:center;gap:5px;flex-wrap:wrap;line-height:1.4}
      .modal-panel:has(.skill-card) .skill-card .small{line-height:1.55;margin:5px 0}
      .modal-panel:has(.skill-card) .skill-card .quest-bar{height:7px!important;margin-top:8px!important}
      .modal-panel:has(.skill-card) .skill-card .row{display:block!important;margin-top:8px!important}
      .modal-panel:has(.skill-card) .skill-card .train{display:flex!important;align-items:center;justify-content:center;width:100%!important;min-height:44px!important;height:44px!important;padding:0 14px!important;font-size:14px!important;box-sizing:border-box}
      .modal-panel:has(.skill-card) .skill-card .train:disabled{display:none!important}
      .modal-panel:has(.skill-card) .skill-tab{min-height:44px!important;padding:0 12px!important;margin:3px 3px 3px 0!important;white-space:nowrap}
      .modal-panel:has(.skill-card) .stat-grid{grid-template-columns:1fr 1fr!important;gap:6px!important}
      .modal-panel:has(.skill-card) .stat{min-height:44px!important;padding:8px!important}
      .modal-panel:has(.skill-card) .modal-head{position:sticky;top:0;z-index:3;padding-bottom:7px;background:inherit}
      .modal-panel:has(.skill-card) .quest-list{display:block!important}
    }`;
    document.head.appendChild(style);
  }

  function enhanceSkillModal() {
    if (!isMobile()) return false;
    const panel = document.querySelector('.modal-panel');
    if (!panel || !panel.querySelector('.skill-card')) return false;
    panel.classList.add('mobile-skill-panel');
    panel.querySelectorAll('.train').forEach(btn => {
      btn.style.minWidth = '100%';
      btn.style.minHeight = '44px';
      btn.style.touchAction = 'manipulation';
    });
    panel.querySelectorAll('.skill-tab').forEach(btn => {
      btn.style.minHeight = '44px';
      btn.style.touchAction = 'manipulation';
    });
    return true;
  }

  function injectBagMobileStyle() {
    if (document.getElementById('mobile-bag-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'mobile-bag-ui-style';
    style.textContent = `@media(max-width:600px){
      .mobile-bag-panel .equip-grid{grid-template-columns:1fr 1fr!important;gap:6px!important}
      .mobile-bag-panel .bag-filter{min-height:44px!important;padding:0 10px!important;touch-action:manipulation}
      .mobile-bag-panel .mobile-bag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
      .mobile-bag-panel .mobile-bag-card{min-width:0;min-height:150px;border:1px solid #4b3a2d;border-radius:8px;padding:9px;background:#191310;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;touch-action:manipulation}
      .mobile-bag-panel .mobile-bag-icon{width:44px;height:44px;border:2px solid #4b3a2d;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:2px}
      .mobile-bag-panel .mobile-bag-name{font-weight:800;line-height:1.35;min-height:36px;overflow:hidden}
      .mobile-bag-panel .mobile-bag-meta{font-size:11px;color:#b9a58a}
      .mobile-bag-panel .mobile-bag-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:auto}
      .mobile-bag-panel .mobile-bag-actions .btn{min-height:44px!important;padding:0 6px!important;touch-action:manipulation}
      .mobile-bag-panel .mobile-bag-detail{margin-top:8px;padding:10px;border:1px solid #4b3a2d;border-radius:7px;background:#211a15}
      .mobile-bag-panel .mobile-bag-detail button{min-height:44px!important;margin:3px 3px 0 0}
      .mobile-bag-panel .mobile-bag-count{float:right;color:#f5e8cf}
      .mobile-bag-panel .mobile-bag-empty{grid-column:1/-1;text-align:center;padding:24px 8px;color:#9f8c75}
      @media(min-width:420px){.mobile-bag-panel .mobile-bag-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    }`;
    document.head.appendChild(style);
  }

  const qualityOrder = { '绝品': 0, '精品': 1, '良品': 2, '凡品': 3 };
  function getBagPlayer() { return (g.state && g.state.player) || (g.playerData) || (g.game && g.game.player) || null; }
  MOBILE_UI.getBagData = function () {
    const p = getBagPlayer() || {};
    const bag = Array.isArray(p.bag) ? p.bag : [];
    const used = typeof g.bagUsed === 'function' ? Number(g.bagUsed(p)) || 0 : bag.reduce((n, s) => n + Number(s.count || 1), 0);
    const capacity = Number(p.bagCap || 20);
    const items = bag.slice().sort((a, b) => {
      const da = g.getItemById ? g.getItemById(a.id) : null, db = g.getItemById ? g.getItemById(b.id) : null;
      return (qualityOrder[da && da.rarity] ?? 99) - (qualityOrder[db && db.rarity] ?? 99);
    }).map(stack => ({ stack, detail: typeof g.getItemById === 'function' ? g.getItemById(stack.id) : null })).filter(x => x.detail);
    return { player: p, items, used, capacity, hasSpace: used < capacity };
  };

  function renderBagMobile() {
    if (!isMobile()) return false;
    const panel = document.querySelector('.modal-panel');
    if (!panel) return false;
    const data = MOBILE_UI.getBagData();
    if (!data.player) return false;
    const list = panel.querySelector('.item-list');
    if (!list) return false;
    panel.classList.add('mobile-bag-panel');
    const filters = panel.querySelectorAll('.bag-filter');
    filters.forEach(b => { b.style.minHeight = '44px'; b.style.touchAction = 'manipulation'; });
    const items = data.items;
    list.innerHTML = '<div class="mobile-bag-grid">' + (items.length ? items.map(x => {
      const d = x.detail, s = x.stack, c = (s.count || 1), rar = esc(d.rarity || '凡品'), rc = (g.RARITY_COLOR && g.RARITY_COLOR[d.rarity]) || '#b9a58a', icon = (g.ITEM_ICON && g.ITEM_ICON[d.type]) || '物';
      return `<article class="mobile-bag-card" data-id="${esc(d.id)}" style="border-color:${rc}"><div class="mobile-bag-icon" style="border-color:${rc};color:${rc}">${icon}</div><div class="mobile-bag-name">${esc(d.name)}<span class="mobile-bag-count">×${esc(c)}</span></div><div class="mobile-bag-meta" style="color:${rc}">${rar}</div><div class="mobile-bag-meta">${esc(d.type || '物品')}</div><div class="mobile-bag-actions"><button class="btn sm primary mobile-bag-detail-btn" data-id="${esc(d.id)}">详情</button><button class="btn sm mobile-bag-use-btn" data-id="${esc(d.id)}">${d.type === '书卷' ? '研读' : d.type === '消耗品' ? '使用' : (d.type === '武器' || d.type === '防具' || d.type === '饰品') ? '装备' : '查看'}</button></div></article>`;
    }).join('') : '<div class="mobile-bag-empty">背包空空如也。</div>') + '</div><div class="mobile-bag-detail small">点击“详情”查看物品属性与原有操作。</div>';
    panel.querySelectorAll('.mobile-bag-detail-btn').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      if (typeof g.showItemDetail === 'function') g.showItemDetail(data.player, btn.dataset.id, '全部');
      else showBagDetailFallback(panel, data.player, btn.dataset.id);
    });
    panel.querySelectorAll('.mobile-bag-use-btn').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const d = typeof g.getItemById === 'function' ? g.getItemById(btn.dataset.id) : null;
      if (!d) return;
      if ((d.type === '武器' || d.type === '防具' || d.type === '饰品') && typeof g.equipItem === 'function') {
        const r = g.equipItem(data.player, d.id);
        if (r && r.msg) data.player.logs.unshift(r.msg);
      } else if (d.type === '消耗品' || d.type === '书卷' || (d.quest && d.flag)) {
        if (typeof g.useItem === 'function') {
          const r = g.useItem(data.player, d.id);
          if (r && r.msg) data.player.logs.unshift(r.msg);
        }
      } else return;
      if (typeof g.saveGame === 'function') g.saveGame(g.state);
      setTimeout(renderBagMobile, 0);
    });
    panel.querySelectorAll('.mobile-bag-card').forEach(card => card.onclick = e => {
      if (e.target.closest('button')) return;
      if (typeof g.showItemDetail === 'function') g.showItemDetail(data.player, card.dataset.id, '全部');
    });
    return true;
  }

  function showBagDetailFallback(panel, p, id) {
    const d = g.getItemById ? g.getItemById(id) : null;
    if (!d) return;
    const box = panel.querySelector('.mobile-bag-detail');
    if (!box) return;
    const stats = typeof g.formatItemStats === 'function' ? g.formatItemStats(d) : '';
    box.innerHTML = `<b>${esc(d.name)}</b> <span>${esc(d.rarity || '凡品')}</span><p>${esc(d.desc || '')}</p>${stats ? `<p class="power">${esc(stats)}</p>` : ''}`;
  }

  function avatarHtml(data) {
    try {
      if (typeof g.playerAvatar === 'function') return g.playerAvatar(data.id || data.name || 'player', 'lg');
      if (typeof g.avatarHtml === 'function') return g.avatarHtml(data, 'lg');
    } catch (_) {}
    return data.avatar ? `<img src="${esc(data.avatar)}" alt="">` : '';
  }

  function findCharacterTarget() {
    return document.querySelector('#characterPanel,.character-panel,[data-page="character"],[data-panel="character"],.modal-panel') || document.querySelector('#app');
  }

  function renderCharacterMobile(target, data) {
    const el = typeof target === 'string' ? document.querySelector(target) : (target || findCharacterTarget());
    if (!el) return false;
    data = data || MOBILE_UI.getPlayerData();
    const stats = data.stats || {};
    const hp = Math.max(0, Number(data.hp || 0));
    const hpMax = Math.max(1, Number(data.maxHp || 100));
    const mp = Math.max(0, Number(data.mp || 0));
    const mpMax = Math.max(1, Number(data.maxMp || 60));
    const progress = Math.max(0, Math.min(100, Number(data.realmProgress || 0)));
    const skills = Array.isArray(data.skills) ? data.skills : [];
    const equip = Array.isArray(data.equip) ? data.equip : [];

    el.querySelectorAll('.mui-character-mobile').forEach(n => n.remove());

    const equipHtml = equip.map(e => {
      const empty = e.name === '空';
      return `<div class="mc-equip-row">
        <span class="mc-label">${esc(e.label)}</span>
        <span class="mc-equip-name ${empty ? 'mc-equip-empty' : ''}">${esc(e.name)}${e.stars ? `<span class="mc-stars">${esc(e.stars)}</span>` : ''}</span>
      </div>`;
    }).join('');

    const host = document.createElement('div');
    host.innerHTML = `
      <div class="mui-character-mobile">
        <section class="mc-card mc-hero">
          <div class="mc-avatar">${avatarHtml(data)}</div>
          <div>
            <div class="mc-label">江湖人物</div>
            <div class="mc-name">${esc(data.name)}<span class="mc-power">${esc(data.combatPower)}</span></div>
            <div class="mc-realm">${esc(data.realmName)}</div>
            <div class="mc-note" style="margin-top:4px">${esc(data.locationName)}</div>
          </div>
        </section>

        <section class="mc-card">
          <div class="mc-row">
            <span class="mc-section" style="margin:0">人物境界</span>
            <span class="mc-label">${esc(data.nextRealmText)}</span>
          </div>
          <div class="mc-row" style="min-height:auto;margin-top:4px">
            <span class="mc-value">${esc(data.realmName)}</span>
            <span class="mc-label">${esc(data.nextRealmNeed)}</span>
          </div>
          <div class="mc-progress"><i style="width:${progress}%"></i></div>
          <div class="mc-note" style="margin-top:6px">人物境界影响学武门槛、展示与高境界遇敌修正；功法境界独立计算。</div>
        </section>

        <section class="mc-card">
          <div class="mc-section">状态</div>
          <div class="mc-grid">
            <div class="mc-stat">
              <div class="mc-row" style="min-height:auto">
                <span class="mc-label">气血</span>
                <span class="mc-value">${hp}/${hpMax}</span>
              </div>
              <div class="mc-bar"><i style="width:${Math.min(100, hp / hpMax * 100)}%"></i></div>
            </div>
            <div class="mc-stat">
              <div class="mc-row" style="min-height:auto">
                <span class="mc-label">内力</span>
                <span class="mc-value">${mp}/${mpMax}</span>
              </div>
              <div class="mc-bar mp"><i style="width:${Math.min(100, mp / mpMax * 100)}%"></i></div>
            </div>
            <div class="mc-stat">
              <span class="mc-label">银两</span>
              <div class="mc-value">${esc(data.silver)}</div>
            </div>
            <div class="mc-stat">
              <span class="mc-label">综合战力</span>
              <div class="mc-value">${esc(data.combatPower)}</div>
            </div>
          </div>
        </section>

        <section class="mc-card">
          <div class="mc-section">基础属性</div>
          <div class="mc-grid">
            <div class="mc-stat"><span class="mc-label">臂力</span><div class="mc-value">${esc(stats.str)}</div></div>
            <div class="mc-stat"><span class="mc-label">身法</span><div class="mc-value">${esc(stats.dex)}</div></div>
            <div class="mc-stat"><span class="mc-label">内力</span><div class="mc-value">${esc(stats.int)}</div></div>
            <div class="mc-stat"><span class="mc-label">根骨</span><div class="mc-value">${esc(stats.con)}</div></div>
          </div>
        </section>

        <section class="mc-card">
          <div class="mc-section">当前装备</div>
          ${equipHtml || '<div class="mc-note">暂无装备</div>'}
        </section>

        <section class="mc-card">
          <div class="mc-section">武学摘要</div>
          ${skills.length
            ? skills.slice(0, 6).map(s => `<div class="mc-skill"><div class="mc-skill-name">${esc(s.name || s.id || '未命名武学')}</div><div class="mc-skill-realm">${esc(s.realmName || s.realm || '初窥门径')}</div></div>`).join('')
            : '<div class="mc-note">尚未习得武学</div>'}
        </section>
      </div>`;
    el.appendChild(host.firstElementChild);
    return true;
  }

  function refreshCharacterMobile() {
    return renderCharacterMobile(findCharacterTarget(), MOBILE_UI.getPlayerData());
  }

  MOBILE_UI.showCharacterPage = function () {
    const app = document.querySelector('#app');
    if (!app) return;
    const existing = app.querySelector('.mui-character-mobile');
    if (existing) existing.remove();
    renderCharacterMobile(app, MOBILE_UI.getPlayerData());
    const panel = app.querySelector('.mui-character-mobile');
    if (panel) panel.style.display = 'block';
  };

  function installHooks() {
    if (!g.Game || typeof g.Game.on !== 'function') return;
    if (MOBILE_UI._characterHooksInstalled) return;
    MOBILE_UI._characterHooksInstalled = true;
    const refresh = () => setTimeout(refreshCharacterMobile, 0);
    ['render:after', 'realm:up', 'player:loaded', 'save:after', 'skill:learned', 'skill:trained', 'character:changed'].forEach(ev => g.Game.on(ev, refresh));
    if (typeof g.Game.hook === 'function') {
      g.Game.hook('openModal', function (next) {
        return function () {
          const result = next.apply(this, arguments);
          setTimeout(() => { enhanceSkillModal(); renderBagMobile(); }, 0);
          return result;
        };
      });
    }
    g.Game.on('nav:change', function (tab) {
      if (tab === 'char') MOBILE_UI.showCharacterPage();
    });
  }

  injectCharacterStyle();
  injectSkillMobileStyle();
  injectBagMobileStyle();
  installHooks();

  MOBILE_UI.renderCharacterMobile = renderCharacterMobile;
  MOBILE_UI.refreshCharacterMobile = refreshCharacterMobile;
  MOBILE_UI.enhanceSkillModal = enhanceSkillModal;
  MOBILE_UI.getBagData = MOBILE_UI.getBagData;
  MOBILE_UI.renderBagMobile = renderBagMobile;
  MOBILE_UI.isMobile = isMobile;
  window.MobileUI = MOBILE_UI;

  window.addEventListener('resize', () => setTimeout(() => {
    refreshCharacterMobile();
    enhanceSkillModal();
    renderBagMobile();
  }, 0));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
      refreshCharacterMobile();
      enhanceSkillModal();
      renderBagMobile();
    }, 0));
  } else {
    setTimeout(() => {
      refreshCharacterMobile();
      enhanceSkillModal();
      renderBagMobile();
    }, 0);
  }
})(typeof window !== 'undefined' ? window : this);
