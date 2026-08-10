/**
 * 家园 · 伴侣深度互动
 * 同住结缘者：闲话 / 谈心 / 共餐 / 赠礼 / 练功 / 共憩 / 往事 / 嘱托
 * 台词按好感档位 + NPC 个性
 */
(function(){

  function homeOf(p){
    if(typeof ensureHome==="function"){
      var h=ensureHome(p);
      if(!h.residents)h.residents=[];
      return h;
    }
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    return p.home;
  }
  function isRes(p,id){
    return (homeOf(p).residents||[]).indexOf(id)>=0;
  }
  function quietSave(){
    if(typeof saveGame==="function")saveGame(state);
  }
  function tier(fav){
    fav=fav|0;
    if(fav>=95)return 5;
    if(fav>=80)return 4;
    if(fav>=60)return 3;
    if(fav>=40)return 2;
    if(fav>=20)return 1;
    return 0;
  }
  function pick(a){
    if(!a||!a.length)return"……";
    return a[Math.floor(Math.random()*a.length)];
  }
  function pickTier(table,t){
    if(!table)return"";
    for(var i=t;i>=0;i--){
      if(table[i]&&table[i].length)return pick(table[i]);
    }
    return"";
  }

  /* —— 通用院中互动台词（按档） —— */
  var ACT = {
    chat: {
      0: ["院里风还行。","嗯。","你回来了。"],
      1: ["今日无事，正好闲坐。","院墙外有人走过，脚步很轻。","茶还热着。"],
      2: ["有你在，院子才像家。","方才练了一阵，手还热。","想听我说些什么？"],
      3: ["等你回来的时候，总把灯点着。","同住之后，话反而多了。","今日想与你多说几句。"],
      4: ["你不在的时辰，我会数到你推门。","院中一草一木，都习惯有你。","近些日子，心很定。"],
      5: ["你来了。其实我一直在等。","这院子，是我们的。","想说的话很多，又觉得陪着就够。"]
    },
    heart: {
      0: ["……谈心？还早。"],
      1: ["心不静，谈也白谈。","再熟一些吧。"],
      2: ["其实偶尔也会觉得，江湖好累。","你愿意听，我便说一点。"],
      3: ["有你听着，好多了。","这些话，只在院墙里说。","别走太远。"],
      4: ["心近了，路也近了。","有你在，我不怕。","今日的话，记在心里就好。"],
      5: ["私定终身之后，更想把日子过细。","你若累了，就靠过来。","心已许，院已安。"]
    },
    meal: {
      0: ["有现成的，你自便。","灶冷了。"],
      1: ["一起吃一点吧。","不丰盛，填饱就好。"],
      2: ["今日多做了一点，等你。","热的，当心烫。"],
      3: ["你爱吃的，我记着。","同桌吃饭，比银子香。"],
      4: ["每顿都想着你回来。","吃完再走，好不好？"],
      5: ["家常菜，只给你一个人做。","吃饱了，才有力气护你想护的人。"]
    },
    gift: {
      0: ["……收着。","不必。"],
      1: ["有心了。","下次别破费。"],
      2: ["你总记得带东西回来。","我收下了。"],
      3: ["有你这份心，比礼物重。","放在最稳妥的地方。"],
      4: ["你送的，我都留着。","其实更想要你人在。"],
      5: ["你送什么，我都喜欢。","人来了，比什么礼物都好。"]
    },
    train: {
      0: ["自己练。","看仔细。"],
      1: ["这一处，改一下。","别急。"],
      2: ["有长进。再来。","院里正好比划。"],
      3: ["同道切磋，彼此有益。","你已经摸到门道了。"],
      4: ["我能教的，所剩无几。","走稳，别忘了来时路。"],
      5: ["青出于蓝，我乐见。","以后你我论交，不必分师徒。"]
    },
    rest: {
      0: ["自己歇。","别吵。"],
      1: ["睡稳些。","院门我看着。"],
      2: ["累了就躺着。","有我在。"],
      3: ["今日多睡一刻。","我守着灯。"],
      4: ["你的安危，也是我的事。","歇足了再走。"],
      5: ["睡吧。我在。","灯给你留着，永远。"]
    },
    past: {
      0: ["过去的事，不提。"],
      1: ["每个人都有不想说的。","你若诚心，以后可以说。"],
      2: ["有些事，想起来还疼。","那年……半句就够。"],
      3: ["跟你说这些，是信你。","有些仇，还没报。"],
      4: ["我的过去，你已听得差不多。","说给你听，是因你不会拿去换银子。"],
      5: ["过去的伤，因你不那么疼了。","若重来一次，仍愿在这院里遇见你。"]
    },
    entrust: {
      0: ["……什么嘱托？"],
      1: ["说吧。","我听着。"],
      2: ["你的事，我尽量记。","有难处，开口。"],
      3: ["你不在时，院里我撑着。","有信，我会留。"],
      4: ["你的后路，我帮你看着。","出门在外，记得回家。"],
      5: ["你的命，我一半担着。","去闯吧。院门，永远为你开。"]
    }
  };

  /* NPC 个性覆盖（院中） */
  var NPC_HOME = {
    aqing: {
      chat: {2:["药圃的露水好，草都精神。"],4:["有院墙挡着，比山里踏实。"],5:["叶哨放在窗台。你一推门，我听得见。"]},
      meal: {3:["温水给你。药苦，饭要香一点。"],5:["今日的草特别好，汤里也放了。"]},
      heart: {4:["……其实等你回来，已经习惯了。"],5:["私定终身之后，竹林和院子，都是家。"]},
      train: {2:["认不清叶脉，就别乱采——连吃饭也是。"]}
    },
    jian_tong: {
      chat: {2:["你回来了！看我这一招——"],5:["剑已经擦好了。院里的落叶，我劈中了三次。"]},
      train: {1:["你也会剑吗？"],3:["有你指点，我进步飞快！"],5:["只与你一起练。"]},
      heart: {5:["叶落无声的时候，我想的都是你。"]}
    },
    yaotong: {
      meal: {2:["刚熬好，你先喝一口。"],5:["其实每天都多备一份，等你。"]},
      heart: {5:["药要慢熬，情也是。院里的日子，我想一直这样。"]},
      rest: {3:["院里风软，适合养伤。"]}
    },
    luyun: {
      train: {2:["雾少了，剑路更清晰。"],4:["有些剑招不写在谱上。院里，我传你一式。"],5:["若你入内门，第一杯茶仍敬你——在自家院里。"]},
      chat: {3:["你回来了。可要指点一招？"]}
    },
    que_shadow: {
      chat: {0:["……"],2:["你的脚步，我听得见。"],5:["需要影时，不必出声。"]},
      heart: {4:["……影也可以有固定的落点。"],5:["……住下了。就不走了。"]},
      entrust: {3:["有信，我会留。"]} 
    },
    monk_jing: {
      chat: {2:["心定了些。院里风好。"],5:["无相无我。有你，亦无碍。"]},
      rest: {3:["打坐的蒲团，给你留一个。"],5:["香火在心，不在寺。"]}
    },
    su_wanqing: {
      meal: {3:["新方子，你试试。"],5:["晚间若不适，不必再跑医馆。"]},
      rest: {4:["脉象稳些了。多睡一刻。"]}
    },
    shen_shuheng: {
      train: {3:["此处正好练心。"],5:["剑可同锋。院中一席，已够。"]},
      chat: {2:["你回来了。"]}
    },
    yanlan_mei: {
      train: {2:["这里无雾，反而看得清剑路。"],5:["剑穗挂在廊柱，便是家。"]},
      heart: {4:["若你愿意，朝夕可见。"]}
    },
    huichun_lan: {
      chat: {2:["你回来啦！"],5:["花圃和你，我都想守着。"]},
      meal: {3:["药熬好了，当心烫。"]}
    },
    xuan_zhu: {
      chat: {2:["今日流水已记。"],5:["契约写到老，也写在这院里。"]},
      entrust: {3:["账本迁过来了。你的事，我算着。"]}
    },
    ao_sailor: {
      chat: {2:["潮声远了，睡得倒踏实。"],5:["岸上的落脚处，就是你。"]},
      entrust: {4:["船位还是给你留着。出门，记得回港——回院。"]}
    },
    helie_npc: {
      train: {2:["刀要养，人更要养。"],4:["试刀的声音，没扰着你吧？"],5:["炉火留给自己人。你是。"]},
      meal: {3:["烫——小心。吃完再打铁。"]}
    },
    wuxiang_chen: {
      chat: {2:["在抄经，见你合十。"],5:["念珠分你的那串，还在。"]},
      rest: {4:["静室不在寺外，在你身边。"]}
    }
  };

  function lineFor(npcId, actId, fav){
    var t=tier(fav);
    var patch=NPC_HOME[npcId]&&NPC_HOME[npcId][actId];
    if(patch){
      var s=pickTier(patch,t);
      if(s)return s;
    }
    return pickTier(ACT[actId],t)||"……";
  }

  /* 每日每项互动次数限制（轻度） */
  function actKey(npcId,actId,day){
    return "home_"+npcId+"_"+actId+"_"+day;
  }
  function canAct(player,npcId,actId,max){
    max=max||1;
    if(!player.flags)player.flags={};
    var k=actKey(npcId,actId,player.day||1);
    return (player.flags[k]|0)<max;
  }
  function markAct(player,npcId,actId){
    if(!player.flags)player.flags={};
    var k=actKey(npcId,actId,player.day||1);
    player.flags[k]=(player.flags[k]|0)+1;
  }

  var HOME_ACTS=[
    {id:"chat",name:"闲话家常",favor:3,max:2,desc:"院中随意说说"},
    {id:"heart",name:"谈心",favor:6,max:1,need:40,desc:"好感≥40"},
    {id:"meal",name:"共进一餐",favor:4,max:1,desc:"同桌吃饭，小幅回血"},
    {id:"gift",name:"赠礼",favor:5,max:1,cost:12,desc:"12两"},
    {id:"train",name:"一同练功",favor:4,max:1,desc:"随机武学小幅经验"},
    {id:"rest",name:"相伴休憩",favor:3,max:1,desc:"回血回蓝，每日一次"},
    {id:"past",name:"问起过往",favor:5,max:1,need:40,desc:"好感≥40"},
    {id:"entrust",name:"临行嘱托",favor:4,max:1,need:60,desc:"好感≥60 · 出门前"}
  ];

  window.interactHomeCompanion=function(player,npcId,actId){
    if(!isRes(player,npcId))return{ok:false,msg:"对方不在院中"};
    if(!(player.bonds&&player.bonds[npcId]))return{ok:false,msg:"需为结缘伴侣"};
    var act=HOME_ACTS.find(function(a){return a.id===actId;});
    if(!act)return{ok:false,msg:"无此互动"};

    var fav=typeof getFavor==="function"?getFavor(player,npcId):0;
    if(act.need&&fav<act.need)return{ok:false,msg:"好感不足（需≥"+act.need+"）"};
    if(!canAct(player,npcId,actId,act.max||1)){
      return{ok:false,msg:"今日此项已尽，明日再来。"};
    }
    if(act.cost&&player.silver<(act.cost))return{ok:false,msg:"银两不足（需"+act.cost+"）"};

    if(act.cost)player.silver-=act.cost;
    markAct(player,npcId,actId);

    var line=lineFor(npcId,actId,fav);
    /* 若有 getDialogueLine，倾心档可混入一句分层对话增强个性 */
    if(actId==="chat"||actId==="heart"){
      if(typeof getDialogueLine==="function"){
        var npc=typeof findPerson==="function"?findPerson(npcId):null;
        if(npc&&fav>=80&&Math.random()<0.45){
          line=getDialogueLine(npc,fav);
        }
      }
    }

    var gain=act.favor||2;
    if(typeof hasBond==="function"&&hasBond(player,npcId))gain+=1;
    var d=typeof addFavor==="function"?addFavor(player,npcId,gain):0;

    var extra="";
    if(actId==="meal"){
      var h=Math.floor(player.maxHp*0.08);
      player.hp=Math.min(player.maxHp,player.hp+h);
      extra="气血+"+h;
    }
    if(actId==="rest"){
      var h2=Math.floor(player.maxHp*0.15);
      var m2=Math.floor(player.maxMp*0.15);
      player.hp=Math.min(player.maxHp,player.hp+h2);
      player.mp=Math.min(player.maxMp,player.mp+m2);
      extra="气血+"+h2+"、内力+"+m2;
    }
    if(actId==="train"&&player.skills&&player.skills.length){
      var sk=player.skills[Math.floor(Math.random()*player.skills.length)];
      var exp=8+Math.floor(Math.random()*8);
      sk.exp=(sk.exp||0)+exp;
      extra="【"+sk.name+"】经验+"+exp;
      while(sk.exp>=sk.maxExp&&sk.realm<4){
        sk.exp-=sk.maxExp;sk.realm+=1;sk.maxExp=Math.floor(sk.maxExp*1.6);
        sk.power=Math.floor((sk.power||0)*1.25);
        extra+=" → 突破！";
      }
    }
    if(actId==="gift"){
      extra="银两-"+(act.cost||12);
    }

    try{
      if(!player.chatLog)player.chatLog={};
      if(!player.chatLog[npcId])player.chatLog[npcId]=[];
      player.chatLog[npcId].push({role:"you",text:"（院中·"+act.name+"）",at:player.day||1});
      player.chatLog[npcId].push({role:"npc",text:line,at:player.day||1});
      if(player.chatLog[npcId].length>12)player.chatLog[npcId].splice(0,player.chatLog[npcId].length-12);
    }catch(e){}

    var name=(player.bonds[npcId]&&player.bonds[npcId].name)||npcId;
    var note=[];
    if(d)note.push("好感+"+d);
    if(extra)note.push(extra);
    var msg=name+"：「"+line+"」"+(note.length?("（"+note.join("，")+"）"):"");
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg,line:line,gain:d,extra:extra,act:act.name};
  };

  function npcName(p,id){
    if(p.bonds&&p.bonds[id]&&p.bonds[id].name)return p.bonds[id].name;
    var n=typeof findPerson==="function"?findPerson(id):null;
    return(n&&n.name)||id;
  }

  /** 伴侣互动面板 */
  window.modalHomeCompanion=function(npcId){
    var p=ensurePlayer(state.player);
    if(!isRes(p,npcId)){
      p.logs.unshift("对方不在院中");
      return;
    }
    var npc=typeof findPerson==="function"?findPerson(npcId):null;
    var fav=typeof getFavor==="function"?getFavor(p,npcId):0;
    var rank=typeof favorRank==="function"?favorRank(fav):{name:"",color:"#d9ad62"};
    var nm=npcName(p,npcId);
    var av=(typeof npcAvatar==="function"&&npc)?npcAvatar(npc,"lg"):"";
    var greet=lineFor(npcId,"chat",fav);
    if(typeof getDialogueLine==="function"&&npc){
      greet=getDialogueLine(npc,fav);
    }

    var hist="";
    if(p.chatLog&&p.chatLog[npcId]&&p.chatLog[npcId].length){
      hist='<div class="chat-history">';
      p.chatLog[npcId].slice(-5).forEach(function(m){
        if(m.role==="you")hist+='<div class="chat-line you"><span class="chat-tag">你</span> '+m.text+'</div>';
        else hist+='<div class="chat-line npc"><span class="chat-tag">对方</span> 「'+m.text+'」</div>';
      });
      hist+="</div>";
    }

    var btns=HOME_ACTS.map(function(a){
      var locked=a.need&&fav<a.need;
      var used=!canAct(p,npcId,a.id,a.max||1);
      var dis=locked||used?"disabled":"";
      var tip=locked?("需好感"+a.need):(used?"今日已用":(a.desc||""));
      return '<button class="btn primary home-act" data-act="'+a.id+'" '+dis+'>'+a.name+
        (tip?'<span class="small"> · '+tip+'</span>':"")+'</button>';
    }).join("");

    openModal(
      '<div class="modal-head"><h2 class="section-title">'+(av?av+" ":"")+nm+
        ' <span class="rank-tag" style="border-color:#e8a0a0;color:#e8a0a0">同住</span></h2>'+
        '<button class="modal-close" id="mClose">返回</button></div>'+
      '<div class="favor-row"><span class="small">好感</span>'+
        '<div class="favor-bar"><div class="favor-fill" style="width:'+Math.min(100,fav)+'%;background:'+rank.color+'"></div></div>'+
        '<span class="rank-tag" style="border-color:'+rank.color+';color:'+rank.color+'">'+(rank.name||"")+" "+fav+'</span></div>'+
      hist+
      '<div class="talk-bubble">「'+greet+'」</div>'+
      '<h3 class="section-title">院中相处</h3>'+
      '<div class="row" style="flex-direction:column;gap:5px;align-items:stretch">'+btns+'</div>'+
      '<div class="row" style="margin-top:8px">'+
        '<button class="btn sm" id="evictHere">请其搬离</button>'+
        '<button class="btn sm" id="backHome">家园</button>'+
      '</div>'
    );

    qs("#mClose").onclick=function(){modalHome();};
    qs("#backHome").onclick=function(){modalHome();};
    if(qs("#evictHere"))qs("#evictHere").onclick=function(){
      if(!confirm("请「"+nm+"」搬离小院？"))return;
      if(typeof evictResident==="function"){
        var r=evictResident(p,npcId);
        if(!r.ok)p.logs.unshift(r.msg);
      }
      quietSave();
      modalHome();
    };

    qsa(".home-act").forEach(function(el){
      el.onclick=function(){
        var r=interactHomeCompanion(p,npcId,el.dataset.act);
        quietSave();
        if(!r.ok){
          openModal(
            '<div class="modal-head"><h2 class="section-title">'+nm+'</h2><button class="modal-close" id="mClose">返回</button></div>'+
            '<p class="small dialog-note">'+r.msg+'</p>'+
            '<button class="btn" id="back">继续相处</button>'
          );
          qs("#mClose").onclick=function(){modalHomeCompanion(npcId);};
          qs("#back").onclick=function(){modalHomeCompanion(npcId);};
          return;
        }
        openModal(
          '<div class="modal-head"><h2 class="section-title">'+nm+' · '+r.act+'</h2>'+
            '<button class="modal-close" id="mClose">返回</button></div>'+
          '<div class="talk-bubble flash">「'+r.line+'」</div>'+
          '<p class="small dialog-note">'+(r.msg.replace(/^[^（]*/,"").replace(/^「[^」]*」/,"")||("好感+"+(r.gain||0)))+'</p>'+
          '<button class="btn primary" id="back">继续相处</button>'
        );
        qs("#mClose").onclick=function(){modalHomeCompanion(npcId);};
        qs("#back").onclick=function(){modalHomeCompanion(npcId);};
      };
    });
  };

  /* 覆盖家园同住区：进入伴侣面板 */
  var _modalHome=typeof modalHome==="function"?modalHome:null;
  window.modalHome=function(){
    if(_modalHome)_modalHome();
    var p=ensurePlayer(state.player);
    var panel=document.getElementById("modalPanel");
    if(!panel||!p.home||!p.home.unlocked)return;

    /* 把原「交谈」按钮升级为「相处」进入完整互动 */
    qsa(".talk-res",panel).forEach(function(el){
      el.textContent="相处";
      el.classList.add("primary");
      el.onclick=function(){
        modalHomeCompanion(el.dataset.id);
      };
    });

    /* 若没有 home_resident 注入的列表，补一块 */
    if(!panel.querySelector(".talk-res")&&!panel.querySelector(".invite-res")){
      var h=homeOf(p);
      var cap=Math.max(1,Math.min(5,h.level||1));
      var resHtml;
      if(h.residents&&h.residents.length){
        resHtml=h.residents.map(function(id){
          var npc=typeof findPerson==="function"?findPerson(id):null;
          var nm=npcName(p,id);
          var av=(typeof npcAvatar==="function"&&npc)?npcAvatar(npc,"sm"):"";
          return '<div class="item-row" style="cursor:default">'+av+
            '<div class="item-meta"><b>'+nm+'</b><p class="small">结缘 · 同住</p></div>'+
            '<button class="btn sm primary talk-res" data-id="'+id+'">相处</button></div>';
        }).join("");
      }else{
        resHtml='<p class="small">尚无住人。与结缘之人私定终身后可邀请入住。</p>';
      }
      var bonded=Object.keys(p.bonds||{}).filter(function(id){return p.bonds[id]&&!isRes(p,id);});
      var inviteRow=bonded.length
        ?('<div class="row" style="margin:6px 0;gap:4px">'+bonded.map(function(id){
            return '<button class="btn sm primary invite-res" data-id="'+id+'">邀请'+npcName(p,id)+'</button>';
          }).join("")+'</div>')
        :"";
      var block=document.createElement("div");
      block.innerHTML='<hr><h3 class="section-title">同住（'+(h.residents||[]).length+'/'+cap+'）</h3>'+resHtml+inviteRow+
        '<p class="small">与伴侣相处：闲话、谈心、共餐、练功、共憩等；台词随好感加深。</p>';
      panel.appendChild(block);
      qsa(".talk-res",panel).forEach(function(el){
        el.onclick=function(){modalHomeCompanion(el.dataset.id);};
      });
      qsa(".invite-res",panel).forEach(function(el){
        el.onclick=function(){
          if(typeof showInviteFlow==="function"){
            /* home_resident 内部未暴露时用 invite API */
          }
          if(typeof inviteResident==="function"){
            var r=inviteResident(p,el.dataset.id);
            if(!r.ok){p.logs.unshift(r.msg);quietSave();return;}
            openModal(
              '<div class="modal-head"><h2 class="section-title">邀请入住</h2><button class="modal-close" id="mClose">返回</button></div>'+
              '<div class="talk-bubble">'+r.msg+'</div>'+
              '<div class="row" style="margin-top:8px">'+
                '<button class="btn primary" id="agreeIn">安顿下来</button>'+
                '<button class="btn" id="refuseIn">再等等</button></div>'
            );
            qs("#mClose").onclick=function(){modalHome();};
            qs("#agreeIn").onclick=function(){
              confirmResident(p,el.dataset.id,true);quietSave();modalHome();
            };
            qs("#refuseIn").onclick=function(){
              confirmResident(p,el.dataset.id,false);quietSave();modalHome();
            };
          }
        };
      });
    }
  };

})();
