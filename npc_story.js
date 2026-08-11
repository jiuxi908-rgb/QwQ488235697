/* 核心 NPC 专属剧情：flags 驱动 2～3 段，好感门槛 */
(function(){
  var STORIES={
    aqing:[
      {id:1,needFavor:15,title:"竹叶止血",
        lines:["阿青蹲在湿石旁，把竹叶捣成糊，递到你面前。","「别动。蛇毒浅的，这个够用。」","她手指有草汁的苦香，动作很稳。","「你要是再乱采，下次我可不管。」她说完，耳尖有点红。"],
        reward:function(p){p.hp=Math.min(p.maxHp,(p.hp|0)+25);if(typeof addFavor==="function")addFavor(p,"aqing",8);return"气血+25 · 阿青好感+8";}},
      {id:2,needFavor:40,title:"药篓里的信",
        lines:["阿青把药篓放下，从夹层抽出一张皱纸。","「回春谷有人托我带话……说山下或许有能用的人。」","「不是招你入谷。只是——」她顿了顿，「别一个人硬撑。」","纸上只有一行小字：识药者，可来。"],
        reward:function(p){p.flags.aqing_letter=true;p.silver=(p.silver|0)+15;if(typeof addFavor==="function")addFavor(p,"aqing",10);return"银两+15 · 解锁线索「识药者」· 好感+10";}},
      {id:3,needFavor:70,title:"雨停之后",
        lines:["雨停了。阿青没有立刻走。","「我在竹径采了三年药。以前觉得够了。」","「遇见你之后……」她看着远处山门方向，「想看看山外的草，是不是也不一样。」","「你若还走江湖，偶尔回竹径。我——药还在。」"],
        reward:function(p){p.flags.aqing_bond=true;if(p.stats)p.stats.wit=(p.stats.wit|0)+1;if(typeof addFavor==="function")addFavor(p,"aqing",15);return"悟性+1 · 阿青心绪已明 · 好感+15";}}
    ],
    luyun:[
      {id:1,needFavor:20,title:"雾中第一剑",
        lines:["陆云把剑收回鞘，剑穗上的露水甩落。","「你的剑……还有空隙。但比昨日稳。」","他在石上划了半道弧：「跟我走这一步。心不要抢。」","雾散开一线，你忽然明白「慢」有时比快更难。"],
        reward:function(p){if(p.skills){var sw=p.skills.find(function(s){return s.type==="剑法";});if(sw){sw.exp=(sw.exp||0)+25;if(typeof addFavor==="function")addFavor(p,"luyun",8);return"【"+sw.name+"】经验+25 · 陆云好感+8";}}if(typeof addFavor==="function")addFavor(p,"luyun",8);return"剑意微明 · 好感+8";}},
      {id:2,needFavor:45,title:"外门夜话",
        lines:["值夜时，陆云难得说了长话。","「斋主三年收两个亲传，不是苛刻，是怕剑被人握歪。」","「我进外门七年，剑穗换了四次，人还在山门。」","「你若只为扬名，不必留。若为把剑握直——」他看你一眼，「可以再来。」"],
        reward:function(p){p.flags.luyun_night=true;if(typeof addFavor==="function")addFavor(p,"luyun",12);p.reputation=(p.reputation|0)+2;return"声望+2 · 陆云认可你一分 · 好感+12";}},
      {id:3,needFavor:75,title:"替你挡的那一剑",
        lines:["山道贼人突袭。陆云侧身，剑光横在你身前。","收招时，他袖口破了一道口子，血色很淡。","「下次自己挡。」他说得轻，像训同门。","「……也别死在我看不见的地方。」"],
        reward:function(p){p.flags.luyun_bond=true;if(typeof addFavor==="function")addFavor(p,"luyun",20);if(p.stats)p.stats.agi=(p.stats.agi|0)+1;return"身法+1 · 与陆云羁绊已成 · 好感+20";}}
    ],
    zhou:[
      {id:1,needFavor:10,title:"店里的旧账",
        lines:["老周擦着柜台，忽然压低声音。","「十年前，有个剑客在我店里住过一晚。第二天，人就没了。」","「只留下一句：黑盐道上，别信笑着递刀的人。」","「你当故事听也行。当日子过，也行。」"],
        reward:function(p){p.flags.zhou_tale=true;if(typeof addFavor==="function")addFavor(p,"zhou",6);return"记下旧闻 · 老周好感+6";}},
      {id:2,needFavor:35,title:"后门钥匙",
        lines:["老周塞给你一枚铜钥匙。","「后院柴房。真遇上事，从那儿走，别从正门。」","「我开店，不参与江湖。但住店的人，我得保他们睡个整觉。」","「钥匙别丢。丢了，当我没给过。」"],
        reward:function(p){p.flags.zhou_key=true;if(typeof addFavor==="function")addFavor(p,"zhou",10);p.silver=(p.silver|0)+8;return"获得「后门关照」· 银两+8 · 好感+10";}},
      {id:3,needFavor:60,title:"一碗面，两条路",
        lines:["老周在你面前放下热面。","「门派是墙，独行是路。墙暖，路宽。」","「你若要入某门，我敬你一碗。你若要自己走——」","他敲了敲桌：「我也敬你一碗。别饿着打仗。」"],
        reward:function(p){p.flags.zhou_bond=true;p.hp=Math.min(p.maxHp,(p.hp|0)+30);if(typeof addFavor==="function")addFavor(p,"zhou",12);return"气血+30 · 老周视你为「自己人」· 好感+12";}}
    ]
  };

  function favorOf(p,id){
    if(typeof getFavor==="function")return getFavor(p,id)|0;
    return (p.favor&&p.favor[id])|0;
  }

  function nextStory(p,npcId){
    var list=STORIES[npcId];
    if(!list)return null;
    for(var i=0;i<list.length;i++){
      var st=list[i];
      var key="story_"+npcId+"_"+st.id;
      if(p.flags&&p.flags[key])continue;
      if(favorOf(p,npcId)<st.needFavor)return{locked:true,need:st.needFavor,have:favorOf(p,npcId),title:st.title};
      return st;
    }
    return{done:true};
  }

  function playStory(p,npcId){
    if(!p.flags)p.flags={};
    var st=nextStory(p,npcId);
    if(!st||st.done)return{ok:false,msg:"你们之间该说的，似乎都说过了。"};
    if(st.locked)return{ok:false,msg:"再熟悉些再谈（好感需≥"+st.need+"，当前"+st.have+"）。"};
    var key="story_"+npcId+"_"+st.id;
    p.flags[key]=1;
    var rw=st.reward?st.reward(p):"";
    var body=(st.lines||[]).join("<br>");
    p.logs.unshift("【专属·"+st.title+"】"+(rw?("（"+rw+"）"):""));
    p.logs=p.logs.slice(0,50);
    return{ok:true,title:st.title,html:body,reward:rw};
  }

  function injectNpcStoryButton(npcId){
    var p=state&&state.player;
    if(!p||!STORIES[npcId])return;
    var panel=document.querySelector("#modalPanel");
    if(!panel)return;
    if(panel.querySelector("[data-story-npc]"))return;
    var st=nextStory(p,npcId);
    var label="专属往事";
    var dis=false;
    if(st&&st.done){label="往事已尽";dis=true;}
    else if(st&&st.locked){label="专属往事（好感≥"+st.need+"）";dis=true;}
    else if(st&&st.title)label="专属·"+st.title;

    var btn=document.createElement("button");
    btn.className="btn primary";
    btn.setAttribute("data-story-npc",npcId);
    btn.disabled=dis;
    btn.textContent=label;
    btn.style.marginTop="8px";
    btn.onclick=function(){
      var r=playStory(p,npcId);
      if(!r.ok){p.logs.unshift(r.msg);if(typeof saveGame==="function")saveGame(state);return;}
      if(typeof saveGame==="function")saveGame(state);
      openModal(
        '<div class="modal-head"><h2 class="section-title">'+r.title+'</h2>'+
        '<button class="modal-close" id="mClose">关闭</button></div>'+
        '<div class="talk-bubble">'+r.html+'</div>'+
        (r.reward?'<p class="small" style="color:var(--gold)">'+r.reward+'</p>':'')+
        '<button class="btn primary" id="stBack">返回对话</button>'
      );
      var c=document.querySelector("#mClose");if(c)c.onclick=closeModal;
      var b=document.querySelector("#stBack");
      if(b)b.onclick=function(){if(typeof modalNpc==="function")modalNpc(npcId);else closeModal();};
    };
    var row=panel.querySelector(".row")||panel;
    row.appendChild(btn);
  }

  function ensureZhouLoneAct(){
    if(typeof npcs==="undefined")return;
    var z=npcs.find(function(n){return n.id==="zhou";});
    if(!z||!z.acts)return;
    if(z.acts.some(function(a){return a.id==="lone_path";}))return;
    z.acts.push({id:"lone_path",name:"表明：我走独行",type:"lone_path"});
  }
  ensureZhouLoneAct();

  setTimeout(function(){
    if(typeof interactPerson==="function"){
      var _ip=interactPerson;
      interactPerson=function(player,npc,act){
        if(act==="lone_path"&&npc&&npc.id==="zhou"){
          player.flags=player.flags||{};
          player.flags.mq_lone=true;
          if(typeof markMainFlag==="function")markMainFlag(player,"lone");
          player.logs.unshift("你对老周说：门墙再暖，也是别人的。我走路。老周点头，又添了一碗面。");
          if(typeof advanceMainQuest==="function")advanceMainQuest(player);
          return{ok:true,msg:"独行之意已明"};
        }
        return _ip(player,npc,act);
      };
    }
    if(typeof modalNpc==="function"){
      var _mn=modalNpc;
      modalNpc=function(npcId){
        _mn(npcId);
        setTimeout(function(){injectNpcStoryButton(npcId);},0);
      };
    }
  },0);

  window.NPC_STORIES=STORIES;
  window.playNpcStory=playStory;
})();
