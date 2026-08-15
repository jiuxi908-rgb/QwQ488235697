/* ui_bridge.js — 把旧逻辑接到新 UI 壳
 * 1. 地图节点：到达后自动开地点面板；非可达节点也可查看
 * 2. 战斗：explore / resolveThreat 出结果后弹出 combat 壳
 * 3. 不改数值判定，只增强表现
 */
(function (g) {
  "use strict";

  var installed = false;

  function player() {
    return (g.state && g.state.player) || null;
  }

  function locIdFromMapKey(key) {
    if (!key) return null;
    if (g.X_MAP && g.X_MAP.nodes && g.X_MAP.nodes[key]) {
      return g.X_MAP.nodes[key].id || key;
    }
    return key;
  }

  function safeOpenLocation(locId) {
    if (!locId) return;
    if (typeof g.openLocationPanel === "function") {
      try { g.openLocationPanel(locId); } catch (e) { console.warn("[ui_bridge] loc", e); }
    }
  }

  function showCombatFromResult(r, p) {
    if (!r || r.kind === "calm") return;
    if (typeof g.openCombatPanel !== "function") return;
    p = p || player();
    if (!p) return;

    var foeName = (r.foe) || (r.tier && r.tier.name) || "对手";
    var foeMax = Math.max(30, Math.floor((r.diff || 30) * 1.2));
    var foeHp = r.outcome === "完胜" || r.outcome === "险胜" ? Math.floor(foeMax * 0.15) : Math.floor(foeMax * 0.6);
    if (r.outcome === "惨败" || r.outcome === "溃逃") foeHp = foeMax;

    var logs = [];
    if (typeof g.formatCombatResult === "function") {
      try { logs.push(g.formatCombatResult(r)); } catch (_) {}
    }
    if (r.outcome) logs.push("结果：" + r.outcome);
    if (r.damage) logs.push("你受到 " + r.damage + " 点伤害");

    g.openCombatPanel({
      foeName: foeName,
      foeHp: foeHp,
      foeMaxHp: foeMax,
      foeLv: r.tier ? r.tier.name : "?",
      playerName: p.name || "你",
      playerHp: p.hp | 0,
      playerMaxHp: p.maxHp || 100,
      playerLv: (typeof g.getPlayerRank === "function" ? (g.getPlayerRank(p) || {}).name : "") || "",
      log: logs,
      onAttack: function () {
        if (typeof g.appendCombatLog === "function") g.appendCombatLog("战斗已结算，请关闭面板。");
      },
      onSkill: function () {
        if (typeof g.appendCombatLog === "function") g.appendCombatLog("本场已结束。");
      },
      onDefend: function () {
        if (typeof g.appendCombatLog === "function") g.appendCombatLog("本场已结束。");
      },
      onItem: function () {
        if (typeof g.modalBag === "function") g.modalBag();
      },
      onFlee: function () {
        if (typeof g.closeModal === "function") g.closeModal();
        if (typeof g.renderGame === "function") g.renderGame();
      }
    });
  }

  /* —— 包装 exploreLocation：战斗时弹壳 —— */
  function hookExplore() {
    if (typeof g.exploreLocation !== "function") return;
    if (g.exploreLocation._uiBridged) return;
    var prev = g.exploreLocation;
    g.exploreLocation = function (arg) {
      // 兼容 player 或 locId
      var p = arg && arg.location != null ? arg : player();
      var result = prev.apply(this, arguments);
      try {
        if (result && result.ok && result.kind === "combat") {
          // 从日志里尽量还原最后一次 resolve 信息较难，做简化展示
          setTimeout(function () {
            showCombatFromResult({
              kind: "combat",
              foe: "遭遇之敌",
              outcome: /完胜/.test(result.message || "") ? "完胜"
                : /险胜/.test(result.message || "") ? "险胜"
                : /受挫/.test(result.message || "") ? "受挫"
                : /惨败|溃逃/.test(result.message || "") ? "惨败" : "交锋",
              damage: 0,
              power: typeof g.calcCombatPower === "function" ? g.calcCombatPower(p) : 0,
              diff: 30,
              tier: { name: "交锋" }
            }, p);
          }, 80);
        }
      } catch (e) { console.warn("[ui_bridge] explore", e); }
      return result;
    };
    g.exploreLocation._uiBridged = true;
  }

  /* —— 包装 resolveThreat：有结果就弹 —— */
  function hookResolve() {
    if (typeof g.resolveThreat !== "function") return;
    if (g.resolveThreat._uiBridged) return;
    var prev = g.resolveThreat;
    g.resolveThreat = function (playerArg, diff, baseDamage, opts) {
      var r = prev.apply(this, arguments);
      try {
        if (r && r.kind !== "calm") {
          setTimeout(function () { showCombatFromResult(r, playerArg); }, 60);
        }
      } catch (e) { console.warn("[ui_bridge] resolve", e); }
      return r;
    };
    g.resolveThreat._uiBridged = true;
  }

  /* —— 地图节点：到达后开地点面板；点击当前点也开 —— */
  function hookMapClicks() {
    document.addEventListener("click", function (e) {
      var node = e.target.closest && e.target.closest(".xmap-node, .map-node");
      if (!node) return;
      if (node.classList.contains("fog-deep")) return;

      var key = node.dataset.key || node.dataset.id || node.dataset.loc;
      var locId = locIdFromMapKey(key);

      // 当前所在节点：直接开面板
      if (node.classList.contains("current")) {
        e.stopPropagation();
        var p = player();
        safeOpenLocation((p && p.location) || locId);
        return;
      }

      // 非可达：查看详情时附带地点面板（延迟，避免挡原 showNodeDetail）
      if (!node.classList.contains("reachable")) {
        setTimeout(function () {
          // 若已有 modal 详细，不强制抢；否则开地点面板
          if (!document.querySelector("#modalPanel .section-title")) {
            safeOpenLocation(locId);
          }
        }, 120);
      }
    }, true);
  }

  /* —— 移动成功后开地点面板 —— */
  function hookMove() {
    if (typeof g.moveToX === "function" && !g.moveToX._uiBridged) {
      var prev = g.moveToX;
      g.moveToX = function (p, targetKey) {
        var r = prev.apply(this, arguments);
        try {
          if (r && r.ok) {
            var locId = (p && p.location) || locIdFromMapKey(targetKey);
            setTimeout(function () { safeOpenLocation(locId); }, 100);
          }
        } catch (e) {}
        return r;
      };
      g.moveToX._uiBridged = true;
    }
    if (typeof g.movePlayer === "function" && !g.movePlayer._uiBridged) {
      var prev2 = g.movePlayer;
      g.movePlayer = function (p, targetId) {
        var r = prev2.apply(this, arguments);
        try {
          if (r && r.ok) {
            setTimeout(function () { safeOpenLocation((p && p.location) || targetId); }, 100);
          }
        } catch (e) {}
        return r;
      };
      g.movePlayer._uiBridged = true;
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    hookExplore();
    hookResolve();
    hookMapClicks();
    hookMove();
    // 延迟再 hook 一次，防止被后续脚本覆盖
    setTimeout(function () {
      hookExplore();
      hookResolve();
      hookMove();
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }

  if (g.Game && typeof g.Game.on === "function") {
    g.Game.on("core:ready", install);
  }

  g.UIBridge = { install: install, showCombatFromResult: showCombatFromResult };
})(typeof window !== "undefined" ? window : this);
