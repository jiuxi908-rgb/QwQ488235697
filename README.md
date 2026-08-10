# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）

## 怎么玩

用浏览器打开仓库根目录的 `index.html`（需能加载同目录下全部 `.js` 与 `assets/avatars/`）。

## 目录结构

```
├── index.html              # 入口 + 内联样式
├── assets/avatars/         # NPC/主角 120×120 像素头像 SVG
├── data1.js / data2.js     # 地图、门派、武学、出身等静态数据
├── text.js / npc.js / items.js / favor.js
├── db.js                   # O(1) 索引与战力缓存
├── core.js                 # 事件总线、扩展钩子
├── logic.js / time.js / map_grid.js / combat.js / save_slots.js
├── *_ui.js / home_*.js / quest.js / meridian.js / romance*.js
├── pixel_ui.js / avatar_lib.js
├── dialog_opt.js / dialog_acts.js
└── ui_smooth.js            # 滚动保持、弹窗体验（最后加载）
```

> 已删除：旧 ES 模块原型 `js/`、未接入的 `data/*.json`、空桩 `avatar_pack.js`。

## 架构分层（加载顺序）

| 层 | 文件 | 职责 |
|----|------|------|
| **数据** | `data1` `data2` `text` `npc` `items` `favor` `db` | 静态表 + 索引 |
| **核心** | `core` | `Game.on` / `Game.wrap` / ensurePlayer |
| **逻辑** | `logic` `time` `npc_logic` `map_grid` `combat` `save_slots` | 主流程、地图、战斗、存档 |
| **系统** | `*_ui` `home_*` `quest` `meridian` `romance*` `pixel_ui` `avatar_lib` `dialog_*` | 玩法与界面 |
| **体验** | `ui_smooth` | **必须最后加载** |

### 核心 API

```js
Game.on("render:after", function(player){ /* 主界面刷完 */ });
Game.on("player:ensure", function(p){ p.myFlag = p.myFlag||0; });
Game.wrap("modalNpc", function(next, args){
  next();
});
```

### 扩展约定

1. 新玩法 → 新文件，在 `index.html` 对应层追加 `<script>`，**不要**放在 `ui_smooth.js` 之后。
2. 补玩家字段 → `Game.on("player:ensure", …)`。
3. 改主界面 → 优先 `Game.on("render:after")`。
4. 关弹窗 → 只 `closeModal()`，不必每次 `renderGame()`。

## 主要系统

- 六大门派 · X 型网状地图 · 战力分级遇敌
- 武学（武功/内功/身法）· 经脉 · 装备背包
- 好感 / 私定终身 / 家园入住
- 像素头像库 `assets/avatars/`（23 人）
- 三槽存档 · 时辰节气
