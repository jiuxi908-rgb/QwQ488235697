# 游戏数据表（给非程序员）

这些 JSON 是**可编辑的数据源**，改完保存即可。

| 文件 | 内容 |
|------|------|
| `world.json` | 世界观标题、背景、势力 |
| `maps.json` | 地点、邻居、探索事件 |
| `sects.json` | 门派、师父、任务、商店 |
| `skills.json` | 武学、品质、地点可学列表 |
| `origins.json` | 出身、天赋、属性名 |

## 怎么改

1. 用任意文本编辑器打开对应 JSON（注意逗号、引号不要漏）。
2. 用 **本地服务器** 打开游戏（不要直接双击 `index.html`）：
   - VS Code：Live Server
   - 或终端：`python -m http.server 8080`
3. 刷新页面。`data_loader.js` 会自动拉取最新 JSON。

离线 / `file://` 打开时，使用打包好的 `data_tables.js`（与 JSON 内容一致）。若只改了 JSON，需要同步更新 `data_tables.js`，或走 http 热加载。

## 注意

- 不要改字段名（如 `id`、`stats.arm`），只改数值和文案。
- `id` 被代码引用，新增条目可以，删除可能影响旧存档。
