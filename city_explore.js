/* city_explore.js — 州府 Explore 执行层
 * city_content.json 只存数据；本文件负责抽样、结算、日志与 UI 反馈。
 */
(function(g){
  "use strict";
  var TYPE_LABEL={silver:"银两",exp:"经验",heal:"气血",damage:"气血",mp:"内力",stat:"属性",log:"见闻"};

  function player(){return(g.state&&g.state.player)||g.player||null;}
  function content(id){return typeof g.getCityContent==="function"?g.getCityContent(id):((g.cityContent||{})[id]||{explore:[]});}
  function pick(list){
    if(!Array.isArray(list)||!list.length)return null;
    var total=list.reduce(function(s,e){return s+Math.max(0,Number(e.weight)||0);},0);
    if(total<=0)return list[Math.floor(Math.random()*list.length)];
    var r=Math.random()*total;
    for(var i=0;i<list.length;i++){r-=Math.max(0,Number(list[i].weight)||0);if(r<=0)return list[i];}
    return list[list.length-1];
  }
  function log(p,text){
    if(!Array.isArray(p.logs))p.logs=[];
    p.logs.unshift(text);p.logs=p.logs.slice(0,50);
  }
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function ensureStats(p){if(!p.stats)p.stats={arm:5,agi:5,bone:5,qi:5,wit:5,luck:5};}
  function apply(p,event){
    var r=event.result||{}, parts=[], key, val;
    if(r.silver){p.silver=Math.max(0,(p.silver||0)+Number(r.silver));parts.push((r.silver>0?"获得 ":"损失 ")+Math.abs(r.silver)+"银");}
    if(r.hp){p.hp=clamp((p.hp==null?p.maxHp||100:p.hp)+Number(r.hp),1,p.maxHp||100);parts.push((r.hp>0?"恢复 ":"损失 ")+Math.abs(r.hp)+"气血");}
    if(r.mp){p.mp=clamp((p.mp==null?p.maxMp||60:p.mp)+Number(r.mp),0,p.maxMp||60);parts.push((r.mp>0?"恢复 ":"损失 ")+Math.abs(r.mp)+"内力");}
    if(r.exp){
      p.exp=(p.exp||0)+Number(r.exp);
      if(typeof p.experience==="number")p.experience+=Number(r.exp);
      parts.push("获得 "+r.exp+"历练");
    }
    if(r.stat){
      ensureStats(p);
      Object.keys(r.stat).forEach(function(k){val=Number(r.stat[k])||0;p.stats[k]=(p.stats[k]||0)+val;parts.push((g.STAT_LABELS&&g.STAT_LABELS[k]||k)+(val>0?"+":"")+val);});
    }
    if(r.log)parts.push(r.log);
    var summary=parts.length?"（"+parts.join("、")+"）":"";
    var line="【"+(event.title||"游历")+"】"+(event.text||"")+summary;
    log(p,line);
    if(g.Game&&Game.emit)Game.emit("city:explore",{cityId:p.worldLocation,event:event,result:r,player:p});
    return{ok:true,event:event,message:line};
  }
  function normalizeEvent(e,i){
    e=e||{};
    if(e.result)return Object.assign({id:"event_"+i,weight:1,title:TYPE_LABEL[e.type]||"游历"},e);
    var r={};
    if(e.type==="silver")r.silver=Number(e.value)||0;
    else if(e.type==="heal")r.hp=Math.abs(Number(e.value)||0);
    else if(e.type==="damage")r.hp=-Math.abs(Number(e.value)||0);
    else if(e.type==="mp")r.mp=Math.abs(Number(e.value)||0);
    else if(e.type==="exp")r.exp=Math.abs(Number(e.value)||0);
    else if(e.type==="stat"){r.stat={};r.stat[e.key]=Number(e.value)||0;}
    else if(e.type==="log")r.log=e.text||"";
    return Object.assign({},e,{id:e.id||"event_"+i,weight:e.weight==null?1:e.weight,title:e.title||TYPE_LABEL[e.type]||"游历",result:r});
  }
  function events(id){return (content(id).explore||[]).map(normalizeEvent);}
  function explore(id){
    var p=player();if(!p)return{ok:false,msg:"没有可用玩家存档。"};
    var list=events(id||p.worldLocation);if(!list.length)return{ok:false,msg:"本城暂时没有可游历内容。"};
    return apply(p,pick(list));
  }
  function open(cityId){
    var p=player();if(!p)return;
    cityId=cityId||p.worldLocation;if(!cityId)return;
    var c=(g.WORLD_MAP_LAYERED&&g.WORLD_MAP_LAYERED.city)?g.WORLD_MAP_LAYERED.city(cityId):null;
    var list=events(cityId),root=document.getElementById("modalRoot");if(!root)return;
    var esc=function(s){return String(s==null?"":s).replace(/[&<>\"']/g,function(x){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[x];});};
    var html='<div class="modal-mask" id="cityExploreModal"><div class="modal-panel"><div class="modal-head"><h3 class="section-title">'+esc(c?c.name:cityId)+' · 游历</h3><button class="modal-close" onclick="cityExploreClose()">关闭</button></div>';
    html+='<div class="small">随机事件按 weight 抽取；结果会直接写入玩家状态与日志。</div><div class="city-explore-list">';
    list.forEach(function(e,i){html+='<button class="city-explore-option" onclick="cityExploreRun(\''+esc(cityId)+'\','+i+')"><b>'+esc(e.title)+'</b><span>'+esc(e.text)+'</span><small>权重 '+e.weight+' · '+esc(TYPE_LABEL[e.type]||e.type||"效果")+'</small></button>';});
    html+='</div></div></div>';root.innerHTML=html;
    g.__CITY_EXPLORE_CACHE=list;
  }
  function run(id,index){
    var list=g.__CITY_EXPLORE_CACHE||events(id),e=list[index];if(!e)return;
    var p=player();var r=apply(p,e);if(!r.ok)return;
    if(typeof renderGame==="function")renderGame();
    open(id);
    if(typeof showToast==="function")showToast(r.message);
  }
  function close(){var e=document.getElementById("cityExploreModal");if(e)e.remove();}
  g.CityExplore={events:events,explore:explore,open:open,run:run,close:close};
  g.cityExploreOpen=open;g.cityExploreRun=run;g.cityExploreClose=close;
  if(typeof document!=="undefined"){
    var s=document.createElement("style");s.textContent='.city-explore-list{display:grid;gap:7px;margin-top:9px}.city-explore-option{display:block;width:100%;padding:9px;text-align:left;background:#1a1512;color:#e8d7bd;border:1px solid #4b3a2d;border-radius:8px}.city-explore-option b{display:block;color:#d9ad62}.city-explore-option span{display:block;margin-top:4px;font-size:11px}.city-explore-option small{display:block;margin-top:5px;color:#8f806d;font-size:9px}';document.head.appendChild(s);
  }
})(typeof window!=="undefined"?window:this);
