/* 江湖任务系统 */
(function(){
  const QUEST_BOARD_LOCS=["qinghe","market","ferry","mist_gate","hearth","herb_valley","whale_port"];
  const MAX_ACTIVE=5;

  /**
   * type: talk | deliver | explore | duel | collect | visit
   * target: npcId / locId / itemId
   * need: 数量
   */
  const QUESTS=[
    {id:"q_zhou_rest",name:"客栈帮忙",giver:"zhou",loc:"qinghe",desc:"老周店里缺人手，帮他搬一趟货。",type:"talk",target:"zhou",need:1,
      reward:{silver:15,favor:{zhou:5}},text:"搬完货，老周塞给你几两碎银。"},
    {id:"q_su_herb",name:"采药问诊",giver:"su",loc:"qinghe",desc:"苏半仙需要止血草，去竹径采一株送来。",type:"collect",target:"herb_stop",need:1,
      reward:{silver:20,item:"jinchuang",favor:{su:6}},text:"苏半仙接过草药，配了一包金创药回赠。"},
    {id:"q_aqing_path",name:"竹径识药",giver:"aqing",loc:"bamboo",desc:"与阿青聊聊药草，认清叶脉。",type:"talk",target:"aqing",need:1,
      reward:{silver:10,favor:{aqing:8}},text:"阿青点点头：你认得比从前清楚了。"},
    {id:"q_yubo_ferry",name:"渡口护航",giver:"yubo",loc:"ferry",desc:"老余要人护一程船，去白沙渡与他会合。",type:"talk",target:"yubo",need:1,
      reward:{silver:25,favor:{yubo:5}},text:"船靠岸，老余把护船银子递给你。"},
    {id:"q_qianliu_gamble",name:"市集眼力",giver:"qianliu",loc:"market",desc:"钱六让你去旧瓦市找他，辨一辨货色。",type:"talk",target:"qianliu",need:1,
      reward:{silver:18,favor:{qianliu:4}},text:"钱六嘿了一声：眼力还行，这点银子拿去。"},
    {id:"q_luyun_sword",name:"山门试剑",giver:"luyun",loc:"mist_gate",desc:"陆云约你在烟岚山门比剑切磋。",type:"duel",target:"luyun",need:1,diff:35,
      reward:{silver:30,exp:20,favor:{luyun:6}},text:"剑光落定，陆云拱手：进境不错。"},
    {id:"q_tieba_road",name:"古道清匪",giver:"tieba",loc:"salt_road",desc:"铁疤说黑盐古道有劫匪，去清理一趟。",type:"explore",target:"salt_road",need:1,
      reward:{silver:40,favor:{tieba:8}},text:"刀光散尽，铁疤扔来一锭银子：算你一条道上的。"},
    {id:"q_yaotong_collect",name:"谷中采药",giver:"yaotong",loc:"herb_valley",desc:"药童需要灵芝草，在回春谷采到后交给他。",type:"collect",target:"spirit_herb",need:1,
      reward:{silver:35,item:"huichun_san",favor:{yaotong:7}},text:"药童接过灵芝，回赠一包回春散。"},
    {id:"q_ao_guard",name:"护船一程",giver:"ao_sailor",loc:"whale_port",desc:"潮生招人护船，去玄鲸港与他会合。",type:"talk",target:"ao_sailor",need:1,
      reward:{silver:28,favor:{ao_sailor:5}},text:"潮生拍拍你肩：契约算结了，银子在这。"},
    {id:"q_shishu_story",name:"听书秘闻",giver:"shishu",loc:"qinghe",desc:"王说书有段秘闻，去清河茶棚听他说完。",type:"talk",target:"shishu",need:1,
      reward:{silver:12,favor:{shishu:6}},text:"醒木一拍，故事收场，他塞给你一点茶钱回礼。"},
    {id:"q_jian_spar",name:"指点竹间",giver:"jian_tong",loc:"bamboo",desc:"竹间想请你指点剑法，去听雨竹径找他。",type:"talk",target:"jian_tong",need:1,
      reward:{exp:15,favor:{jian_tong:10}},text:"竹间连连道谢，剑穗晃得欢快。"},
    {id:"q_stall_pie",name:"炊饼人情",giver:"stall",loc:"market",desc:"张婆缺人手送炊饼，去旧瓦市帮她一回。",type:"talk",target:"stall",need:1,
      reward:{silver:10,item:"gift_tea",favor:{stall:5}},text:"张婆塞给你热炊饼和一点茶。"},
    {id:"q_explore_bamboo",name:"竹径游历",giver:"zhou",loc:"qinghe",desc:"老周让你去听雨竹径转转，看看有无异常。",type:"explore",target:"bamboo",need:1,
      reward:{silver:16},text:"你把竹径见闻说与老周，他点头付了跑腿钱。"},
    {id:"q_explore_market",name:"市集风声",giver:"shishu",loc:"qinghe",desc:"王说书要旧瓦市的新鲜风声，去游历一回再来。",type:"explore",target:"market",need:1,
      reward:{silver:14,favor:{shishu:4}},text:"说书人把见闻记进话本，赏你一文人情。"},
    {id:"q_deliver_letter",name:"密信送达",giver:"que_shadow",loc:"sparrow_den",desc:"影七要你把密信相关线索走一遭：先去白雀楼见他。",type:"talk",target:"que_shadow",need:1,
      reward:{silver:45,favor:{que_shadow:5}},text:"影七接过话，丢下银票：活干得干净。"},
    {id:"q_monk_copy",name:"抄经悟心",giver:"monk_jing",loc:"void_temple",desc:"静尘邀你去无相寺抄经静心。",type:"talk",target:"monk_jing",need:1,
      reward:{mp:30,favor:{monk_jing:6}},text:"墨干心静，静尘合十：施主心定了些。"},
    {id:"q_hearth_ore",name:"搬矿助炉",giver:"helie_npc",loc:"hearth",desc:"贺炉缺人手搬矿，去赤炉山庄帮他。",type:"talk",target:"helie_npc",need:1,
      reward:{silver:22,favor:{helie_npc:5}},text:"矿石入炉，贺炉抹汗：这趟银子你拿着。"},
    {id:"q_collect_jinchuang",name:"备药应急",giver:"su",loc:"qinghe",desc:"苏半仙要你准备两份金创药应急（背包持有即可交付）。",type:"collect",target:"jinchuang",need:2,
      reward:{silver:25,favor:{su:5}},text:"药箱满了，苏半仙少有地夸了你一句靠谱。"},
    {id:"q_visit_cloud",name:"云巅一问",giver:"hermit",loc:"cloud_peak",desc:"云叟在云岚绝顶，去见他一面。",type:"visit",target:"cloud_peak",need:1,
      reward:{luck:1,favor:{hermit:8}},text:"云叟望着云海：缘法近了一寸。福缘微升。"},
    {id:"q_blood_scout",name:"峡谷探路",giver:"tieba",loc:"salt_road",desc:"铁疤要血石峡谷的消息，去那里游历一次再回。",type:"explore",target:"blood_ravine",need:1,
      reward:{silver:50,favor:{tieba:6}},text:"听完你的见闻，铁疤刀柄敲了敲桌：有用。"}
  ];

  function getQuestById(id){return QUESTS.find(function(q){return q.id===id;});}
  function ensureQuests(p){
    if(!p.quests)p.quests={active:[],done:[]};
    if(!p.quests.active)p.quests.active=[];
    if(!p.quests.done)p.quests.done=[];
    return p.quests;
  }
  function isActive(p,qid){
    return ensureQuests(p).active.some(function(a){return a.id===qid;});
  }
  function isDone(p,qid){
    return ensureQuests(p).done.indexOf(qid)>=0;
  }
  function getActive(p,qid){
    return ensureQuests(p).active.find(function(a){return a.id===qid;});
  }
  function availableQuests(p){
    return QUESTS.filter(function(q){
      if(isActive(p,q.id)||isDone(p,q.id))return false;
      return true;
    });
  }
  function boardQuests(p,loc){
    return availableQuests(p).filter(function(q){
      return !q.loc||q.loc===loc||QUEST_BOARD_LOCS.indexOf(loc)>=0;
    }).slice(0,8);
  }

  window.acceptQuest=function(player,questId){
    ensureQuests(player);
    var q=getQuestById(questId);
    if(!q)return{ok:false,msg:"无此任务"};
    if(isDone(player,questId))return{ok:false,msg:"已完成过"};
    if(isActive(player,questId))return{ok:false,msg:"已在进行"};
    if(player.quests.active.length>=MAX_ACTIVE)return{ok:false,msg:"任务已满（最多"+MAX_ACTIVE+"个）"};
    player.quests.active.push({id:q.id,progress:0,need:q.need||1});
    player.logs.unshift("接取任务【"+q.name+"】："+q.desc);
    return{ok:true,msg:"接取【"+q.name+"】"};
  };

  window.abandonQuest=function(player,questId){
    ensureQuests(player);
    var i=player.quests.active.findIndex(function(a){return a.id===questId;});
    if(i<0)return{ok:false,msg:"未接取"};
    var q=getQuestById(questId);
    player.quests.active.splice(i,1);
    player.logs.unshift("放弃任务【"+(q?q.name:questId)+"】。");
    return{ok:true,msg:"已放弃"};
  };

  function applyReward(player,reward){
    if(!reward)return"";
    var parts=[];
    if(reward.silver){player.silver+=reward.silver;parts.push("银两+"+reward.silver);}
    if(reward.exp&&player.skills&&player.skills.length){
      var s=player.skills[Math.floor(Math.random()*player.skills.length)];
      s.exp=(s.exp||0)+reward.exp;parts.push("【"+s.name+"】经验+"+reward.exp);
    }
    if(reward.mp){player.mp=Math.min(player.maxMp,player.mp+reward.mp);parts.push("内力+"+reward.mp);}
    if(reward.heal){player.hp=Math.min(player.maxHp,player.hp+reward.heal);parts.push("气血+"+reward.heal);}
    if(reward.luck){player.stats.luck=(player.stats.luck||0)+reward.luck;parts.push("福缘+"+reward.luck);}
    if(reward.item&&typeof addItem==="function"){
      var r=addItem(player,reward.item,1);
      if(r.ok)parts.push("获得【"+(getItemById(reward.item)||{}).name+"】");
    }
    if(reward.favor&&typeof addFavor==="function"){
      Object.keys(reward.favor).forEach(function(nid){
        addFavor(player,nid,reward.favor[nid]);
        parts.push("好感+");
      });
    }
    return parts.length?("（"+parts.join("，")+"）"):"";
  }

  window.completeQuest=function(player,questId){
    ensureQuests(player);
    var act=getActive(player,questId);
    var q=getQuestById(questId);
    if(!act||!q)return{ok:false,msg:"任务无效"};
    if(act.progress<(act.need||1))return{ok:false,msg:"进度未满"};

    if(q.type==="collect"){
      if(typeof hasItem!=="function"||!hasItem(player,q.target,q.need||1))
        return{ok:false,msg:"物品不足，请先备齐"};
      removeItem(player,q.target,q.need||1);
    }

    player.quests.active=player.quests.active.filter(function(a){return a.id!==questId;});
    if(player.quests.done.indexOf(questId)<0)player.quests.done.push(questId);
    var rw=applyReward(player,q.reward);
    var msg="完成任务【"+q.name+"】！"+(q.text||"")+rw;
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg};
  };

  /** 推进任务进度（自动触发） */
  function bumpQuest(player,type,targetId,amount){
    ensureQuests(player);
    amount=amount||1;
    var changed=false;
    player.quests.active.forEach(function(a){
      var q=getQuestById(a.id);
      if(!q||q.type!==type)return;
      if(q.target&&q.target!==targetId)return;
      if(a.progress>=(a.need||1))return;
      a.progress=Math.min(a.need||1,a.progress+amount);
      changed=true;
      if(a.progress>=(a.need||1)){
        player.logs.unshift("任务【"+q.name+"】已可交付。");
      }
    });
    return changed;
  }

  window.questOnTalk=function(player,npcId){
    bumpQuest(player,"talk",npcId,1);
  };
  window.questOnVisit=function(player,locId){
    bumpQuest(player,"visit",locId,1);
    bumpQuest(player,"explore",locId,1);
  };
  window.questOnExplore=function(player,locId){
    bumpQuest(player,"explore",locId,1);
  };
  window.questOnDuel=function(player,npcId,won){
    if(won)bumpQuest(player,"duel",npcId,1);
  };
  window.questOnCollect=function(player,itemId){
    /* collect 在交付时检查持有，也可在获得时提示 */
    ensureQuests(player);
    player.quests.active.forEach(function(a){
      var q=getQuestById(a.id);
      if(!q||q.type!=="collect"||q.target!==itemId)return;
      var have=0;
      if(player.bag)player.bag.forEach(function(s){if(s.id===itemId)have+=s.count;});
      a.progress=Math.min(a.need||1,have);
    });
  };

  function tryAutoCompleteCollect(player){
    ensureQuests(player);
    player.quests.active.forEach(function(a){
      var q=getQuestById(a.id);
      if(!q||q.type!=="collect")return;
      var have=0;
      if(player.bag)player.bag.forEach(function(s){if(s.id===q.target)have+=s.count;});
      a.progress=Math.min(a.need||1,have);
    });
  }

  /* —— 钩入现有系统 —— */
  function installHooks(){
    if(typeof movePlayer==="function"){
      var _mv=movePlayer;
      movePlayer=function(player,targetId){
        var r=_mv(player,targetId);
        if(r&&r.ok)questOnVisit(player,targetId);
        return r;
      };
    }
    if(typeof exploreLocation==="function"){
      var _ex=exploreLocation;
      exploreLocation=function(player){
        var r=_ex(player);
        if(r&&r.ok)questOnExplore(player,player.location);
        return r;
      };
    }
    if(typeof interactPerson==="function"){
      var _ip=interactPerson;
      interactPerson=function(player,npc,actId){
        var r=_ip(player,npc,actId);
        if(r&&r.ok){
          questOnTalk(player,npc.id);
          if(actId&&(npc.acts||[]).some(function(a){return a.id===actId&&a.type==="duel";})){
            /* duel 胜负在 interact 内，简化：只要交手且 ok 算推进一半——用 logs 无法判断，按 ok 且非惨败难以取
               简化：交手即 +1 若 act 为 duel */
            var act=(npc.acts||[]).find(function(a){return a.id===actId;});
            if(act&&act.type==="duel")questOnDuel(player,npc.id,true);
          }
        }
        return r;
      };
    }
    if(typeof chatWithNpc==="function"){
      var _ch=chatWithNpc;
      chatWithNpc=function(player,npc,topicId){
        var r=_ch(player,npc,topicId);
        if(r&&r.ok)questOnTalk(player,npc.id);
        return r;
      };
    }
    if(typeof addItem==="function"){
      var _add=addItem;
      addItem=function(player,itemId,count){
        var r=_add(player,itemId,count);
        if(r&&r.ok)questOnCollect(player,itemId);
        return r;
      };
    }
    if(typeof createPlayer==="function"){
      var _cp=createPlayer;
      createPlayer=function(opts){
        var p=_cp(opts);
        ensureQuests(p);
        return p;
      };
    }
  }
  installHooks();

  function typeLabel(t){
    return {talk:"交谈",deliver:"运送",explore:"游历",duel:"切磋",collect:"收集",visit:"抵达"}[t]||t;
  }
  function progressText(a,q){
    return (a.progress||0)+"/"+(a.need||q.need||1);
  }
  function targetName(q){
    if(q.type==="talk"||q.type==="duel"){
      var n=typeof findPerson==="function"?findPerson(q.target):null;
      return n?n.name:q.target;
    }
    if(q.type==="explore"||q.type==="visit"){
      var m=typeof getMapById==="function"?getMapById(q.target):null;
      return m?m.name:q.target;
    }
    if(q.type==="collect"){
      var it=typeof getItemById==="function"?getItemById(q.target):null;
      return it?it.name:q.target;
    }
    return q.target||"—";
  }

  window.modalQuests=function(tab){
    var p=ensurePlayer(state.player);
    ensureQuests(p);
    tryAutoCompleteCollect(p);
    tab=tab||"active";
    var activeHtml="";
    if(!p.quests.active.length){
      activeHtml='<p class="small">暂无进行中的任务。可在任务榜接取。</p>';
    }else{
      activeHtml=p.quests.active.map(function(a){
        var q=getQuestById(a.id);if(!q)return"";
        var ready=a.progress>=(a.need||1);
        var bar=Math.min(100,Math.floor(100*(a.progress/(a.need||1))));
        return '<div class="quest-card'+(ready?" ready":"")+'">'+
          '<div class="quest-head"><b>'+q.name+'</b> <span class="tag">'+typeLabel(q.type)+'</span>'+
          (ready?'<span class="rank-tag">可交付</span>':'')+'</div>'+
          '<p class="small">'+q.desc+'</p>'+
          '<p class="small">目标：'+targetName(q)+' · 进度 '+progressText(a,q)+'</p>'+
          '<div class="quest-bar"><div class="quest-fill" style="width:'+bar+'%"></div></div>'+
          '<div class="row" style="margin-top:6px">'+
          (ready?'<button class="btn primary sm q-turn" data-id="'+q.id+'">交付</button>':'')+
          '<button class="btn sm q-drop" data-id="'+q.id+'">放弃</button></div></div>';
      }).join("");
    }

    var board=boardQuests(p,p.location);
    var boardHtml=board.length?board.map(function(q){
      var rw=[];
      if(q.reward){
        if(q.reward.silver)rw.push(q.reward.silver+"两");
        if(q.reward.exp)rw.push("经验");
        if(q.reward.item){var it=getItemById(q.reward.item);rw.push(it?it.name:"物品");}
      }
      return '<div class="quest-card">'+
        '<div class="quest-head"><b>'+q.name+'</b> <span class="tag">'+typeLabel(q.type)+'</span></div>'+
        '<p class="small">'+q.desc+'</p>'+
        '<p class="small">目标：'+targetName(q)+(rw.length?(" · 奖励 "+rw.join("/")":":"))+'</p>'+
        '<button class="btn primary sm q-accept" data-id="'+q.id+'">接取</button></div>';
    }).join(""):'<p class="small">此地暂无新任务，或已全部接取/完成。</p>';

    var doneHtml=p.quests.done.length
      ?'<ul class="small">'+p.quests.done.map(function(id){
          var q=getQuestById(id);return '<li>'+(q?q.name:id)+'</li>';
        }).join("")+'</ul>'
      :'<p class="small">尚无完成记录。</p>';

    var body=tab==="board"?boardHtml:(tab==="done"?doneHtml:activeHtml);
    openModal(
      '<div class="modal-head"><h2 class="section-title">任务</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<div class="row" style="margin-bottom:8px">'+
        '<button class="btn sm'+(tab==="active"?" primary":"")+'" id="tabActive">进行中（'+p.quests.active.length+'/'+MAX_ACTIVE+'）</button>'+
        '<button class="btn sm'+(tab==="board"?" primary":"")+'" id="tabBoard">任务榜</button>'+
        '<button class="btn sm'+(tab==="done"?" primary":"")+'" id="tabDone">已完成（'+p.quests.done.length+'）</button>'+
      '</div>'+
      '<div class="quest-list">'+body+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qs("#tabActive").onclick=function(){modalQuests("active");};
    qs("#tabBoard").onclick=function(){modalQuests("board");};
    qs("#tabDone").onclick=function(){modalQuests("done");};
    qsa(".q-accept").forEach(function(el){
      el.onclick=function(){
        var r=acceptQuest(p,el.dataset.id);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalQuests("board");
      };
    });
    qsa(".q-turn").forEach(function(el){
      el.onclick=function(){
        var r=completeQuest(p,el.dataset.id);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalQuests("active");
      };
    });
    qsa(".q-drop").forEach(function(el){
      el.onclick=function(){
        if(!confirm("确定放弃该任务？"))return;
        abandonQuest(p,el.dataset.id);
        saveGame(state);modalQuests("active");
      };
    });
  };

  function wireQuestBtn(){
    var bar=document.querySelector(".toolbar");
    if(!bar)return;
    if(!qs("#questBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm";b.id="questBtn";b.textContent="任务";
      b.onclick=function(){modalQuests("active");};
      var after=qs("#bagBtn",bar)||qs("#skillBtn",bar)||qs("#charBtn",bar);
      if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);
      else bar.appendChild(b);
    }else{
      qs("#questBtn",bar).onclick=function(){modalQuests("active");};
    }
    /* HUD 角标 */
    var p=state&&state.player?ensurePlayer(state.player):null;
    if(p){
      ensureQuests(p);
      tryAutoCompleteCollect(p);
      var ready=p.quests.active.filter(function(a){return a.progress>=(a.need||1);}).length;
      var btn=qs("#questBtn",bar);
      if(btn)btn.textContent=ready>0?("任务·"+ready):"任务";
    }
  }
  var _rg=renderGame;
  renderGame=function(){_rg();wireQuestBtn();};
})();
