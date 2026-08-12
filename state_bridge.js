/* state_bridge.js
 * 将 logic.js 的全局词法变量 state 暴露为 window.state。
 * 旧系统使用 let state，导致 window.state 不存在；二级 UI、境界系统、
 * 存档桥等模块通过 window.state 读取时会退回到“未命名/未入流”等默认值。
 * 使用 getter/setter 保证 renderStart / 读档重新赋值 state 后仍保持同步。
 */
(function (g) {
  "use strict";
  try {
    Object.defineProperty(g, "state", {
      configurable: true,
      enumerable: true,
      get: function () {
        try { return state; } catch (_) { return null; }
      },
      set: function (value) {
        try { state = value; } catch (_) {}
      }
    });
    console.log("[state_bridge] window.state 已接通");
  } catch (err) {
    console.error("[state_bridge] 初始化失败:", err);
  }
})(window);
