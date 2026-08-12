/* =========================================
 * mobile_ui.js
 * 手机二级界面统一层
 * 不新增成长系统，只负责信息组织、触控与底部面板。
 * ========================================= */
(function () {
  'use strict';

  const MOBILE_UI = {
    minTouch: 44,
    init() {
      this.injectStyle();
      this.bindDelegates();
    },

    injectStyle() {
      if (document.getElementById('mobile-ui-style')) return;
      const style = document.createElement('style');
      style.id = 'mobile-ui-style';
      style.textContent = `
        :root { --mui-gap: 10px; --mui-radius: 12px; }
        .mui-screen { width:100%; max-width:560px; margin:0 auto; padding:12px; box-sizing:border-box; }
        .mui-card { background:rgba(20,24,31,.94); border:1px solid rgba(255,255,255,.10); border-radius:var(--mui-radius); padding:12px; margin-bottom:var(--mui-gap); box-sizing:border-box; }
        .mui-title { display:flex; align-items:center; justify-content:space-between; gap:8px; font-weight:700; margin-bottom:8px; }
        .mui-sub { font-size:12px; opacity:.68; line-height:1.45; }
        .mui-row { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:44px; }
        .mui-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
        .mui-stat { padding:9px; border-radius:9px; background:rgba(255,255,255,.045); min-width:0; }
        .mui-stat b { display:block; font-size:16px; margin-top:3px; }
        .mui-label { font-size:12px; opacity:.68; }
        .mui-progress { height:7px; border-radius:99px; overflow:hidden; background:rgba(255,255,255,.10); margin-top:8px; }
        .mui-progress > i { display:block; height:100%; width:0; background:currentColor; border-radius:inherit; transition:width .25s ease; }
        .mui-tabs { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; position:sticky; bottom:8px; z-index:20; padding:6px; border-radius:12px; background:rgba(12,15,20,.96); backdrop-filter:blur(8px); }
        .mui-tabs button, .mui-action { min-height:44px; border:0; border-radius:9px; background:rgba(255,255,255,.07); color:inherit; font:inherit; touch-action:manipulation; }
        .mui-tabs button:active, .mui-action:active { transform:scale(.98); }
        .mui-sheet { position:fixed; inset:0; z-index:9999; display:flex; align-items:flex-end; background:rgba(0,0,0,.48); }
        .mui-sheet[hidden] { display:none; }
        .mui-sheet-body { width:100%; max-height:82vh; overflow:auto; box-sizing:border-box; padding:16px 14px calc(16px + env(safe-area-inset-bottom)); border-radius:16px 16px 0 0; background:#15191f; box-shadow:0 -8px 30px rgba(0,0,0,.35); }
        .mui-sheet-handle { width:38px; height:4px; border-radius:99px; margin:0 auto 12px; background:rgba(255,255,255,.25); }
        @media (min-width:700px) { .mui-screen { padding:18px; } .mui-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }
      `;
      document.head.appendChild(style);
    },

    bindDelegates() {
      document.addEventListener('click', e => {
        const close = e.target.closest('[data-mui-close]');
        if (close) this.closeSheet(close.closest('.mui-sheet'));
      });
    },

    esc(text) {
      return String(text == null ? '' : text)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    },

    renderCharacter(target, data) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      data = data || {};
      const stats = data.stats || {};
      const hp = Math.max(0, Number(data.hp || 0));
      const hpMax = Math.max(1, Number(data.hpMax || data.maxHp || 1));
      const mp = Math.max(0, Number(data.mp || data.neili || 0));
      const mpMax = Math.max(1, Number(data.mpMax || data.maxMp || 1));
      const progress = Math.max(0, Math.min(100, Number(data.realmProgress || 0)));
      el.innerHTML = `
        <div class="mui-screen">
          <section class="mui-card">
            <div class="mui-row">
              <div>
                <div class="mui-sub">人物境界</div>
                <div style="font-size:21px;font-weight:800">${this.esc(data.realmName || '未入流')}</div>
              </div>
              <div style="text-align:right">
                <div class="mui-label">综合值</div>
                <b>${this.esc(data.combatPower ?? 0)}</b>
              </div>
            </div>
            <div class="mui-row" style="margin-top:8px">
              <span class="mui-sub">${this.esc(data.nextRealmText || '当前境界')}</span>
              <span class="mui-sub">${this.esc(data.nextRealmNeed || '')}</span>
            </div>
            <div class="mui-progress"><i style="width:${progress}%"></i></div>
            <div class="mui-sub" style="margin-top:8px">人物境界影响整体段位与学武门槛；功法境界独立计算。</div>
          </section>

          <section class="mui-card">
            <div class="mui-title">状态</div>
            <div class="mui-grid">
              <div class="mui-stat"><span class="mui-label">气血</span><b>${hp}/${hpMax}</b></div>
              <div class="mui-stat"><span class="mui-label">内力</span><b>${mp}/${mpMax}</b></div>
              <div class="mui-stat"><span class="mui-label">银两</span><b>${this.esc(data.silver ?? 0)}</b></div>
              <div class="mui-stat"><span class="mui-label">地点</span><b style="font-size:14px">${this.esc(data.locationName || '未知')}</b></div>
            </div>
          </section>

          <section class="mui-card">
            <div class="mui-title">基础属性</div>
            <div class="mui-grid">
              ${[['臂力','str'],['身法','dex'],['内力','int'],['根骨','con']].map(([n,k]) => `<div class="mui-stat"><span class="mui-label">${n}</span><b>${this.esc(stats[k] ?? stats[n] ?? 0)}</b></div>`).join('')}
            </div>
          </section>

          ${this.renderSkills(data.skills || [])}
        </div>`;
    },

    renderSkills(skills) {
      return `<section class="mui-card"><div class="mui-title">武学</div>${skills.length ? skills.map(s => `
        <div class="mui-row" style="border-top:1px solid rgba(255,255,255,.07)">
          <div><b>${this.esc(s.name || '未命名武学')}</b><div class="mui-sub">${this.esc(s.type || '')}</div></div>
          <div style="text-align:right"><b>${this.esc(s.realmName || s.realm || '初窥门径')}</b><div class="mui-sub">${this.esc(s.levelText || '')}</div></div>
        </div>`).join('') : '<div class="mui-sub">尚未习得武学</div>'}</section>`;
    },

    openSheet(title, content) {
      const old = document.querySelector('.mui-sheet');
      if (old) old.remove();
      const sheet = document.createElement('div');
      sheet.className = 'mui-sheet';
      sheet.innerHTML = `<div class="mui-sheet-body"><div class="mui-sheet-handle"></div><div class="mui-row"><b>${this.esc(title)}</b><button class="mui-action" style="width:44px" data-mui-close>×</button></div><div style="margin-top:12px">${content || ''}</div></div>`;
      sheet.addEventListener('click', e => { if (e.target === sheet) this.closeSheet(sheet); });
      document.body.appendChild(sheet);
      return sheet;
    },

    closeSheet(sheet) { if (sheet) sheet.remove(); }
  };

  window.MobileUI = MOBILE_UI;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => MOBILE_UI.init(), {once:true});
  else MOBILE_UI.init();
})();
