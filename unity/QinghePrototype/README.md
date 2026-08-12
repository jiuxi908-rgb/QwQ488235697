# 清河热区原型（Unity 2D）

对应网页 `scene_view.js` / `docs/id_map.json` 的 **qinghe** 五热区。  
本目录是 **可直接拖进 Unity 工程的脚本与数据**，不依赖浏览器再扩场景。

## 过关标准

Play → 看见清河（或占位色块）→ 点 5 处 → Console 各一条：

```
qinghe:explore
qinghe:npc:zhou
qinghe:npc:su
qinghe:learn
qinghe:exit
```

## 5 分钟接入

1. Unity Hub → **2D** 模板新建工程（如 `Yanyu_Qinghe`）
2. 将本目录下 `Assets/` **整夹拷贝**到工程的 `Assets/`（合并即可）
3. 菜单不需要；打开任意 Scene，或新建空 Scene
4. Hierarchy 空物体 `QingheRoot`，挂 `QingheBootstrap`
5. Play：脚本会自动生成 5 个热区按钮（UGUI），点击打日志

可选：把仓库 `assets/scenes/qinghe.svg` 导出 PNG，赋给 Bootstrap 的 `backgroundSprite`。

## 文件

| 路径 | 作用 |
|------|------|
| `Assets/Data/id_map.json` | 与网页对照表同步 |
| `Assets/Scripts/HotspotAction.cs` | 热区点击 → Debug.Log |
| `Assets/Scripts/QingheBootstrap.cs` | 运行时生成 5 热区 UI |
| `Assets/Scripts/QingheActions.cs` | action 字符串常量 |

## 明确不做（本里程碑）

- 门派 / 主线 / 战斗结算
- 读 JSON 学武真逻辑（下一段再做）
- URP / 景深 / HD-2D

## 与网页关系

| 网页 | Unity |
|------|-------|
| `SCENES.qinghe.hotspots` | `QingheActions` + Bootstrap |
| `exploreLocation` 等 | 本阶段仅 Log，下阶段接假面板 |
| 浏览器继续可玩 | 本目录只服务引擎侧 |
