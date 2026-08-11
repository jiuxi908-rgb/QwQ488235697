/** data1.js — 兼容入口
 *  表数据已抽到：
 *    data/world.json  data/maps.json  data/sects.json
 *    data/skills.json data/origins.json
 *  运行时由 data_tables.js 同步注入；http 下 data_loader.js 可热加载 JSON。
 *  非程序员改表：直接编辑 data/*.json（保持字段结构），再用本地服务器打开即可覆盖。
 */
(function(g){
  if(!g.world && g.__GAME_DATA && g.__GAME_DATA.world){
    g.world=g.__GAME_DATA.world;
    g.maps=g.__GAME_DATA.maps;
    g.RANK_NAMES=g.__GAME_DATA.RANK_NAMES;
    g.sects=g.__GAME_DATA.sects;
  }
})(typeof window!=="undefined"?window:this);
