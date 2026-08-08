/**
 * X 型网状地图
 * - 菱形网格 (row,col)
 * - 仅斜向：左上/右上/左下/右下
 * - 迷雾探索 · 路径条件 · TIME_COST.move
 */
(function(){

  var DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];

  var X_MAP = {
    rows: 4,
    cols: 4,
    nodes: {
      "0,0": { id:"mist_gate",   name:"烟岚山门", type:"门派", icon:"⛰️" },
      "0,1": { id:"qinghe",      name:"清河镇",   type:"城镇", icon:"🏘️" },
      "0,2": { id:"ferry",       name:"白沙渡",   type:"渡口", icon:"⛵" },
      "0,3": { id:"hearth",      name:"赤炉山庄", type:"门派", icon:"🔥" },
      "1,0": { id:"bamboo",      name:"听雨竹径", type:"野外", icon:"🎋" },
      "1,1": { id:"market",      name:"旧瓦市",   type:"城镇", icon:"🏪" },
      "1,2": { id:"whale_port",  name:"玄鲸港",   type:"门派", icon:"⚓" },
      "1,3": { id:"salt_road",   name:"黑盐古道", type:"野外", icon:"🗡️" },
      "2,0": { id:"herb_valley", name:"回春谷",   type:"门派", icon:"🌿" },
      "2,1": { id:"sparrow_den", name:"白雀楼",   type:"门派", icon:"🕊️" },
      "2,2": { id:"secret_cave", name:"影窟",     type:"秘境", icon:"🕳️" },
      "2,3": { id:"secret_reef", name:"沉沙暗礁", type:"秘境", icon:"🌊" },
      "3,0": { id:"void_temple", name:"无相寺",   type:"门派", icon:"🏯" },
      "3,1": { id:"cloud_peak",  name:"云岚绝顶", type:"秘境", icon:"☁️" },
      "3,2": { id:"blood_ravine",name:"血石峡谷", type:"野外", icon:"💀" }
    },
    /* 仅斜向边 key 规范为 min-max 字典序，写入时统一 */
    edges: {},
    special: {}
  };

  function edgeKey(a, b){
    return a < b ? a+"-"+b : b+"-"+a;
  }

  function addEdge(a, b, cost){
    if(!X_MAP.nodes[a]||!X_MAP.nodes[b])return;
    X_MAP.edges[edgeKey(a,b)] = { cost: cost||1 };
  }
  function addSpecial(a, b, conf){
    X_MAP.special[edgeKey(a,b)] = conf;
  }

  /* 纯斜向连通（保证清河可辐射全图） */
  [
    ["0,1","1,0"],["0,1","1,2"],
    ["0,0","1,1"],
    ["0,2","1,1"],["0,2","1,3"],
    ["0,3","1,2"],
    ["1,0","2,1"],
    ["1,1","2,0"],["1,1","2,2"],
    ["1,2","2,1"],["1,2","2,3"],
    ["1,3","2,2"],
    ["2,0","3,1"],
    ["2,1","3,0"],["2,1","3,2"],
    ["2,2","3,1"],
    ["2,3","3,2"]
  ].forEach(function(p){ addEdge(p[0],p[1],1); });

  addSpecial("1,2","2,3", { req:{qi:8}, msg:"暗礁密布，需内力≥8" });
  addSpecial("1,1","2,2", { req:{agi:8}, msg:"影窟机关，需身法≥8" });
  addSpecial("1,3","2,2", { req:{agi:10}, msg:"盐道危机，需身法≥10" });
  addSpecial("2,1","3,2", { req:{arm:10}, msg:"血风扑面，需臂力≥10" });
  addSpecial("2,0","3,1", { req:{wit:10}, msg:"云路迷踪，需悟性≥10" });
  addSpecial("2,2","3,1", { req:{wit:8,agi:8}, msg:"绝顶险径，需悟性·身法≥8" });
  addSpecial("2,3","3,2", { req:{arm:12}, msg:"血谷凶险，需臂力≥12" });

  window.X_MAP = X_MAP;

  var idToKey = {};
  Object.keys(X_MAP.nodes).forEach(function(k){
    idToKey[X_MAP.nodes[k].id] = k;
  });

  function getNeighborsX(row, col){
    var from = row+","+col;
    var out = [];
    for(var i=0;i<DIAG.length;i++){
      var nr = row+DIAG[i][0], nc = col+DIAG[i][1];
      var key = nr+","+nc;
      if(!X_MAP.nodes[key])continue;
      var ek = edgeKey(from, key);
      if(!X_MAP.edges[ek])continue;
      out.push({
        key: key,
        node: X_MAP.nodes[key],
        edge: X_MAP.edges[ek],
        special: X_MAP.special[ek]||null
      });
    }
    return out;
  }

  /** 统一玩家地图字段，迁移旧存档 */
  function ensurePos(player){
    if(!player)return;
    var key = idToKey[player.location] || "0,1";
    if(player.mapRow==null || player.mapCol==null){
      var p = key.split(",");
      player.mapRow = +p[0];
      player.mapCol = +p[1];
    }
    /* explored: string[] 地点 id */
    if(!Array.isArray(player.explored)){
      var list = [];
      if(player.exploredList && Array.isArray(player.exploredList)){
        list = player.exploredList.slice();
      }else if(player.explored && typeof player.explored==="object"){
        Object.keys(player.explored).forEach(function(k){
          var n = X_MAP.nodes[k];
          if(n) list.push(n.id);
          else if(typeof k==="string" && idToKey[k]) list.push(k);
        });
      }
      player.explored = list;
    }
    if(player.explored.indexOf(player.location)<0){
      player.explored.push(player.location);
    }
    /* 同步坐标与 location */
    var sync = idToKey[player.location];
    if(sync){
      var s = sync.split(",");
      player.mapRow = +s[0];
      player.mapCol = +s[1];
    }
  }

  function isExplored(player, nodeId){
    ensurePos(player);
    return player.explored.indexOf(nodeId)>=0;
  }

  /** 可见：当前 / 已探索 / 与当前相邻 / 与任一已探索相邻 */
  function isVisible(player, row, col){
    ensurePos(player);
    var key = row+","+col;
    var node = X_MAP.nodes[key];
    if(!node)return false;
    if(player.mapRow===row && player.mapCol===col)return true;
    if(isExplored(player, node.id))return true;
    /* 与当前相邻 */
    var nearCur = getNeighborsX(player.mapRow, player.mapCol);
    for(var i=0;i<nearCur.length;i++){
      if(nearCur[i].key===key)return true;
    }
    /* 与已探索节点相邻 */
    for(var e=0;e<player.explored.length;e++){
      var ek = idToKey[player.explored[e]];
      if(!ek)continue;
      var er = ek.split(",").map(Number);
      var neigh = getNeighborsX(er[0], er[1]);
      for(var j=0;j<neigh.length;j++){
        if(neigh[j].key===key)return true;
      }
    }
    return false;
  }

  function checkPathReq(player, special){
    if(!special)return{ok:true};
    if(special.blocked){
      return{ok:false,msg:special.blockedMsg||"此路不通"};
    }
    if(special.req){
      var ks = Object.keys(special.req);
      for(var i=0;i<ks.length;i++){
        var st = ks[i], val = special.req[st];
        if((player.stats[st]||0)<val){
          var lab = (typeof STAT_LABELS!=="undefined"&&STAT_LABELS[st])?STAT_LABELS[st]:st;
          return{ok:false,msg:special.msg||(lab+"需≥"+val)};
        }
      }
    }
    if(special.item){
      var has = typeof hasItem==="function" && hasItem(player, special.item, 1);
      if(!has){
        var iname = special.itemName || special.item;
        return{ok:false,msg:special.msg||("需持有【"+iname+"】")};
      }
    }
    if(special.quest){
      var done = player.quests && player.quests.done && player.quests.done.indexOf(special.quest)>=0;
      if(!done){
        return{ok:false,msg:special.msg||("需完成任务："+special.quest)};
      }
    }
    return{ok:true};
  }

  function canMoveX(player, toKey){
    ensurePos(player);
    var fromKey = player.mapRow+","+player.mapCol;
    if(fromKey===toKey)return{ok:false,msg:"已在此处"};
    var parts = fromKey.split(",").map(Number);
    var neigh = getNeighborsX(parts[0], parts[1]);
    var target = null;
    for(var i=0;i<neigh.length;i++){
      if(neigh[i].key===toKey){ target=neigh[i]; break; }
    }
    if(!target)return{ok:false,msg:"无路可通（仅可沿斜向路径移动）"};
    var req = checkPathReq(player, target.special);
    if(!req.ok)return req;
    return{ok:true, edge:target.edge, special:target.special, node:target.node};
  }

  function isReachableX(player, row, col){
    var r = canMoveX(player, row+","+col);
    return r.ok;
  }

  function isAdjacentLocked(player, row, col){
    ensurePos(player);
    var key = row+","+col;
    var neigh = getNeighborsX(player.mapRow, player.mapCol);
    for(var i=0;i<neigh.length;i++){
      if(neigh[i].key===key){
        return !checkPathReq(player, neigh[i].special).ok;
      }
    }
    return false;
  }

  function triggerArrival(player, locId){
    var mapObj = typeof getMapById==="function" ? getMapById(locId) : null;
    if(mapObj && mapObj.events && mapObj.events.length){
      return mapObj.events[Math.floor(Math.random()*mapObj.events.length)];
    }
    return "";
  }

  window.moveToX = function(player, targetKey){
    ensurePos(player);
    var check = canMoveX(player, targetKey);
    if(!check.ok)return check;

    var parts = targetKey.split(",").map(Number);
    player.mapRow = parts[0];
    player.mapCol = parts[1];
    var node = X_MAP.nodes[targetKey];
    player.location = node.id;
    if(player.explored.indexOf(node.id)<0)player.explored.push(node.id);

    var moveCost = (typeof TIME_COST!=="undefined" && TIME_COST.move!=null)
      ? TIME_COST.move
      : ((check.edge && check.edge.cost) || 1);
    var tmsgs = [];
    if(typeof advanceTime==="function"){
      var tr = advanceTime(player, moveCost);
      if(tr && tr.msgs) tmsgs = tr.msgs;
    }

    var arrival = triggerArrival(player, node.id);
    var clock = typeof formatClockShort==="function" ? formatClockShort(player)+" · " : "";
    var msg = clock + "抵达【"+node.name+"】" + (arrival ? ("。"+arrival) : "。");
    player.logs.unshift(msg);
    tmsgs.forEach(function(m){ player.logs.unshift(m); });
    player.logs = player.logs.slice(0,50);
    return{ok:true, msg:msg, cost:moveCost};
  };

  var _movePlayer = typeof movePlayer==="function" ? movePlayer : null;
  window.movePlayer = function(player, locId){
    ensurePos(player);
    var targetKey = idToKey[locId];
    if(!targetKey){
      return _movePlayer ? _movePlayer(player, locId) : {ok:false,msg:"未知地点"};
    }
    return moveToX(player, targetKey);
  };

  function getScreenPos(row, col, cellW, cellH, offsetX){
    var x = col * cellW + (row % 2) * (cellW * 0.5) + offsetX;
    var y = row * (cellH * 0.78) + 32;
    return { x:x, y:y };
  }

  function showNodeDetail(player, key){
    var node = X_MAP.nodes[key];
    if(!node)return;
    var mapObj = typeof getMapById==="function" ? getMapById(node.id) : null;
    var explored = isExplored(player, node.id);
    var current = player.mapRow+","+player.mapCol === key;
    var can = canMoveX(player, key);
    var desc = mapObj && mapObj.desc ? mapObj.desc : (node.type||"");
    var body =
      '<div class="modal-head"><h2 class="section-title">'+
      (explored||current ? node.icon+" "+node.name : "❓ 未知之地")+
      '</h2><button class="modal-close" id="mClose">关闭</button></div>';
    if(explored||current){
      body += '<p class="small">'+node.type+(mapObj&&mapObj.region?(" · "+mapObj.region):"")+'</p>';
      body += '<p>'+desc+'</p>';
    }else{
      body += '<p class="small">雾气未散，看不真切。</p>';
    }
    if(can.ok && !current){
      body += '<div class="row" style="margin-top:10px"><button class="btn primary" id="goNode">前往此处</button></div>';
    }else if(!current && !can.ok && can.msg && can.msg.indexOf("无路")<0){
      body += '<p class="small" style="color:#d9ad62">'+can.msg+'</p>';
    }
    openModal(body);
    qs("#mClose").onclick = closeModal;
    if(qs("#goNode")){
      qs("#goNode").onclick = function(){
        var r = moveToX(player, key);
        if(!r.ok) player.logs.unshift(r.msg);
        if(typeof saveGame==="function") saveGame(state);
        closeModal();
        renderGame();
      };
    }
  }

  window.renderXMap = function(player){
    ensurePos(player);
    var cellW = 102, cellH = 66, offsetX = 40;
    var width = X_MAP.cols * cellW + offsetX + 48;
    var height = X_MAP.rows * cellH * 0.78 + 90;

    var lines = [];
    Object.keys(X_MAP.edges).forEach(function(ek){
      var pair = ek.split("-");
      var a = pair[0].split(",").map(Number);
      var b = pair[1].split(",").map(Number);
      /* 仅画两端至少一端可见的路径 */
      if(!isVisible(player,a[0],a[1]) && !isVisible(player,b[0],b[1])) return;
      var p1 = getScreenPos(a[0],a[1],cellW,cellH,offsetX);
      var p2 = getScreenPos(b[0],b[1],cellW,cellH,offsetX);
      var isSpecial = !!X_MAP.special[ek];
      lines.push(
        '<line x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'" '+
        'stroke="'+(isSpecial?"#d9ad62":"#5a4a3a")+'" stroke-width="'+(isSpecial?2.5:1.5)+'" '+
        (isSpecial?'stroke-dasharray="6 4" class="path-special"':'')+
        ' opacity="0.9"/>'
      );
    });

    var nodesHtml = [];
    Object.keys(X_MAP.nodes).forEach(function(key){
      var node = X_MAP.nodes[key];
      var rc = key.split(",").map(Number);
      var pos = getScreenPos(rc[0],rc[1],cellW,cellH,offsetX);
      var current = player.mapRow===rc[0] && player.mapCol===rc[1];
      var explored = isExplored(player, node.id);
      var visible = isVisible(player, rc[0], rc[1]);
      var reachable = isReachableX(player, rc[0], rc[1]);
      var locked = isAdjacentLocked(player, rc[0], rc[1]);

      if(!visible && !current){
        /* 完全迷雾：仍占位但极淡，或跳过 */
        nodesHtml.push(
          '<div class="xmap-node fog-deep" style="left:'+(pos.x-34)+'px;top:'+(pos.y-28)+'px" data-key="'+key+'">'+
          '<div class="node-icon">·</div><div class="node-name"> </div></div>'
        );
        return;
      }

      var cls = "xmap-node";
      if(current) cls += " current";
      else if(reachable) cls += " reachable";
      else if(locked) cls += " locked";
      if(explored) cls += " explored";
      if(!explored && !current) cls += " hidden";

      var displayName = (explored || current) ? node.name : "???";
      var displayIcon = (explored || current) ? node.icon : "❓";

      nodesHtml.push(
        '<div class="'+cls+'" style="left:'+(pos.x-34)+'px;top:'+(pos.y-28)+'px" '+
        'data-key="'+key+'" data-id="'+node.id+'">'+
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
          '<span class="lg lock">条件未满</span>'+
          '<span class="lg fog">未探索</span>'+
          '<span class="lg special">险路</span>'+
        '</div>'+
        '<div class="xmap-container" style="width:'+width+'px;height:'+height+'px">'+
          '<svg class="xmap-paths" width="'+width+'" height="'+height+'">'+lines.join("")+'</svg>'+
          nodesHtml.join("")+
        '</div>'+
        '<p class="small" style="margin:4px 0 0">仅可沿斜向路径移动一步 · 金色虚线为险路</p>'+
      '</div>'
    );
  };

  if(!document.getElementById("xmap-style")){
    var st = document.createElement("style");
    st.id = "xmap-style";
    st.textContent = [
      ".xmap-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:4px 0 8px}",
      ".xmap-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:10px;color:#b9a58a;margin-bottom:4px}",
      ".xmap-legend .lg::before{content:'';display:inline-block;width:8px;height:8px;margin-right:3px;border:1px solid #4b3a2d;vertical-align:middle}",
      ".xmap-legend .cur::before{background:#34271e;border-color:#d9ad62}",
      ".xmap-legend .reach::before{background:#1e2a1a;border-color:#7aae6a}",
      ".xmap-legend .lock::before{background:#2a1a18;border-color:#b85b53}",
      ".xmap-legend .fog::before{background:#120e0a}",
      ".xmap-legend .special::before{background:transparent;border-color:#d9ad62;border-style:dashed}",
      ".xmap-container{position:relative;background:radial-gradient(ellipse at 40% 30%,#1a241a,#0d120d 70%);",
      "  border:1px solid #4b3a2d;border-radius:12px;overflow:hidden;margin:0 auto}",
      ".xmap-paths{position:absolute;left:0;top:0;pointer-events:none;z-index:1}",
      ".xmap-node{position:absolute;width:68px;height:56px;display:flex;flex-direction:column;",
      "  align-items:center;justify-content:center;border-radius:10px;border:2px solid #4b3a2d;",
      "  background:rgba(26,22,18,.92);text-align:center;font-size:10px;padding:4px 2px;z-index:2;",
      "  transition:transform .15s,border-color .15s,box-shadow .15s;user-select:none;cursor:pointer}",
      ".xmap-node .node-icon{font-size:18px;line-height:1.15}",
      ".xmap-node .node-name{font-size:9px;color:#b9a58a;margin-top:1px;max-width:64px;",
      "  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".xmap-node .node-marker{position:absolute;top:-12px;color:#d9ad62;font-size:10px;animation:bob .8s ease-in-out infinite}",
      "@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}",
      ".xmap-node.current{border-color:#d9ad62;box-shadow:0 0 16px rgba(217,173,98,.45);background:rgba(48,38,28,.95)}",
      ".xmap-node.current .node-name{color:#d9ad62;font-weight:700}",
      ".xmap-node.explored{border-color:#5a6a4a}",
      ".xmap-node.reachable{border-color:#7aae6a;box-shadow:0 0 8px rgba(122,174,106,.3)}",
      ".xmap-node.reachable:hover,.xmap-node.reachable:active{border-color:#d9ad62;transform:scale(1.06)}",
      ".xmap-node.locked{border-color:#b85b53;opacity:.85}",
      ".xmap-node.hidden{border-color:#2a2218;background:rgba(14,12,10,.88)}",
      ".xmap-node.hidden .node-name{color:#4a3a2a}",
      ".xmap-node.fog-deep{opacity:.25;border-color:transparent;background:transparent;cursor:default;pointer-events:none}",
      ".xmap-node .node-glow{position:absolute;width:72px;height:72px;border-radius:50%;",
      "  background:rgba(122,174,106,.14);animation:pulse-glow 2s infinite;z-index:-1;pointer-events:none}",
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

  function bindMap(root, p){
    if(!root)return;
    root.querySelectorAll(".xmap-node").forEach(function(el){
      if(el.classList.contains("fog-deep"))return;
      el.onclick = function(){
        var key = el.dataset.key;
        if(el.classList.contains("reachable")){
          var r = moveToX(p, key);
          if(!r.ok) p.logs.unshift(r.msg);
          if(typeof saveGame==="function") saveGame(state);
          renderGame();
          return;
        }
        showNodeDetail(p, key);
      };
    });
  }

  var _rg = typeof renderGame==="function" ? renderGame : null;
  if(_rg){
    window.renderGame = function(){
      if(state && state.player) ensurePos(state.player);
      _rg();
      var p = state && state.player; if(!p) return;
      var old = document.querySelector(".pixel-map");
      var exist = document.querySelector(".xmap-wrap");
      var holder = document.createElement("div");
      holder.innerHTML = renderXMap(p);
      var node = holder.firstChild;
      if(old){
        old.replaceWith(node);
        bindMap(node, p);
      }else if(exist){
        exist.parentNode.replaceChild(node, exist);
        bindMap(node, p);
      }
    };
  }

  window.renderGridMap = function(player){ return renderXMap(player); };
  window.moveToGrid = function(player, key){ return moveToX(player, key); };
  window.getNeighborsX = getNeighborsX;

  if(typeof Game!=="undefined" && Game.on){
    Game.on("player:ensure", function(p){ ensurePos(p); });
  }

})();
