/**
 * core.js — 游戏架构核心层
 *
 * 分层约定（由底到顶）：
 *   1. 数据  data1.js / data2.js / text.js / npc.js / items.js …
 *   2. 核心  core.js（本文件）· 事件 · 状态规范化 · 渲染钩子
 *   3. 逻辑  logic.js / time.js / npc_logic.js / combat.js …
 *   4. UI    *_ui.js / pixel_ui.js / map_grid.js / home_*.js …
 *   5. 体验  ui_smooth.js（最后加载）
 *
 * 扩展方式：
 *   Game.on("render:after", fn)     — 主界面刷新后
 *   Game.on("player:ensure", fn)    — 规范化玩家时追加字段
 *   Game.on("save:before", fn)      — 存档前
 *   Game.hook(name, fn)             — 包装已有全局函数（有序、可追溯）
 */
(function(global){
  "use strict";

  var Game = global.Game || {};
  global.Game = Game;

  /* —— 简易事件总线 —— */
  var _bus = {};
  Game.on = function(evt, fn){
    if(!_bus[evt])_bus[evt]=[];
    _bus[evt].push(fn);
    return function off(){
      _bus[evt]=(_bus[evt]||[]).filter(function(f){return f!==fn;});
    };
  };
  Game.off = function(evt, fn){
    if(!_bus[evt])return;
    if(!fn)_bus[evt]=[];
    else _bus[evt]=_bus[evt].filter(function(f){return f!==fn;});
  };
  Game.emit = function(evt, payload){
    var list=_bus[evt];
    if(!list||!list.length)return payload;
    for(var i=0;i<list.length;i++){
      try{
        var r=list[i](payload);
        if(r!==undefined)payload=r;
      }catch(err){
        console.warn("[Game.emit]",evt,err);
      }
    }
    return payload;
  };

  /* —— 有序函数钩子（替代无序多层覆盖） —— */
  var _hooks = {};
  /**
   * Game.hook("renderGame", function(next){ return function(){ ...; next(); }; })
   * 后注册的在外层（更后执行外围逻辑）
   */
  Game.hook = function(name, wrapper){
    if(!_hooks[name])_hooks[name]=[];
    _hooks[name].push(wrapper);
    Game._rebuild(name);
  };
  Game._rebuild = function(name){
    var base = Game._base && Game._base[name];
    if(!base && typeof global[name]==="function"){
      base = global[name];
      if(!Game._base)Game._base={};
      /* 若尚未记录，且还没被 hook 包过，记为 base */
      if(!Game._base[name])Game._base[name]=base;
      base=Game._base[name];
    }
    if(!base)return;
    var fn=base;
    var list=_hooks[name]||[];
    for(var i=0;i<list.length;i++){
      try{fn=list[i](fn)||fn;}catch(e){console.warn("[Game.hook]",name,e);}
    }
    global[name]=fn;
    Game[name]=fn;
  };
  Game.captureBase = function(name, fn){
    if(!Game._base)Game._base={};
    if(fn)Game._base[name]=fn;
    else if(typeof global[name]==="function"&&!Game._base[name])Game._base[name]=global[name];
  };

  /* —— 统一玩家状态规范化 —— */
  function ensurePlayerCore(p){
    if(!p)return p;
    if(!p.skills)p.skills=[];
    if(p.contrib==null)p.contrib=0;
    if(!p.flags)p.flags={};
    if(p.sectRank==null)p.sectRank=0;
    if(!p.logs)p.logs=[];
    if(!p.stats)p.stats={arm:5,agi:5,bone:5,qi:5,wit:5,luck:5};
    if(p.hp==null)p.hp=p.maxHp||100;
    if(p.maxHp==null)p.maxHp=100;
    if(p.mp==null)p.mp=p.maxMp||60;
    if(p.maxMp==null)p.maxMp=60;
    if(p.silver==null)p.silver=0;
    if(p.day==null)p.day=1;
    if(!p.location)p.location="qinghe";
    if(!p.bag)p.bag=[];
    if(!p.equip)p.equip={weapon:null,armor:null,accessory:null};
    if(!p.favor)p.favor={};
    if(!p.bonds)p.bonds={};
    if(!p.explored)p.explored={};
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    if(!p.home.storage)p.home.storage=[];
    if(!p.clock)p.clock={shichen:0,jieqi:0,xun:0};
    if(!p.quests)p.quests={active:[],done:[],dailyDay:0};
    if(!p.meridians)p.meridians={};
    /* 允许各系统注册额外字段 */
    Game.emit("player:ensure", p);
    return p;
  }

  Game.ensurePlayer = ensurePlayerCore;

  /* 在 ensurePlayer 定义后包装全局（logic 加载后会再 capture） */
  function installEnsurePlayer(){
    var prev = global.ensurePlayer;
    global.ensurePlayer = function(p){
      if(typeof prev==="function"){
        try{p=prev(p);}catch(e){}
      }
      return ensurePlayerCore(p);
    };
  }
  installEnsurePlayer();

  /* —— 存档包装 —— */
  function installSave(){
    if(typeof global.saveGame!=="function")return;
    var _save=global.saveGame;
    global.saveGame=function(st){
      if(st&&st.player)ensurePlayerCore(st.player);
      Game.emit("save:before", st);
      var r=_save(st);
      Game.emit("save:after", st);
      return r;
    };
  }

  /* —— 渲染钩子：render:before / render:after —— */
  function installRender(){
    if(typeof global.renderGame!=="function")return;
    Game.captureBase("renderGame", global.renderGame);
    var base=Game._base.renderGame;
    global.renderGame=function(){
      var p=global.state&&global.state.player;
      if(p)ensurePlayerCore(p);
      Game.emit("render:before", p);
      base.apply(this, arguments);
      Game.emit("render:after", p);
    };
    Game._base.renderGame=base;
  }

  /* DOM 工具（各 UI 可复用，避免重复声明冲突） */
  if(typeof global.qs!=="function"){
    global.qs=function(s,root){return (root||document).querySelector(s);};
  }
  if(typeof global.qsa!=="function"){
    global.qsa=function(s,root){return Array.prototype.slice.call((root||document).querySelectorAll(s));};
  }

  /**
   * 安全包装：模块用 Game.wrap("modalNpc", fn) 代替
   *   var _m=modalNpc; modalNpc=function(){ _m(); ... }
   * 这样 core 能追踪层数，避免无限套娃难以调试。
   */
  Game.wrap = function(name, wrapperFn){
    Game.captureBase(name);
    Game.hook(name, function(next){
      return function(){
        var args=arguments;
        var ctx=this;
        return wrapperFn.call(ctx, function(){
          return next.apply(ctx, args);
        }, args);
      };
    });
  };

  /* 延迟安装：等 logic.js 等定义完再 capture */
  function boot(){
    installEnsurePlayer();
    installSave();
    installRender();
    Game.emit("core:ready", Game);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(boot,0); });
  }else{
    setTimeout(boot,0);
  }

  /* 供调试 */
  Game.version="1.0.0-core";
  Game.debug = function(){
    return{
      events:Object.keys(_bus).map(function(k){return k+":"+(_bus[k]||[]).length;}),
      hooks:Object.keys(_hooks),
      bases:Game._base?Object.keys(Game._base):[]
    };
  };

})(typeof window!=="undefined"?window:this);
