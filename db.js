/**
 * db.js — 静态数据性能层
 *
 * 目标：把所有 .find / .filter 热路径改成 Map/对象 O(1) 查询；
 *       战力/衍生属性可缓存；掉落表预计算累计权重。
 *
 * 加载顺序：data1 → data2 → text → favor → npc → items → **db.js** → core → …
 */
(function(global){
  "use strict";

  var DB = global.DB || {};
  global.DB = DB;
  DB.version = "2.0.0";

  /* —— 工具 —— */
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

  /* —— 建索引 —— */
  function rebuild(){
    var t0 = (typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();

    DB.maps     = indexById(typeof maps!=="undefined"?maps:[]);
    DB.sects    = indexById(typeof sects!=="undefined"?sects:[]);
    DB.skills   = indexById(typeof skills!=="undefined"?skills:[]);
    DB.items    = indexById(typeof ITEMS!=="undefined"?ITEMS:[]);
    DB.npcs     = indexById(typeof npcs!=="undefined"?npcs:[]);
    DB.origins  = indexById(typeof origins!=="undefined"?origins:[]);
    DB.talents  = indexById(typeof talents!=="undefined"?talents:[]);

    /* 地点 → NPC 列表（只建一次） */
    DB.npcsByLoc = groupBy(typeof npcs!=="undefined"?npcs:[], "loc");

    /* 地点 → 门派（map.sect） */
    DB.sectByLoc = Object.create(null);
    if(typeof maps!=="undefined"){
      for(var i=0;i<maps.length;i++){
        var m=maps[i];
        if(m&&m.sect)DB.sectByLoc[m.id]=DB.sects[m.sect]||null;
      }
    }

    /* 武学按类型 / 品质分组（UI 筛选） */
    DB.skillsByType = groupBy(typeof skills!=="undefined"?skills:[], "type");
    DB.skillsByQuality = groupBy(typeof skills!=="undefined"?skills:[], "quality");

    /* LOCAL_SKILLS 反查：skillId → 可学地点[] */
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

    /* 掉落表：预计算 total 权重，避免每次 roll 再扫 */
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

    /* 商店库存集合：快速 has */
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

    /* 地图邻居集合：O(1) 判断通路（兼容旧 neighbors 数组） */
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

  /* —— O(1) 查询 API（覆盖全局同名函数） —— */
  function installLookups(){
    global.getMapById = function(id){
      return (DB.maps&&DB.maps[id])||null;
    };
    global.getSectById = function(id){
      return (DB.sects&&DB.sects[id])||null;
    };
    global.getSectByLoc = function(locId){
      if(DB.sectByLoc&&DB.sectByLoc[locId])return DB.sectByLoc[locId];
      var m=global.getMapById(locId);
      return m&&m.sect?(DB.sects[m.sect]||null):null;
    };
    global.getSkillById = function(id){
      return (DB.skills&&DB.skills[id])||null;
    };
    global.getItemById = function(id){
      return (DB.items&&DB.items[id])||null;
    };
    global.findPerson = function(id){
      return (DB.npcs&&DB.npcs[id])||null;
    };
    global.getNpcsAt = function(loc){
      var list=(DB.npcsByLoc&&DB.npcsByLoc[loc])||[];
      /* 返回浅拷贝，避免调用方误改共享数组 */
      return list.slice();
    };

    /* 可选：更快的邻居判断（旧 movePlayer 仍用 neighbors.includes） */
    DB.isNeighbor = function(fromId, toId){
      var ns=DB.neighborSet&&DB.neighborSet[fromId];
      return !!(ns&&ns[toId]);
    };

    /* 优化 rollDrop：用预计算 total */
    if(typeof global.rollDrop==="function"||typeof DROP_TABLE!=="undefined"){
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
  }

  /* —— 战力 / derived 缓存 ——
   * 键：技能数量 + 技能 realm 指纹 + 装备三槽 + stats 六维 + hp 上限相关
   * 变更装备/学招/突破/属性后自动失效
   */
  var _cache = { power:Object.create(null), derived:Object.create(null) };
  var _CACHE_MAX = 32;

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
    /* 临时 buff */
    if(p.tempBuffs&&p.tempBuffs.length){
      for(var t=0;t<p.tempBuffs.length;t++){
        var tb=p.tempBuffs[t];
        sig+="|tb"+(tb.name||"")+"."+(tb.left|0);
      }
    }
    /* 经脉 */
    if(p.meridians){
      var mk=Object.keys(p.meridians);
      for(var mi=0;mi<mk.length;mi++)sig+="|m"+mk[mi]+"."+(p.meridians[mk[mi]]|0);
    }
    return sig;
  }

  function cacheGet(bucket, key){
    return bucket[key];
  }
  function cacheSet(bucket, key, val){
    var keys=Object.keys(bucket);
    if(keys.length>=_CACHE_MAX){
      /* 简单淘汰最旧一半 */
      for(var i=0;i<(keys.length>>1);i++)delete bucket[keys[i]];
    }
    bucket[key]=val;
    return val;
  }

  function installCombatCache(){
    if(typeof global.derived==="function"){
      var _derived = global.derived;
      global.derived = function(player){
        var key=playerFingerprint(player);
        var hit=cacheGet(_cache.derived, key);
        if(hit)return hit;
        var d=_derived(player);
        /* 返回拷贝，避免调用方改到缓存 */
        var copy={attack:d.attack,dodge:d.dodge};
        if(d.def!=null)copy.def=d.def;
        return cacheSet(_cache.derived, key, copy);
      };
    }
    if(typeof global.calcCombatPower==="function"){
      var _pow = global.calcCombatPower;
      global.calcCombatPower = function(player){
        var key=playerFingerprint(player);
        var hit=cacheGet(_cache.power, key);
        if(hit!=null)return hit;
        var v=_pow(player);
        return cacheSet(_cache.power, key, v);
      };
    }
    DB.invalidateCombatCache = function(){
      _cache.power=Object.create(null);
      _cache.derived=Object.create(null);
    };
  }

  /* 优化 movePlayer 邻居检查（若仍用旧 maps.neighbors） */
  function installMovePatch(){
    if(typeof global.movePlayer!=="function")return;
    var _mv=global.movePlayer;
    global.movePlayer=function(player, targetId){
      /* 若 map_grid 已接管，其内部不再依赖本函数；保留兼容 */
      if(DB.neighborSet&&player&&player.location){
        var ns=DB.neighborSet[player.location];
        if(ns&&!ns[targetId]){
          /* 仍交给原逻辑，可能 map_grid 覆盖了 movePlayer */
        }
      }
      return _mv(player, targetId);
    };
  }

  /* bag 查找加速：可选维护 id→stack 索引会复杂（突变多），保留 find 但降低频率即可 */

  function boot(){
    rebuild();
    installLookups();
    installCombatCache();
    installMovePatch();
  }

  /* 数据在同步 script 标签中已就绪，立即建索引 */
  boot();

  /* 若后续动态追加数据，可手动 DB.rebuild() */
  DB.rebuild = function(){
    rebuild();
    installLookups();
    if(DB.invalidateCombatCache)DB.invalidateCombatCache();
  };

  DB.stats = function(){
    return{
      maps:Object.keys(DB.maps||{}).length,
      sects:Object.keys(DB.sects||{}).length,
      skills:Object.keys(DB.skills||{}).length,
      items:Object.keys(DB.items||{}).length,
      npcs:Object.keys(DB.npcs||{}).length,
      buildMs:DB.buildMs,
      cachePower:Object.keys(_cache.power).length,
      cacheDerived:Object.keys(_cache.derived).length
    };
  };

})(typeof window!=="undefined"?window:this);
