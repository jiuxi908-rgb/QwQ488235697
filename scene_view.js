/**
 * 场景外壳：按 location 选配置，热区打到现有 API
 * 范围：qinghe / bamboo / mist_gate / kaifeng（不再扩）
 */
(function(){
  var SCENES={
    qinghe:{
      bg:"./assets/scenes/qinghe.svg",
      title:"清河镇",
      learnTitle:"拳场·学艺",
      exitTitle:"官道·出城",
      hotspots:[
        {id:"inn",label:"客栈·市井",hint:"游历",left:6,top:42,width:22,height:38,action:"explore"},
        {id:"zhou",label:"老周",hint:"交谈",left:12,top:58,width:14,height:18,action:"npc",target:"zhou"},
        {id:"clinic",label:"医馆",hint:"苏半仙",left:32,top:48,width:16,height:32,action:"npc",target:"su"},
        {id:"yard",label:"拳场·学艺",hint:"学武",left:50,top:54,width:14,height:28,action:"learn"},
        {id:"gate",label:"官道·出城",hint:"入城/赶路",left:74,top:36,width:20,height:42,action:"exit"}
      ]
    },
    bamboo:{
      bg:"./assets/scenes/bamboo.svg",
      title:"听雨竹径",
      learnTitle:"竹间学艺",
      exitTitle:"山径·去向",
      hotspots:[
        {id:"path",label:"竹径游历",hint:"游历",left:8,top:40,width:20,height:36,action:"explore"},
        {id:"aqing",label:"阿青",hint:"采药人",left:18,top:58,width:14,height:18,action:"npc",target:"aqing"},
        {id:"yard",label:"练剑坪",hint:"学武",left:40,top:52,width:20,height:28,action:"learn"},
        {id:"jian",label:"竹间",hint:"练剑少年",left:48,top:62,width:12,height:16,action:"npc",target:"jian_tong"},
        {id:"gate",label:"山门方向",hint:"赶路",left:76,top:40,width:18,height:36,action:"exit"}
      ]
    },
    mist_gate:{
      bg:"./assets/scenes/mist_gate.svg",
      title:"烟岚山门",
      learnTitle:"山门可学",
      exitTitle:"下山/入城",
      hotspots:[
        {id:"explore",label:"山门游历",hint:"游历",left:35,top:28,width:28,height:30,action:"explore"},
        {id:"luyun",label:"陆云",hint:"外门弟子",left:74,top:52,width:18,height:24,action:"npc",target:"luyun"},
        {id:"shen",label:"沈疏",hint:"外门执事",left:78,top:68,width:14,height:16,action:"npc",target:"shen_wai"},
        {id:"learn",label:"练剑坪·学武",hint:"学武",left:6,top:55,width:18,height:24,action:"learn"},
        {id:"sect",label:"剑斋门派",hint:"门派",left:38,top:55,width:22,height:22,action:"sect"},
        {id:"exit",label:"下山",hint:"赶路/入城",left:4,top:78,width:24,height:16,action:"exit"}
      ]
    },
    kaifeng:{
      bg:"./assets/scenes/kaifeng.svg",
      title:"开封（东京）",
      learnTitle:"京城见闻",
      exitTitle:"出城与长途",
      hotspots:[
        {id:"street",label:"御街·市井",hint:"游历",left:4,top:36,width:22,height:36,action:"explore"},
        {id:"temple",label:"相国寺外",hint:"游历",left:30,top:32,width:24,height:36,action:"explore"},
        {id:"spots",label:"出城·下辖",hint:"清河等",left:62,top:40,width:16,height:30,action:"city_spots"},
        {id:"travel",label:"长途官道",hint:"赴邻城",left:80,top:36,width:16,height:32,action:"city_travel"}
      ]
    }
  };

  var enabled=true;

  function sceneFor(loc){return SCENES[loc]||null;}

  function runAction(player,hs){
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
      if(typeof modalNpc==="function")modalNpc(hs.target);
      else if(typeof modalPerson==="function")modalPerson(hs.target);
      return;
    }
    if(hs.action==="learn"){openLearnSheet(player);return;}
    if(hs.action==="exit"){openExitSheet(player);return;}
    if(hs.action==="sect"){
      var sect=typeof getSectByLoc==="function"?getSectByLoc(player.location):null;
      if(sect&&typeof modalSect==="function")modalSect(sect);
      else{
        player.logs.unshift("此地无门派可入。");
        if(typeof saveGame==="function")saveGame(state);
        renderGame();
      }
      return;
    }
    if(hs.action==="city_spots"){openCitySpots(player);return;}
    if(hs.action==="city_travel"){openCityTravel(player);return;}
  }

  function openLearnSheet(player){
    var sc=sceneFor(player.location);
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
      '<div class="modal-head"><h2 class="section-title">'+(sc&&sc.learnTitle?sc.learnTitle:"学艺")+'</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">可学列表来自 LOCAL_SKILLS，结算走 learnSkill。</p>'+
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
    var sc=sceneFor(player.location);
    var here=typeof getMapById==="function"?getMapById(player.location):null;
    var neigh=(here&&here.neighbors)||[];
    var moves=neigh.map(function(id){
      var m=getMapById(id);
      return '<button class="btn sm primary scene-move" data-id="'+id+'">'+(m?m.name:id)+'</button>';
    }).join("");
    var cityBtn="";
    if(typeof getParentCityId==="function"&&typeof enterCity==="function"){
      var pid=getParentCityId(player.location);
      if(pid&&pid!==player.location){
        var c=typeof WORLD_CITIES!=="undefined"?WORLD_CITIES[pid]:null;
        cityBtn='<button class="btn primary" id="sceneEnterCity">入城·'+(c&&c.short?c.short:pid)+'</button>';
      }
    }
    openModal(
      '<div class="modal-head"><h2 class="section-title">'+(sc&&sc.exitTitle?sc.exitTitle:"去向")+'</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">赶路仍用现有移动 / 州府逻辑。</p>'+
      (cityBtn?'<div class="row" style="margin-bottom:8px">'+cityBtn+'</div>':"")+
      (moves?'<div class="row">'+moves+'</div>':'<p class="small">无邻接可去。</p>')
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

  function openCitySpots(player){
    var c=typeof WORLD_CITIES!=="undefined"?WORLD_CITIES[player.location]:null;
    var kids=(c&&c.children)||[];
    if(!kids.length){
      openModal(
        '<div class="modal-head"><h2 class="section-title">下辖江湖</h2><button class="modal-close" id="mClose">关闭</button></div>'+
        '<p class="small">本城暂无线索。</p>'
      );
      qs("#mClose").onclick=closeModal;
      return;
    }
    var rows=kids.map(function(id){
      var m=typeof getMapById==="function"?getMapById(id):null;
      return '<button class="btn sm primary scene-spot" data-id="'+id+'">'+(m?m.name:id)+(m&&m.type?(" · "+m.type):"")+'</button>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">出城·下辖</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">出城走 leaveCityToSpot。</p>'+
      '<div class="row" style="flex-direction:column;align-items:stretch;gap:6px">'+rows+'</div>'
    );
    qs("#mClose").onclick=closeModal;
    qsa(".scene-spot").forEach(function(el){
      el.onclick=function(){
        var r=typeof leaveCityToSpot==="function"?leaveCityToSpot(player,el.dataset.id):{ok:false,msg:"无法出城"};
        if(!r.ok)player.logs.unshift(r.msg||"无法出城");
        if(typeof saveGame==="function")saveGame(state);
        closeModal();
        renderGame();
      };
    });
  }

  function openCityTravel(player){
    if(typeof getCityNeighbors!=="function"&&typeof CITY_EDGES==="undefined"){
      player.logs.unshift("长途系统未就绪。");
      if(typeof saveGame==="function")saveGame(state);
      renderGame();
      return;
    }
    var neigh=[];
    if(typeof CITY_EDGES!=="undefined"){
      CITY_EDGES.forEach(function(e){
        if(e.from===player.location)neigh.push({id:e.to,cost:e.cost,kind:e.kind,label:e.label,req:e.req});
        else if(e.to===player.location)neigh.push({id:e.from,cost:e.cost,kind:e.kind,label:e.label,req:e.req});
      });
    }
    function kindLabel(k){if(k==="canal")return"漕运";if(k==="river")return"江路";if(k==="sea")return"海路";return"官道";}
    var rows=neigh.map(function(n){
      var dest=typeof WORLD_CITIES!=="undefined"?WORLD_CITIES[n.id]:null;
      var lab=dest?dest.short:n.id;
      var fee=n.req&&n.req.silver?("·资"+n.req.silver):"";
      return '<button class="btn sm primary scene-travel" data-id="'+n.id+'">赴'+lab+'（'+n.cost+'程·'+kindLabel(n.kind)+fee+')</button>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">长途官道</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">城际 travelCity，耗时更长。</p>'+
      (rows?'<div class="row" style="flex-direction:column;align-items:stretch;gap:6px">'+rows+'</div>':'<p class="small">无直达邻城。</p>')
    );
    qs("#mClose").onclick=closeModal;
    qsa(".scene-travel").forEach(function(el){
      el.onclick=function(){
        var r=typeof travelCity==="function"?travelCity(player,el.dataset.id):{ok:false,msg:"无法赶路"};
        if(!r.ok)player.logs.unshift(r.msg||"无法赶路");
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
          '<span class="small">'+sc.title+' · 点热区</span>'+
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
    if(tog)tog.onclick=function(){document.body.classList.toggle("scene-compact");};
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
    locPanel.insertBefore(node,locPanel.firstChild);
    bindScene(player);
  }

  if(!document.getElementById("scene-view-style")){
    var st=document.createElement("style");
    st.id="scene-view-style";
    st.textContent=[
      ".scene-wrap{margin:0 0 8px}",
      ".scene-stage{position:relative;width:100%;border:3px solid;border-color:#3a2a1c #1a120c #1a120c #3a2a1c;",
      "  box-shadow:4px 4px 0 #0a0806;background:#0e0c0a;overflow:hidden;aspect-ratio:16/9}",
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
      "body.scene-compact .pixel-map,body.scene-compact .xmap-wrap{display:none}",
      "body.scene-compact .panel .row.compact-block{opacity:.85}"
    ].join("\n");
    document.head.appendChild(st);
  }

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
