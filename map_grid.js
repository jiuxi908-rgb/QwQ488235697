/* X交叉地图 · 45°菱形布局 · 斜向路径 · 迷雾 */
(function(){

  var X_MAP = {
    nodes: {
      "0,0": { id: "mist_gate", name: "烟岚山门", type: "门派", icon: "⛰️" },
      "0,1": { id: "qinghe", name: "清河镇", type: "城镇", icon: "🏘️" },
      "0,2": { id: "ferry", name: "白沙渡", type: "渡口", icon: "⛵" },
      "0,3": { id: "hearth", name: "赤炉山庄", type: "门派", icon: "🔥" },
      "1,0": { id: "bamboo", name: "听雨竹径", type: "野外", icon: "🎋" },
      "1,1": { id: "market", name: "旧瓦市", type: "城镇", icon: "🏪" },
      "1,2": { id: "whale_port", name: "玄鲸港", type: "门派", icon: "⚓" },
      "1,3": { id: "salt_road", name: "黑盐古道", type: "野外", icon: "🗡️" },
      "2,0": { id: "herb_valley", name: "回春谷", type: "门派", icon: "🌿" },
      "2,1": { id: "sparrow_den", name: "白雀楼", type: "门派", icon: "🕊️" },
      "2,2": { id: "secret_cave", name: "影窟", type: "秘境", icon: "🕳️" },
      "2,3": { id: "secret_reef", name: "沉沙暗礁", type: "秘境", icon: "🌊" },
      "3,0": { id: "void_temple", name: "无相寺", type: "门派", icon: "🏯" },
      "3,1": { id: "cloud_peak", name: "云岚绝顶", type: "秘境", icon: "☁️" },
      "3,2": { id: "blood_ravine", name: "血石峡谷", type: "野外", icon: "💀" }
    },
    edges: {
      "0,1-0,0": { cost: 1 },
      "0,1-0,2": { cost: 1 },
      "0,1-1,0": { cost: 1 },
      "0,1-1,1": { cost: 1 },
      "0,0-1,0": { cost: 1 },
      "0,0-0,3": { cost: 1 },
      "0,2-1,1": { cost: 1 },
      "0,2-1,2": { cost: 1 },
      "0,2-0,3": { cost: 1 },
      "0,3-1,2": { cost: 1 },
      "0,3-1,3": { cost: 1 },
      "1,0-1,1": { cost: 1 },
      "1,0-2,0": { cost: 1 },
      "1,1-1,2": { cost: 1 },
      "1,1-2,0": { cost: 1 },
      "1,1-2,1": { cost: 1 },
      "1,2-1,3": { cost: 1 },
      "1,2-2,1": { cost: 1 },
      "1,2-2,2": { cost: 1 },
      "1,2-2,3": { cost: 1 },
      "1,3-2,2": { cost: 1 },
      "1,3-2,3": { cost: 1 },
      "2,0-2,1": { cost: 1 },
      "2,0-3,0": { cost: 1 },
      "2,1-2,2": { cost: 1 },
      "2,1-3,0": { cost: 1 },
      "2,1-3,1": { cost: 1 },
      "2,2-2,3": { cost: 1 },
      "2,2-3,1": { cost: 1 },
      "2,2-3,2": { cost: 1 },
      "2,3-3,2": { cost: 1 },
      "3,0-3,1": { cost: 1 },
      "3,1-3,2": { cost: 1 }
    },
    special_paths: {
      "1,2-2,2": { req: { agi: 8 }, msg: "暗道幽深，需身法≥8" },
      "1,2-2,3": { req: { qi: 8 }, msg: "暗礁密布，需内力≥8" },
      "2,1-3,1": { req: { wit: 10 }, msg: "云路迷踪，需悟性≥10" },
      "3,1-3,2": { req: { arm: 12 }, msg: "血谷凶险，需臂力≥12" },
      "1,3-2,2": { req: { agi: 10 }, msg: "盐道危机，需身法≥10" },
      "2,2-3,2": { req: { arm: 10 }, msg: "血风扑面，需臂力≥10" }
    },
    rows: 4,
    cols: 4
  };

  window.X_MAP = X_MAP;

  /* id -> key */
  var idToKey = {};
  Object.keys(X_MAP.nodes).forEach(function(k){
    idToKey[X_MAP.nodes[k].id] = k;
  });

  function edgeLookup(a, b){
    return X_MAP.edges[a+"-"+b] || X_MAP.edges[b+"-"+a] || null;
  }
  function specialLookup(a, b){
    return X_MAP.special_paths[a+"-"+b] || X_MAP.special_paths[b+"-"+a] || null;
  }

  function getNeighborsX(row, col){
    var dirs = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
    var result = [];
    var from = row+","+col;
    for(var i=0;i<dirs.length;i++){
      var nr=row+dirs[i][0], nc=col+dirs[i][1];
      var key=nr+","+nc;
      if(!X_MAP.nodes[key])continue;
      var edge=edgeLookup(from, key);
      if(!edge)continue;
      result.push({
        key:key,
        node:X_MAP.nodes[key],
        edge:edge,
        isSpecial:!!specialLookup(from, key)
      });
    }
    return result;
  }

  function ensurePos(player){
    if(player.mapRow==null||player.mapCol==null){
      var k=idToKey[player.location]||"0,1";
      var p=k.split(",");
      player.mapRow=+p[0];
      player.mapCol=+p[1];
    }
    if(!player.exploredList){
      /* 兼容旧 explored 对象与新数组 */
      if(Array.isArray(player.explored)){
        player.exploredList=player.explored.slice();
      }else if(player.explored&&typeof player.explored==="object"){
        player.exploredList=[];
        Object.keys(player.explored).forEach(function(key){
          var n=X_MAP.nodes[key];
          if(n&&player.exploredList.indexOf(n.id)<0)player.exploredList.push(n.id);
        });
      }else{
        player.exploredList=[];
      }
    }
    if(player.exploredList.indexOf(player.location)<0){
      player.exploredList.push(player.location);
    }
  }

  function isExplored(player, nodeId){
    ensurePos(player);
    return player.exploredList.indexOf(nodeId)>=0;
  }

  function canMoveX(player, fromKey, toKey){
    var parts=fromKey.split(",");
    var neighbors=getNeighborsX(+parts[0], +parts[1]);
    var target=null;
    for(var i=0;i<neighbors.length;i++){
      if(neighbors[i].key===toKey){target=neighbors[i];break;}
    }
    if(!target)return{ok:false,msg:"无路可通"};
    var special=specialLookup(fromKey, toKey);
    if(special&&special.req){
      var keys=Object.keys(special.req);
      for(var j=0;j<keys.length;j++){
        var st=keys[j],val=special.req[st];
        if((player.stats[st]||0)<val){
          return{ok:false,msg:special.msg||(((typeof STAT_LABELS!=="undefined"&&STAT_LABELS[st])?STAT_LABELS[st]:st)+"不足")};
        }
      }
    }
    if(special&&special.blocked){
      return{ok:false,msg:special.blockedMsg||"此路不通"};
    }
    return{ok:true,edge:target.edge,special:special};
  }

  function triggerArrival(player, locId){
    var mapObj=typeof getMapById==="function"?getMapById(locId):null;
    if(mapObj&&mapObj.events&&mapObj.events.length){
      return mapObj.events[Math.floor(Math.random()*mapObj.events.length)];
    }
    return "";
  }

  window.moveToX=function(player, targetKey){
    ensurePos(player);
    var current=player.mapRow+","+player.mapCol;
    var check=canMoveX(player, current, targetKey);
    if(!check.ok)return check;

    var parts=targetKey.split(",");
    player.mapRow=+parts[0];
    player.mapCol=+parts[1];
    var node=X_MAP.nodes[targetKey];
    if(!node)return{ok:false,msg:"无效地点"};
    player.location=node.id;

    if(player.exploredList.indexOf(node.id)<0)player.exploredList.push(node.id);

    var cost=(check.edge&&check.edge.cost)||1;
    if(typeof advanceTime==="function"){
      for(var t=0;t<cost;t++)advanceTime(player,1);
    }else{
      player.day=(player.day||1)+Math.max(0,cost-1);
    }

    var arrival=triggerArrival(player, node.id);
    var msg="第"+(player.day||1)+"日，抵达【"+node.name+"】"+(arrival?("。"+arrival):"。");
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg,cost:cost};
  };

  /* 覆盖 movePlayer：按地点 id 走 X 图 */
  var _movePlayer=typeof movePlayer==="function"?movePlayer:null;
  window.movePlayer=function(player, locId){
    ensurePos(player);
    var targetKey=idToKey[locId];
    if(!targetKey){
      return _movePlayer?_movePlayer(player,locId):{ok:false,msg:"未知地点"};
    }
    return moveToX(player, targetKey);
  };

  function getScreenPos(row, col, cellW, cellH, offsetX){
    /* 45° 菱形：行偏移半格，纵向压缩 */
    var x = col * cellW + (row % 2) * (cellW * 0.5) + offsetX;
    var y = row * (cellH * 0.72) + 28;
    return { x: x, y: y };
  }

  function isReachableX(player, row, col){
    ensurePos(player);
    var current=player.mapRow+","+player.mapCol;
    var target=row+","+col;
    if(current===target)return true;
    var neighbors=getNeighborsX(player.mapRow, player.mapCol);
    for(var i=0;i<neighbors.length;i++){
      if(neighbors[i].key===target)return true;
    }
    return false;
  }

  window.renderXMap=function(player){
    ensurePos(player);
    var rows=X_MAP.rows, cols=X_MAP.cols;
    var cellW=100, cellH=64, offsetX=36;
    var width=cols*cellW+offsetX+40;
    var height=rows*cellH*0.72+80;

    var lines=[];
    Object.keys(X_MAP.edges).forEach(function(edgeKey){
      var pair=edgeKey.split("-");
      if(pair.length!==2)return;
      var a=pair[0].split(",").map(Number);
      var b=pair[1].split(",").map(Number);
      var p1=getScreenPos(a[0],a[1],cellW,cellH,offsetX);
      var p2=getScreenPos(b[0],b[1],cellW,cellH,offsetX);
      var isSpecial=!!specialLookup(pair[0],pair[1]);
      lines.push(
        '<line x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'" '+
        'stroke="'+(isSpecial?"#d9ad62":"#5a4a3a")+'" stroke-width="'+(isSpecial?2.5:1.5)+'" '+
        (isSpecial?'stroke-dasharray="6 4" class="path-special"':'')+' opacity="0.85"/>'
      );
    });

    var nodesHtml=[];
    Object.keys(X_MAP.nodes).forEach(function(key){
      var node=X_MAP.nodes[key];
      var rc=key.split(",").map(Number);
      var pos=getScreenPos(rc[0],rc[1],cellW,cellH,offsetX);
      var current=player.mapRow===rc[0]&&player.mapCol===rc[1];
      var explored=isExplored(player, node.id);
      var reachable=isReachableX(player, rc[0], rc[1]);

      var cls="xmap-node";
      if(current)cls+=" current";
      else if(reachable)cls+=" reachable";
      if(explored)cls+=" explored";
      if(!explored&&!current)cls+=" hidden";

      var displayName=(explored||current)?node.name:"???";
      var displayIcon=(explored||current)?node.icon:"❓";
      var clickable=current||reachable;

      nodesHtml.push(
        '<div class="'+cls+'" style="left:'+(pos.x-34)+'px;top:'+(pos.y-28)+'px" '+
        'data-key="'+key+'" data-id="'+node.id+'" '+(clickable?'role="button"':'')+'>'+
        '<div class="node-icon">'+displayIcon+'</div>'+
        '<div class="node-name">'+displayName+'</div>'+
        (current?'<div class="node-marker">▼</div>':'')+
        (reachable&&!current?'<div class="node-glow"></div>':'')+
        '</div>'
      );
    });

    return (
      '<div class="xmap-wrap">'+
        '<div class="xmap-legend">'+
          '<span class="lg cur">当前位置</span>'+
          '<span class="lg reach">可前往</span>'+
          '<span class="lg fog">未探索</span>'+
          '<span class="lg special">险路</span>'+
        '</div>'+
        '<div class="xmap-container" style="width:'+width+'px;height:'+height+'px">'+
          '<svg class="xmap-paths" width="'+width+'" height="'+height+'">'+lines.join("")+'</svg>'+
          nodesHtml.join("")+
        '</div>'+
      '</div>'
    );
  };

  /* 样式 */
  if(!document.getElementById("xmap-style")){
    var st=document.createElement("style");
    st.id="xmap-style";
    st.textContent=[
      ".xmap-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:4px 0 8px}",
      ".xmap-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:10px;color:#b9a58a;margin-bottom:4px}",
      ".xmap-legend .lg::before{content:'';display:inline-block;width:8px;height:8px;margin-right:3px;border:1px solid #4b3a2d;vertical-align:middle}",
      ".xmap-legend .cur::before{background:#34271e;border-color:#d9ad62}",
      ".xmap-legend .reach::before{background:#1e2a1a;border-color:#7aae6a}",
      ".xmap-legend .fog::before{background:#120e0a}",
      ".xmap-legend .special::before{background:transparent;border-color:#d9ad62;border-style:dashed}",
      ".xmap-container{position:relative;background:radial-gradient(ellipse at 40% 30%,#1a241a,#0d120d 70%);",
      "  border:1px solid #4b3a2d;border-radius:12px;overflow:hidden;margin:0 auto}",
      ".xmap-paths{position:absolute;left:0;top:0;pointer-events:none;z-index:1}",
      ".xmap-node{position:absolute;width:68px;height:56px;display:flex;flex-direction:column;",
      "  align-items:center;justify-content:center;border-radius:10px;border:2px solid #4b3a2d;",
      "  background:rgba(26,22,18,.9);text-align:center;font-size:10px;padding:4px 2px;z-index:2;",
      "  transition:transform .15s,border-color .15s,box-shadow .15s;user-select:none}",
      ".xmap-node .node-icon{font-size:18px;line-height:1.15}",
      ".xmap-node .node-name{font-size:9px;color:#b9a58a;margin-top:1px;max-width:64px;",
      "  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".xmap-node .node-marker{position:absolute;top:-12px;color:#d9ad62;font-size:10px;animation:bob .8s ease-in-out infinite}",
      "@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}",
      ".xmap-node.current{border-color:#d9ad62;box-shadow:0 0 16px rgba(217,173,98,.45);background:rgba(48,38,28,.95)}",
      ".xmap-node.current .node-name{color:#d9ad62;font-weight:700}",
      ".xmap-node.explored{border-color:#5a6a4a}",
      ".xmap-node.reachable{border-color:#7aae6a;cursor:pointer;box-shadow:0 0 8px rgba(122,174,106,.25)}",
      ".xmap-node.reachable:active,.xmap-node.reachable:hover{border-color:#d9ad62;transform:scale(1.06)}",
      ".xmap-node.hidden{border-color:#2a2218;background:rgba(14,12,10,.85)}",
      ".xmap-node.hidden .node-name{color:#4a3a2a}",
      ".xmap-node .node-glow{position:absolute;width:72px;height:72px;border-radius:50%;",
      "  background:rgba(122,174,106,.12);animation:pulse-glow 2s infinite;z-index:-1;pointer-events:none}",
      "@keyframes pulse-glow{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.25);opacity:.6}}",
      ".path-special{animation:dash-flow 1.2s linear infinite}",
      "@keyframes dash-flow{to{stroke-dashoffset:-20}}",
      "@media(max-width:600px){",
      "  .xmap-node{width:56px;height:48px}",
      "  .xmap-node .node-icon{font-size:15px}",
      "  .xmap-node .node-name{font-size:8px}",
      "}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* 替换主界面地图 */
  var _rg=typeof renderGame==="function"?renderGame:null;
  if(_rg){
    window.renderGame=function(){
      if(state&&state.player)ensurePos(state.player);
      _rg();
      var p=state&&state.player;if(!p)return;
      var old=document.querySelector(".pixel-map");
      if(!old){
        /* 可能已被上次替换 */
        var exist=document.querySelector(".xmap-wrap");
        if(exist){
          var parent=exist.parentNode;
          var holder=document.createElement("div");
          holder.innerHTML=renderXMap(p);
          parent.replaceChild(holder.firstChild, exist);
          bindClicks(parent.querySelector(".xmap-wrap")||holder, p);
        }
        return;
      }
      var holder=document.createElement("div");
      holder.innerHTML=renderXMap(p);
      var node=holder.firstChild;
      old.replaceWith(node);
      bindClicks(node, p);
    };
  }

  function bindClicks(root, p){
    if(!root)return;
    root.querySelectorAll(".xmap-node.reachable").forEach(function(el){
      el.onclick=function(){
        var r=moveToX(p, el.dataset.key);
        if(!r.ok)p.logs.unshift(r.msg);
        if(typeof saveGame==="function")saveGame(state);
        renderGame();
      };
    });
  }

  /* 兼容旧网格 API，避免其他脚本报错 */
  window.WORLD_MAP=window.WORLD_MAP||null;
  window.renderGridMap=function(player){return renderXMap(player);};
  window.moveToGrid=function(player,key){return moveToX(player,key);};

  if(typeof Game!=="undefined"&&Game.on){
    Game.on("player:ensure", function(p){
      ensurePos(p);
    });
  }

})();
