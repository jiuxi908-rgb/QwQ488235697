# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）

## 怎么玩（重要）

**不要直接双击 `index.html`（`file://` 无法热加载 JSON）。**

请用本地服务器打开仓库根目录：

```bash
# 任选其一
python -m http.server 8080
# 或 VS Code / Cursor 的 Live Server，打开 index.html
```

然后浏览器访问：`http://localhost:8080`

GitHub Pages 等 http(s) 部署同样可用。

### 存档

- 游戏内「存档」：三槽位 + 临时档（localStorage）
- **导出备份** / **导入备份**：存档或读档弹窗底部，导出为 JSON 文件，可换设备、清缓存后导入
- 旧存档读取时会自动迁移字段（家园、经脉、时辰等）

## 目录结构

```
├── index.html                 # 入口 + 样式
├── data/                      # ★ 可编辑数据表（JSON）
│   ├── world.json             # 世界观
│   ├── maps.json              # 地点、邻居、探索
│   ├── sects.json             # 门派、师父、任务
│   ├── skills.json            # 武学、品质、地点可学
│   ├── origins.json           # 出身、天赋、属性名
│   └── README.md              # 改表说明
├── data_loader.js             # http 下 fetch JSON 覆盖静态表
├── data1_world.js             # 回退：世界观（file:// 用）
├── data1_maps_a.js / _b.js    # 回退：地图
├── data1_sects_a.js / _b.js   # 回退：门派
├── data1.js / data2.js        # 兼容入口 + 逻辑函数 / 武学出身回退
├── assets/avatars/            # 120×120 像素头像
├── text.js / npc.js / items.js / favor.js
├── db.js                      # O(1) 索引与战力缓存
├── core.js                    # 事件总线、扩展钩子
├── logic.js / time.js / map_grid.js / combat.js
├── save_slots.js / save_io.js # 三槽存档 + 迁移/导出导入
├── *_ui.js / home_*.js / quest.js / meridian.js / romance*.js
├── pixel_ui.js / avatar_lib.js
├── dialog_opt.js / dialog_acts.js
└── ui_smooth.js               # 滚动保持、弹窗体验（最后加载）
```

## 数据怎么改

1. 编辑 `data/*.json`（保持字段名，只改数值和文案）
2. 用本地服务器打开并**强制刷新**（Ctrl+F5）
3. `data_loader.js` 会拉取 JSON 并 `DB.rebuild()`

`file://` 或 fetch 失败时，使用同目录下的 `data1_*.js` / `data2.js` 内嵌回退表，游戏仍可运行，但改 JSON 不会生效。

详见 [`data/README.md`](data/README.md)。

## 架构分层（加载顺序）

| 层 | 文件 | 职责 |
|----|------|------|
| **数据** | `data1_*` → `data2` → `npc`/`items` → `db` → `data_loader` | 静态表 + 索引 + JSON 热覆盖 |
| **核心** | `core` | `Game.on` / `Game.wrap` / ensurePlayer |
| **逻辑** | `logic` `time` `map_grid` `combat` `save_slots` `save_io` | 主流程、地图、战斗、存档 |
| **系统** | `*_ui` `home_*` `quest` `meridian` `romance*` `pixel_ui` … | 玩法与界面 |
| **体验** | `ui_smooth` | **必须最后加载** |

### 扩展约定

1. 新玩法 → 新文件，在 `index.html` 对应层追加 `<script>`，不要放在 `ui_smooth.js` 之后。
2. 补玩家字段 → `Game.on("player:ensure", …)`。
3. 改主界面 → 优先 `Game.on("render:after")`。
4. 关弹窗 → 只 `closeModal()`，不必每次 `renderGame()`。

## 主要系统

- 六大门派 · X 型网状地图 · 战力分级遇敌
- 武学（武功/内功/身法）· 经脉 · 装备背包
- 好感 / 私定终身 / 家园入住
- 像素头像库 `assets/avatars/`
- 三槽存档 · 导出/导入备份 · 时辰节气
