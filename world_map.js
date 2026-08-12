/** 两层地图：州府 + 江湖节点。第2步：运河/江路线（苏州·建康·鄂州·应天） */
(function(){
  var CITIES={
    kaifeng:{id:"kaifeng",name:"开封（东京）",short:"开封",type:"州府",tier:"city",region:"中原",icon:"京",tag:"缉武司",
      desc:"大雍东京，人烟百万。御街车马昼夜不绝，缉武司坊间传闻最多。",
      events:["有人低声说缉武司昨夜抄了南巷。","相国寺外算命的说你印堂发暗。","货栈伙计打听黑盐道的消息。"],
      explore:[{text:"你在御街挤过人群，听见几句门派招人的闲话。",type:"log"},{text:"替客栈送一份公文到南城，换得辛苦钱。",type:"silver",value:14},{text:"医馆门前排队，你帮着递药，大夫随口点了你两句。",type:"heal",value:20},{text:"校场外有人比武，你旁观片刻，记下发力的窍门。",type:"exp",value:16},{text:"夜巷遇巡夜兵丁盘查，言语不和动了手。",type:"damage",value:14,diff:32,kind:"combat"}],
      children:["qinghe","market","hearth","sparrow_den","secret_cave","blood_ravine"]},
    luoyang:{id:"luoyang",name:"洛阳（西京）",short:"洛阳",type:"州府",tier:"city",region:"中原",icon:"洛",tag:"寺观",
      desc:"西京陪都，寺观林立，经声与市声交织。往西便是荒山古刹一路。",
      events:["有僧人化缘，说西山钟声近日不齐。","书肆老板推销半部旧经。","官道上来了车队，说是入京述职。"],
      explore:[{text:"你在白马寺外听了一段经，心神略静。",type:"mp",value:18},{text:"抄经铺缺人手，你写了一页，得几文墨银。",type:"silver",value:10},{text:"与游学书生论了一会儿，悟性有感。",type:"stat",key:"wit",value:1},{text:"西城墙下有人劫道，你不得不应。",type:"damage",value:16,diff:36,kind:"combat"},{text:"夜观星象，福缘微动。",type:"stat",key:"luck",value:1}],
      children:["void_temple","cloud_peak","herb_valley"]},
    yangzhou:{id:"yangzhou",name:"扬州",short:"扬州",type:"州府",tier:"city",region:"淮扬",icon:"扬",tag:"盐银",
      desc:"盐运漕运交汇，银子与水汽一样重。往南可下江东，往东通海口。",
      events:["盐商议价声传到巷口。","有人雇护船，价码不低。","夜泊的船灯连成一线。"],
      explore:[{text:"你帮盐行清点一袋货，换得碎银。",type:"silver",value:16},{text:"运河边练步，脚下湿滑，反摸到重心。",type:"exp",value:14},{text:"水匪小船贴岸，你先躲后打。",type:"damage",value:18,diff:40,kind:"combat"},{text:"茶楼听过往客商谈南海商路。",type:"log"},{text:"江风灌怀，内息略长。",type:"mp",value:15}],
      children:["ferry","salt_road","whale_port","secret_reef"]},
    hangzhou:{id:"hangzhou",name:"杭州（临安）",short:"杭州",type:"州府",tier:"city",region:"两浙",icon:"杭",tag:"湖山",
      desc:"江南繁华处，湖山与丝市并称。山门多在城外雾里，城里多是商贾与文士。",
      events:["丝行伙计吆喝最新的湖丝。","有人说城外竹径近来有剑声。","画舫上飘来半句小曲。"],
      explore:[{text:"湖堤漫步，听舟子讲城外剑斋的传闻。",type:"log"},{text:"丝市帮人运货，银子到手。",type:"silver",value:15},{text:"雨中在堤上走了一趟，身法略活。",type:"stat",key:"agi",value:1},{text:"市井混混找茬，你被迫还手。",type:"damage",value:12,diff:28,kind:"combat"},{text:"茶馆听书，说部与武学无干，却解乏。",type:"heal",value:12}],
      children:["bamboo","mist_gate"]},
    suzhou:{id:"suzhou",name:"苏州",short:"苏州",type:"州府",tier:"city",region:"两浙",icon:"苏",tag:"丝织",
      desc:"机坊连巷，湖丝与绣样并称。与临安并称江南双城，商贾比刀客更多。",
      events:["机坊里梭声不绝。","绣娘们争论一枚花样。","有人说北来的盐船又晚点了。"],
      explore:[{text:"你在机坊外帮人搬了半日丝，得几文银。",type:"silver",value:13},{text:"沿河看绣样，眼力略有长进。",type:"stat",key:"wit",value:1},{text:"市井闲话：临安湖上又见剑光。",type:"log"},{text:"夜巷遇剪径小贼，你应付几下。",type:"damage",value:11,diff:26,kind:"combat"}],
      children:[]},
    jiankang:{id:"jiankang",name:"建康",short:"建康",type:"州府",tier:"city",region:"江东",icon:"建",tag:"江防",
      desc:"江东重镇，城墙与江防并重。北望淮扬，南接两浙，金陵气在市井里也能嗅到。",
      events:["城墙上旗角猎猎。","有人议论江北盐道的安危。","客栈里有退伍的江防兵喝酒。"],
      explore:[{text:"你沿江堤走了一程，江风洗去路尘。",type:"mp",value:14},{text:"帮江防营送了一趟文书，换得辛苦钱。",type:"silver",value:12},{text:"听老兵讲当年江上的刀光。",type:"exp",value:12},{text:"码头混混找茬，你不愿退让。",type:"damage",value:15,diff:34,kind:"combat"}],
      children:[]},
    ezhou:{id:"ezhou",name:"鄂州",short:"鄂州",type:"州府",tier:"city",region:"荆湖",icon:"鄂",tag:"江泊",
      desc:"长江中游泊口，货船连樯。再往西便是更远的山河，往东可回淮扬。",
      events:["货船卸货的号子此起彼伏。","有人打听往川峡的水路。","夜江上灯火一串。"],
      explore:[{text:"你在码头帮了一天工，银子到手。",type:"silver",value:15},{text:"江边吐纳，内息略畅。",type:"mp",value:16},{text:"听船老大讲上游的险滩。",type:"log"},{text:"水匪趁乱摸船，你被迫出手。",type:"damage",value:17,diff:38,kind:"combat"}],
      children:[]},
    yingtian:{id:"yingtian",name:"应天（商丘）",short:"应天",type:"州府",tier:"city",region:"中原",icon:"应",tag:"官道驿",
      desc:"归德故地，官道与驿站的中转。东京与淮扬之间，人马在此换脚、换马。",
      events:["驿卒换马的蹄声很急。","有人说开封的公文昨夜刚过。","茶棚里过路客商交换路况。"],
      explore:[{text:"你在驿站帮人牵马，得几文赏钱。",type:"silver",value:11},{text:"官道上练了一趟脚力。",type:"exp",value:10},{text:"茶棚听来开封与扬州的近闻。",type:"log"},{text:"荒郊遇小股劫道，你且战且走。",type:"damage",value:13,diff:30,kind:"combat"}],
      children:[]}
  };
  var CITY_EDGES=[
    {from:"kaifeng",to:"luoyang",cost:3,kind:"road",label:"西京官道"},
    {from:"kaifeng",to:"yangzhou",cost:4,kind:"canal",label:"汴河→淮"},
    {from:"yangzhou",to:"hangzhou",cost:3,kind:"canal",label:"运河南下"},
    {from:"kaifeng",to:"hangzhou",cost:5,kind:"road",label:"东南官道"},
    {from:"luoyang",to:"yangzhou",cost:5,kind:"road",label:"东去淮扬"},
    {from:"kaifeng",to:"yingtian",cost:2,kind:"road",label:"归德官道"},
    {from:"yingtian",to:"yangzhou",cost:3,kind:"road",label:"淮扬官道"},
    {from:"yangzhou",to:"jiankang",cost:3,kind:"road",label:"江东官道"},
    {from:"jiankang",to:"hangzhou",cost:3,kind:"canal",label:"江东→两浙"},
    {from:"hangzhou",to:"suzhou",cost:2,kind:"canal",label:"江南近水"},
    {from:"yangzhou",to:"ezhou",cost:5,kind:"river",label:"长江西上"}
  ];
  var PARENT={};
  Object.keys(CITIES).forEach(function(cid){(CITIES[cid].children||[]).forEach(function(sid){PARENT[sid]=cid;});});
  function cityEdgeKey(a,b){return a<b?a+"|"+b:b+"|"+a;}
  var EDGE_MAP={};
  CITY_EDGES.forEach(function(e){EDGE_MAP[cityEdgeKey(e.from,e.to)]=e;});
  function getCity(id){return CITIES[id]||null;}
  function getParentCityId(locId){if(CITIES[locId])return locId;return PARENT[locId]||null;}
  function getCityNeighbors(cityId){
    var out=[];
    CITY_EDGES.forEach(function(e){
      if(e.from===cityId)out.push({id:e.to,cost:e.cost,kind:e.kind,label:e.label});
      else if(e.to===cityId)out.push({id:e.from,cost:e.cost,kind:e.kind,label:e.label});
    });
    return out;
  }
  function kindLabel(k){if(k==="canal")return"漕运";if(k==="river")return"江路";return"官道";}
  function injectCityMaps(){
    if(typeof maps==="undefined")return;
    Object.keys(CITIES).forEach(function(cid){
      var c=CITIES[cid];
      var exist=maps.find(function(m){return m.id===cid;});
      if(exist){
        exist.tier="city";exist.desc=c.desc;exist.events=c.events||exist.events;
        exist.explore=c.explore||exist.explore;exist.children=c.children||[];
        exist.region=c.region;exist.name=c.name;return;
      }
      maps.push({id:c.id,name:c.name,type:c.type||"州府",tier:"city",region:c.region,desc:c.desc,neighbors:[],events:c.events||[],explore:c.explore||[],children:c.children||[]});
    });
    maps.forEach(function(m){
      if(CITIES[m.id]){m.tier="city";return;}
      m.tier=m.tier||"spot";
      if(PARENT[m.id]&&!m.parent)m.parent=PARENT[m.id];
    });
    if(typeof DB!=="undefined"&&DB.rebuild){try{DB.rebuild();}catch(e){}}
  }
  injectCityMaps();
  function advanceDays(player,cost){
    var unit=(typeof TIME_COST!=="undefined"&&TIME_COST.move!=null)?TIME_COST.move:1;
    var total=Math.max(1,(cost|0)*unit);
    var tmsgs=[];
    if(typeof advanceTime==="function"){var tr=advanceTime(player,total);if(tr&&tr.msgs)tmsgs=tr.msgs;}
    else player.day=(player.day|0)+Math.max(1,cost|0);
    return tmsgs;
  }
  window.enterCity=function(player,cityId){
    var c=getCity(cityId);if(!c)return{ok:false,msg:"未知州府"};
    if(player.location===cityId)return{ok:false,msg:"已在"+c.short};
    var curParent=getParentCityId(player.location);
    if(curParent!==cityId&&!CITIES[player.location])return{ok:false,msg:"需先到该州府下辖地点"};
    player.location=cityId;
    if(Array.isArray(player.explored)&&player.explored.indexOf(cityId)<0)player.explored.push(cityId);
    var tmsgs=advanceDays(player,1);
    var clock=typeof formatClockShort==="function"?formatClockShort(player)+" · ":"";
    var ev=(c.events&&c.events.length)?c.events[Math.floor(Math.random()*c.events.length)]:"";
    var msg=clock+"进入【"+c.name+"】"+(ev?("。"+ev):"。");
    player.logs.unshift(msg);tmsgs.forEach(function(m){player.logs.unshift(m);});player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  };
  window.leaveCityToSpot=function(player,spotId){
    var c=getCity(player.location);if(!c)return{ok:false,msg:"你不在州府"};
    if((c.children||[]).indexOf(spotId)<0)return{ok:false,msg:"非本城下辖"};
    var mapObj=typeof getMapById==="function"?getMapById(spotId):null;
    if(!mapObj)return{ok:false,msg:"地点不存在"};
    player.location=spotId;
    if(Array.isArray(player.explored)&&player.explored.indexOf(spotId)<0)player.explored.push(spotId);
    if(typeof X_MAP!=="undefined"&&X_MAP.nodes){
      var key=null;Object.keys(X_MAP.nodes).forEach(function(k){if(X_MAP.nodes[k].id===spotId)key=k;});
      if(key){var rc=key.split(",").map(Number);player.mapRow=rc[0];player.mapCol=rc[1];}
    }
    var tmsgs=advanceDays(player,1);
    var clock=typeof formatClockShort==="function"?formatClockShort(player)+" · ":"";
    var msg=clock+"出城，抵达【"+mapObj.name+"】。";
    player.logs.unshift(msg);tmsgs.forEach(function(m){player.logs.unshift(m);});player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  };
  window.travelCity=function(player,toCityId){
    if(!CITIES[player.location])return{ok:false,msg:"长途须从州府启程（可先点「入城」）"};
    var fromId=player.location;
    if(fromId===toCityId)return{ok:false,msg:"已在此城"};
    var edge=EDGE_MAP[cityEdgeKey(fromId,toCityId)];
    if(!edge)return{ok:false,msg:"无直达官道/水路，请改道"};
    var dest=getCity(toCityId);if(!dest)return{ok:false,msg:"未知目的地"};
    var cost=edge.cost||3;
    var tmsgs=advanceDays(player,cost);
    player.location=toCityId;
    if(Array.isArray(player.explored)&&player.explored.indexOf(toCityId)<0)player.explored.push(toCityId);
    var clock=typeof formatClockShort==="function"?formatClockShort(player)+" · ":"";
    var msg=clock+"经"+kindLabel(edge.kind)+(edge.label?("「"+edge.label+"」"):"")+"，赶路"+cost+"程，抵达【"+dest.name+"】。";
    var ev=(dest.events&&dest.events.length)?dest.events[Math.floor(Math.random()*dest.events.length)]:"";
    if(ev)msg+=ev;
    player.logs.unshift(msg);tmsgs.forEach(function(m){player.logs.unshift(m);});player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg,cost:cost};
  };
  window.returnToParentCity=function(player){
    var pid=getParentCityId(player.location);
    if(!pid)return{ok:false,msg:"此地无归属州府"};
    if(player.location===pid)return{ok:false,msg:"已在州府"};
    return enterCity(player,pid);
  };
  function isCityLoc(id){return !!CITIES[id];}
  function renderCityPanel(player){
    var c=getCity(player.location);if(!c)return"";
    var kids=c.children||[];
    var childrenHtml=kids.length
      ? kids.map(function(id){
          var m=typeof getMapById==="function"?getMapById(id):null;
          var name=m?m.name:id;var typ=m?m.type:"";
          return '<button class="btn sm primary city-spot" data-id="'+id+'">'+name+(typ?(" · "+typ):"")+'</button>';
        }).join("")
      : '<p class="small">本城暂无线索，先在城中游历，或走长途往他处。</p>';
    var neigh=getCityNeighbors(c.id).map(function(n){
      var dest=getCity(n.id);var lab=dest?dest.short:n.id;
      return '<button class="btn sm city-travel" data-id="'+n.id+'">赴'+lab+'（'+n.cost+'程·'+kindLabel(n.kind)+'）</button>';
    }).join("");
    var tag=c.tag?('<span class="tag">'+c.tag+'</span>'):'';
    return '<div class="city-panel"><div class="loc-head"><h2 class="section-title">'+c.icon+' '+c.name+'</h2><span class="tag">州府</span> '+tag+'</div><p class="small">'+c.desc+'</p><p class="small" style="color:var(--gold)">话本借宋世地名，实指大雍山河。</p><h3 class="section-title" style="font-size:13px;margin-top:8px">下辖江湖</h3><div class="row compact-block">'+childrenHtml+'</div><h3 class="section-title" style="font-size:13px;margin-top:8px">长途</h3><div class="row compact-block">'+neigh+'</div><p class="small">城际耗时更长；下辖地点出城后仍走原有山河网。</p></div>';
  }
  function injectWorldChrome(player){
    var locPanel=document.querySelectorAll(".panel")[1];if(!locPanel)return;
    if(!isCityLoc(player.location)){
      var pid=getParentCityId(player.location);
      if(pid){
        var city=getCity(pid);
        var bar=document.getElementById("worldCityBar");if(bar)bar.remove();
        bar=document.createElement("div");bar.id="worldCityBar";bar.className="row compact-block";
        bar.innerHTML='<span class="tag">州府</span><span class="small">属【'+(city?city.short:pid)+'】</span><button class="btn sm primary" id="btnEnterCity">入城·'+(city?city.short:pid)+'</button>';
        var toolbar=locPanel.querySelector(".row.compact-block")||locPanel;
        locPanel.insertBefore(bar,locPanel.querySelector(".xmap-wrap, .pixel-map")||toolbar);
        var btn=document.getElementById("btnEnterCity");
        if(btn)btn.onclick=function(){var r=enterCity(player,pid);if(!r.ok)player.logs.unshift(r.msg);if(typeof saveGame==="function")saveGame(state);renderGame();};
      }
      return;
    }
    var wrap=locPanel.querySelector(".xmap-wrap, .pixel-map, .city-panel");
    var holder=document.createElement("div");holder.innerHTML=renderCityPanel(player);var node=holder.firstChild;
    if(wrap)wrap.replaceWith(node);else{var old=document.getElementById("cityPanelRoot");if(old)old.remove();node.id="cityPanelRoot";locPanel.appendChild(node);}
    locPanel.querySelectorAll(".move").forEach(function(el){el.style.display="none";});
    locPanel.querySelectorAll(".city-spot").forEach(function(el){el.onclick=function(){var r=leaveCityToSpot(player,el.dataset.id);if(!r.ok)player.logs.unshift(r.msg);if(typeof saveGame==="function")saveGame(state);renderGame();};});
    locPanel.querySelectorAll(".city-travel").forEach(function(el){el.onclick=function(){var r=travelCity(player,el.dataset.id);if(!r.ok)player.logs.unshift(r.msg);if(typeof saveGame==="function")saveGame(state);renderGame();};});
  }
  var st=document.createElement("style");st.id="world-map-style";
  st.textContent=".city-panel{margin:4px 0 8px;padding:8px;border:1px solid var(--line);border-radius:8px;background:#1a1512}.city-panel .section-title{margin-top:0}#worldCityBar{margin:6px 0;align-items:center}";
  document.head.appendChild(st);
  setTimeout(function(){
    if(typeof Game!=="undefined"&&Game.on){
      Game.on("render:after",function(p){if(p)injectWorldChrome(p);});
    }else if(typeof renderGame==="function"){
      var _rg=renderGame;renderGame=function(){_rg();if(state&&state.player)injectWorldChrome(state.player);};
    }
  },30);
  window.WORLD_CITIES=CITIES;window.CITY_EDGES=CITY_EDGES;window.getParentCityId=getParentCityId;window.isCityLocation=isCityLoc;
})();
