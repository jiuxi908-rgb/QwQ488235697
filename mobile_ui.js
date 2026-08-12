/* =========================================
 * mobile_ui.js
 * 手机二级界面增强层
 * 人物页适配：只增强，不替换桌面端业务逻辑。
 * ========================================= */
(function () {
  'use strict';

  const MOBILE_UI = window.MobileUI || {
    minTouch: 44,
    init() { this.injectStyle(); this.bindDelegates(); },
    injectStyle() {},
    bindDelegates() {},
    esc(text) { return String(text == null ? '' : text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); },
    renderSkills() { return ''; },
    closeSheet(sheet) { if (sheet) sheet.remove(); }
  };

  const esc = MOBILE_UI.esc.bind(MOBILE_UI);
  const isMobile = () => window.matchMedia ? window.matchMedia('(max-width:600px)').matches : window.innerWidth <= 600;

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
      if (typeof window.playerAvatar === 'function') return window.playerAvatar(data.id || data.name || 'player', 'lg');
      if (typeof window.avatarHtml === 'function') return window.avatarHtml(data, 'lg');
    } catch (_) {}
    return '';
  }

  function renderCharacterMobile(target, data) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !isMobile()) return false;
    data = data || {};
    const stats = data.stats || {};
    const hp = Math.max(0, Number(data.hp ?? data.qixue ?? 0));
    const hpMax = Math.max(1, Number(data.hpMax ?? data.maxHp ?? 100));
    const mp = Math.max(0, Number(data.mp ?? data.neili ?? 0));
    const mpMax = Math.max(1, Number(data.mpMax ?? data.maxMp ?? 100));
    const progress = Math.max(0, Math.min(100, Number(data.realmProgress ?? 0)));
    const skills = Array.isArray(data.skills) ? data.skills : [];
    el.innerHTML = `<div class="mui-character-mobile">
      <section class="mc-card mc-hero"><div class="mc-avatar">${avatarHtml(data)}</div><div><div class="mc-label">江湖人物</div><div class="mc-name">${esc(data.name || data.playerName || '无名侠客')}<span class="mc-power">${esc(data.combatPower ?? 0)}</span></div><div class="mc-realm">${esc(data.realmName || data.realm || '未入流')}</div><div class="mc-note">${esc(data.locationName || data.location || '未知地点')}</div></div></section>
      <section class="mc-card"><div class="mc-row"><span class="mc-section">人物境界</span><span class="mc-label">${esc(data.nextRealmText || '当前境界')}</span></div><div class="mc-row"><span class="mc-value">${esc(data.realmName || data.realm || '未入流')}</span><span class="mc-label">${esc(data.nextRealmNeed || '')}</span></div><div class="mc-progress"><i style="width:${progress}%"></i></div><div class="mc-note" style="margin-top:6px">人物境界负责整体段位与学武门槛，功法境界独立计算。</div></section>
      <section class="mc-card"><div class="mc-section">状态</div><div class="mc-grid"><div class="mc-stat"><div class="mc-row"><span class="mc-label">气血</span><span class="mc-value">${hp}/${hpMax}</span></div><div class="mc-bar"><i style="width:${Math.min(100,hp/hpMax*100)}%"></i></div></div><div class="mc-stat"><div class="mc-row"><span class="mc-label">内力</span><span class="mc-value">${mp}/${mpMax}</span></div><div class="mc-bar mp"><i style="width:${Math.min(100,mp/mpMax*100)}%"></i></div></div><div class="mc-stat"><span class="mc-label">银两</span><div class="mc-value">${esc(data.silver ?? data.money ?? 0)}</div></div><div class="mc-stat"><span class="mc-label">综合战力</span><div class="mc-value">${esc(data.combatPower ?? 0)}</div></div></div></section>
      <section class="mc-card"><div class="mc-section">基础属性</div><div class="mc-grid">${[['臂力','str'],['身法','dex'],['内力','int'],['根骨','con']].map(([n,k])=>`<div class="mc-stat"><span class="mc-label">${n}</span><div class="mc-value">${esc(stats[k] ?? stats[n] ?? 0)}</div></div>`).join('')}</div></section>
      <section class="mc-card"><div class="mc-section">武学摘要</div>${skills.length ? skills.slice(0,6).map(s=>`<div class="mc-skill"><div class="mc-skill-name">${esc(s.name || '未命名武学')}</div><div class="mc-skill-realm">${esc(s.realmName || s.realm || '初窥门径')}</div></div>`).join('') : '<div class="mc-note">尚未习得武学</div>'}</section>
    </div>`;
    return true;
  }

  injectCharacterStyle();
  MOBILE_UI.renderCharacterMobile = renderCharacterMobile;
  MOBILE_UI.isMobile = isMobile;
  window.MobileUI = MOBILE_UI;
})();
