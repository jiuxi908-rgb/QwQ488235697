/* world_map_v2.js — 分层天下地图增强层
 * 数据源优先使用 data/world.json，避免 world_map.js / world_map_v2.js / world.json 三套城际路线漂移。
 * 保留 file:// fallback，旧江湖点仍由 maps.json + map_grid.js 承载。
 */
(function(g){
  "use strict";

  var FALLBACK={
    cities:{
      kaifeng:{name:"开封",alias:"东京",region:"中原核心",tag:"缉武司",desc:"天下漕运汇聚之地，缉武司耳目遍布坊市。",children:["qinghe","market","hearth","sparrow_den","secret_cave","blood_ravine"]},
      luoyang:{name:"洛阳",alias:"西京",region:"中原西部",tag:"寺观",desc:"古都山河之间，寺观、士人和江湖客交错往来。",children:["herb_valley","void_temple","cloud_peak"]},
      yingtian:{name:"应天",alias:"商丘",region:"中原东部",tag:"官道驿",desc:"归德旧地，南北官道在此交汇，驿骑昼夜不息。",children:[]},
      yangzhou:{name:"扬州",alias:"淮扬",region:"漕运",tag:"盐银",desc:"江淮舟楫云集，盐商、漕船与江湖人物共同维系繁盛市面。",children:["ferry","salt_road","whale_port","secret_reef"]},
      jiankang:{name:"建康",alias:"金陵",region:"江东",tag:"江防",desc:"江东重镇，城防森严，旧都气象与江湖风声并存。",children:[]},
      hangzhou:{name:"杭州",alias:"临安",region:"两浙",tag:"湖山",desc:"湖山清丽而商旅不绝，茶、丝与江湖消息沿水路汇聚。",children:["bamboo","mist_gate"]},
      suzhou:{name:"苏州",alias:"姑苏",region:"两浙",tag:"丝织·机坊",desc:"水巷纵横，丝织机坊昼夜作响，商贾与工匠往来不绝。",children:[]},
      ezhou:{name:"鄂州",alias:"江汉",region:"荆湖",tag:"江泊·货船",desc:"江汉水路的中游枢纽，货船、江泊与水寨消息汇成一处。",children:[]},
      mingzhou:{name:"明州",alias:"宁波",region:"海路",tag:"市舶·海驿",desc:"海舶渐盛的港口，远洋商旅带来异域货物与江湖传闻。",children:["haizhan"]},
      quanzhou:{name:"泉州",alias:"刺桐",region:"海路",tag:"海贸·蕃坊",desc:"海商汇聚的大港，蕃坊、香料与海船带来异域消息。",children:["quanzhou_wharf"]},
      guangzhou:{name:"广州",alias:"岭南",region:"海路",tag:"南海商货",desc:"南海商路尽头，热风裹着异域货香，商盟势力盘根错节。",children:[]},
      changsha:{name:"长沙",alias:"潭州",region:"荆湖",tag:"湘米·舟船",desc:"湘江贯城，米船往来不绝，荆湖江路在此转折。",children:[]},
      chengdu:{name:"成都",alias:"蜀中",region:"川峡",tag:"锦官·蜀道难",desc:"锦官城富庶而群山险阻，入蜀道路漫长，远行者多在此歇脚。",children:[]}
    },
    edges:[
      ["kaifeng","luoyang",2,"road"],["kaifeng","yingtian",3,"road"],["luoyang","yingtian",3,"road"],["yingtian","yangzhou",3,"canal"],["kaifeng","yangzhou",5,"canal"],
      ["yangzhou","jiankang",3,"river"],["jiankang","hangzhou",3,"river"],["hangzhou","suzhou",2,"canal"],["yangzhou","ezhou",5,"river"],
      ["hangzhou","mingzhou",3,"sea"],["mingzhou","quanzhou",5,"sea"],["quanzhou","guangzhou",6,"sea"],["ezhou","changsha",4,"river"],["changsha","chengdu",7,"mountain"]
    ]
  };

  function fromWorldData(){
    var wm=g.world&&g.world.worldMap;
    if(!wm||!wm.cities||!Array.isArray(wm.edges))return FALLBACK;
    var cities={};
    Object.keys(wm.cities).forEach(function(id){
      var x=wm.cities[id]||{};
      cities[id]={name:x.name||id,alias:x.alias||"",region:x.region||"",tag:x.tag||"",desc:x.desc||"",children:Array.isArray(x.children)?x.children.slice():[]};
    });
    return{cities:cities,edges:wm.edges.map(function(e){return[e[0],e[1],Number(e[2])||1,e[3]||"road"]})};
  }

  var DATA=fromWorldData(),C=DATA.cities,E=DATA.edges;
  var KIND={road:"官道",canal:"运河",river:"江路",sea:"海路",mountain:"蜀道"};

  function city(id){return C[id]||null;}
  function neighbors(id){
    var a=[];
    E.forEach(function(e){
      if(e[0]===id&&C[e[1]])a.push({id:e[1],city:C[e[1]],cost:e[2],kind:e[3]});
      if(e[1]===id&&C[e[0]])a.push({id:e[0],city:C[e[0]],cost:e[2],kind:e[3]});
    });
    return a;
  }
  function owner(loc){
    var m=typeof getMapById==="function"?getMapById(loc):null;
    if(m&&m.parent&&C[m.parent])return m.parent;
    for(var id in C)if(C[id].children.indexOf(loc)>=0)return id;
    return null;
  }
  function path(a,b){
    if(!C[a]||!C[b])return null;
    if(a===b)return[a];
    var q=[a],prev={};prev[a]=null;
    while(q.length){
      var cur=q.shift(),ns=neighbors(cur);
      for(var i=0;i<ns.length;i++){
        var n=ns[i].id;if(prev[n]!==undefined)continue;
        prev[n]=cur;if(n===b){var r=[n],x=cur;while(x){r.push(x);x=prev[x];}return r.reverse();}
        q.push(n);
      }
    }
    return null;
  }
  function edge(a,b){
    for(var i=0;i<E.length;i++)if((E[i][0]===a&&E[i][1]===b)||(E[i][0]===b&&E[i][1]===a))return{cost:E[i][2],kind:E[i][3]};
    return null;
  }
  function travel(p,to){
    if(!p||!C[to])return{ok:false,msg:"未知州府"};
    var from=p.worldLocation||owner(p.location);
    if(!from||!C[from])return{ok:false,msg:"当前江湖点尚未登记所属州府"};
    if(from===to)return{ok:false,msg:"已经在"+C[to].name};
    var route=path(from,to);if(!route)return{ok:false,msg:"没有可用的城际路线"};
    var days=0;
    for(var i=0;i<route.length-1;i++){var e=edge(route[i],route[i+1]);if(!e)return{ok:false,msg:"路线数据不完整"};days+=e.cost;}
    var unit=(typeof TIME_COST!=="undefined"&&TIME_COST.move!=null)?TIME_COST.move:1;
    if(typeof advanceTime==="function")advanceTime(p,days*unit);
    p.worldLocation=to;
    if(!Array.isArray(p.worldVisited))p.worldVisited=[];
    if(p.worldVisited.indexOf(to)<0)p.worldVisited.push(to);
    if(!Array.isArray(p.logs))p.logs=[];
    p.logs.unshift("经"+route.map(function(x){return C[x].name;}).join(" → ")+"，抵达"+C[to].name+"，耗时"+days+"日。");
    p.logs=p.logs.slice(0,50);
    if(g.Game&&Game.emit)Game.emit("world:travel",{from:from,to:to,route:route,days:days,kind:route.slice(0,-1).map(function(x,i){return edge(x,route[i+1]).kind;})});
    return{ok:true,from:from,to:to,route:route,days:days};
  }
  function enter(p,cityId,spotId){
    if(!p||!C[cityId])return{ok:false,msg:"未知州府"};
    if(spotId&&C[cityId].children.indexOf(spotId)>=0){p.location=spotId;p.worldLocation=cityId;return{ok:true,location:spotId};}
    p.worldLocation=cityId;return{ok:true,children:C[cityId].children.slice()};
  }
  function esc(s){return String(s==null?"":s).replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c;});}
  function closeMap(){var el=document.getElementById("worldMapV2");if(el)el.remove();}
  function open(){
    var p=g.state&&g.state.player||g.player;if(!p)return;
    var root=document.getElementById("modalRoot");if(!root)return;
    var cur=p.worldLocation||owner(p.location)||"kaifeng";
    var current=C[cur]||C.kaifeng;
    var html='<div class="modal-mask" id="worldMapV2"><div class="modal-panel"><div class="modal-head"><h3 class="section-title">天下舆图</h3><button class="modal-close" onclick="worldV2Close()">关闭</button></div>';
    html+='<div class="world-v2-current"><b>'+esc(current.name)+'</b><span>'+esc(current.alias)+' · '+esc(current.region)+' · '+esc(current.tag)+'</span><p>'+esc(current.desc||"")+'</p>';
    html+='<p>当前江湖点：'+esc((typeof getMapById==="function"&&getMapById(p.location)?getMapById(p.location).name:p.location||"未知"))+'</p></div>';
    html+='<div class="world-v2-grid">';
    Object.keys(C).forEach(function(id){var active=id===cur,near=neighbors(cur).some(function(n){return n.id===id;}),visited=Array.isArray(p.worldVisited)&&p.worldVisited.indexOf(id)>=0;html+='<button class="world-v2-city '+(active?"active ":"")+(near?"near ":"")+(visited?"visited":"")+'" onclick="worldV2Travel(\''+id+'\')"><b>'+esc(C[id].name)+'</b><small>'+esc(C[id].alias)+' · '+esc(C[id].region)+'</small><i>'+esc(C[id].tag)+'</i></button>';});
    html+='</div><div class="section-title">当前可达城际路线</div><div class="world-v2-routes">';
    neighbors(cur).forEach(function(n){html+='<div><span>'+esc(n.city.name)+' · '+esc(KIND[n.kind]||n.kind)+'</span><b>'+n.cost+'日</b></div>';});
    if(!neighbors(cur).length)html+='<div class="small">当前州府暂无可用城际路线。</div>';
    html+='</div><div class="small">州府负责长途旅行；清河、竹径、山门等仍由原江湖点地图承载。路线数据来自 data/world.json。</div></div></div>';
    root.innerHTML=html;
  }
  g.WORLD_MAP_LAYERED={cities:C,edges:E,neighbors:neighbors,owner:owner,path:path,travel:travel,enter:enter,open:open};
  g.worldV2Close=closeMap;
  g.worldV2Travel=function(id){var r=travel(g.state&&g.state.player||g.player,id);if(!r.ok){if(typeof showToast==="function")showToast(r.msg);else if(typeof alert==="function")alert(r.msg);return;}open();if(typeof renderGame==="function")renderGame();};

  function install(){
    if(typeof document==="undefined")return;
    var bars=document.querySelectorAll(".toolbar");
    for(var i=0;i<bars.length;i++){
      var bar=bars[i];
      if(!g.player&&!g.state?.player)continue;
      if(bar.querySelector("[data-world-v2], [data-world-layered]"))continue;
      var b=document.createElement("button");b.className="btn sm";b.textContent="天下舆图";b.dataset.worldV2="1";b.onclick=open;bar.appendChild(b);
    }
  }
  function style(){
    if(document.getElementById("world-v2-style"))return;
    var s=document.createElement("style");s.id="world-v2-style";
    s.textContent='.world-v2-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.world-v2-city{min-height:64px;text-align:left;padding:7px;background:#1a1512;color:#e8d7bd;border:1px solid #4b3a2d;border-radius:7px}.world-v2-city b{display:block;color:#f5e8cf}.world-v2-city small{display:block;color:#8f806d;font-size:9px;margin-top:2px}.world-v2-city i{display:block;color:#d9ad62;font-style:normal;font-size:9px;margin-top:3px}.world-v2-city.active{border-color:#d9ad62;background:#34271e}.world-v2-city.near{box-shadow:inset 0 0 0 1px rgba(217,173,98,.18)}.world-v2-city.visited{border-bottom-color:#7aae6a}.world-v2-current{padding:8px;border:1px solid #4b3a2d;background:#1a1512;border-radius:8px;margin-bottom:8px}.world-v2-current b{color:#d9ad62;font-size:17px}.world-v2-current span{font-size:10px;color:#b9a58a;margin-left:6px}.world-v2-current p{font-size:11px;color:#d8c6aa;margin:5px 0}.world-v2-routes>div{display:flex;justify-content:space-between;padding:5px 2px;border-bottom:1px dashed rgba(75,58,45,.35);font-size:11px}.world-v2-routes b{color:#d9ad62}@media(max-width:600px){.world-v2-grid{grid-template-columns:repeat(2,1fr)}}';
    document.head.appendChild(s);
  }
  function boot(){style();install();}
  if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,200);});else setTimeout(boot,200);setInterval(install,1200);}
})(typeof window!=="undefined"?window:this);
