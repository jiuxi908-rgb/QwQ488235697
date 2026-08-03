# 一剑一蓑烟雨录

一款适合部署到 GitHub Pages 的单机/网页端文字武侠 RPG 原型。当前版本已完成开始界面、创建角色、玩家数据系统、LocalStorage 存档系统与基础地图移动。

## 项目结构

```text
.
├── index.html          # GitHub Pages 入口页面
├── css/
│   └── style.css       # 页面样式
├── js/
│   ├── main.js         # UI 渲染与流程控制
│   ├── player.js       # 玩家属性与角色创建
│   ├── save.js         # LocalStorage 存档
│   ├── map.js          # 地图查询与移动
│   ├── battle.js       # 战斗系统设计占位
│   ├── item.js         # 物品经济设计占位
│   ├── npc.js          # NPC 关系设计占位
│   └── skill.js        # 武学系统设计占位
├── json/
│   ├── world.json      # 世界观、势力与江湖规则
│   ├── maps.json       # 地图区域、邻接与随机事件
│   ├── origins.json    # 出身数据
│   └── talents.json    # 天赋数据
└── assets/             # 后续像素图、音效、图标资源
```

## 本地运行

由于项目使用 ES Modules 和 `fetch()` 读取 JSON，请通过静态服务器运行，而不是直接双击 HTML：

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/index.html
```

## 上传并开启 GitHub Pages

1. 在 GitHub 创建一个新仓库。
2. 将本项目推送到仓库主分支，例如：

   ```bash
   git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
   git branch -M main
   git push -u origin main
   ```

3. 打开仓库页面，进入 **Settings → Pages**。
4. Source 选择 **Deploy from a branch**。
5. Branch 选择 **main**，目录选择 **/** root。
6. 保存后等待部署完成，GitHub 会生成 Pages 访问地址。


## 分支冲突时的发布方式

如果 PR 显示“分支有冲突，不能干净地创建合并”，不必先合并 PR 才能预览网页。这个项目是纯静态站点，可以采用以下任一方式发布：

### 方式 A：直接从当前分支发布

1. 将当前分支推送到 GitHub。
2. 进入 **Settings → Pages**。
3. 如果使用分支部署，Branch 可选择当前分支，例如 `work`，目录选择 **/** root。
4. 如果使用 Actions 部署，Source 选择 **GitHub Actions**，本仓库已提供 `.github/workflows/pages.yml`。

### 方式 B：用当前版本覆盖 main

如果你确认远端 `main` 不需要保留旧文件，可以在配置好远端后执行：

```bash
git branch -M main
git push -u origin main --force-with-lease
```

> 注意：强制推送会改写远端分支历史，只建议在你自己的新仓库或确认无协作者依赖旧历史时使用。

## 后续扩展建议

- 将门派、NPC、武学、物品继续拆成 JSON 数据表。
- 为 `assets/` 添加像素角色头像、地图节点图标和 UI 音效。
- 增加 `saveVersion` 字段，后续版本升级时做存档迁移。
