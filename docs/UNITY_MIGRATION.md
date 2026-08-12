# Unity 迁移说明（浏览器 = 规则原型机）

```
浏览器版 = 可玩完整游戏 + 规则是否好玩的试验场
Unity     = 新的最外层（场景 / 镜头 / 以后 HD-2D）
共享      = 数值、武学、境界、主线 flag、地点 id 等数据与规则
```

**原则：** 不要一上来重写全部玩法；也不要两套互相打架的数值。

---

## 1. 表现实验已冻结（浏览器）

| 保留 | 暂不做 |
|------|--------|
| 清河 `scene_view.js` 作参考 | 不再复制开封/门派场景 |
| 修 bug、调境界/主线、补文档 | 不上浏览器行走/碰撞 |
| `data/*.json` 为数值源 | 不为 Unity 在网页里再堆表现 |

清河热区证明了「场景点选 → 原 API」可行；后续表现以 Unity 为准。

---

## 2. 迁移边界

| 留在数据/规则（两套都能用） | 交给 Unity |
|------------------------------|------------|
| 地点 id、`parent`、城际边 | 场景、相机、角色移动 |
| 武学表、境界阈值、主线 step | 热区/碰撞触发 |
| 战斗结算、学武条件 | UI 皮肤、立绘、HD-2D 表现 |
| 存档字段含义 | 输入、分辨率、平台 |
| NPC id、acts 类型 | 对话演出、动画 |

浏览器继续回答：**规则好不好玩**。  
Unity 回答：**好不好看、好不好走**。

---

## 3. Unity 最小里程碑（仅清河）

1. 顶视或 3/4 **2D** 场景（首周不必真 HD-2D）
2. 玩家能走 **或** 仅可点热区（与网页一致即可）
3. **5 个交互点** 与网页对齐：
   - 游历 → `explore`
   - 老周 → `npc:zhou`
   - 医馆 → `npc:su`
   - 学武 → `learn`（读 `LOCAL_SKILLS.qinghe`）
   - 出城 → `exit`（邻接移动 / `enterCity:kaifeng`）
4. 先 Debug 日志或空面板，逻辑可假数据
5. 再接：从 JSON 读地点名、可学技能（拷 `data/maps.json`、`data/skills.json`）

**成功标准：** 进清河 → 点 5 件事 → 有反馈；不是空场景很炫。

---

## 4. 数据怎么接

### 短期

- `data/*.json` = **唯一数值源**
- Unity：TextAsset / Addressables 读同一套 id
- 建议拷贝进 Unity 的：
  - `data/maps.json`
  - `data/skills.json`
  - `data/sects.json`（若有）
  - 本文档下方的 id 对照（或 `docs/id_map.json`）

### 中期

- 战斗 / 学武 / 境界：C# 精简重写，或先假逻辑 + 对照网页公式
- 公式参考（网页）：
  - 战力：`derived.attack*2 + dodge + Σ(skill.power*(1+realm*0.25)) + bone + qi/2`（装备另加）
  - 人物境界：战力 + 辅分 → 未入流～宗师（见 `realm.js`）

### 存档字段（先本地 JSON，与网页对齐）

| 字段 | 含义 |
|------|------|
| `location` | 地点 id，如 `qinghe` |
| `mapRow` / `mapCol` | X 网坐标（可选） |
| `explored` | 已探索地点 id 列表 |
| `skills[]` | `{id,name,type,quality,realm,exp,maxExp,power,mp,effect}` |
| `stats` | arm/agi/bone/qi/wit/luck |
| `hp` `maxHp` `mp` `maxMp` `silver` `day` |
| `sect` `contrib` `sectRank` |
| `flags.mainStep` | 主线进度 |
| `flags.*` | 主线/教程/NPC 剧情 |
| `rankId` `rankName` | 人物境界 |
| `favor` / 家园等 | 按需迁 |

---

## 5. HD-2D 顺序（更后）

1. 2D/2.5D 能走或能点的清河  
2. 统一角色与场景规范  
3. 再 URP、景深、3D 场景 + 2D 角色  

首个里程碑 **不要** 绑死八方级光影。

---

## 6. id 对照表（清河最小集）

### 地点

| id | 名称 | 备注 |
|----|------|------|
| `qinghe` | 清河镇 | 出生点 / 场景试点 |
| `bamboo` | 听雨竹径 | 邻接 |
| `ferry` | 白沙渡 | 邻接 |
| `market` | 旧瓦市 | 邻接 |
| `hearth` | 赤炉山庄 | 邻接 |
| `kaifeng` | 开封（东京） | 州府 parent |

### 交互 action（与 `scene_view.js` 一致）

| action | 目标 | 网页入口 |
|--------|------|----------|
| `explore` | — | `exploreLocation(player)` |
| `npc` | `zhou` | `modalNpc("zhou")` |
| `npc` | `su` | `modalNpc("su")` |
| `learn` | LOCAL_SKILLS.qinghe | `learnSkill` |
| `exit` | 邻接 / 入城 | `movePlayer` / `enterCity` |

### NPC（清河）

| id | 名称 | title |
|----|------|-------|
| `zhou` | 老周 | 客栈掌柜 |
| `su` | 苏半仙 | 医馆大夫 |
| `shishu` | 王说书 | 茶棚说书人 |

### 清河可学武学 id

`basic_fist` · `basic_sword` · `basic_neigong` · `crush_leg`  
（以 `data/skills.json` / `LOCAL_SKILLS` 为准，热更新后以 JSON 为准。）

### 人物境界 id

| rankId | name |
|--------|------|
| 0 | 未入流 |
| 1 | 三流 |
| 2 | 二流 |
| 3 | 一流 |
| 4 | 超一流 |
| 5 | 宗师 |

学武门槛：玄阶≥三流，地阶≥二流，天阶≥一流。

---

## 7. 本周清单（对照）

1. 浏览器：强制刷新测清河 5 热区，记 bug；修完 **停扩场景**
2. 建 Unity 工程（建议 **2D 模板**）
3. 清河示意：SVG 可导出 PNG（`assets/scenes/qinghe.svg`）
4. 摆 5 个触发器，打日志或空面板
5. 工程内放同名 id 表，与本页一致

---

## 8. 刻意先不做

- 浏览器再做开封 HD 场景
- Unity 一次接六大门派 + 全主线
- 联网、云存档
- 首周真 HD-2D 后处理
