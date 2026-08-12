# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）· 规则原型机

## 在线游玩

**https://jiuxi908-rgb.github.io/QwQ488235697/**

> 若打不开：仓库 → **Settings → Pages** → Build and deployment 选 **GitHub Actions**。

## 场景外壳 v0.1

- **清河 / 听雨竹径 / 烟岚山门 / 开封** 有场景热区（点选 → 原有 explore / NPC / 学武 / 门派 / 入城）
- **其余地点**仍是列表 UI，不炸、不强制场景
- 场景配置在 `scene_view.js` 的 `SCENES` 表；底图在 `assets/scenes/`

本阶段 **不再扩** 第五站场景；改规则、修 bug、调主线/境界仍可继续。

## Unity 迁移（备用）

表现层计划迁到 Unity；浏览器继续可玩，并作为数值/规则试验场。

- [`docs/UNITY_MIGRATION.md`](docs/UNITY_MIGRATION.md)
- [`docs/id_map.json`](docs/id_map.json)（含四站热区对照）

```
浏览器 = 规则是否好玩
Unity   = 好不好看、好不好走
共享   = data 与同一套 location / npc / skill id
```

## 本地怎么玩

```bash
git clone https://github.com/jiuxi908-rgb/QwQ488235697.git
cd QwQ488235697
python -m http.server 8080
# http://localhost:8080
```

离线可双击 `index.html`；完整热数据建议用本地服务器加载 `data/*.json`。

### 存档

- 三槽 + 临时档（localStorage）
- **导出备份** / **导入备份**
- 旧档自动迁移

## 目录（节选）

```
├── index.html
├── data/                      # 可编辑 JSON（数值源）
├── docs/UNITY_MIGRATION.md
├── docs/id_map.json
├── assets/scenes/             # qinghe / bamboo / mist_gate / kaifeng
├── scene_view.js              # 四站热区外壳（v0.1 锁范围）
├── world_map.js / map_grid.js / realm.js
└── …
```

## 主要系统

六大门派 · X 型江湖网 + 州府长途 · 人物境界 · 武学/经脉/装备 · 好感/结缘/家园 · **四站场景热区** · 三槽存档

### 州府层（简图）

| 阶段 | 州府 |
|------|------|
| 中原核心 | 开封、洛阳、应天 |
| 运河/江路 | 扬州、建康、杭州、苏州、鄂州 |
| 海路 | 明州、泉州、广州（船资） |
| 荆湖/西南 | 长沙、成都（蜀道盘缠） |
