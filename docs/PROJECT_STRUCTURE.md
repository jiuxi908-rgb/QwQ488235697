# 项目结构与数据规范

## 1. 项目分层

| 层 | 目录 | 职责 |
|---|---|---|
| 规则数据 | `data/` | 武学、人物、地图、门派、任务等数据 |
| 美术资源 | `assets/` | 场景、图片及其他表现资源 |
| 项目文档 | `docs/` | ID、迁移规则、结构规范 |
| 浏览器原型 | 根目录 HTML / JS | 当前可玩的规则原型 |
| Unity 原型 | `unity/QinghePrototype/` | 清河场景与交互迁移实验 |

## 2. 数据源原则

`docs/id_map.json` 是跨端 ID 的参考源。

Unity 内的 `Assets/Data/id_map.json` 是当前 Unity 原型所需的数据副本，不应自行产生与全局 ID 冲突的新 ID。

数值正式迁移前，以浏览器版 `data/` 为准；Unity 可以先使用假数据验证界面和交互。

## 3. ID 规范

地点使用 `location id`，例如：

```text
qinghe
bamboo
mist_gate
kaifeng
```

NPC 使用独立 ID，例如：

```text
zhou
su
shishu
```

武学使用稳定 ID，例如：

```text
basic_fist
basic_sword
basic_neigong
crush_leg
```

程序判断使用 ID，不使用显示名称。

## 4. Unity action 规范

清河当前 action：

```text
explore
npc:zhou
npc:su
learn
exit
```

日志统一为：

```text
qinghe:explore
qinghe:npc:zhou
qinghe:npc:su
qinghe:learn
qinghe:exit
```

`npc` action 必须携带目标 NPC ID。

## 5. 文件职责

`QingheActions.cs`：集中维护清河 action 常量和日志格式。

`HotspotAction.cs`：负责单个热区被点击后的 action 触发。

`QingheBootstrap.cs`：负责原型运行时 UI 初始化，不保存游戏规则数据。

`Assets/Data/id_map.json`：负责 Unity 原型需要的地点、NPC、武学和境界映射。

`UNITY_MIGRATION.md`：记录浏览器与 Unity 的职责边界以及迁移顺序。

## 6. 修改规则

修改全局 ID 时，先更新 `docs/id_map.json`，再同步 Unity 数据副本。

修改 Unity UI 时，不应把游戏规则硬编码进 `QingheBootstrap.cs`。

新增场景前，先确定该场景的 location ID、hotspot ID、NPC ID 和 action，再添加表现资源。

当前阶段优先保证：

```text
数据一致 > 交互正确 > UI 完整 > 美术表现
```
