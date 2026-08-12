/** world_map.js — 旧地图 API 兼容层
 * 不再保存城市、路线或 Explore 硬编码数据。
 * 所有天下数据由 data/world.json 驱动，实际实现位于 world_map_v2.js。
 */
(function(g){
  "use strict";
  function api(){return g.WORLD_MAP_LAYERED||null;}
  g.worldMapCity=function(id){var a=api();return a&&a.city?a.city(id):null;};
  g.worldMapNeighbors=function(id){var a=api();return a&&a.neighbors?a.neighbors(id):[];};
  g.worldMapTravel=function(player,to){var a=api();return a&&a.travel?a.travel(player,to):{ok:false,msg:"天下地图尚未加载"};};
  g.worldMapOpen=function(){var a=api();if(a&&a.open)a.open();};
  g.WORLD_MAP_LEGACY={getCity:g.worldMapCity,getNeighbors:g.worldMapNeighbors,travel:g.worldMapTravel,open:g.worldMapOpen};
})(typeof window!=="undefined"?window:this);
