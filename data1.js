/** data1.js — 兼容入口：表数据见 data1_world.js / data1_maps.js / data1_sects.js / data/*.json */
(function(g){
  if(!g.world) console.warn("[data1] world 未加载，请确认 data1_world.js");
  if(!g.maps) console.warn("[data1] maps 未加载，请确认 data1_maps.js");
  if(!g.sects) console.warn("[data1] sects 未加载，请确认 data1_sects.js");
})(typeof window!=="undefined"?window:this);
