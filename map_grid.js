/**
 * X 型网状地图 · 像素材质
 * 斜向为主 + 官道正交补边（保证全图连通）
 * 寻路 / 自动回门派
 */
(function(){

  var DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];
  var ORTH = [[-1,0],[1,0],[0,-1],[0,1]];

  var TYPE_GLYPH = { "城镇":"邑", "渡口":"津", "门派":"门", "野外":"野", "秘境":"秘" };
  var TYPE_TONE = {
    "城镇":"#6b503a", "渡口":"#3a5a6a", "门派":"#5a4a28",
    "野外":"#3a5a3a", "秘境":"#4a3a5a"
  };

  /* 门派 id -> 地图地点 id */
  var SECT_HOME = {
    yanlan: "mist_gate",
    chilu: "hearth",
    huichun: "herb_valley",
    xuanjing: "whale_port",
    baique: "sparrow_den",
    wuxiang: "void_temple"
  };

  var X_MAP = {
    rows: 4,
    cols: 4,
    nodes: {
      "0,0": { id:"mist_gate",   name:"烟岚山门", type:"门派", icon:"门" },
      "0,1": { id:"qinghe",      name:"清河镇",   type:"城镇", icon:"邑" },
      "0,2": { id:"ferry",       name:"白沙渡",   type:"渡口", icon:"津" },
      "0,3": { id:"hearth",      name:"赤炉山庄", type:"门派", icon:"炉" },
      "1,0": { id:"bamboo",      name:"听雨竹径", type:"野外", icon:"竹" },
      "1,1": { id:"market",      name:"旧瓦市",   type:"城镇", icon:"市" },
      "1,2": { id:"whale_port",  name:"玄鲸港",   type:"门派", icon:"港" },
      "1,3": { id:"salt_road",   name:"黑盐古道", type:"野外", icon:"道" },
      "2,0": { id:"herb_valley", name:"回春谷",   type:"门派", icon:"谷" },
      "2,1": { id:"sparrow_den", name:"白雀楼",   type:"门派", icon:"楼" },
      "2,2": { id:"secret_cave", name:"影窟",     type:"秘境", icon:"窟" },
      "2,3": { id:"secret_reef", name:"沉沙暗礁", type:"秘境", icon:"礁" },
      "3,0": { id:"void_temple", name:"无相寺",   type:"门派", icon:"寺" },
      "3,1": { id:"cloud_peak",  name:"云岚绝顶", type:"秘境", icon:"顶" },
      "3,2": { id:"blood_ravine",name:"血石峡谷", type:"野外", icon:"峡" }
    },
    edges: {},
    special: {}
  };

  function edgeKey(a, b){ return a < b ? a+"-"+b : b+"-"+a; }
  function addEdge(a, b, cost, kind){
    if(!X_MAP.nodes[a]||!X_MAP.nodes[b])return;
    var ek = edgeKey(a,b);
    if(!X_MAP.edges[ek]) X_MAP.edges[ek] = { cost: cost||1, kind: kind||"x" };
    else {
      X_MAP.edges[ek].cost = Math.min(X_MAP.edges[ek].cost, cost||1);
      if(kind) X_MAP.edges[ek].kind = kind;
    }
  }
  function addSpecial(a, b, conf){ X_MAP.special[edgeKey(a,b)] = conf; }

  /* —— 斜向 X 网（主路径） —— */
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
  ].forEach(function(p){ addEdge(p[0],p[1],1,"x"); });

  /* —— 官道正交（解决棋盘奇偶，保证全图连通） —— */
  [
    ["0,0","0,1"], ["0,1","0,2"], ["0,2","0,3"],
    ["0,1","1,1"], ["1,0","1,1"], ["1,1","1,2"], ["1,2","1,3"],
    ["1,1","2,1"], ["2,0","2,1"], ["2,1","2,2"], ["2,2","2,3"],
    ["2,1","3,1"], ["3,0","3,1"], ["3,1","3,2"],
    ["1,0","2,0"], ["0,3","1,3"]
  ].forEach(function(p){ addEdge(p[0],p[1],1,"road"); });

  /* 险路仍挂在斜向捷径上 */
  addSpecial("1,2","2,3", { req:{qi:8}, msg:"暗礁密布，需内力≥8" });
  addSpecial("1,1","2,2", { req:{agi:8}, msg:"影窟机关，需身法≥8" });
  addSpecial("1,3","2,2", { req:{agi:10}, msg:"盐道危机，需身法≥10" });
  addSpecial("2,1","3,2", { req:{arm:10}, msg:"血风扑面，需臂力≥10" });
  addSpecial("2,0","3,1", { req:{wit:10}, msg:"云路迷踪，需悟性≥10" });
  addSpecial("2,2","3,1", { req:{wit:8,agi:8}, msg:"绝顶险径，需悟性·身法≥8" });
  addSpecial("2,3","3,2", { req:{arm:12}, msg:"血谷凶险，需臂力≥12" });

  window.X_MAP = X_MAP;
  window.SECT_HOME = SECT_HOME;

  var idToKey = {};
  Object.keys(X_MAP.nodes).forEach(function(k){ idToKey[X_MAP.nodes[k].id] = k; });

  function getNeighborsX(row, col){
    var from = row+","+col;
    var out = [];
    var dirs = DIAG.concat(ORTH);
    for(var i=0;i<dirs.length;i++){
      var nr = row+dirs[i][0], nc = col+dirs[i][1];
      var key = nr+","+nc;
      if(!X_MAP.nodes[key])continue;
      var ek = edgeKey(from, key);
      if(!X_MAP.edges[ek])continue;
      out.push({
        key: key, node: X_MAP.nodes[key],
        edge: X_MAP.edges[ek], special: X_MAP.special[ek]||null
      });
    }
    return out;
  }

  function ensurePos(player){
    if(!player)return;
    var key = idToKey[player.location] || "0,1";
    if(player.mapRow==null || player.mapCol==null){
      var p = key.split(",");
      player.mapRow = +p[0]; player.mapCol = +p[1];
    }
    if(!Array.isArray(player.explored)){
      var list = [];
      if(player.exploredList && Array.isArray(player.exploredList)) list = player.exploredList.slice();
      else if(player.explored && typeof player.explored==="object"){
        Object.keys(player.explored).forEach(function(k){
          var n = X_MAP.nodes[k];
          if(n) list.push(n.id);
          else if(idToKey[k]) list.push(k);
        });
      }
      player.explored = list;
    }
    if(player.explored.indexOf(player.location)<0) player.explored.push(player.location);
    var sync = idToKey[player.location];
    if(sync){
      var s = sync.split(",");
      player.mapRow = +s[0]; player.mapCol = +s[1];
    }
  }

  function isExplored(player, nodeId){
    ensurePos(player);
    return player.explored.indexOf(nodeId)>=0;
  }

  function isVisible(player, row, col){
    ensurePos(player);
    var key = row+","+col;
    var node = X_MAP.nodes[key];
    if(!node)return false;
    if(player.mapRow===row && player.mapCol===col)return true;
    if(isExplored(player, node.id))return true;
    var nearCur = getNeighborsX(player.mapRow, player.mapCol);
    for(var i=0;i<nearCur.length;i++) if(nearCur[i].key===key) return true;
    for(var e=0;e<player.explored.length;e++){
      var ek = idToKey[player.explored[e]];
      if(!ek)continue;
      var er = ek.split(",").map(Number);
      var neigh = getNeighborsX(er[0], er[1]);
      for(var j=0;j<neigh.length;j++) if(neigh[j].key===key) return true;
    }
    return false;
  }

  function checkPathReq(player, special){
    if(!special)return{ok:true};
    if(special.blocked) return{ok:false,msg:special.blockedMsg||"此路不通"};
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
      if(!has) return{ok:false,msg:special.msg||("需持有【"+(special.itemName||special.item)+"】")};
    }
    if(special.quest){
      var done = player.quests && player.quests.done && player.quests.done.indexOf(special.quest)>=0;
      if(!done) return{ok:false,msg:special.msg||("需完成任务："+special.quest)};
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
    for(var i=0;i<neigh.length;i++) if(neigh[i].key===toKey){ target=neigh[i]; break; }
    if(!target)return{ok:false,msg:"无路可通"};
    var req = checkPathReq(player, target.special);
    if(!req.ok)return req;
    return{ok:true, edge:target.edge, special:target.special, node:target.node};
  }

  function isReachableX(player, row, col){ return canMoveX(player, row+","+col).ok; }

  function isAdjacentLocked(player, row, col){
    ensurePos(player);
    var key = row+","+col;
    var neigh = getNeighborsX(player.mapRow, player.mapCol);
    for(var i=0;i<neigh.length;i++){
      if(neigh[i].key===key) return !checkPathReq(player, neigh[i].special).ok;
    }
    return false;
  }

  /** BFS 寻路（仅走当前满足条件的边） */
  function findPath(player, fromKey, toKey){
    if(fromKey===toKey) return [fromKey];
    var queue = [fromKey];
    var prev = {};
    prev[fromKey] = null;
    while(queue.length){
      var cur = queue.shift();
      var rc = cur.split(",").map(Number);
      var neigh = getNeighborsX(rc[0], rc[1]);
      for(var i=0;i<neigh.length;i++){
        var n = neigh[i];
        if(prev[n.key]!==undefined) continue;
        if(!checkPathReq(player, n.special).ok) continue;
        prev[n.key] = cur;
        if(n.key===toKey){
          var path = [toKey];
          var p = cur;
          while(p){ path.push(p); p = prev[p]; }
          path.reverse();
          return path;
        }
        queue.push(n.key);
      }
    }
    return null;
  }

  function triggerArrival(player, locId){
    var mapObj = typeof getMapById==="function" ? getMapById(locId) : null;
    if(mapObj && mapObj.events && mapObj.events.length){
      return mapObj.events[Math.floor(Math.random()*mapObj.events.length)];
    }
    return "";
  }

  function applyArrive(player, node, steps){
    player.location = node.id;
    if(player.explored.indexOf(node.id)<0) player.explored.push(node.id);
    var moveCost = steps * ((typeof TIME_COST!=="undefined" && TIME_COST.move!=null) ? TIME_COST.move : 1);
    var tmsgs = [];
    if(typeof advanceTime==="function"){
      var tr = advanceTime(player, moveCost);
      if(tr && tr.msgs) tmsgs = tr.msgs;
    }
    return tmsgs;
  }

  window.moveToX = function(player, targetKey){
    ensurePos(player);
    var check = canMoveX(player, targetKey);
    if(!check.ok)return check;
    var parts = targetKey.split(",").map(Number);
    player.mapRow = parts[0]; player.mapCol = parts[1];
    var node = X_MAP.nodes[targetKey];
    var tmsgs = applyArrive(player, node, 1);
    var arrival = triggerArrival(player, node.id);
    var clock = typeof formatClockShort==="function" ? formatClockShort(player)+" · " : "";
    var msg = clock + "抵达【"+node.name+"】" + (arrival ? ("。"+arrival) : "。");
    player.logs.unshift(msg);
    tmsgs.forEach(function(m){ player.logs.unshift(m); });
    player.logs = player.logs.slice(0,50);
    return{ok:true, msg:msg, cost:1};
  };

  /** 沿最短路径连续移动（自动寻路） */
  window.travelTo = function(player, locId){
    ensurePos(player);
    var targetKey = idToKey[locId];
    if(!targetKey) return{ok:false,msg:"未知地点"};
    var fromKey = player.mapRow+","+player.mapCol;
    if(fromKey===targetKey) return{ok:false,msg:"已在此处"};
    var path = findPath(player, fromKey, targetKey);
    if(!path || path.length<2){
      return{ok:false,msg:"暂无通路（或险路条件不足），请先探索邻境或提升属性"};
    }
    var steps = path.length - 1;
    var end = path[path.length-1];
    var rc = end.split(",").map(Number);
    player.mapRow = rc[0]; player.mapCol = rc[1];
    var node = X_MAP.nodes[end];
    /* 途经点一并记入探索 */
    for(var i=1;i<path.length;i++){
      var n = X_MAP.nodes[path[i]];
      if(n && player.explored.indexOf(n.id)<0) player.explored.push(n.id);
    }
    var tmsgs = applyArrive(player, node, steps);
    var arrival = triggerArrival(player, node.id);
    var clock = typeof formatClockShort==="function" ? formatClockShort(player)+" · " : "";
    var msg = clock + "赶路"+steps+"程，抵达【"+node.name+"】" + (arrival ? ("。"+arrival) : "。");
    player.logs.unshift(msg);
    tmsgs.forEach(function(m){ player.logs.unshift(m); });
    player.logs = player.logs.slice(0,50);
    return{ok:true, msg:msg, steps:steps};
  };

  /** 自动回门派 */
  window.returnToSect = function(player){
    ensurePos(player);
    if(!player.sect) return{ok:false,msg:"你尚未拜入门派"};
    var homeId = SECT_HOME[player.sect];
    if(!homeId){
      var sect = typeof getSectById==="function" ? getSectById(player.sect) : null;
      homeId = sect && sect.loc;
    }
    if(!homeId) return{ok:false,msg:"门派驻地不明"};
    if(player.location===homeId) return{ok:false,msg:"你已在门派驻地"};

    var targetKey = idToKey[homeId];
    if(!targetKey) return{ok:false,msg:"驻地不在当前地图"};

    var fromKey = player.mapRow+","+player.mapCol;
    var path = findPath(player, fromKey, targetKey);

    /* 有通路：按寻路赶路；无通路（被险路卡住）且已探索过驻地：传讯回山，耗时更多 */
    if(path && path.length>=2){
      var r = travelTo(player, homeId);
      if(r.ok){
        var sectName = (typeof getSectById==="function" && getSectById(player.sect))
          ? getSectById(player.sect).name : "门派";
        player.logs.unshift("你收拾行装，返回【"+sectName+"】驻地。");
        r.msg = "返回门派驻地";
      }
      return r;
    }

    if(player.explored.indexOf(homeId)>=0 || player.sect){
      /* 门派传讯：不依赖通路，耗时 = 曼哈顿距离（至少 2） */
      var trc = targetKey.split(",").map(Number);
      var dist = Math.abs(trc[0]-player.mapRow) + Math.abs(trc[1]-player.mapCol);
      var steps = Math.max(2, dist);
      player.mapRow = trc[0]; player.mapCol = trc[1];
      var node = X_MAP.nodes[targetKey];
      var tmsgs = applyArrive(player, node, steps);
      var sectName = (typeof getSectById==="function" && getSectById(player.sect))
        ? getSectById(player.sect).name : "门派";
      var clock = typeof formatClockShort==="function" ? formatClockShort(player)+" · " : "";
      var msg = clock + "门派传讯接引，你返回【"+node.name+"】（"+sectName+"）。";
      player.logs.unshift(msg);
      tmsgs.forEach(function(m){ player.logs.unshift(m); });
      player.logs = player.logs.slice(0,50);
      return{ok:true, msg:msg, steps:steps, teleport:true};
    }

    return{ok:false,msg:"尚不识归途，请先探索通往门派的道路"};
  };

  var _movePlayer = typeof movePlayer==="function" ? movePlayer : null;
  window.movePlayer = function(player, locId){
    ensurePos(player);
    var targetKey = idToKey[locId];
    if(!targetKey) return _movePlayer ? _movePlayer(player, locId) : {ok:false,msg:"未知地点"};
    /* 相邻一步；否则尝试寻路 */
    var adj = canMoveX(player, targetKey);
    if(adj.ok) return moveToX(player, targetKey);
    return travelTo(player, locId);
  };

  function getScreenPos(row, col, cellW, cellH, offsetX){
    var x = col * cellW + (row % 2) * (cellW * 0.5) + offsetX;
    var y = row * (cellH * 0.78) + 32;
    return { x:x, y:y };
  }

  function pixelPathSegments(x1, y1, x2, y2, special, road){
    var dx = x2 - x1, dy = y2 - y1;
    var steps = Math.max(8, Math.floor(Math.sqrt(dx*dx+dy*dy) / 6));
    var col = special ? "#d9ad62" : (road ? "#6a5a48" : "#5a4a3a");
    var col2 = special ? "#8a6a30" : "#3a2e24";
    var rects = [];
    for(var i=0;i<=steps;i++){
      if(special && i%2===1) continue;
      var t = i / steps;
      var x = Math.round(x1 + dx * t);
      var y = Math.round(y1 + dy * t);
      var w = road && !special ? 2 : 3;
      rects.push('<rect x="'+(x-1)+'" y="'+(y-1)+'" width="'+w+'" height="'+w+'" fill="'+col+'"/>');
      if(!special) rects.push('<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+col2+'"/>');
    }
    return rects.join("");
  }

  function nodeTileHtml(node, explored, current){
    var glyph = (explored || current) ? (node.icon || TYPE_GLYPH[node.type] || "·") : "?";
    var name = (explored || current) ? node.name : "???";
    return (
      '<div class="node-tile">'+
        '<div class="node-glyph">'+glyph+'</div>'+
        '<div class="node-name">'+name+'</div>'+
      '</div>'
    );
  }

  function showNodeDetail(player, key){
    var node = X_MAP.nodes[key];
    if(!node)return;
    var mapObj = typeof getMapById==="function" ? getMapById(node.id) : null;
    var explored = isExplored(player, node.id);
    var current = (player.mapRow+","+player.mapCol) === key;
    var can = canMoveX(player, key);
    var path = null;
    if(!can.ok && !current){
      path = findPath(player, player.mapRow+","+player.mapCol, key);
    }
    var desc = mapObj && mapObj.desc ? mapObj.desc : (node.type||"");
    var title = (explored||current) ? (node.icon+" "+node.name) : "? 未知之地";
    var body =
      '<div class="modal-head"><h2 class="section-title">'+title+
      '</h2><button class="modal-close" id="mClose">关闭</button></div>';
    if(explored||current){
      body += '<p class="small">'+node.type+(mapObj&&mapObj.region?(" · "+mapObj.region):"")+'</p>';
      body += '<p>'+desc+'</p>';
    }else body += '<p class="small">雾气未散，看不真切。</p>';
    if(can.ok && !current){
      body += '<div class="row" style="margin-top:10px"><button class="btn primary" id="goNode">前往（一步）</button></div>';
    }else if(path && path.length>=2 && !current){
      body += '<div class="row" style="margin-top:10px"><button class="btn primary" id="goNode">寻路前往（'+ (path.length-1) +'程）</button></div>';
    }else if(!current && !can.ok && can.msg && can.msg.indexOf("无路")<0){
      body += '<p class="small" style="color:#d9ad62">'+can.msg+'</p>';
    }
    openModal(body);
    qs("#mClose").onclick = closeModal;
    if(qs("#goNode")){
      qs("#goNode").onclick = function(){
        var r;
        if(can.ok) r = moveToX(player, key);
        else r = travelTo(player, node.id);
        if(!r.ok) player.logs.unshift(r.msg);
        if(typeof saveGame==="function") saveGame(state);
        closeModal(); renderGame();
      };
    }
  }

  window.renderXMap = function(player){
    ensurePos(player);
    var cellW = 100, cellH = 64, offsetX = 36;
    var width = X_MAP.cols * cellW + offsetX + 48;
    var height = X_MAP.rows * cellH * 0.78 + 88;

    var pathSvg = [];
    Object.keys(X_MAP.edges).forEach(function(ek){
      var pair = ek.split("-");
      var a = pair[0].split(",").map(Number);
      var b = pair[1].split(",").map(Number);
      if(!isVisible(player,a[0],a[1]) && !isVisible(player,b[0],b[1])) return;
      var p1 = getScreenPos(a[0],a[1],cellW,cellH,offsetX);
      var p2 = getScreenPos(b[0],b[1],cellW,cellH,offsetX);
      var edge = X_MAP.edges[ek];
      pathSvg.push(pixelPathSegments(p1.x, p1.y, p2.x, p2.y, !!X_MAP.special[ek], edge.kind==="road"));
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
        nodesHtml.push(
          '<div class="xmap-node fog-deep" style="left:'+(pos.x-32)+'px;top:'+(pos.y-26)+'px">'+
          '<div class="node-tile fog"><div class="node-glyph">·</div></div></div>'
        );
        return;
      }

      var cls = "xmap-node";
      if(current) cls += " current";
      else if(reachable) cls += " reachable";
      else if(locked) cls += " locked";
      if(explored) cls += " explored";
      if(!explored && !current) cls += " hidden";

      nodesHtml.push(
        '<div class="'+cls+'" style="left:'+(pos.x-32)+'px;top:'+(pos.y-26)+'px" '+
        'data-key="'+key+'" data-id="'+node.id+'">'+
        nodeTileHtml(node, explored, current)+
        (current?'<div class="node-marker">▼</div>':'')+
        (reachable&&!current?'<div class="node-pulse"></div>':'')+
        '</div>'
      );
    });

    var sectBtn = "";
    if(player.sect){
      var homeId = SECT_HOME[player.sect];
      var atHome = homeId && player.location===homeId;
      sectBtn = atHome
        ? '<button class="btn sm" disabled>已在驻地</button>'
        : '<button class="btn sm primary" id="btnReturnSect">回门派</button>';
    }

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
          '<div class="xmap-dither"></div>'+
          '<svg class="xmap-paths" width="'+width+'" height="'+height+'" shape-rendering="crispEdges">'+
            pathSvg.join("")+
          '</svg>'+
          nodesHtml.join("")+
        '</div>'+
        '<div class="row" style="margin-top:6px;gap:6px;align-items:center">'+
          sectBtn+
          '<span class="small">斜向捷径 · 官道贯通 · 金点为险路</span>'+
        '</div>'+
      '</div>'
    );
  };

  var styleEl = document.getElementById("xmap-style");
  if(styleEl) styleEl.remove();
  var st = document.createElement("style");
  st.id = "xmap-style";
  st.textContent = [
    ".xmap-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:4px 0 8px;image-rendering:pixelated}",
    ".xmap-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:10px;color:#b9a58a;margin-bottom:4px}",
    ".xmap-legend .lg::before{content:'';display:inline-block;width:8px;height:8px;margin-right:3px;",
    "  border:2px solid #4b3a2d;vertical-align:middle;border-radius:0;box-shadow:1px 1px 0 #0a0806}",
    ".xmap-legend .cur::before{background:#5a3a22;border-color:#d9ad62 #5a4020 #5a4020 #d9ad62}",
    ".xmap-legend .reach::before{background:#2a3a22;border-color:#7aae6a #2a4a2a #2a4a2a #7aae6a}",
    ".xmap-legend .lock::before{background:#3a1a18;border-color:#b85b53 #5a2020 #5a2020 #b85b53}",
    ".xmap-legend .fog::before{background:#120e0a;border-color:#2a2218}",
    ".xmap-legend .special::before{background:#3a2a12;border-color:#d9ad62}",
    ".xmap-container{position:relative;margin:0 auto;overflow:hidden;border-radius:0;",
    "  border:3px solid;border-color:#3a2a1c #1a120c #1a120c #3a2a1c;",
    "  box-shadow:4px 4px 0 #0a0806, inset 1px 1px 0 rgba(217,173,98,.12);background:#0e0c0a}",
    ".xmap-dither{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.55;",
    "  background-image:linear-gradient(90deg,rgba(0,0,0,.35) 1px,transparent 1px),",
    "  linear-gradient(rgba(0,0,0,.35) 1px,transparent 1px),",
    "  linear-gradient(45deg,transparent 46%,rgba(26,32,22,.5) 50%,transparent 54%);",
    "  background-size:8px 8px,8px 8px,16px 16px}",
    ".xmap-paths{position:absolute;left:0;top:0;pointer-events:none;z-index:1;image-rendering:pixelated}",
    ".xmap-node{position:absolute;width:64px;height:52px;z-index:2;cursor:pointer;user-select:none}",
    ".xmap-node .node-tile{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;",
    "  justify-content:center;border-radius:0;border:2px solid;border-color:#6b503a #2a1c12 #2a1c12 #6b503a;",
    "  box-shadow:2px 2px 0 #0a0806, inset 1px 1px 0 rgba(245,232,207,.08);",
    "  background:linear-gradient(180deg,#2a2218,#1a1510);padding:3px 2px;text-align:center}",
    ".xmap-node .node-glyph{font-size:14px;line-height:1.1;color:#d9ad62;font-weight:700;text-shadow:1px 1px 0 #000}",
    ".xmap-node .node-name{font-size:9px;color:#b9a58a;margin-top:2px;max-width:58px;overflow:hidden;",
    "  text-overflow:ellipsis;white-space:nowrap;text-shadow:1px 1px 0 #000}",
    ".xmap-node.current .node-tile{border-color:#d9ad62 #5a4020 #5a4020 #d9ad62;background:#3a2a1c;",
    "  box-shadow:0 0 0 2px rgba(217,173,98,.35),2px 2px 0 #0a0806}",
    ".xmap-node.current .node-name{color:#d9ad62;font-weight:700}",
    ".xmap-node.current .node-glyph{color:#f5e8cf}",
    ".xmap-node.explored .node-tile{border-color:#5a6a4a #2a3a22 #2a3a22 #5a6a4a}",
    ".xmap-node.reachable .node-tile{border-color:#7aae6a #2a4a2a #2a4a2a #7aae6a;background:#1e2a1a}",
    ".xmap-node.reachable:active .node-tile{transform:translate(1px,1px);box-shadow:1px 1px 0 #0a0806}",
    ".xmap-node.reachable .node-glyph{color:#9ece8a}",
    ".xmap-node.locked .node-tile{border-color:#b85b53 #5a2020 #5a2020 #b85b53;background:#2a1816}",
    ".xmap-node.locked .node-glyph{color:#c87870}",
    ".xmap-node.hidden .node-tile{border-color:#3a2a22 #1a120c #1a120c #3a2a22;background:#120e0a}",
    ".xmap-node.hidden .node-glyph{color:#5a4a3a}",
    ".xmap-node.hidden .node-name{color:#4a3a2a}",
    ".xmap-node.fog-deep{pointer-events:none;opacity:.3}",
    ".xmap-node.fog-deep .node-tile{border-color:#1a1510;background:#0a0806;box-shadow:none}",
    ".xmap-node .node-marker{position:absolute;top:-11px;left:50%;transform:translateX(-50%);color:#d9ad62;",
    "  font-size:10px;text-shadow:1px 1px 0 #000;animation:px-bob .7s steps(2,end) infinite}",
    "@keyframes px-bob{0%,100%{margin-top:0}50%{margin-top:-3px}}",
    ".xmap-node .node-pulse{position:absolute;inset:-3px;border:2px solid #7aae6a;pointer-events:none;z-index:-1;",
    "  opacity:.5;animation:px-pulse 1.2s steps(3,end) infinite;box-shadow:2px 2px 0 #0a0806}",
    "@keyframes px-pulse{0%,100%{opacity:.25}50%{opacity:.7}}",
    "@media(max-width:600px){.xmap-node{width:54px;height:46px}.xmap-node .node-glyph{font-size:12px}.xmap-node .node-name{font-size:8px}}"
  ].join("\n");
  document.head.appendChild(st);

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
    var btn = root.querySelector("#btnReturnSect");
    if(btn){
      btn.onclick = function(){
        var r = returnToSect(p);
        if(!r.ok) p.logs.unshift(r.msg);
        if(typeof saveGame==="function") saveGame(state);
        renderGame();
      };
    }
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
      if(old){ old.replaceWith(node); bindMap(node, p); }
      else if(exist){ exist.parentNode.replaceChild(node, exist); bindMap(node, p); }

      /* 工具栏也可回门派 */
      var bar = document.querySelector(".toolbar");
      if(bar && p.sect && !bar.querySelector("#toolReturnSect")){
        var b = document.createElement("button");
        b.className = "btn sm"; b.id = "toolReturnSect"; b.textContent = "回门派";
        b.onclick = function(){
          var r = returnToSect(p);
          if(!r.ok) p.logs.unshift(r.msg);
          if(typeof saveGame==="function") saveGame(state);
          renderGame();
        };
        bar.appendChild(b);
      }else if(bar){
        var tb = bar.querySelector("#toolReturnSect");
        if(tb){
          tb.style.display = p.sect ? "" : "none";
          tb.onclick = function(){
            var r = returnToSect(p);
            if(!r.ok) p.logs.unshift(r.msg);
            if(typeof saveGame==="function") saveGame(state);
            renderGame();
          };
        }
      }
    };
  }

  window.renderGridMap = function(player){ return renderXMap(player); };
  window.moveToGrid = function(player, key){ return moveToX(player, key); };
  window.getNeighborsX = getNeighborsX;
  window.findMapPath = findPath;

  if(typeof Game!=="undefined" && Game.on){
    Game.on("player:ensure", function(p){ ensurePos(p); });
  }

})();
