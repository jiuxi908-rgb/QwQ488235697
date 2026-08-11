/** data1.js — 世界 / 地图 / 门派表（与 data/*.json 同步；JSON 为非程序员编辑入口） */
const world={title:"一剑一蓑烟雨录",background:"大雍末年，朝廷以缉武司统辖江湖，商路、盐铁与漕运被诸侯暗中争夺。武人不再只问胜负，也要在门规、恩义、名声与生计之间做选择。",states:["大雍朝廷","北庭节镇","南海商盟"],rules:["杀人留痕","拜师有门","武无定法","无唯一主线"],factions:["守序正道","逐利中道","幽暗邪道"]};

// 若 data_tables 已注入同名数据，以 JSON 热加载结果为准（data_loader 后置覆盖）
if(typeof window!=="undefined"&&window.__GAME_DATA&&window.__GAME_DATA.world){
  /* data_tables 已提供时不强制覆盖，保留下方 const 作为 file:// 回退 */
}
