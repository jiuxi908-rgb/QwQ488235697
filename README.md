# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）

## 怎么玩

用浏览器打开仓库中的 `index.html`（需能加载同目录下全部 `.js`）。

## 架构分层

脚本按 **依赖从底到顶** 加载（见 `index.html`）：

| 层 | 文件 | 职责 |
|----|------|------|
| **数据** | `data1.js` `data2.js` `text.js` `npc.js` `items.js` `favor.js` | 地图、门派、武学、物品、文案、好感表 |
| **核心** | `core.js` | 事件总线、`ensurePlayer` 统一、渲染/存档钩子 |
| **逻辑** | `logic.js` `time.js` `npc_logic.js` `map_grid.js` `combat.js` `save_slots.js` | 主流程、时间、移动、战斗、存档 |
| **系统 UI** | `*_ui.js` `home_*.js` `quest.js` `meridian.js` `romance*.js` `pixel_ui.js` … | 各系统界面与玩法扩展 |
| **体验** | `ui_smooth.js` | 滚动保持、弹窗背景锁（**最后加载**） |

### 核心 API（`Game`）

```js
Game.on("render:after", function(player){ /* 主界面刷完 */ });
Game.on("player:ensure", function(p){ p.myFlag = p.myFlag||0; });
Game.on("save:before", function(state){ /* 存档前 */ });

// 推荐用 wrap 扩展已有函数，而不是直接 var _x=x; x=function(){_x();...}
Game.wrap("modalNpc", function(next, args){
  next(); // 先跑原逻辑
  // 再追加 UI
});
```

调试：`Game.debug()` 可查看已注册事件与钩子。

### 扩展约定

1. **新玩法** → 新文件，在 `index.html` 对应层追加 `<script>`，**不要**插到 `ui_smooth.js` 之后。
2. **补玩家字段** → `Game.on("player:ensure", …)`，避免各处重复 `if(!p.xxx)`。
3. **改主界面** → 优先 `Game.on("render:after")`，减少无限 `renderGame = function(){ _rg(); …}` 套娃。
4. **关弹窗** → 只 `closeModal()`，不要无必要 `renderGame()`（滚动由 `ui_smooth` 处理）。

## 主要系统

- 六大门派（拜师、贡献、任务、商店、独门武学）
- 网格地图 + 迷雾探索 + 路径属性门槛
- 战力分级遇敌（完胜 / 险胜 / 受挫 / 惨败 / 溃逃）
- 武学（武功 / 内功 / 身法）· 经脉 · 装备 · 背包
- 好感 / 私定终身 / 家园入住
- 三槽存档 · 时辰节气

## 门派地点

| 门派 | 地图 |
|------|------|
| 烟岚剑斋 | 烟岚山门 |
| 赤炉刀社 | 赤炉山庄 |
| 回春谷 | 回春谷 |
| 玄鲸帮 | 玄鲸港 |
| 白雀楼 | 白雀楼 |
| 无相寺 | 无相寺 |
