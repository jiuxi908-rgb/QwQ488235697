# 浏览器模式运行规范

浏览器版采用“数据 → 核心 → 逻辑 → UI → 场景”的分层。

## 数据

`data/world.json`：世界观。
`data/maps.json`：地点与移动。
`data/sects.json`：门派。
`data/skills.json`：武学。
`data/origins.json`：出身与天赋。
`data/content.json`：场景说明、关系等级、旅行事件、新手提示和浏览器规则。

## 加载

HTTP/HTTPS 下由 `data_loader.js` 统一读取 JSON，并写入 `window.__GAME_DATA`。

调试：

```js
getDataState()
getGameData("content")
reloadGameData()
```

## 核心

`core.js` 提供事件总线、玩家规范化、存档钩子与渲染钩子。新模块优先使用 `Game.on()`、`Game.emit()` 和 `Game.hook()`，避免继续层层覆盖全局函数。

## 场景

`scene_view.js` 只负责清河、听雨竹径、烟岚山门、开封的场景热区和入口，不重复实现战斗、移动、学武、存档规则。

## 存档

当前迁移版本为 3。新增字段必须提供默认值，并保持旧 ID 不变。

## 扩展顺序

先数据，再逻辑，再 Game 事件，再 UI，最后场景表现。这样浏览器版仍然可以作为 Unity 迁移前的规则试验场。
