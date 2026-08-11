# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）

## 在线游玩

**https://jiuxi908-rgb.github.io/QwQ488235697/**

> 若打不开：仓库 → **Settings → Pages** → Build and deployment 选 **GitHub Actions**，保存后等 1～2 分钟；也可点 Actions 里 `Deploy to GitHub Pages` 手动 Run。

已提供：
- `.github/workflows/pages.yml` 自动部署
- 根目录 `.nojekyll`（避免 Jekyll 干扰静态资源）

## 本地怎么玩

### 推荐：本地服务器（可热改 JSON）

```bash
git clone https://github.com/jiuxi908-rgb/QwQ488235697.git
cd QwQ488235697
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

### 离线 / 双击 `index.html`（file://）

可以玩。数据来自：

| 模块 | 文件 |
|------|------|
| 地图 / 门派 | `data1_maps_*.js`、`data1_sects_*.js` |
| 武学 / 出身 | `data2.js` + **`data_tables_skills.js`**（与 `data/*.json` 同步） |

改了 `data/*.json` 后若要离线生效，需同步更新对应 `data_tables_*.js`（或继续用本地服务器）。

### 存档

- 三槽 + 临时档（localStorage）
- 存档弹窗底部：**导出备份** / **导入备份**（JSON 文件）
- 旧档自动迁移（家园、经脉、时辰等）

## 目录结构

```
├── index.html
├── .nojekyll
├── .github/workflows/pages.yml   # GitHub Pages 部署
├── data/                         # 可编辑 JSON（在线热加载）
│   ├── world.json / maps.json / sects.json
│   ├── skills.json / origins.json
│   └── README.md
├── data_loader.js                # http(s) fetch JSON
├── data_tables.js                # 离线打包说明
├── data_tables_skills.js         # 离线：武学/出身（与 JSON 同步）
├── data1_*.js                    # 离线：世界/地图/门派
├── data2.js                      # 逻辑 + 表回退
├── assets/avatars/
├── save_slots.js / save_io.js
└── …（core / logic / ui 等）
```

## 数据怎么改

1. 编辑 `data/*.json`
2. 用 **http** 打开（Pages 或 `python -m http.server`）并强制刷新
3. `data_loader.js` 拉取 JSON 并 `DB.rebuild()`

详见 [`data/README.md`](data/README.md)。

## 架构分层

| 层 | 文件 | 职责 |
|----|------|------|
| **数据** | `data1_*` → `data2` → `data_tables_skills` → `db` → `data_loader` | 表 + 索引 + 热覆盖 |
| **核心** | `core` | 事件 / 钩子 / ensurePlayer |
| **逻辑** | `logic` `map_grid` `combat` `save_*` | 主流程与存档 |
| **系统** | `*_ui` `home_*` `quest` … | 玩法界面 |
| **体验** | `ui_smooth` | **最后加载** |

## 主要系统

六大门派 · X 型地图 · 战力分级遇敌 · 武学/经脉/装备 · 好感/结缘/家园 · 像素头像 · 三槽存档与导出导入
