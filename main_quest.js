/* 短主线：flags.mainStep 驱动，HUD 显示当前目标 */
(function(){
  var MAIN=[
    {id:0,title:"初入清河",desc:"在【清河镇】游历一次，熟悉江湖风雨。",check:function(p){return !!p.flags.mq_explored_qinghe;},
      reward:function(p){p.silver=(p.silver|0)+10;return"银两+10";}},
    {id:1,title:"手无寸铁",desc:"学会任意一门武学（清河镇可学破风拳等）。",check:function(p){return p.skills&&p.skills.length>0;},
      reward:function(p){p.mp=Math.min(p.maxMp,(p.mp|0)+15);return"内力+15";}},
    {id:2,title:"人情往来",desc:"与清河镇的【老周】（或任意 NPC）交谈一次。",check:function(p){return !!p.flags.mq_talked;},
      reward:function(p){if(typeof addFavor==="function")addFavor(p,"zhou",5);return"与老周好感+5";}},
    {id:3,title:"竹径一行",desc:"前往【听雨竹径】。",check:function(p){return p.location==="bamboo"||!!p.flags.mq_been_bamboo;},
      reward:function(p){p.silver=(p.silver|0)+12;return"银两+12";}},
    {id:4,title:"雨中历练",desc:"在【听雨竹径】游历一次。",check:function(p){return !!p.flags.mq_explored_bamboo;},
      reward:function(p){
        if(p.skills&&p.skills.length){var s=p.skills[0];s.exp=(s.exp||0)+12;return"【"+s.name+"】经验+12";}
        return"见识+1";
      }},
    {id:5,title:"山门在望",desc:"抵达任意门派驻地（如烟岚山门、赤炉山庄、回春谷等）。",check:function(p){
      var m=typeof getMapById==="function"?getMapById(p.location):null;
      return !!(m&&m.sect)||!!p.flags.mq_sect_loc;
    },reward:function(p){p.reputation=(p.reputation|0)+2;return"声望+2";}},
    {id:6,title:"立身之始",desc:"接取并完成任意一个江湖任务，或拜入一门派。",check:function(p){
      return (p.quests&&p.quests.done&&p.quests.done.length>0)||!!p.sect||!!p.flags.mq_quest_done;
    },reward:function(p){p.silver=(p.silver|0)+30;return"银两+30";}},
    {id:7,title:"江湖路远",desc:"主线已毕。此后自由闯荡：经脉、家园、结缘、秘境皆可探索。",check:function(){return true;},
      reward:function(p){p.flags.mainDone=true;return"解锁「自由江湖」";}}
  ];

  function ensureMain(p){
    if(!p.flags)p.flags={};
    if(p.flags.mainStep==null)p.flags.mainStep=0;
    return p;
  }

  function currentObj(p){
    ensureMain(p);
    if(p.flags.mainDone)return null;
    var i=Math.min(MAIN.length-1,p.flags.mainStep|0);
    return MAIN[i];
  }

  window.advanceMainQuest=function(player){
    ensureMain(player);
    if(player.flags.mainDone)return false;
    var changed=false;
    while(true){
      var step=player.flags.mainStep|0;
      if(step>=MAIN.length){player.flags.mainDone=true;break;}
      var node=MAIN[step];
      if(!node.check(player))break;
      var rw=node.reward?node.reward(player):"";
      player.logs.unshift("【主线·"+node.title+"】完成！"+(rw?("（"+rw+"）"):""));
      player.flags.mainStep=step+1;
      changed=true;
      if(step+1>=MAIN.length){player.flags.mainDone=true;player.logs.unshift("【主线】告一段落——江湖广阔，由你书写。");break;}
    }
    if(changed)player.logs=player.logs.slice(0,50);
    return changed;
  };

  function injectHud(p){
    ensureMain(p);
    advanceMainQuest(p);
    var obj=currentObj(p);
    var hud=document.querySelector(".hud");
    if(!hud)return;
    var old=document.getElementById("mainObjBar");
    if(old)old.remove();
    if(!obj||p.flags.mainDone)return;
    var bar=document.createElement("div");
    bar.id="mainObjBar";
    bar.className="main-obj";
    bar.innerHTML='<span class="tag">主线</span> <b>'+obj.title+'</b> <span class="small">'+obj.desc+'</span>';
    var panel=hud.closest(".panel");
    if(panel)panel.appendChild(bar);
  }

  function markFlags(p,kind,arg){
    ensureMain(p);
    if(kind==="explore"){
      if(arg==="qinghe")p.flags.mq_explored_qinghe=true;
      if(arg==="bamboo")p.flags.mq_explored_bamboo=true;
    }
    if(kind==="move"){
      if(arg==="bamboo")p.flags.mq_been_bamboo=true;
      var m=typeof getMapById==="function"?getMapById(arg):null;
      if(m&&m.sect)p.flags.mq_sect_loc=true;
    }
    if(kind==="talk")p.flags.mq_talked=true;
    if(kind==="quest")p.flags.mq_quest_done=true;
    advanceMainQuest(p);
  }

  setTimeout(function(){
    if(typeof exploreLocation==="function"){
      var _ex=exploreLocation;
      exploreLocation=function(player){
        var r=_ex(player);
        if(r&&r.ok){
          markFlags(player,"explore",player.location);
          if(typeof window._tutorialHookExplore==="function")window._tutorialHookExplore(player,r);
        }
        return r;
      };
    }
    if(typeof movePlayer==="function"){
      var _mv=movePlayer;
      movePlayer=function(player,tid){
        var r=_mv(player,tid);
        if(r&&r.ok)markFlags(player,"move",tid);
        return r;
      };
    }
    if(typeof interactPerson==="function"){
      var _ip=interactPerson;
      interactPerson=function(player,npc,act){
        var r=_ip(player,npc,act);
        if(r&&r.ok)markFlags(player,"talk",npc&&npc.id);
        return r;
      };
    }
    if(typeof chatWithNpc==="function"){
      var _ch=chatWithNpc;
      chatWithNpc=function(player,npc,topic){
        var r=_ch(player,npc,topic);
        if(r&&r.ok)markFlags(player,"talk",npc&&npc.id);
        return r;
      };
    }
    if(typeof completeQuest==="function"){
      var _cq=completeQuest;
      completeQuest=function(player,qid){
        var r=_cq(player,qid);
        if(r&&r.ok)markFlags(player,"quest",qid);
        return r;
      };
    }
    if(typeof joinSect==="function"){
      var _js=joinSect;
      joinSect=function(player,sect){
        var r=_js(player,sect);
        if(r&&r.ok){player.flags.mq_quest_done=true;advanceMainQuest(player);}
        return r;
      };
    }
    if(typeof learnSkill==="function"){
      var _ls=learnSkill;
      learnSkill=function(player,skill){
        var r=_ls(player,skill);
        if(r&&r.ok)advanceMainQuest(player);
        return r;
      };
    }
  },0);

  if(typeof Game!=="undefined"&&Game.on){
    Game.on("player:ensure",function(p){ensureMain(p);});
    Game.on("render:after",function(p){if(p)injectHud(p);});
  }

  window.getMainObjective=function(p){return currentObj(p);};
})();
