/**
 * 场景外壳（第1步：仅清河）
 * 最外层 = 场景图 + 热区；内层仍走现有逻辑，不重写玩法
 */
(function(){
  var SCENES={
    qinghe:{
      bg:"./assets/scenes/qinghe.svg",
      title:"清河镇",
      hotspots:[
        {
          id:"inn",
          label:"客栈·市井",
          hint:"游历", 
          left:6, top:42, width:22, height:38,
          action:"explore"
        },
        {
          id:"zhou",
          label:"老周",
          hint:"交谈",
          left:12, top:58, width:14, height:18,
          action:"npc", target:"zhou"
        },
        {
          id:"clinic",
          label:"医馆",
          hint:"苏半仙",
          left:32, top:48, width:16, height:32,
          action:"npc", target:"su"
        },
        {
          id:"yard",
          label:"拳场·学艺",
          hint:"学武",
          left:50, top:54, width:14, height:28,
          action:"learn"
        },
        {
          id:"gate",
          label:"官道·出城",
          hint:"入城/赶路",
          left:74, top:36, width:20, height:42,
          action:"exit"
        }
      ]
    }
  };

  var enabled=true; /* 可关掉场景层，只留旧 UI */

  function sceneFor(loc){
    return SCENES[loc]||null;
  }

  function runAction(player, hs){
    if(!hs)return;
    if(hs.action==="explore"){
      if(typeof exploreLocation==="function"){
        exploreLocation(player);
        if(typeof saveGame==="function")saveGame(state);
        renderGame();
      }
      return;
    }
    if(hs.action==="npc"){
      var id=hs.target;
      if(typeof modalNpc==="function")modalNpc(id);
      else if(typeof modalPerson==="function")modalPerson(id);
      return;
    }
    if(hs.action==="learn"){
      openLearnSheet(player);
      return;
    }
    if(hs.action==="exit"){
      openExitSheet(player);
      return;
    }
  }

  function openLearnSheet(player){
    var ids=(typeof LOCAL_SKILLS!=="undefined"&&LOCAL_SKILLS[player.location])||[];
    var list=ids.map(function(id){
      return typeof getSkillById==="function"?getSkillById(id):null;
    }).filter(Boolean);
    if(!list.length){
      player.logs.unshift("此地暂无可学武学。");
      if(typeof saveGame==="function")saveGame(state);
      renderGame();
      return;
    }
    var rows=list.map(function(s){
      var owned=(player.skills||[]).some(function(x){return x.id===s.id;});
      return '<button class="btn sm '+(owned?"":"primary")+' scene-learn" data-id="'+s.id+'" '+(owned?"disabled":"")+'>'+s.name+(s.cost?(" · "+s.cost+"两"):"")+(owned?" · 已学":"")+'</button>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">拳场·学艺</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">清河可学武学（走原有 learnSkill）。</p>'+
      '<div class="row" style="flex-direction:column;align-items:stretch;gap:6px">'+rows+'</div>'
    );
    qs("#mClose").onclick=closeModal;
    qsa(".scene-learn").forEach(function(el){
      el.onclick=function(){
        var sk=getSkillById(el.dataset.id);
        var r=learnSkill(player,sk);
        player.logs.unshift(r.msg||(r.ok?"学会了":"学武失败"));
        if(typeof saveGame==="function")saveGame(state);
        closeModal();
        renderGame();
      };
    });
  }

  function openExitSheet(player){
    var here=typeof getMapById==="function"?getMapById(player.location):null;
    var neigh=(here&&here.neighbors)||[];
    var moves=neigh.map(function(id){
      var m=getMapById(id);
      return '<button class="btn sm primary scene-move" data-id="'+id+'">'+(m?m.name:id)+'</button>';
    }).join("");
    var cityBtn="";
    if(typeof getParentCityId==="function"&&typeof enterCity==="function"){
      var pid=getParentCityId(player.location);
      if(pid){
        var c=typeof WORLD_CITIES!=="undefined"?WORLD_CITIES[pid]:null;
        cityBtn='<button class="btn primary" id="sceneEnterCity">入城·'+(c&&c.short?c.short:pid)+'</button>';
      }
    }
    openModal(
      '<div class="modal-head"><h2 class="section-title">官道·出城</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">赶路仍用现有移动 / 州府逻辑。</p>'+
      (cityBtn?'<div class="row" style="margin-bottom:8px">'+cityBtn+'</div>':"")+
      '<div class="row">'+moves+'</div>'
    );
    qs("#mClose").onclick=closeModal;
    if(qs("#sceneEnterCity")){
      qs("#sceneEnterCity").onclick=function(){
        var pid=getParentCityId(player.location);
        var r=enterCity(player,pid);
        if(!r.ok)player.logs.unshift(r.msg);
        if(typeof saveGame==="function")saveGame(state);
        closeModal();
        renderGame();
      };
    }
    qsa(".scene-move").forEach(function(el){
      el.onclick=function(){
        var r=typeof movePlayer==="function"?movePlayer(player,el.dataset.id):{ok:false,msg:"无法移动"};
        if(!r.ok)player.logs.unshift(r.msg||r.message||"无法到达");
        if(typeof saveGame==="function")saveGame(state);
        closeModal();
        renderGame();
      };
    });
  }

  function renderSceneLayer(player){
    var sc=sceneFor(player.location);
    if(!sc||!enabled)return"";
    var spots=sc.hotspots.map(function(h){
      return (
        '<button type="button" class="scene-hot" data-hid="'+h.id+'" '+
        'style="left:'+h.left+'%;top:'+h.top+'%;width:'+h.width+'%;height:'+h.height+'%" '+
        'title="'+(h.hint||h.label)+'">'+
        '<span class="scene-hot-label">'+h.label+'</span>'+
        '</button>'
      );
    }).join("");
    return (
      '<div class="scene-wrap" id="sceneWrap">'+
        '<div class="scene-stage">'+
          '<img class="scene-bg" src="'+sc.bg+'" alt="'+sc.title+'" draggable="false"/>'+
          '<div class="scene-hotspots">'+spots+'</div>'+
        '</div>'+
        '<div class="row scene-bar">'+
          '<span class="tag">场景</span>'+
          '<span class="small">点热区交互 · 下方仍是完整界面</span>'+
          '<button class="btn sm" id="sceneToggleClassic">折叠/展开旧区</button>'+
        '</div>'+
      '</div>'
    );
  }

  function bindScene(player){
    var root=document.getElementById("sceneWrap");
    if(!root)return;
    var sc=sceneFor(player.location);
    if(!sc)return;
    root.querySelectorAll(".scene-hot").forEach(function(el){
      el.onclick=function(e){
        e.preventDefault();
        var hid=el.dataset.hid;
        var hs=null;
        for(var i=0;i<sc.hotspots.length;i++)if(sc.hotspots[i].id===hid){hs=sc.hotspots[i];break;}
        runAction(player,hs);
      };
    });
    var tog=document.getElementById("sceneToggleClassic");
    if(tog){
      tog.onclick=function(){
        document.body.classList.toggle("scene-compact");
      };
    }
  }

  function injectScene(player){
    if(!player||!enabled)return;
    if(!sceneFor(player.location)){
      document.body.classList.remove("scene-mode");
      return;
    }
    document.body.classList.add("scene-mode");
    var panels=document.querySelectorAll(".panel");
    if(panels.length<2)return;
    var locPanel=panels[1];
    if(document.getElementById("sceneWrap"))return;
    var holder=document.createElement("div");
    holder.innerHTML=renderSceneLayer(player);
    var node=holder.firstChild;
    /* 插到地点面板顶部 */
    locPanel.insertBefore(node,locPanel.firstChild);
    bindScene(player);
  }

  /* 样式 */
  var st=document.createElement("style");
  st.id="scene-view-style";
  st.textContent=[
    ".scene-wrap{margin:0 0 8px}",
    ".scene-stage{position:relative;width:100%;border:3px solid;border-color:#3a2a1c #1a120c #1a120c #3a2a1c;",
    "  box-shadow:4px 4px 0 #0a0806;background:#0e0c0a;overflow:hidden;border-radius:0;aspect-ratio:16/9}",
    ".scene-bg{display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;pointer-events:none}",
    ".scene-hotspots{position:absolute;inset:0}",
    ".scene-hot{position:absolute;border:2px solid rgba(217,173,98,.35);background:rgba(217,173,98,.06);",
    "  cursor:pointer;padding:0;margin:0;border-radius:4px;transition:background .15s,border-color .15s}",
    ".scene-hot:hover,.scene-hot:focus{background:rgba(217,173,98,.18);border-color:#d9ad62;outline:none}",
    ".scene-hot:active{background:rgba(217,173,98,.28)}",
    ".scene-hot-label{position:absolute;left:50%;bottom:4px;transform:translateX(-50%);",
    "  font-size:10px;white-space:nowrap;color:#f5e8cf;text-shadow:1px 1px 0 #000;",
    "  background:rgba(20,16,12,.75);padding:1px 6px;border:1px solid #4b3a2d;pointer-events:none}",
    ".scene-bar{margin-top:6px;align-items:center;gap:8px}",
    /* 紧凑：弱化地图网格，场景优先 */
    "body.scene-compact .pixel-map{display:none}",
    "body.scene-compact .panel .row.compact-block{opacity:.85}"
  ].join("\n");
  document.head.appendChild(st);

  setTimeout(function(){
    if(typeof Game!=="undefined"&&Game.on){
      Game.on("render:after",function(p){if(p)injectScene(p);});
    }else if(typeof renderGame==="function"){
      var _rg=renderGame;
      window.renderGame=function(){
        _rg();
        if(state&&state.player)injectScene(state.player);
      };
    }
  },50);

  window.SCENE_DEFS=SCENES;
  window.setSceneEnabled=function(v){enabled=!!v;};
})();
