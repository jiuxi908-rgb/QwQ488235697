/**
 * data_loader.js — 从 data/*.json 热加载表数据（方便非程序员改表）
 *
 * 用法：
 *   1. 默认：data_tables.js 同步注入（file:// / 离线也可用）
 *   2. 本文件在 http(s) 下 fetch JSON 覆盖，然后 DB.rebuild()
 *   3. 控制台可手动：reloadGameData().then(()=>location.reload())
 */
(function(g){
  "use strict";
  var FILES = [
    { path: "./data/world.json", keys: ["world"] },
    { path: "./data/maps.json", keys: ["maps"] },
    { path: "./data/sects.json", keys: ["RANK_NAMES", "sects"] },
    { path: "./data/skills.json", keys: ["skills", "SKILL_DESIGN", "LOCAL_SKILLS"] },
    { path: "./data/origins.json", keys: ["origins", "talents", "BASE_STATS", "STAT_LABELS", "STAT_HELP"] }
  ];

  function applyChunk(obj){
    if(!obj)return;
    Object.keys(obj).forEach(function(k){
      g[k] = obj[k];
      if(!g.__GAME_DATA)g.__GAME_DATA={};
      g.__GAME_DATA[k]=obj[k];
    });
  }

  function afterLoad(){
    if(typeof DB!=="undefined" && DB.rebuild){
      try{ DB.rebuild(); }catch(e){ console.warn("[data_loader] DB.rebuild", e); }
    }
    if(typeof Game!=="undefined" && Game.emit){
      try{ Game.emit("data:ready", g.__GAME_DATA); }catch(e){}
    }
    g.__DATA_LOADED = true;
  }

  g.reloadGameData = function(){
    if(typeof fetch!=="function"){
      return Promise.reject(new Error("当前环境不支持 fetch，请直接改 data_tables.js 或用本地服务器打开"));
    }
    return Promise.all(FILES.map(function(f){
      return fetch(f.path + "?t=" + Date.now(), { cache: "no-store" })
        .then(function(r){
          if(!r.ok)throw new Error(f.path + " " + r.status);
          return r.json();
        })
        .then(function(json){ applyChunk(json); })
        .catch(function(err){
          console.warn("[data_loader] skip", f.path, err.message||err);
        });
    })).then(function(){
      afterLoad();
      return g.__GAME_DATA;
    });
  };

  function auto(){
    var proto = "";
    try{ proto = location.protocol; }catch(e){}
    if(proto!=="http:" && proto!=="https:"){
      g.__DATA_LOADED = true;
      return;
    }
    g.reloadGameData().catch(function(){ g.__DATA_LOADED = true; });
  }

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded", function(){ setTimeout(auto, 0); });
    else setTimeout(auto, 0);
  }
})(typeof window!=="undefined"?window:this);
