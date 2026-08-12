/* world_map_v2.js — 分层天下地图增强层
 * 保留现有 world_map.js / X_MAP，增加稳定的 city -> spot 层级、城际边和长途旅行。
 */
(function(g){"use strict";
var C={
 kaifeng:{name:"开封",alias:"东京",region:"中原核心",tag:"缉武司",children:["qinghe","market","hearth","sparrow_den","secret_cave","blood_ravine"]},
 luoyang:{name:"洛阳",alias:"西京",region:"中原西部",tag:"寺观",children:["herb_valley","void_temple","cloud_peak"]},
 yingtian:{name:"应天",alias:"商丘",region:"中原东部",tag:"官道",children:[]},
 yangzhou:{name:"扬州",alias:"淮扬",region:"漕运",tag:"盐银",children:["ferry","salt_road","whale_port","secret_reef"]},
 jiankang:{name:"建康",alias:"江东",region:"江东",tag:"江防",children:[]},
 hangzhou:{name:"杭州",alias:"临安",region:"两浙",tag:"湖山",children:["bamboo","mist_gate"]},
 suzhou:{name:"苏州",alias:"姑苏",region:"两浙",tag:"丝织",children:[]},
 mingzhou:{name:"明州",alias:"宁波",region:"海路",tag:"市舶",children:[]},
 quanzhou:{name:"泉州",alias:"刺桐",region:"海路",tag:"海贸",children:[]},
 guangzhou:{name:"广州",alias:"岭南",region:"海路",tag:"南海商盟",children:[]},
 ezhou:{name:"鄂州",alias:"江汉",region:"荆湖",tag:"长江",children:[]},
 changsha:{name:"长沙",alias:"潭州",region:"荆湖",tag:"湘江",children:[]},
 chengdu:{name:"成都",alias:"蜀中",region:"川峡",tag:"蜀道",children:[]}
};
var E=[
 ["kaifeng","luoyang",2,"road"],["kaifeng","yingtian",2,"road"],["luoyang","yingtian",3,"road"],
 ["yingtian","yangzhou",2,"canal"],["yangzhou","jiankang",2,"canal"],["jiankang","hangzhou",2,"canal"],["hangzhou","suzhou",1,"canal"],
 ["yangzhou","ezhou",4,"river"],["hangzhou","mingzhou",2,"sea"],["mingzhou","quanzhou",4,"sea"],["quanzhou","guangzhou",5,"sea"],
 ["ezhou","changsha",2,"river"],["changsha","chengdu",8,"mountain"]
];
var KIND={road:"官道",canal:"运河",river:"江路",sea:"海路",mountain:"蜀道"};
function city(id){return C[id]||null}
function neighbors(id){var a=[];E.forEach(function(e){if(e[0]===id)a.push({id:e[1],city:C[e[1]],cost:e[2],kind:e[3]});if(e[1]===id)a.push({id:e[0],city:C[e[0]],cost:e[2],kind:e[3]})});return a}
function owner(loc){var m=typeof getMapById==="function"?getMapById(loc):null;if(m&&C[m.parent])return m.parent;for(var id in C)if(C[id].children.indexOf(loc)>=0)return id;return"kaifeng"}
function path(a,b){if(a===b)return[a];var q=[a],prev={};prev[a]=null;while(q.length){var cur=q.shift();var ns=neighbors(cur);for(var i=0;i<ns.length;i++){var n=ns[i].id;if(prev[n]!==undefined)continue;prev[n]=cur;if(n===b){var r=[n],x=cur;while(x){r.push(x);x=prev[x]}return r.reverse()}q.push(n)}}return null}
function edge(a,b){for(var i=0;i<E.length;i++){if((E[i][0]===a&&E[i][1]===b)||(E[i][0]===b&&E[i][1]===a))return{cost:E[i][2],kind:E[i][3]}}return null}
function travel(p,to){if(!p||!C[to])return{ok:false,msg:"未知州府"};var from=p.worldLocation||owner(p.location);if(from===to)return{ok:false,msg:"已经在"+C[to].name};var route=path(from,to);if(!route)return{ok:false,msg:"没有可用的城际路线"};var days=0;for(var i=0;i<route.length-1;i++)days+=edge(route[i],route[i+1]).cost;var unit=(typeof TIME_COST!=="undefined"&&TIME_COST.move!=null)?TIME_COST.move:1;if(typeof advanceTime==="function")advanceTime(p,days*unit);p.worldLocation=to;if(!Array.isArray(p.worldVisited))p.worldVisited=[];if(p.worldVisited.indexOf(to)<0)p.worldVisited.push(to);if(!Array.isArray(p.logs))p.logs=[];p.logs.push("经"+route.map(function(x){return C[x].name}).join(" → ")+"，抵达"+C[to].name+"，耗时"+days+"日。");if(g.Game&&Game.emit)Game.emit("world:travel",{from:from,to:to,route:route,days:days,kind:route.slice(0,-1).map(function(x,i){return edge(x,route[i+1]).kind})});return{ok:true,from:from,to:to,route:route,days:days}}
function enter(p,cityId,spotId){if(!C[cityId])return{ok:false,msg:"未知州府"};if(spotId&&C[cityId].children.indexOf(spotId)>=0){p.location=spotId;p.worldLocation=cityId;if(Array.isArray(p.explored)&&p.explored.indexOf(spotId)<0)p.explored.push(spotId);return{ok:true,location:spotId}}return{ok:true,children:C[cityId].children.slice()}}
function esc(s){return String(s==null?"":s).replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;"," ":" ",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}
function open(){var p=g.player;if(!p)return;var root=document.getElementById("modalRoot");if(!root)return;var cur=p.worldLocation||owner(p.location),html='<div class="modal-mask" id="worldMapV2"><div class="modal-panel"><div class="modal-head"><h3 class="section-title">天下舆图</h3><button class="modal-close" onclick="document.getElementById(\'worldMapV2\').remove()">关闭</button></div><div class="world-v2-current"><b>'+C[cur].name+'</b><span>'+C[cur].alias+' · '+C[cur].region+' · '+C[cur].tag+'</span><p>当前江湖点：'+(typeof getMapById==="function"&&getMapById(p.location)?getMapById(p.location).name:p.location)+'</p></div><div class="world-v2-grid">';Object.keys(C).forEach(function(id){var active=id===cur,near=neighbors(cur).some(function(n){return n.id===id}),visited=p.worldVisited&&p.worldVisited.indexOf(id)>=0;html+='<button class="world-v2-city '+(active?"active ":"")+(near?"near ":"")+(visited?"visited":"")+'" onclick="worldV2Travel(\''+id+'\')"><b>'+C[id].name+'</b><small>'+C[id].alias+' · '+C[id].region+'</small><i>'+C[id].tag+'</i></button>'});html+='</div><div class="section-title">当前可达城际路线</div><div class="world-v2-routes">';neighbors(cur).forEach(function(n){html+='<div><span>'+n.city.name+' · '+KIND[n.kind]+'</span><b>'+n.cost+'日</b></div>'});html+='</div><div class="small">州府只负责长途旅行；清河、竹径、山门等仍由原江湖点地图承载。城际旅行不会强制经过每个小镇。</div></div></div>';root.innerHTML=html}
g.WORLD_MAP_LAYERED={cities:C,edges:E,neighbors:neighbors,owner:owner,path:path,travel:travel,enter:enter,open:open};
g.worldV2Travel=function(id){var r=travel(g.player,id);if(!r.ok){if(typeof showToast==="function")showToast(r.msg);return}open();if(typeof renderGame==="function")renderGame()};
function install(){if(typeof document==="undefined")return;var bars=document.querySelectorAll(".toolbar");for(var i=0;i<bars.length;i++){var bar=bars[i];if(!g.player||bar.querySelector("[data-world-v2]"))continue;var b=document.createElement("button");b.className="btn sm";b.textContent="天下舆图";b.dataset.worldV2="1";b.onclick=open;bar.appendChild(b)}}
function style(){if(document.getElementById("world-v2-style"))return;var s=document.createElement("style");s.id="world-v2-style";s.textContent='.world-v2-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.world-v2-city{min-height:64px;text-align:left;padding:7px;background:#1a1512;color:#e8d7bd;border:1px solid #4b3a2d;border-radius:7px}.world-v2-city b{display:block;color:#f5e8cf}.world-v2-city small{display:block;color:#8f806d;font-size:9px;margin-top:2px}.world-v2-city i{display:block;color:#d9ad62;font-style:normal;font-size:9px;margin-top:3px}.world-v2-city.active{border-color:#d9ad62;background:#34271e}.world-v2-city.near{box-shadow:inset 0 0 0 1px rgba(217,173,98,.18)}.world-v2-city.visited{border-bottom-color:#7aae6a}.world-v2-current{padding:8px;border:1px solid #4b3a2d;background:#1a1512;border-radius:8px;margin-bottom:8px}.world-v2-current b{color:#d9ad62;font-size:17px}.world-v2-current span{font-size:10px;color:#b9a58a;margin-left:6px}.world-v2-current p{font-size:11px;color:#d8c6aa;margin:5px 0}.world-v2-routes>div{display:flex;justify-content:space-between;padding:5px 2px;border-bottom:1px dashed rgba(75,58,45,.35);font-size:11px}.world-v2-routes b{color:#d9ad62}@media(max-width:600px){.world-v2-grid{grid-template-columns:repeat(2,1fr)}}';document.head.appendChild(s)}
function boot(){style();install()}if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,200)});else setTimeout(boot,200);setInterval(install,1200)}
})(typeof window!=="undefined"?window:this);
