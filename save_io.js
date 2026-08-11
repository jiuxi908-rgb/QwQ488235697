/** save_io.js — 存档版本迁移 + 导出/导入备份
 *  在 save_slots.js 之后加载；包装 loadGame/saveGame，并在存档弹窗加按钮
 */
(function(g){
  "use strict";
  var SAVE_VERSION = 3;
  g.SAVE_VERSION = SAVE_VERSION;

  function migrateSave(data){
    if(!data || typeof data !== "object") return null;
    try{
      if(!data.version) data.version = (data.player && data.player.home) ? 2 : 1;
      if(data.version < 2 && data.player){
        var p = data.player;
        if(!p.home) p.home = {unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
        if(!p.quests) p.quests = {active:[],done:[],dailyDay:0};
        if(!p.favor) p.favor = {};
        if(!p.bonds) p.bonds = {};
        if(!p.bag) p.bag = [];
        if(!p.equip) p.equip = {weapon:null,armor:null,accessory:null};
        data.version = 2;
      }
      if(data.version < 3 && data.player){
        var p2 = data.player;
        if(!p2.meridians) p2.meridians = {};
        if(!p2.explored) p2.explored = {};
        if(!p2.clock) p2.clock = {shichen:0,jieqi:0,xun:0};
        if(!p2.home) p2.home = {unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
        if(!p2.home.residents) p2.home.residents = [];
        if(!p2.flags) p2.flags = {};
        data.version = 3;
      }
      if(data.player && typeof ensurePlayer === "function"){
        try{ ensurePlayer(data.player); }catch(e){}
      }
      data.version = SAVE_VERSION;
      return data;
    }catch(err){
      console.warn("[migrateSave]", err);
      return data;
    }
  }
  g.migrateSave = migrateSave;

  function exportSaveFile(state){
    var st = state || g.state;
    if(!st || !st.player){ alert("没有可导出的进度"); return {ok:false}; }
    if(typeof ensurePlayer === "function") ensurePlayer(st.player);
    var payload = Object.assign({}, st, {
      version: SAVE_VERSION,
      exportedAt: new Date().toISOString(),
      game: "一剑一蓑烟雨录"
    });
    var name = (st.player.name || "少侠").replace(/[\\/:*?"<>|]/g, "_");
    var day = st.player.day || 1;
    var blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "烟雨录_" + name + "_第" + day + "日.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 500);
    return {ok:true, msg:"已导出备份"};
  }
  g.exportSaveFile = exportSaveFile;

  function importSaveFile(file){
    return new Promise(function(resolve, reject){
      if(!file){ reject(new Error("未选择文件")); return; }
      var reader = new FileReader();
      reader.onload = function(){
        try{
          var data = migrateSave(JSON.parse(String(reader.result || "")));
          if(!data || !data.player){ reject(new Error("文件不是有效存档")); return; }
          resolve(data);
        }catch(e){ reject(e); }
      };
      reader.onerror = function(){ reject(new Error("读取失败")); };
      reader.readAsText(file, "utf-8");
    });
  }
  g.importSaveFile = importSaveFile;

  function wrapLoad(){
    if(typeof g.loadGame !== "function" || g.loadGame._migrated) return;
    var _load = g.loadGame;
    g.loadGame = function(){ return migrateSave(_load()); };
    g.loadGame._migrated = 1;
  }
  function wrapSave(){
    if(typeof g.saveGame !== "function" || g.saveGame._versioned) return;
    var _save = g.saveGame;
    g.saveGame = function(st){
      if(st){
        st.version = SAVE_VERSION;
        st.savedAt = new Date().toISOString();
        if(st.player && typeof ensurePlayer === "function"){
          try{ ensurePlayer(st.player); }catch(e){}
        }
      }
      return _save(st);
    };
    g.saveGame._versioned = 1;
  }
  function wrapLoadFromSlot(){
    if(typeof g.loadFromSlot !== "function" || g.loadFromSlot._migrated) return;
    var _lfs = g.loadFromSlot;
    g.loadFromSlot = function(i){
      var data = _lfs(i);
      return migrateSave(data);
    };
    g.loadFromSlot._migrated = 1;
  }

  function ioButtonsHtml(){
    return '<div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap">'+
      '<button class="btn sm" id="exportSaveBtn">导出备份</button>'+
      '<button class="btn sm" id="importSaveBtn">导入备份</button>'+
      '<input type="file" id="importSaveFile" accept="application/json,.json" style="display:none"/>'+
      '</div>'+
      '<p class="small" style="margin-top:4px">导出为 JSON，可换设备或清缓存后导入；旧档自动迁移。</p>';
  }

  function bindIo(){
    var ex = document.querySelector("#exportSaveBtn");
    if(ex) ex.onclick = function(){
      var r = exportSaveFile(g.state);
      if(r.ok && g.state && g.state.player) g.state.player.logs.unshift("已导出存档备份。");
    };
    var im = document.querySelector("#importSaveBtn");
    var fi = document.querySelector("#importSaveFile");
    if(im && fi){
      im.onclick = function(){ fi.click(); };
      fi.onchange = function(){
        var file = fi.files && fi.files[0];
        fi.value = "";
        if(!file) return;
        importSaveFile(file).then(function(data){
          if(!confirm("导入将覆盖当前进度，是否继续？\n角色："+(data.player.name||"无名")+" · 第"+(data.player.day||1)+"日")) return;
          if(typeof saveGame === "function") saveGame(data);
          g.state = data;
          if(typeof ensurePlayer === "function") ensurePlayer(data.player);
          if(typeof closeModal === "function") closeModal();
          if(typeof renderGame === "function") renderGame();
          else if(typeof renderStart === "function") renderStart();
        }).catch(function(err){
          alert("导入失败："+(err && err.message ? err.message : String(err)));
        });
      };
    }
  }

  function patchModal(name){
    if(typeof g[name] !== "function" || g[name]._ioPatched) return;
    var _m = g[name];
    g[name] = function(){
      _m.apply(this, arguments);
      var panel = document.querySelector("#modalPanel") || document.querySelector(".modal-panel");
      if(!panel) return;
      if(panel.querySelector("#exportSaveBtn")) return;
      var box = document.createElement("div");
      box.innerHTML = ioButtonsHtml();
      panel.appendChild(box);
      bindIo();
    };
    g[name]._ioPatched = 1;
  }

  function boot(){
    wrapLoad();
    wrapSave();
    wrapLoadFromSlot();
    patchModal("modalSaves");
    patchModal("modalLoadSlots");
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(boot, 0); });
  else setTimeout(boot, 0);
  setTimeout(boot, 100);
  setTimeout(boot, 300);
})(typeof window !== "undefined" ? window : this);
