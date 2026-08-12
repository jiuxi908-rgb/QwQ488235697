# 游戏数据表（给非程序员）

本目录是**可编辑的数据源**。用 **http(s)** 打开游戏后，`data_loader.js` 会加载这些 JSON；网页内嵌 JS 只作为离线 fallback。

| 文件 | 内容 | 主要消费者 |
|------|------|------------|
| `world.json` | 世界观、州府、双层地图、城际路线 | `world_map_v2.js` |
| `maps.json` | 清河、竹径、山门、秘境等江湖点 | `map_grid.js`、本地移动 |
| `city_content.json` | 州府级城市文案与 explore 数据 | 城市内容层（逐步接入） |
| `sects.json` | 门派、师父、任务、商店 | 门派系统 |
| `skills.json` | 武学、品质、地点可学 | 武学系统 |
| `origins.json` | 出身、天赋、属性中文名 | 创建角色 |
| `content.json` | 补充内容表 | 内容加载层 |

## 数据职责

地图分成两层：

```text
world.json
└── 州府 + 城际边
    └── maps.json
        └── 江湖点 + 邻接 + 游历
```

`world.json` 是州府级地图拓扑的唯一权威来源。不要再在 `world_map_v2.js` 里手工修改城际 cost；代码只负责渲染和移动。

`maps.json` 是旧江湖点地图的权威来源。不要把清河、竹径、门派、秘境直接复制进 `world.json` 的 city 数据。

## 怎么改

1. 编辑对应 JSON（注意逗号、引号配对）。
2. **用本地服务器或在线 Pages** 验证 JSON 修改，不要只靠双击 `index.html`。
3. 强制刷新。
4. 控制台可执行：`reloadGameData().then(() => location.reload())`。

## 在线 vs 离线

| 环境 | 数据来源 |
|------|----------|
| http / https（含 GitHub Pages） | 优先 `data/*.json` |
| file:// 双击打开 | `data1_*.js`、`data2.js`、`data_tables_skills.js` 等内嵌表 |

离线包中的旧数据不会自动跟随 JSON 更新。修改 `maps.json`、门派或武学后，如果仍要支持 `file://`，必须同步对应的离线 JS 分片。

## 注意

- 不要改稳定 ID（`id`、`location`、NPC ID、动作 ID）。
- 删除 ID 可能直接影响旧存档、任务和 Unity。
- `maps.json.neighbors` 负责江湖点短途移动。
- `world.json.worldMap.edges` 负责州府长途移动，两者不要混用。
- 人物境界阈值以 `realm.js` 为运行时权威；`docs/id_map.json` 仅做同步参考。
