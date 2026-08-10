/**
 * db.js — 静态数据性能层
 *
 * 目标：把所有 .find / .filter 热路径改成 Map/对象 O(1) 查询；
 *       战力/衍生属性可缓存；掉落表预计算累计权重。
 *
 * 加载顺序：data1 → data2 → text → favor → npc → items → **db.js** → core → … → combat
 */
(function(global){
  "use strict";

  var DB = global.DB || {};
  global.DB = DB;
  DB.version = "2.0.1";

  function indexById(arr){
    var m = Object.create(null);
    if(!arr)return m;
    for(var i=0;i<arr.length;i++){
      var o=arr[i];
      if(o&&o.id!=null)m[o.id]=o;
    }
    return m;
  }
  function groupBy(arr, key){
    var g = Object.create(null);
    if(!arr)return g;
    for(var i=0;i<arr.length;i++){
      var o=arr[i];
      if(!o)continue;
      var k=o[key];
      if(k==null)continue;
      if(!g[k])g[k]=[];
      g[k].push(o);
    }
    return g;
  }

  function rebuild(){
    var t0 = (typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();

    DB.maps     = indexById(typeof maps!=="undefined"?maps:[]);
    DB.sects    = indexById(typeof sects!=="undefined"?sects:[]);
    DB.skills   = indexById(typeof skills!=="undefined"?skills:[]);
    DB.items    = indexById(typeof ITEMS!=="undefined"?ITEMS:[]);
    DB.npcs     = indexById(typeof npcs!=="undefined"?npcs:[]);
    DB.origins  = indexById(typeof origins!=="undefined"?origins:[]);
    DB.talents  = indexById(typeof talents!=="undefined"?talents:[]);

    DB.npcsByLoc = groupBy(typeof npcs!=="undefined"?npcs:[], "loc");

    DB.sectByLoc = Object.create(null);
    if(typeof maps!=="undefined"){
      for(var i=0;i<maps.length;i++){
        var m=maps[i];
        if(m&&m.sect)DB.sectByLoc[m.id]=DB.sects[m.sect]||null;
      }
    }

    DB.skillsByType = groupBy(typeof skills!=="undefined"?skills:[], "type");
    DB.skillsByQuality = groupBy(typeof skills!=="undefined"?skills:[], "quality");

    DB.skillLocs = Object.create(null);
    if(typeof LOCAL_SKILLS!=="undefined"){
      var locs=Object.keys(LOCAL_SKILLS);
      for(var li=0;li<locs.length;li++){
        var loc=locs[li];
        var list=LOCAL_SKILLS[loc]||[];
        for(var si=0;si<list.length;si++){
          var sid=list[si];
          if(!DB.skillLocs[sid])DB.skillLocs[sid]=[];
          DB.skillLocs[sid].push(loc);
        }
      }
    }

    DB.dropMeta = Object.create(null);
    if(typeof DROP_TABLE!=="undefined"){
      var dlocs=Object.keys(DROP_TABLE);
      for(var di=0;di<dlocs.length;di++){
        var dl=dlocs[di];
        var table=DROP_TABLE[dl]||[];
        var total=0;
        for(var ti=0;ti<table.length;ti++)total+=table[ti].w||0;
        DB.dropMeta[dl]={table:table,total:total};
      }
    }

    DB.shopSet = Object.create(null);
    if(typeof SHOP_STOCK!=="undefined"){
      var slocs=Object.keys(SHOP_STOCK);
      for(var sli=0;sli<slocs.length;sli++){
        var sl=slocs[sli];
        var set=Object.create(null);
        var stock=SHOP_STOCK[sl]||[];
        for(var sj=0;sj<stock.length;sj++)set[stock[sj]]=1;
        DB.shopSet[sl]=set;
      }
    }

    DB.neighborSet = Object.create(null);
    if(typeof maps!=="undefined"){
      for(var mi=0;mi<maps.length;mi++){
        var mp=maps[mi];
        if(!mp)continue;
        var ns=Object.create(null);
        var nb=mp.neighbors||[];
        for(var ni=0;ni<nb.length;ni++)ns[nb[ni]]=1;
        DB.neighborSet[mp.id]=ns;
      }
    }

    var t1=(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();
    DB.buildMs = Math.round((t1-t0)*100)/100;
    DB.ready = true;
    if(typeof Game!=="undefined"&&Game.emit)Game.emit("db:ready", DB);
  }

  function installLookups(){
    global.getMapById = function(id){ return (DB.maps&&DB.maps[id])||null; };
    global.getSectById = function(id){ return (DB.sects&&DB.sects[id])||null; };
    global.getSectByLoc = function(locId){
      if(DB.sectByLoc&&DB.sectByLoc[locId])return DB.sectByLoc[locId];
      var m=global.getMapById(locId);
      return m&&m.sect?(DB.sects[m.sect]||null):null;
    };
    global.getSkillById = function(id){ return (DB.skills&&DB.skills[id])||null; };
    global.getItemById = function(id){ return (DB.items&&DB.items[id])||null; };
    global.findPerson = function(id){ return (DB.npcs&&DB.npcs[id])||null; };
    global.getNpcsAt = function(loc){
      var list=(DB.npcsByLoc&&DB.npcsByLoc[loc])||[];
      return list.slice();
    };

    DB.isNeighbor = function(fromId, toId){
      var ns=DB.neighborSet&&DB.neighborSet[fromId];
      return !!(ns&&ns[toId]);
    };

    global.rollDrop = function(locId){
      var meta=(DB.dropMeta&&DB.dropMeta[locId])||(DB.dropMeta&&DB.dropMeta.qinghe);
      if(!meta||!meta.table||!meta.table.length)return null;
      if(Math.random()>0.28)return null;
      var r=Math.random()*meta.total;
      var table=meta.table;
      for(var i=0;i<table.length;i++){
        r-=table[i].w||0;
        if(r<=0)return table[i].id;
      }
      return table[0].id;
    };
  }

  var _cache = { power:Object.create(null), derived:Object.create(null) };
  var _CACHE_MAX = 48;
  var _cacheInstalled = false;

  function playerFingerprint(p){
    if(!p)return "";
    var eq=p.equip||{};
    var st=p.stats||{};
    var sk=p.skills||[];
    var sig=sk.length+":";
    for(var i=0;i<sk.length;i++){
      sig+=(sk[i].id||"")+"."+(sk[i].realm|0)+"."+(sk[i].power|0)+";";
    }
    sig+="|"+(eq.weapon||"")+","+(eq.armor||"")+","+(eq.accessory||"");
    sig+="|"+(st.arm|0)+","+(st.agi|0)+","+(st.bone|0)+","+(st.qi|0)+","+(st.wit|0)+","+(st.luck|0);
    if(p.tempBuffs&&p.tempBuffs.length){
      for(var t=0;t<p.tempBuffs.length;t++){
        var tb=p.tempBuffs[t];
        sig+="|tb"+(tb.name||"")+"."+(tb.left|0);
      }
    }
    if(p.meridians){
      var mk=Object.keys(p.meridians);
      for(var mi=0;mi<mk.length;mi++)sig+="|m"+mk[mi]+"."+(p.meridians[mk[mi]]|0);
    }
    return sig;
  }

  function cacheGet(bucket, key){ return bucket[key]; }
  function cacheSet(bucket, key, val){
    var keys=Object.keys(bucket);
    if(keys.length>=_CACHE_MAX){
      for(var i=0;i<(keys.length>>1);i++)delete bucket[keys[i]];
    }
    bucket[key]=val;
    return val;
  }

  function installCombatCache(){
    if(typeof global.derived==="function"){
      var _derived = global.derived;
      /* 避免重复包同一层 */
      if(!_derived._dbCached){
        var wrappedDer = function(player){
          var key=playerFingerprint(player);
          var hit=cacheGet(_cache.derived, key);
          if(hit)return hit;
          var d=_derived(player);
          var copy={attack:d.attack,dodge:d.dodge};
          if(d.def!=null)copy.def=d.def;
          return cacheSet(_cache.derived, key, copy);
        };
        wrappedDer._dbCached = true;
        global.derived = wrappedDer;
      }
    }
    if(typeof global.calcCombatPower==="function"){
      var _pow = global.calcCombatPower;
      if(!_pow._dbCached){
        var wrappedPow = function(player){
          var key=playerFingerprint(player);
          var hit=cacheGet(_cache.power, key);
          if(hit!=null)return hit;
          var v=_pow(player);
          return cacheSet(_cache.power, key, v);
        };
        wrappedPow._dbCached = true;
        global.calcCombatPower = wrappedPow;
      }
    }
    _cacheInstalled = true;
    DB.invalidateCombatCache = function(){
      _cache.power=Object.create(null);
      _cache.derived=Object.create(null);
    };
  }

  function boot(){
    rebuild();
    installLookups();
    installCombatCache();
  }

  boot();

  /* combat.js / meridian.js 可能再次包装 calcCombatPower，脚本全部加载后再挂一次缓存（最外层） */
  function rehangCache(){
    installCombatCache();
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(rehangCache, 0); });
  }else{
    setTimeout(rehangCache, 0);
  }

  DB.rebuild = function(){
    rebuild();
    installLookups();
    if(DB.invalidateCombatCache)DB.invalidateCombatCache();
    installCombatCache();
  };

  DB.stats = function(){
    return{
      version:DB.version,
      maps:Object.keys(DB.maps||{}).length,
      sects:Object.keys(DB.sects||{}).length,
      skills:Object.keys(DB.skills||{}).length,
      items:Object.keys(DB.items||{}).length,
      npcs:Object.keys(DB.npcs||{}).length,
      buildMs:DB.buildMs,
      cachePower:Object.keys(_cache.power).length,
      cacheDerived:Object.keys(_cache.derived).length,
      cacheOn:_cacheInstalled
    };
  };

})(typeof window!=="undefined"?window:this);
