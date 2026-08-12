/**
 * data_loader.js — 浏览器版统一数据加载层
 *
 * 运行规则：
 * 1. http(s) / GitHub Pages：优先读取 data/*.json。
 * 2. file://：保留现有 data1_*.js / data2.js / data_tables_skills.js 回退。
 * 3. 所有成功读取的数据进入 window.__GAME_DATA，供其他模块共享。
 * 4. 数据加载完成后发出 Game.emit("data:ready", data)。
 *
 * 扩展新数据表时，只需要在 FILES 中增加一项；不要再让各功能模块
 * 自己重复 fetch 同一份 JSON。
 */
(function(g){
  "use strict";

  var FILES = [
    { path: "./data/world.json", keys: ["world"] },
    { path: "./data/maps.json", keys: ["maps"] },
    { path: "./data/sects.json", keys: ["RANK_NAMES", "sects"] },
    { path: "./data/skills.json", keys: ["skills", "SKILL_DESIGN", "LOCAL_SKILLS"] },
    { path: "./data/origins.json", keys: ["origins", "talents", "BASE_STATS", "STAT_LABELS", "STAT_HELP"] },
    { path: "./data/content.json", keys: ["content"] }
  ];

  var state = g.__DATA_STATE || {
    startedAt: 0,
    loadedAt: 0,
    loaded: false,
    source: "fallback",
    files: {},
    errors: []
  };
  g.__DATA_STATE = state;

  function ensureStore(){
    if(!g.__GAME_DATA)g.__GAME_DATA={};
    return g.__GAME_DATA;
  }

  function applyChunk(obj, file){
    if(!obj)return;
    var store = ensureStore();
    var mapped = file && file.keys && file.keys.length ? file.keys[0] : null;

    /* 允许 JSON 本身提供明确的单一根键。 */
    if(mapped && file.keys.length===1){
      g[mapped]=obj;
      store[mapped]=obj;
      return;
    }

    /* 多键表沿用历史字段名，兼容现有逻辑。 */
    if(file && file.keys){
      file.keys.forEach(function(key){
        if(obj[key]!==undefined){
          g[key]=obj[key];
          store[key]=obj[key];
        }
      });
    }

    /* 新内容表使用 content.json 的完整对象作为 content。 */
    if(file && file.path.indexOf("content.json")!==-1){
      g.content=obj;
      store.content=obj;
    }
  }

  function clearErrors(){ state.errors=[]; }

  function markFile(path, ok, message){
    state.files[path]={ok:!!ok, message:message||"", at:new Date().toISOString()};
    if(!ok)state.errors.push({path:path,message:message||"加载失败"});
  }

  function afterLoad(source){
    if(typeof DB!=="undefined" && DB.rebuild){
      try{ DB.rebuild(); }catch(e){
        console.warn("[data_loader] DB.rebuild", e);
        state.errors.push({path:"DB.rebuild",message:String(e&&e.message||e)});
      }
    }

    state.loadedAt=Date.now();
    state.loaded=true;
    state.source=source||"json";
    g.__DATA_LOADED=true;
    g.__DATA_SOURCE=state.source;

    if(typeof Game!=="undefined" && Game.emit){
      try{ Game.emit("data:ready", g.__GAME_DATA); }catch(e){
        console.warn("[data_loader] data:ready", e);
      }
    }
  }

  g.getGameData = function(key, fallback){
    var store=ensureStore();
    return store[key]!==undefined ? store[key] : fallback;
  };

  g.getDataState = function(){
    return {
      startedAt:state.startedAt,
      loadedAt:state.loadedAt,
      loaded:state.loaded,
      source:state.source,
      files:Object.assign({},state.files),
      errors:state.errors.slice()
    };
  };

  g.reloadGameData = function(options){
    options=options||{};
    if(typeof fetch!=="function"){
      state.errors=[{path:"fetch",message:"当前环境不支持 fetch"}];
      return Promise.reject(new Error("当前环境不支持 fetch，请用本地服务器或 GitHub Pages 打开。"));
    }

    state.startedAt=Date.now();
    state.loaded=false;
    clearErrors();
    var cacheMode=options.cacheMode||"no-store";
    var versionTag=options.versionTag||Date.now();

    return Promise.all(FILES.map(function(f){
      return fetch(f.path + "?v=" + versionTag, {cache:cacheMode})
        .then(function(r){
          if(!r.ok)throw new Error(f.path+" HTTP "+r.status);
          return r.json();
        })
        .then(function(json){
          applyChunk(json,f);
          markFile(f.path,true);
          return json;
        })
        .catch(function(err){
          markFile(f.path,false,err&&err.message?err.message:String(err));
          console.warn("[data_loader] skip", f.path, err);
          return null;
        });
    })).then(function(results){
      var okCount=results.filter(Boolean).length;
      if(okCount>0)afterLoad("json");
      else afterLoad("fallback");
      return ensureStore();
    });
  };

  function auto(){
    var proto="";
    try{proto=location.protocol;}catch(e){}
    if(proto!=="http:" && proto!=="https:"){
      state.loaded=true;
      state.source="fallback";
      g.__DATA_LOADED=true;
      g.__DATA_SOURCE="fallback";
      return;
    }
    g.reloadGameData().catch(function(err){
      state.loaded=true;
      state.source="fallback";
      g.__DATA_LOADED=true;
      g.__DATA_SOURCE="fallback";
      console.warn("[data_loader] fallback", err);
    });
  }

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(auto,0);});
    else setTimeout(auto,0);
  }
})(typeof window!=="undefined"?window:this);
