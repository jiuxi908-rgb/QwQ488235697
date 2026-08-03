export const BASE_STATS = { arm: 5, agi: 5, bone: 5, qi: 5, wit: 5, luck: 5 };
export const STAT_LABELS = { arm: '臂力', agi: '身法', bone: '根骨', qi: '内力', wit: '悟性', luck: '福缘' };
export const STAT_HELP = {
  arm: '影响外功伤害、负重、刀拳类学习门槛。', agi: '影响闪避、先手、轻功和暗器表现。', bone: '影响气血上限、抗性、突破稳定度。', qi: '影响内力上限、内功威力、招式释放次数。', wit: '影响读谱速度、武学经验获取、解谜选项。', luck: '影响奇遇、掉落、NPC初始印象和隐藏事件。'
};
export function createPlayer({ name, gender, origin, talent }, origins, talents) {
  const stats = { ...BASE_STATS };
  applyBonus(stats, origins.find(o => o.id === origin)?.stats);
  applyBonus(stats, talents.find(t => t.id === talent)?.stats);
  return { name: name || '无名少侠', gender, age: 16, origin, talent, stats, hp: stats.bone * 20 + 80, maxHp: stats.bone * 20 + 80, mp: stats.qi * 15 + 60, maxMp: stats.qi * 15 + 60, silver: 120, location: 'qinghe', reputation: 0, day: 1, logs: ['十六岁这年，你背起旧包袱，踏入清河镇。'] };
}
function applyBonus(stats, bonus = {}) { Object.entries(bonus).forEach(([k, v]) => stats[k] += v); }
export function tickAge(player) { if (player.day > 0 && player.day % 360 === 0) player.age += 1; }
export function derived(player) { return { attack: player.stats.arm * 2 + Math.floor(player.stats.qi / 2), dodge: player.stats.agi * 2, learn: player.stats.wit * 3, encounter: player.stats.luck * 2 }; }
