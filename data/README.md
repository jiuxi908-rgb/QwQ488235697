# 游戏数据表（给非程序员）

本目录是**可编辑的数据源**。用本地服务器打开游戏后，`data_loader.js` 会自动加载这些 JSON 并覆盖页面内的回退表。

| 文件 | 内容 | 状态 |
|------|------|------|
| `world.json` | 标题、背景、朝廷/势力 | ✅ |
| `maps.json` | 地点、邻居、探索事件 | ✅ |
| `sects.json` | 门派、师父、任务、商店 | ✅ |
| `skills.json` | 武学列表、品质、地点可学 | ✅ |
| `origins.json` | 出身、天赋、属性中文名 | ✅ |

## 怎么改

1. 用文本编辑器打开对应 JSON（注意逗号、引号、方括号配对）。
2. **必须用本地服务器打开游戏**（不要双击 `index.html`）：
   ```bash
   python -m http.server 8080
   ```
   或 VS Code / Cursor 的 Live Server。
3. 浏览器打开 `http://localhost:8080`，强制刷新。
4. 控制台可手动：`reloadGameData().then(() => location.reload())`

## 与 JS 回退表的关系

| 环境 | 数据来源 |
|------|----------|
| `http://` / `https://` | 优先 `data/*.json`（热加载） |
| `file://` 或 fetch 失败 | `data1_*.js` / `data2.js` 内嵌表 |

只改 JSON、却用双击打开页面时，改动**不会**生效。

## 注意

- 不要改字段名（如 `id`、`stats.arm`、`neighbors`），只改数值和文案。
- `id` 被代码和存档引用；新增可以，删除可能影响旧存档。
- 地图 `neighbors` 需双向或与 `map_grid` 路径逻辑一致，否则可能无法移动。
