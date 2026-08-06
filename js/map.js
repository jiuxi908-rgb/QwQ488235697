export function getMapById(maps, id) {
  return maps.find(m => m.id === id);
}

export function movePlayer(player, maps, targetId) {
  const here = getMapById(maps, player.location);
  if (!here || !here.neighbors.includes(targetId)) {
    return { ok: false, message: '道路未通，无法前往。' };
  }
  player.location = targetId;
  player.day += 1;
  const next = getMapById(maps, targetId);
  const event = next.events[Math.floor(Math.random() * next.events.length)];
  player.logs.unshift(`第${player.day}日，你来到【${next.name}】：${event}`);
  player.logs = player.logs.slice(0, 40);
  return { ok: true, message: event };
}

export function exploreLocation(player, maps) {
  const here = getMapById(maps, player.location);
  if (!here || !here.explore || here.explore.length === 0) {
    return { ok: false, message: '此地暂无游历内容。' };
  }

  player.day += 1;
  const pool = here.explore;
  const evt = pool[Math.floor(Math.random() * pool.length)];
  let msg = `第${player.day}日，你在【${here.name}】游历：${evt.text}`;

  switch (evt.type) {
    case 'silver':
      player.silver = Math.max(0, player.silver + evt.value);
      msg += evt.value > 0 ? `（银两+${evt.value}）` : `（银两${evt.value}）`;
      break;
    case 'heal':
      player.hp = Math.min(player.maxHp, player.hp + evt.value);
      msg += `（气血+${evt.value}）`;
      break;
    case 'damage':
      player.hp = Math.max(1, player.hp - evt.value);
      msg += `（气血-${evt.value}）`;
      break;
    case 'mp':
      player.mp = Math.min(player.maxMp, player.mp + evt.value);
      msg += `（内力+${evt.value}）`;
      break;
    case 'exp':
      if (player.skills && player.skills.length > 0) {
        const s = player.skills[Math.floor(Math.random() * player.skills.length)];
        s.exp += evt.value;
        msg += `（【${s.name}】经验+${evt.value}）`;
        // 简单自动突破检查
        while (s.exp >= s.maxExp && s.realm < 4) {
          s.exp -= s.maxExp;
          s.realm += 1;
          s.maxExp = Math.floor(s.maxExp * 1.6);
          s.power = Math.floor((s.power || 0) * 1.25);
          msg += ` → 突破至更高境界！`;
        }
      } else {
        msg += `（无武学可练，经验散佚）`;
      }
      break;
    case 'stat':
      if (player.stats[evt.key] !== undefined) {
        player.stats[evt.key] += evt.value;
        msg += `（${evt.key}+${evt.value}）`;
      }
      break;
    case 'log':
    default:
      break;
  }

  player.logs.unshift(msg);
  player.logs = player.logs.slice(0, 40);
  return { ok: true, message: msg };
}
