/* 门派任务系统 · 任务武学 */
(function(){
  /** 任务奖励武学（完成对应门派任务或贡献兑换） */
  var SECT_QUEST_SKILLS=[
    {id:"mist_guard",name:"护山剑势",type:"剑法",quality:"黄阶",req:{agi:8,wit:6},cost:0,mp:6,power:14,effect:null,maxExp:55,desc:"烟岚外门巡山所用，剑意护周。"},
    {id:"furnace_stance",name:"护炉刀势",type:"刀法",quality:"黄阶",req:{arm:9,bone:6},cost:0,mp:7,power:16,effect:"流血",maxExp:60,desc:"赤炉学徒守炉刀法，势沉力重。"},
    {id:"herb_needle",name:"药针手",type:"拳掌",quality:"黄阶",req:{wit:7,qi:6},cost:0,mp:5,power:11,effect:"破绽",maxExp:55,desc:"回春谷外门以指代针，点穴疗伤两用。"},
    {id:"tide_rope",name:"潮绳功",type:"内功",quality:"黄阶",req:{qi:8},cost:0,mp:0,power:0,effect:"maxMp+25",maxExp:70,desc:"玄鲸帮水手吐纳，借潮息养气。"},
    {id:"silent_pass",name:"无声渡",type:"轻功",quality:"黄阶",req:{agi:9,luck:4},cost:0,mp:4,power:0,effect:"dodge+4",maxExp:55,desc:"白雀影卫入门步法，落地无声。"},
    {id:"sutra_seal",name:"抄经印",type:"拳掌",quality:"黄阶",req:{wit:9,qi:7},cost:0,mp:8,power:12,effect:"迟滞",maxExp:60,desc:"无相寺抄经时悟出的掌印，以静制动。"},
    {id:"patrol_fist",name:"巡山拳",type:"拳掌",quality:"黄阶",req:{arm:7,agi:6},cost:0,mp:4,power:10,effect:null,maxExp:50,desc:"各门外门通用巡山拳架。"},
    {id:"envoy_blade",name:"传信刀",type:"刀法",quality:"玄阶",req:{agi:11,arm:8},cost:0,mp:10,power:24,effect:"破绽",maxExp:110,desc:"白雀楼传信所用短刀法，快而准。"},
    {id:"fog_pierce",name:"破雾一剑",type:"剑法",quality:"玄阶",req:{agi:12,wit:9},cost:0,mp:11,power:26,effect:"迟滞",maxExp:115,desc:"烟岚内门在雾中觅敌的一剑。"},
    {id:"ore_break",name:"开山断矿",type:"刀法",quality:"玄阶",req:{arm:13,bone:9},cost:0,mp:12,power:28,effect:"流血",maxExp:120,desc:"赤炉内门开矿断石的刀势。"},
    {id:"detox_palm",name:"解毒散掌",type:"拳掌",quality:"玄阶",req:{bone:11,qi:10,wit:8},cost:0,mp:14,power:20,effect:"heal",maxExp:120,desc:"回春谷内门解毒素掌，亦可伤敌。"},
    {id:"contract_breath",name:"契约吐纳",type:"内功",quality:"玄阶",req:{qi:13,luck:6},cost:0,mp:0,power:0,effect:"maxMp+40,qi+1",maxExp:130,desc:"玄鲸帮内门以契约心法稳息。"},
    {id:"heart_seal",name:"观心印",type:"拳掌",quality:"玄阶",req:{wit:14,qi:11},cost:0,mp:16,power:30,effect:"内伤",maxExp:140,desc:"无相寺戒律院观心印，专破心魔。"}
  ];

  /* 并入全局 skills */
  if(typeof skills!=="undefined"&&Array.isArray(skills)){
    SECT_QUEST_SKILLS.forEach(function(sk){
      if(!skills.some(function(s){return s.id===sk.id;}))skills.push(sk);
    });
  }

  /** 各门派扩充任务：rank 0外门 1内门 2亲传；skill 完成后学会；daily 每日限次 */
  var EXTRA_TASKS={
    yanlan:[
      {id:"yl5",name:"外门巡山",desc:"沿山道巡逻一周",contrib:10,silver:6,rank:0,daily:true},
      {id:"yl6",name:"传授护山剑",desc:"完成巡山后领悟护山剑势",contrib:15,rank:0,skill:"mist_guard",once:true},
      {id:"yl7",name:"雾中寻人",desc:"在云雾中找到迷路香客",contrib:18,diff:38,rank:0},
      {id:"yl8",name:"内门剑会",desc:"参加内门小比",contrib:22,diff:48,rank:1},
      {id:"yl9",name:"破雾试剑",desc:"雾中出剑不乱",contrib:28,diff:55,rank:1,skill:"fog_pierce",once:true},
      {id:"yl10",name:"护持斋主",desc:"随斋主巡视山门",contrib:35,diff:65,rank:2}
    ],
    chilu:[
      {id:"cl5",name:"守炉一夜",desc:"守着炉火不灭",contrib:10,silver:8,rank:0,daily:true},
      {id:"cl6",name:"领悟护炉刀",desc:"炉边苦练得护炉刀势",contrib:16,rank:0,skill:"furnace_stance",once:true},
      {id:"cl7",name:"试刀断木",desc:"一刀断木",contrib:14,diff:32,rank:0},
      {id:"cl8",name:"护送刀坯",desc:"护刀坯至市集",contrib:20,diff:42,rank:1},
      {id:"cl9",name:"开山断矿",desc:"以刀开矿",contrib:26,diff:52,rank:1,skill:"ore_break",once:true},
      {id:"cl10",name:"镇炉异动",desc:"协助社主镇压炉心",contrib:38,diff:70,rank:2}
    ],
    huichun:[
      {id:"hc5",name:"识药一日",desc:"辨认谷中药草",contrib:9,silver:5,rank:0,daily:true},
      {id:"hc6",name:"药针入门",desc:"学会以指代针",contrib:14,rank:0,skill:"herb_needle",once:true},
      {id:"hc7",name:"义诊清河",desc:"去清河镇义诊",contrib:12,rank:0},
      {id:"hc8",name:"追缉毒师",desc:"追查制毒者下落",contrib:24,diff:45,rank:1},
      {id:"hc9",name:"解毒散掌",desc:"在毒障中炼掌",contrib:30,diff:55,rank:1,skill:"detox_palm",once:true},
      {id:"hc10",name:"禁地采药",desc:"入谷中禁地",contrib:36,diff:68,rank:2}
    ],
    xuanjing:[
      {id:"xj5",name:"缆绳值守",desc:"看守码头缆绳",contrib:10,silver:10,rank:0,daily:true},
      {id:"xj6",name:"潮绳吐纳",desc:"在潮头练吐纳",contrib:14,rank:0,skill:"tide_rope",once:true},
      {id:"xj7",name:"近海护航",desc:"护送货船一程",contrib:16,diff:40,rank:0},
      {id:"xj8",name:"清剿水贼",desc:"清剿近海水贼",contrib:24,diff:50,rank:1},
      {id:"xj9",name:"契约吐纳",desc:"以契约心法稳息",contrib:28,rank:1,skill:"contract_breath",once:true},
      {id:"xj10",name:"深海探路",desc:"随船头探深海",contrib:40,diff:72,rank:2}
    ],
    baique:[
      {id:"bq5",name:"影中行走",desc:"无声穿过楼廊",contrib:12,silver:8,rank:0,daily:true},
      {id:"bq6",name:"无声渡",desc:"学会落地无声",contrib:15,rank:0,skill:"silent_pass",once:true},
      {id:"bq7",name:"传信一城",desc:"送达一封密信",contrib:14,diff:30,rank:0},
      {id:"bq8",name:"假情报",desc:"布下假情报",contrib:22,diff:45,rank:1},
      {id:"bq9",name:"传信刀法",desc:"领悟传信刀",contrib:26,rank:1,skill:"envoy_blade",once:true},
      {id:"bq10",name:"清除内鬼",desc:"处决楼内叛徒",contrib:35,diff:62,rank:2}
    ],
    wuxiang:[
      {id:"wx5",name:"抄经静心",desc:"抄写无相经一卷",contrib:10,rank:0,daily:true},
      {id:"wx6",name:"抄经印",desc:"抄经时悟出掌印",contrib:15,rank:0,skill:"sutra_seal",once:true},
      {id:"wx7",name:"面壁一日",desc:"面壁观心",contrib:12,rank:0},
      {id:"wx8",name:"戒律巡寺",desc:"协助清查破戒",contrib:20,diff:42,rank:1},
      {id:"wx9",name:"观心印",desc:"习得观心印",contrib:28,diff:58,rank:1,skill:"heart_seal",once:true},
      {id:"wx10",name:"降服心魔",desc:"挑战心魔幻境",contrib:36,diff:70,rank:2}
    ]
  };

  function mergeSectTasks(){
    if(typeof sects==="undefined")return;
    sects.forEach(function(sect){
      var extra=EXTRA_TASKS[sect.id];
      if(!extra)return;
      if(!sect.tasks)sect.tasks=[];
      extra.forEach(function(t){
        if(!sect.tasks.some(function(x){return x.id===t.id;}))sect.tasks.push(t);
      });
      /* 商店增加任务武学兑换 */
      if(!sect.shop)sect.shop=[];
      var skillShops={
        yanlan:[{id:"yl_mist",name:"护山剑势",cost:20,contribNeed:20,skill:"mist_guard"},{id:"yl_fog",name:"破雾一剑",cost:40,contribNeed:55,skill:"fog_pierce"}],
        chilu:[{id:"cl_furn",name:"护炉刀势",cost:20,contribNeed:22,skill:"furnace_stance"},{id:"cl_ore",name:"开山断矿",cost:40,contribNeed:58,skill:"ore_break"}],
        huichun:[{id:"hc_needle",name:"药针手",cost:18,contribNeed:18,skill:"herb_needle"},{id:"hc_detox",name:"解毒散掌",cost:38,contribNeed:52,skill:"detox_palm"}],
        xuanjing:[{id:"xj_rope",name:"潮绳功",cost:22,contribNeed:20,skill:"tide_rope"},{id:"xj_cont",name:"契约吐纳",cost:42,contribNeed:60,skill:"contract_breath"}],
        baique:[{id:"bq_silent",name:"无声渡",cost:25,contribNeed:25,skill:"silent_pass"},{id:"bq_envoy",name:"传信刀",cost:45,contribNeed:58,skill:"envoy_blade"}],
        wuxiang:[{id:"wx_sutra",name:"抄经印",cost:22,contribNeed:22,skill:"sutra_seal"},{id:"wx_heart",name:"观心印",cost:48,contribNeed:65,skill:"heart_seal"}]
      };
      (skillShops[sect.id]||[]).forEach(function(it){
        if(!sect.shop.some(function(x){return x.id===it.id;}))sect.shop.push(it);
      });
      if(!sect.skills)sect.skills=[];
      ["mist_guard","fog_pierce","furnace_stance","ore_break","herb_needle","detox_palm","tide_rope","contract_breath","silent_pass","envoy_blade","sutra_seal","heart_seal"].forEach(function(sid){
        if(EXTRA_TASKS[sect.id]&&EXTRA_TASKS[sect.id].some(function(t){return t.skill===sid;})){
          if(sect.skills.indexOf(sid)<0)sect.skills.push(sid);
        }
      });
    });
  }
  mergeSectTasks();

  function ensureSectQuestFlags(p){
    if(!p.flags)p.flags={};
    if(!p.sectTaskDone)p.sectTaskDone={};
    return p;
  }

  function taskDoneKey(sectId,taskId){return sectId+"_"+taskId;}
  function dailyKey(sectId,taskId,day){return "st_"+sectId+"_"+taskId+"_"+day;}

  function canDoSectTask(player,sect,task){
    ensureSectQuestFlags(player);
    if(player.sect!==sect.id)return{ok:false,msg:"非本门弟子"};
    var rank=player.sectRank||0;
    if(task.rank!=null&&rank<task.rank){
      var rn=(typeof RANK_NAMES!=="undefined"?RANK_NAMES[task.rank]:null)||("需身份"+task.rank);
      return{ok:false,msg:"需"+rn+"方可接取"};
    }
    if(task.once&&player.sectTaskDone[taskDoneKey(sect.id,task.id)])
      return{ok:false,msg:"此任务已完成过"};
    if(task.daily&&player.flags[dailyKey(sect.id,task.id,player.day)])
      return{ok:false,msg:"今日已做过"};
    if(task.skill&&player.skills&&player.skills.some(function(s){return s.id===task.skill;}))
      return{ok:false,msg:"已学会对应武学，无需再接"};
    return{ok:true};
  }

  window.doSectTask=function(player,task){
    ensureSectQuestFlags(player);
    if(!player.sect)return{ok:false,msg:"无门派"};
    var sect=getSectById(player.sect);
    if(!sect)return{ok:false,msg:"门派无效"};
    var full=(sect.tasks||[]).find(function(t){return t.id===task.id;})||task;
    var check=canDoSectTask(player,sect,full);
    if(!check.ok){
      player.logs.unshift(check.msg);
      return check;
    }
    player.day+=1;
    var msg="";
    if(full.diff){
      var r=resolveThreat(player,full.diff,Math.floor(full.diff*0.4));
      if(r.outcome==="惨败"){
        player.logs.unshift("门派任务【"+full.name+"】失败：惨败（气血-"+r.damage+"）");
        return{ok:false,msg:"任务失败"};
      }
      player.contrib=(player.contrib||0)+full.contrib;
      if(full.silver)player.silver+=full.silver;
      msg="完成门派任务【"+full.name+"】（"+r.outcome+"）贡献+"+full.contrib+(full.silver?(" 银两+"+full.silver):"");
      if(r.damage)msg+=" 气血-"+r.damage;
    }else{
      player.contrib=(player.contrib||0)+full.contrib;
      if(full.silver)player.silver+=full.silver;
      msg="完成门派任务【"+full.name+"】贡献+"+full.contrib+(full.silver?(" 银两+"+full.silver):"");
    }
    if(full.skill){
      var sk=getSkillById(full.skill);
      if(sk&&!(player.skills||[]).some(function(s){return s.id===sk.id;})){
        var lr=learnSkill(player,Object.assign({},sk,{cost:0}));
        if(lr.ok)msg+=" → 学会【"+sk.name+"】！";
      }
    }
    if(full.once)player.sectTaskDone[taskDoneKey(sect.id,full.id)]=1;
    if(full.daily)player.flags[dailyKey(sect.id,full.id,player.day)]=1;
    /* 额外武学经验 */
    if(player.skills&&player.skills.length&&Math.random()<0.5){
      var s=player.skills[Math.floor(Math.random()*player.skills.length)];
      s.exp=(s.exp||0)+8;
      msg+=" 【"+s.name+"】经验+8";
    }
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  };

  /* 优化门派界面任务区 */
  var _modalSect=modalSect;
  modalSect=function(sect){
    _modalSect(sect);
    var p=ensurePlayer(state.player);
    if(p.sect!==sect.id)return;
    var panel=qs("#modalPanel");
    if(!panel)return;
    /* 重建任务区块更清晰 */
    var rank=p.sectRank||0;
    var tasks=sect.tasks||[];
    var byRank={0:[],1:[],2:[]};
    tasks.forEach(function(t){
      var r=t.rank!=null?t.rank:0;
      if(!byRank[r])byRank[r]=[];
      byRank[r].push(t);
    });
    var html='<h3 class="section-title">门派任务</h3><p class="small">贡献 <b class="power">'+(p.contrib||0)+'</b> · 身份 '+(RANK_NAMES[rank]||"弟子")+'</p>';
    [0,1,2].forEach(function(r){
      var list=byRank[r];
      if(!list||!list.length)return;
      var locked=rank<r;
      html+='<p class="small" style="margin:8px 0 4px;color:var(--gold)">'+(RANK_NAMES[r]||("等级"+r))+'任务'+(locked?"（未解锁）":"")+'</p>';
      list.forEach(function(t){
        var check=canDoSectTask(p,sect,t);
        var tags='';
        if(t.daily)tags+='<span class="tag">每日</span> ';
        if(t.once)tags+='<span class="tag">一次</span> ';
        if(t.skill){
          var sk=getSkillById(t.skill);
          tags+='<span class="tag" style="border-color:var(--gold);color:var(--gold)">武学·'+(sk?sk.name:t.skill)+'</span> ';
        }
        if(t.diff)tags+='<span class="tag">难'+t.diff+'</span> ';
        var reward='贡+'+t.contrib+(t.silver?(' · 银+'+t.silver):'');
        var dis=locked||!check.ok;
        var reason=!check.ok&&!locked?(' · '+check.msg):'';
        html+='<div class="quest-card'+(dis?'':' ready')+'" style="margin-bottom:6px">'+
          '<div class="quest-head"><b>'+t.name+'</b> '+tags+'</div>'+
          '<p class="small">'+t.desc+' · '+reward+reason+'</p>'+
          '<button class="btn primary sm sect-task" data-id="'+t.id+'" '+(dis?'disabled':'')+'>接取</button></div>';
      });
    });
    /* 插入到商店标题之前 */
    var oldTasks=panel.querySelectorAll("h3.section-title");
    var insertBefore=null;
    oldTasks.forEach(function(h){
      if(h.textContent.indexOf("商店")>=0)insertBefore=h;
    });
    var wrap=document.createElement("div");
    wrap.id="sectTaskPanel";
    wrap.innerHTML=html;
    /* 隐藏旧的简单任务列表：找「任务」标题到「商店」之间的内容较难，直接追加新面板 */
    if(insertBefore)panel.insertBefore(wrap,insertBefore);
    else panel.appendChild(wrap);

    qsa(".sect-task",wrap).forEach(function(el){
      el.onclick=function(){
        var t=sect.tasks.find(function(x){return x.id===el.dataset.id;});
        if(!t)return;
        doSectTask(p,t);
        saveGame(state);
        modalSect(sect);
      };
    });
  };
})();
