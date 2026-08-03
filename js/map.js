export function getMapById(maps, id) { return maps.find(m => m.id === id); }
export function movePlayer(player, maps, targetId) {
  const here = getMapById(maps, player.location);
  if (!here || !here.neighbors.includes(targetId)) return { ok: false, message: '道路未通，无法前往。' };
  player.location = targetId; player.day += 1;
  const next = getMapById(maps, targetId);
  const event = next.events[Math.floor(Math.random() * next.events.length)];
  player.logs.unshift(`第${player.day}日，你来到【${next.name}】：${event}`);
  player.logs = player.logs.slice(0, 30);
  return { ok: true, message: event };
}
