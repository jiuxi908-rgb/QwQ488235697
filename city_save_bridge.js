// city_save_bridge.js
// 城市探索自动存档桥接
// 通过 Game 事件监听城市探索，复用现有 saveGame(state) 存档机制。

(function () {
    function initBridge() {
        if (typeof Game === 'undefined' || typeof Game.on !== 'function') {
            setTimeout(initBridge, 100);
            return;
        }

        Game.on('city:explore', function () {
            try {
                if (typeof saveGame === 'function' && typeof state !== 'undefined' && state) {
                    saveGame(state);
                    console.log('[存档桥接] 城市探索已自动保存');
                } else {
                    console.warn('[存档桥接] saveGame 或 state 不可用');
                }
            } catch (e) {
                console.error('[存档桥接] 自动存档失败:', e);
            }
        });

        console.log('[存档桥接] 城市探索自动存档已启用');
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBridge, { once: true });
    } else {
        initBridge();
    }
})();
