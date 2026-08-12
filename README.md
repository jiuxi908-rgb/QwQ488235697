# 一剑一蓑烟雨录

像素风文字武侠 RPG（浏览器单页）· 规则原型机

## 在线游玩

**https://jiuxi908-rgb.github.io/QwQ488235697/**

> 若打不开：仓库 → **Settings → Pages** → Build and deployment 选 **GitHub Actions**。

## 场景外壳 v0.1（浏览器）

- **清河 / 听雨竹径 / 烟岚山门 / 开封** 有场景热区
- **其余地点**仍是列表 UI
- 配置：`scene_view.js` · 底图：`assets/scenes/`
- **不再扩** 第五站场景

## Unity 清河原型（引擎侧）

仓库内已放可拷贝脚本，对齐网页五热区日志：

→ **[`unity/QinghePrototype/`](unity/QinghePrototype/)**

1. Unity **2D** 新建工程  
2. 拷贝该目录 `Assets/` 进工程  
3. 空物体挂 `QingheBootstrap` → Play → 点 5 钮看 Console  

过关：`qinghe:explore` / `npc:zhou` / `npc:su` / `learn` / `exit`

说明与数据：[`docs/UNITY_MIGRATION.md`](docs/UNITY_MIGRATION.md) · [`docs/id_map.json`](docs/id_map.json)

```
浏览器 = 规则是否好玩（可继续玩/修 bug）
Unity   = 场景外壳（从清河 5 热区开工）
共享   = 同一套 location / npc / skill id
```

## 本地怎么玩（浏览器）

```bash
git clone https://github.com/jiuxi908-rgb/QwQ488235697.git
cd QwQ488235697
python -m http.server 8080
```

### 存档

三槽 + 导出/导入备份；旧档自动迁移。

## 主要系统

六大门派 · 州府长途 · 人物境界 · 武学/经脉/装备 · 好感/家园 · 四站场景热区 · Unity 清河脚手架
