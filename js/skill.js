export const SKILL_DESIGN = {
  qualities: ['黄阶', '玄阶', '地阶', '天阶'],
  types: ['内功', '剑法', '刀法', '拳掌', '轻功', '暗器'],
  realms: ['初窥门径', '登堂入室', '融会贯通', '炉火纯青', '返璞归真'],
  combo: '内功提供资源与属性倾向，招式决定输出，轻功改变先手和闪避；同源武学可激活套招。'
};

export function getSkillById(skills, id) {
  return skills.find(s => s.id === id);
}

export function canLearn(player, skill) {
  if (player.skills.some(s => s.id === skill.id)) return { ok: false, msg: '你已学会此武学。' };
  if (player.silver < skill.cost) return { ok: false, msg: `银两不足，需要${skill.cost}两。` };
  for (const [k, v] of Object.entries(skill.req || {})) {
    if ((player.stats[k] || 0) < v) return { ok: false, msg: `属性不足：${k}需要${v}。` };
  }
  return { ok: true };
}

export function learnSkill(player, skill) {
  const check = canLearn(player, skill);
  if (!check.ok) return check;
  player.silver -= skill.cost;
  player.skills.push({
    id: skill.id,
    name: skill.name,
    type: skill.type,
    quality: skill.quality,
    realm: 0,
    exp: 0,
    maxExp: skill.maxExp || 100,
    power: skill.power,
    mp: skill.mp,
    effect: skill.effect
  });
  applyPassive(player, skill);
  player.logs.unshift(`你学会了【${skill.name}】（${skill.quality}${skill.type}）！`);
  return { ok: true, msg: `学会【${skill.name}】` };
}

function applyPassive(player, skill) {
  if (!skill.effect || typeof skill.effect !== 'string') return;
  const parts = skill.effect.split(',');
  for (const p of parts) {
    const m = p.trim().match(/(\w+)\+(\d+)/);
    if (!m) continue;
    const [, key, val] = m;
    const n = parseInt(val);
    if (key === 'maxHp') { player.maxHp += n; player.hp = Math.min(player.hp + n, player.maxHp); }
    else if (key === 'maxMp') { player.maxMp += n; player.mp = Math.min(player.mp + n, player.maxMp); }
    else if (player.stats[key] !== undefined) player.stats[key] += n;
  }
}

export function trainSkill(player, skillId, amount = 10) {
  const s = player.skills.find(x => x.id === skillId);
  if (!s) return { ok: false, msg: '未学会此武学。' };
  if (s.realm >= 4) return { ok: false, msg: '已达返璞归真，无需再练。' };
  s.exp += amount;
  while (s.exp >= s.maxExp && s.realm < 4) {
    s.exp -= s.maxExp;
    s.realm += 1;
    s.maxExp = Math.floor(s.maxExp * 1.6);
    s.power = Math.floor((s.power || 0) * 1.25);
    player.logs.unshift(`【${s.name}】突破至【${SKILL_DESIGN.realms[s.realm]}】！`);
  }
  return { ok: true, msg: `修炼【${s.name}】` };
}

export function getActiveSkills(player) {
  return player.skills.filter(s => ['剑法', '刀法', '拳掌', '暗器'].includes(s.type));
}

export function calcSkillDamage(player, skill) {
  const base = skill.power || 0;
  const realmBonus = 1 + skill.realm * 0.2;
  const statBonus = player.stats.arm * 0.8 + player.stats.qi * 0.5;
  return Math.floor((base + statBonus) * realmBonus);
}
