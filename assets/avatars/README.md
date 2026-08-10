# NPC 像素头像库 (120×120)

由游戏同一套像素生成器批量导出，与 `pixel_ui.js` 风格一致。

## 文件
- `{npcId}.svg` — 各角色半身像素像
- `manifest.json` — 索引
- `hero_ref.svg` — 主角默认

## 使用
`avatar_lib.js` 提供：
- `AVATAR_HAS(id)`
- `AVATAR_SRC(id)` → `./assets/avatars/{id}.svg`
- `avatarFromLib(id, size)` → 带头像的 HTML
- `preloadAvatars()` — 预加载

游戏内 `pixel_ui.js` 会优先使用本库，缺失时回退程序生成。
