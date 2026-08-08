/* 网状地图 · 坐标网格 · 迷雾 · 路径 */
(function(){

  function buildWorldMap(){
    if(typeof maps==="undefined"||!maps.length)return null;
    var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    maps.forEach(function(m){
      if(m.x==null||m.y==null)return;
      if(m.x<minX)minX=m.x;if(m.x>maxX)maxX=m.x;
      if(m.y<minY)minY=m.y;if(m.y>maxY)maxY=m.y;
    });
    /* 四周留一圈空白雾 */
    minX-=1;maxX+=1;minY-=1;maxY+=1;
    var width=maxX-minX+1;
    var height=maxY-minY+1;
    var nodes={};
    var paths={};
    var idToKey={};

    maps.forEach(function(m){
      if(m.x==null||m.y==null)return;
      var gx=m.x-minX, gy=m.y-minY;
      var key=gx+","+gy;
      idToKey[m.id]=key;
      nodes[key]={
        id:m.id,
        name:m.name,
        type:m.type,
        icon:iconFor(m),
        explored:false,
        ox:m.x,oy:m.y,
        gx:gx,gy:gy
      };
    });

    maps.forEach(function(m){
      var from=idToKey[m.id];
      if(!from)return;
      (m.neighbors||[]).forEach(function(nid){
        var to=idToKey[nid];
        if(!to)return;
        var pathKey=[from,to].sort().join("-");
        if(paths[pathKey])return;
        paths[pathKey]=makePath(m, getMapById?getMapById(nid):null);
      });
    });

    return{
      width:width,height:height,
      minX:minX,minY:minY,
      nodes:nodes,paths:paths,idToKey:idToKey
    };
  }

  function iconFor(m){
    if(m.sect)return"⚔";
    if(m.type==="城镇")return"🏘";
    if(m.type==="渡口")return"⛵";
    if(m.type==="秘境")return"✧";
    if(m.type==="野外")return"🌲";
    if(m.type==="门派")return"⚔";
    return"·";
  }

  function makePath(a,b){
    var cost=1;
    var req=null;
    var hardTypes={秘境:1,野外:1};
    if(a&&hardTypes[a.type])cost=2;
    if(b&&hardTypes[b.type])cost=Math.max(cost,2);
    if(a&&a.id==="blood_ravine"||b&&b.id==="blood_ravine"){
      cost=2;req={arm:8};
    }
    if(a&&a.id==="cloud_peak"||b&&b.id==="cloud_peak"){
      cost=2;req={agi:8};
    }
    if(a&&a.id==="secret_reef"||b&&b.id==="secret_reef"){
      cost=2;req={qi:8};
    }
    if(a&&a.id==="secret_cave"||b&&b.id==="secret_cave"){
      cost=2;req={agi:10};
    }
    if(a&&a.id==="void_temple"||b&&b.id==="void_temple"){
      cost=2;req={wit:8};
    }
    return{cost:cost,req:req};
  }

  window.WORLD_MAP=buildWorldMap();

  function ensureMapPos(player){
    if(!WORLD_MAP)return;
    if(!player.explored)player.explored={};
    var key=WORLD_MAP.idToKey[player.location];
    if(key){
      var parts=key.split(",");
      player.mapX=parseInt(parts[0],10);
      player.mapY=parseInt(parts[1],10);
      if(WORLD_MAP.nodes[key]){
        WORLD_MAP.nodes[key].explored=true;
        player.explored[key]=true;
      }
    }else if(player.mapX==null){
      player.mapX=0;player.mapY=0;
    }
    /* 恢复存档中的探索状态 */
    Object.keys(player.explored||{}).forEach(function(k){
      if(WORLD_MAP.nodes[k])WORLD_MAP.nodes[k].explored=true;
    });
  }

  function isNeighbor(x,y,px,py){
    return Math.abs(x-px)+Math.abs(y-py)===1;
  }

  window.getNeighbors=function(pos){
    if(!WORLD_MAP)return[];
    var parts=String(pos).split(",");
    var x=+parts[0],y=+parts[1];
    var dirs=[[0,-1],[0,1],[-1,0],[1,0]];
    var result=[];
    for(var i=0;i<dirs.length;i++){
      var key=(x+dirs[i][0])+","+(y+dirs[i][1]);
      if(WORLD_MAP.nodes[key])result.push(Object.assign({key:key},WORLD_MAP.nodes[key]));
    }
    return result;
  };

  window.moveToGrid=function(player,targetKey){
    if(!WORLD_MAP)return{ok:false,msg:"地图未就绪"};
    ensureMapPos(player);
    var current=player.mapX+","+player.mapY;
    var neighbors=getNeighbors(current);
    var target=null;
    for(var i=0;i<neighbors.length;i++){
      if(neighbors[i].key===targetKey){target=neighbors[i];break;}
    }
    if(!target)return{ok:false,msg:"无法到达（仅可移动至相邻已连通之地）"};

    var pathKey=[current,targetKey].sort().join("-");
    var path=WORLD_MAP.paths[pathKey]||{cost:1};
    if(path.req){
      var keys=Object.keys(path.req);
      for(var j=0;j<keys.length;j++){
        var stat=keys[j],val=path.req[stat];
        if((player.stats[stat]||0)<val){
          var lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[stat])?STAT_LABELS[stat]:stat;
          return{ok:false,msg:"此路难行，需"+lab+"≥"+val};
        }
      }
    }

    var parts=targetKey.split(",");
    player.mapX=parseInt(parts[0],10);
    player.mapY=parseInt(parts[1],10);
    player.location=target.id;
    WORLD_MAP.nodes[targetKey].explored=true;
    if(!player.explored)player.explored={};
    player.explored[targetKey]=true;

    /* 到达文案 */
    var mapObj=typeof getMapById==="function"?getMapById(target.id):null;
    var arrive=mapObj&&mapObj.events&&mapObj.events.length
      ?mapObj.events[Math.floor(Math.random()*mapObj.events.length)]
      :"";
    var cost=path.cost||1;
    if(typeof advanceTime==="function"){
      for(var t=0;t<cost;t++)advanceTime(player,1);
    }else{
      player.day=(player.day||1)+Math.max(0,cost-1);
    }
    var msg="第"+(player.day||1)+"日，抵达【"+target.name+"】"+(arrive?("。"+arrive):"。");
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  };

  /* 覆盖原 movePlayer：优先网格邻接 */
  var _movePlayer=typeof movePlayer==="function"?movePlayer:null;
  window.movePlayer=function(player,locId){
    if(!WORLD_MAP||!WORLD_MAP.idToKey){
      return _movePlayer?_movePlayer(player,locId):{ok:false,msg:"无法移动"};
    }
    ensureMapPos(player);
    var targetKey=WORLD_MAP.idToKey[locId];
    if(!targetKey)return{ok:false,msg:"未知地点"};
    /* 若目标是当前邻接网格，走网格；否则检查是否在旧 neighbors 列表中作为后备 */
    var current=player.mapX+","+player.mapY;
    var neigh=getNeighbors(current);
    var ok=false;
    for(var i=0;i<neigh.length;i++){
      if(neigh[i].key===targetKey){ok=true;break;}
    }
    if(ok)return moveToGrid(player,targetKey);
    /* 非正交相邻但旧数据有连线：仍允许（兼容斜向） */
    var curNode=WORLD_MAP.nodes[current];
    if(curNode){
      var m=typeof getMapById==="function"?getMapById(curNode.id):null;
      if(m&&(m.neighbors||[]).indexOf(locId)>=0){
        return moveToGridForce(player,targetKey);
      }
    }
    return{ok:false,msg:"路途未通，请先探索相邻之地"};
  };

  function moveToGridForce(player,targetKey){
    var node=WORLD_MAP.nodes[targetKey];
    if(!node)return{ok:false,msg:"无效目标"};
    var current=player.mapX+","+player.mapY;
    var pathKey=[current,targetKey].sort().join("-");
    var path=WORLD_MAP.paths[pathKey]||{cost:1};
    if(path.req){
      var keys=Object.keys(path.req);
      for(var j=0;j<keys.length;j++){
        var stat=keys[j],val=path.req[stat];
        if((player.stats[stat]||0)<val){
          var lab=(typeof STAT_LABELS!=="undefined"&&STAT_LABELS[stat])?STAT_LABELS[stat]:stat;
          return{ok:false,msg:"此路难行，需"+lab+"≥"+val};
        }
      }
    }
    var parts=targetKey.split(",");
    player.mapX=+parts[0];player.mapY=+parts[1];
    player.location=node.id;
    node.explored=true;
    if(!player.explored)player.explored={};
    player.explored[targetKey]=true;
    var cost=path.cost||1;
    if(typeof advanceTime==="function"){
      for(var t=0;t<cost;t++)advanceTime(player,1);
    }
    var msg="第"+(player.day||1)+"日，抵达【"+node.name+"】。";
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  }

  window.renderGridMap=function(player){
    if(!WORLD_MAP)return"<p class=\"small\">地图加载中</p>";
    ensureMapPos(player);
    var html=[];
    html.push('<div class="grid-map" style="grid-template-columns:repeat('+WORLD_MAP.width+',minmax(0,1fr))">');
    for(var y=0;y<WORLD_MAP.height;y++){
      for(var x=0;x<WORLD_MAP.width;x++){
        var key=x+","+y;
        var node=WORLD_MAP.nodes[key];
        var current=player.mapX===x&&player.mapY===y;
        var explored=node&&(node.explored||(player.explored&&player.explored[key]));
        var neighbor=isNeighbor(x,y,player.mapX,player.mapY);
        var reachable=neighbor&&node&&(explored||true);

        var cls="map-cell";
        if(current)cls+=" current";
        if(node&&explored)cls+=" explored";
        if(node&&neighbor)cls+=" reachable";
        if(!node)cls+=" empty";
        if(node&&!explored&&!current)cls+=" hidden";
        if(!node)cls+=" void";

        var inner="";
        if(current){
          inner='<span class="icon">'+((node&&node.icon)||"◎")+'</span><span class="name">'+(node?node.name:"")+'</span>';
        }else if(node&&explored){
          inner='<span class="icon">'+node.icon+'</span><span class="name">'+node.name+'</span>';
        }else if(node){
          inner='<span class="fog">?</span>';
        }else{
          inner='<span class="fog dim">·</span>';
        }
        var clickable=node&&(current||neighbor);
        html.push('<div class="'+cls+'" data-key="'+key+'" data-id="'+(node?node.id:"")+'" '+(clickable?'role="button"':'')+'>'+inner+'</div>');
      }
    }
    html.push("</div>");
    return html.join("");
  };

  /* 注入网格地图样式 */
  if(!document.getElementById("map-grid-style")){
    var st=document.createElement("style");
    st.id="map-grid-style";
    st.textContent=[
      ".grid-map{display:grid;gap:3px;margin:6px 0}",
      ".map-cell{min-height:44px;border:2px solid #2a2018;background:#120f0d;padding:3px 2px;",
      "  text-align:center;font-size:9px;line-height:1.2;display:flex;flex-direction:column;",
      "  align-items:center;justify-content:center;image-rendering:pixelated;user-select:none}",
      ".map-cell .icon{font-size:12px;line-height:1.1}",
      ".map-cell .name{color:#c4b08a;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".map-cell .fog{color:#4b3a2d;font-size:14px;font-weight:700}",
      ".map-cell .fog.dim{opacity:.35;font-size:10px}",
      ".map-cell.explored{background:#1a1512;border-color:#4b3a2d}",
      ".map-cell.reachable{border-color:#8a6a45;background:#221c16;cursor:pointer;box-shadow:0 0 0 1px rgba(217,173,98,.15)}",
      ".map-cell.reachable:active{background:#34271e}",
      ".map-cell.current{border-color:#d9ad62;background:#34271e;box-shadow:0 0 0 2px rgba(217,173,98,.35)}",
      ".map-cell.hidden{background:#0a0806;border-color:#1a120c;cursor:default}",
      ".map-cell.void,.map-cell.empty{background:#0a0806;border-color:#0a0806;opacity:.5}",
      ".map-legend{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0;font-size:10px;color:#b9a58a}",
      ".map-legend span{display:inline-flex;align-items:center;gap:3px}",
      ".map-legend i{display:inline-block;width:10px;height:10px;border:1px solid #4b3a2d}",
      ".map-legend i.cur{background:#34271e;border-color:#d9ad62}",
      ".map-legend i.reach{background:#221c16;border-color:#8a6a45}",
      ".map-legend i.fog{background:#0a0806}",
      "@media(max-width:600px){.map-cell{min-height:38px;font-size:8px}.map-cell .icon{font-size:11px}}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* 替换主界面地图区域 */
  var _rg=renderGame;
  window.renderGame=function(){
    if(state&&state.player)ensureMapPos(state.player);
    _rg();
    var p=state&&state.player;if(!p||!WORLD_MAP)return;
    var panel=document.querySelector(".pixel-map");
    if(!panel)return;
    var wrap=panel.parentNode;
    if(!wrap)return;
    /* 用网格地图替换旧 pixel-map */
    var legend='<div class="map-legend">'+
      '<span><i class="cur"></i>当前位置</span>'+
      '<span><i class="reach"></i>可前往</span>'+
      '<span><i class="fog"></i>未探索</span>'+
      '</div>';
    var grid=renderGridMap(p);
    var holder=document.createElement("div");
    holder.innerHTML=legend+grid;
    panel.replaceWith(holder);

    /* 点击可达格移动 */
    holder.querySelectorAll(".map-cell.reachable").forEach(function(el){
      el.onclick=function(){
        var key=el.dataset.key;
        var r=moveToGrid(p,key);
        if(!r.ok){
          p.logs.unshift(r.msg);
        }
        if(typeof saveGame==="function")saveGame(state);
        renderGame();
      };
    });
    /* 当前格：显示详情提示 */
    holder.querySelectorAll(".map-cell.current").forEach(function(el){
      el.title="你在此处";
    });
  };

  /* 新游戏时初始化坐标 */
  var _cp=typeof createPlayer==="function"?createPlayer:null;
  if(_cp){
    window.createPlayer=function(opts){
      var p=_cp(opts);
      ensureMapPos(p);
      return p;
    };
  }

})();
