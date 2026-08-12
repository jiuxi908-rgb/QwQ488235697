# 一剑一蓑烟雨录

像素风文字武侠 RPG。浏览器版负责规则原型，Unity 负责后续场景与表现迁移。

## 当前结构

```text
根目录
├── data/                     游戏规则与数值数据
├── assets/                   场景与美术素材
├── docs/                     项目规范与全局 ID
│   ├── id_map.json           全局 ID 参考源
│   └── UNITY_MIGRATION.md    Unity 迁移规范
├── unity/
│   └── QinghePrototype/      Unity 清河最小原型
│       ├── Assets/Data/      Unity 数据副本
│       └── Assets/Scripts/   Unity 原型脚本
└── 浏览器版 HTML / JS         当前规则原型机
```

## 双端职责

```text
浏览器 = 规则原型：数值、玩法、存档、剧情规则
Unity   = 表现层：场景、镜头、角色、交互、动画
共享    = location / npc / skill / rank 等稳定 ID
```

不要在 Unity 和浏览器各维护一套互相冲突的数值。全局 ID 以 `docs/id_map.json` 为参考，Unity 原型只保留当前场景需要的数据。

## Unity 清河原型

位置：`unity/QinghePrototype/`

当前只验证清河五个交互点：

| UI | action | 日志 |
|---|---|---|
| 客栈·市井 | `explore` | `qinghe:explore` |
| 老周 | `npc` → `zhou` | `qinghe:npc:zhou` |
| 医馆 | `npc` → `su` | `qinghe:npc:su` |
| 拳场·学艺 | `learn` | `qinghe:learn` |
| 官道·出城 | `exit` | `qinghe:exit` |

原型目标不是做完整场景，而是先验证“场景 → 交互 → 规则入口”的链路。

### Unity 接入

1. Unity Hub 创建 2D 工程。
2. 将 `unity/QinghePrototype/Assets/` 合并到工程 `Assets/`。
3. 新建空物体并挂载 `QingheBootstrap`。
4. Play 后点击五个热区。
5. Console 出现上表对应日志，即完成当前原型验收。

## 数据规范

- `docs/id_map.json`：全局地点、NPC、热区、武学、境界和存档字段参考。
- `unity/QinghePrototype/Assets/Data/id_map.json`：Unity 当前原型的数据副本。
- 程序逻辑使用稳定 ID，不使用中文名称作为判断条件。
- `npc` 类 action 必须同时保留 `target`。
- Unity 日志统一使用 `qinghe:<action>` 格式。

## 当前阶段

清河是 Unity 第一阶段，不扩展新的 Unity 场景；先完成热区、数据读取、NPC 对话空面板和假学武面板，再进入角色、移动和正式场景表现。

浏览器版继续作为规则试验场，Unity 不重复实现尚未稳定的玩法规则。

## 在线游玩

url一剑一蓑烟雨录在线版https://jiuxi908-rgb.github.io/QwQ488235697/
