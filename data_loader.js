/**
 * data_loader.js — 浏览器版统一数据加载层
 *
 * http(s) / GitHub Pages：优先读取 data/*.json。
 * file://：保留现有 JS 数据分片回退。
 * 新增：数据加载完成后挂载分层天下地图增强模块。
 */
(function(g){
  "use strict";
  var FILES=[
    {path:"./data/world.json",keys:["world"]},
    {path:"./data/maps.json",keys:["maps"]},
    {path:"./data/sects.json",keys:["RANK_NAMES","sects"]},
    {path:"./data/skills.json",keys:["skills","SKILL_DESIGN","LOCAL_SKILLS"]},
    {path:"./data/origins.json",keys:["origins","talents","BASE_STATS","STAT_LABELS","STAT_HELP"]},
    {path:"./data/content.json",keys:["content"]}
  ];
  var state=g.__DATA_STATE||{startedAt:0,loadedAt:0,loaded:false,source:"fallback",files:{},errors:[]};g.__DATA_STATE=state;
  function store(){if(!g.__GAME_DATA)g.__GAME_DATA={};return g.__GAME_DATA}
  function apply(obj,file){if(!obj)return;var s=store();(file.keys||[]).forEach(function(k){if(obj[k]!==undefined){g[k]=obj[k];s[k]=obj[k]}});if(file.keys&&file.keys.length===1){g[file.keys[0]]=obj[file.keys[0]]!==undefined?obj[file.keys[0]]:obj;s[file.keys[0]]=g[file.keys[0]]}if(file.path.indexOf("content.json")>=0){g.content=obj;s.content=obj}}
  function mark(path,ok,msg){state.files[path]={ok:!!ok,message:msg||"",at:new Date().toISOString()};if(!ok)state.errors.push({path:path,message:msg||"加载失败"})}
  function loadWorldModule(){return new Promise(function(resolve){if(g.__WORLD_MAP_V2_LOADED){resolve();return}if(typeof document==="undefined"){resolve();return}var s=document.createElement("script");s.src="./world_map_v2.js?v="+Date.now();s.onload=function(){g.__WORLD_MAP_V2_LOADED=true;resolve()};s.onerror=function(){console.warn("[data_loader] world_map_v2 加载失败");resolve()};document.head.appendChild(s)})}
  function after(source){if(typeof DB!=="undefined"&&DB.rebuild){try{DB.rebuild()}catch(e){state.errors.push({path:"DB.rebuild",message:String(e&&e.message||e)})}}state.loadedAt=Date.now();state.loaded=true;state.source=source||"json";g.__DATA_LOADED=true;g.__DATA_SOURCE=state.source;if(typeof Game!=="undefined"&&Game.emit)Game.emit("data:ready",g.__GAME_DATA);loadWorldModule()}
  g.getGameData=function(k,f){var s=store();return s[k]!==undefined?s[k]:f};
  g.getDataState=function(){return{startedAt:state.startedAt,loadedAt:state.loadedAt,loaded:state.loaded,source:state.source,files:Object.assign({},state.files),errors:state.errors.slice()}};
  g.reloadGameData=function(options){options=options||{};if(typeof fetch!=="function"){state.errors=[{path:"fetch",message:"当前环境不支持 fetch"}];return Promise.reject(new Error("当前环境不支持 fetch，请用本地服务器或 GitHub Pages 打开。"))}state.startedAt=Date.now();state.loaded=false;state.errors=[];var tag=options.versionTag||Date.now(),cache=options.cacheMode||"no-store";return Promise.all(FILES.map(function(f){return fetch(f.path+"?v="+tag,{cache:cache}).then(function(r){if(!r.ok)throw new Error(f.path+" HTTP "+r.status);return r.json()}).then(function(j){apply(j,f);mark(f.path,true);return j}).catch(function(e){mark(f.path,false,String(e&&e.message||e));console.warn("[data_loader] skip",f.path,e);return null})})).then(function(r){after(r.filter(Boolean).length?"json":"fallback");return store()})};
  function auto(){var proto="";try{proto=location.protocol}catch(e){}if(proto!=="http:"&&proto!=="https:"){state.loaded=true;state.source="fallback";g.__DATA_LOADED=true;g.__DATA_SOURCE="fallback";loadWorldModule();return}g.reloadGameData().catch(function(){state.loaded=true;state.source="fallback";g.__DATA_LOADED=true;g.__DATA_SOURCE="fallback";loadWorldModule()})}
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(auto,0)});else setTimeout(auto,0)}
})(typeof window!=="undefined"?window:this);
