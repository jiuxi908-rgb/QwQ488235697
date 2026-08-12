# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）· 规则原型机

## 在线游玩

**https://jiuxi908-rgb.github.io/QwQ488235697/**

> 若打不开：仓库 → **Settings → Pages** → Build and deployment 选 **GitHub Actions**。

## Unity 迁移（进行中）

表现层计划迁到 Unity；**浏览器继续可玩，并作为数值/规则唯一试验场**。

- 说明与里程碑：[`docs/UNITY_MIGRATION.md`](docs/UNITY_MIGRATION.md)
- id 对照（可给 Unity TextAsset）：[`docs/id_map.json`](docs/id_map.json)
- 浏览器场景扩写已 **冻结**（清河热区仅作参考，不复制开封/门派场景）

```
浏览器 = 规则是否好玩
Unity   = 好不好看、好不好走
共享   = data/*.json 与同一套 location / npc / skill id
```

## 本地怎么玩

```bash
git clone https://github.com/jiuxi908-rgb/QwQ488235697.git
cd QwQ488235697
python -m http.server 8080
# http://localhost:8080
```

离线可双击 `index.html`（file://）；完整热数据建议用本地服务器加载 `data/*.json`。

### 存档

- 三槽 + 临时档（localStorage）
- **导出备份** / **导入备份**
- 旧档自动迁移

## 目录（节选）

```
├── index.html
├── data/                 # 可编辑 JSON（数值源）
├── docs/
│   ├── UNITY_MIGRATION.md
│   └── id_map.json
├── assets/scenes/qinghe.svg   # 清河场景参考
├── scene_view.js              # 清河热区外壳（冻结扩写）
├── world_map.js / map_grid.js / realm.js
└── …
```

## 主要系统

六大门派 · X 型江湖网 + 州府长途 · 人物境界 · 武学/经脉/装备 · 好感/结缘/家园 · 清河场景热区（参考）· 三槽存档

### 州府层（简图）

| 阶段 | 州府 |
|------|------|
| 中原核心 | 开封、洛阳、应天 |
| 运河/江路 | 扬州、建康、杭州、苏州、鄂州 |
| 海路 | 明州、泉州、广州（船资） |
| 荆湖/西南 | 长沙、成都（蜀道盘缠） |
