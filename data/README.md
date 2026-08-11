# 游戏数据表（给非程序员）

本目录是**可编辑的数据源**。用 **http(s)** 打开游戏后，`data_loader.js` 会加载这些 JSON 并覆盖页面内嵌表。

| 文件 | 内容 |
|------|------|
| `world.json` | 标题、背景、势力 |
| `maps.json` | 地点、邻居、探索 |
| `sects.json` | 门派、师父、任务、商店 |
| `skills.json` | 武学、品质、地点可学 |
| `origins.json` | 出身、天赋、属性中文名 |

## 怎么改

1. 编辑对应 JSON（注意逗号、引号配对）。
2. **用本地服务器或 [在线 Pages](https://jiuxi908-rgb.github.io/QwQ488235697/)**，不要只靠双击 `index.html` 来验证 JSON 修改。
3. 强制刷新（Ctrl+F5）。
4. 控制台可执行：`reloadGameData().then(() => location.reload())`

## 在线 vs 离线

| 环境 | 数据来源 |
|------|----------|
| http / https（含 GitHub Pages） | 优先 `data/*.json` |
| file:// 双击打开 | `data1_*.js`（地图门派）+ `data2.js` + **`data_tables_skills.js`**（武学出身，与 JSON 同步） |

离线包说明见根目录 `data_tables.js`。地图/门派离线表在 `data1_maps_*.js` / `data1_sects_*.js`；若改了 JSON 且需要双击也能读到新内容，请同步更新对应 JS 分片。

## 注意

- 不要改字段名（`id`、`stats.arm`、`neighbors` 等），只改数值和文案。
- 删除 `id` 可能影响旧存档。
- 地图 `neighbors` 需与移动逻辑一致。
