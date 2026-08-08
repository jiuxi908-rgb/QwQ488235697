/* 家园入住 · 结缘者可入驻小院 */
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

  function resCap(h){
    return Math.max(1, Math.min(5, h.level||1));
  }

  function isRes(p,id){
    return (homeOf(p).residents||[]).indexOf(id)>=0;
  }

  var LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」","她捏着叶哨：「私定终身之后，总想有个能一起待着的地方。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。明儿起，院里的草，我看着。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好，草都精神。」","她递来温水：「游历累了就歇着。」","「有院墙挡着，比山里踏实。」"],
      leave:"阿青背起药篓：「我先回竹林。叶哨还在，你吹，我听得见。」"
    },
    jian_tong:{
      ask:["竹间眼睛发亮：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「从今天起，这里也是我的道场！」",
      no:"竹间：「扩建的时候喊我。」",
      home:["竹间正在劈竹叶：「你回来了！看我这一招——」","「有院子真好，再也不怕砸到药苗。」"],
      leave:"竹间收剑：「我先回竹林。想我了就来找！」"
    },
    yaotong:{
      ask:["药童抱着药篓：「你家有灶吗？我想搬过来熬药。」"],
      yes:"她把药篓放进灶间角落：「以后药都在这儿熬。」",
      no:"「等你厨房收拾好。」",
      home:["药香从灶间飘出：「刚熬好，你先喝一口。」","「院里风软，适合养伤。」"],
      leave:"「我先回谷。药方抄了一份在桌上。」"
    },
    yanlan_mei:{
      ask:["梅疏影望着院中：「雾少了些。若你愿意，我可在此暂住。」"],
      yes:"她把剑穗挂在廊柱：「那便住下。」",
      no:"「山门那边也还清净。」",
      home:["梅疏影收势：「你回来了。」","「这里无雾，反而看得清剑路。」"],
      leave:"她取下剑穗：「我回山门。」"
    },
    huichun_lan:{
      ask:["兰草晃着辫子：「你家能种花吗？我想搬过来！」"],
      yes:"她把小花插在门边：「那我住下啦！」",
      no:"「等你把花圃留好。」",
      home:["兰草从花圃探头：「你回来啦！」","「药熬好了，当心烫。」"],
      leave:"「我先回谷里！」"
    },
    xuan_zhu:{
      ask:["珠儿敲算盘：「你的院子，我想入住——写入契约。」"],
      yes:"算盘搁在窗台：「账本迁过来了。」",
      no:"「等你把条款写清楚。」",
      home:["珠儿：「今日流水已记。」","「潮声远了，院子倒安静。」"],
      leave:"「契约暂停。想续约，再来。」"
    },
    su_wanqing:{
      ask:["苏晚青：「若你不嫌，我想在院中设一处药柜。」"],
      yes:"药柜钥匙放桌上：「晚间若不适，不必再跑回春谷。」",
      no:"「谷里的药柜也还够用。」",
      home:["苏晚青：「脉象稳些了。」","药香从侧房传来：「新方子，你试试。」"],
      leave:"「我暂回医馆。钥匙你收着。」"
    },
    shen_shuheng:{
      ask:["沈疏衡：「若院中有一席，剑可同锋。」"],
      yes:"云纹佩挂于廊柱：「那便住下。」",
      no:"「雾中也清静。」",
      home:["沈疏衡在院中舞剑，见你只点头。","「此处正好练心。」"],
      leave:"「我回山门。有约不散。」"
    },
    luyun:{
      ask:["陆云：「你的院子，可留我一席？」"],
      yes:"剑架在廊下：「从今日起在此练剑。」",
      no:"「山门也清静。」",
      home:["陆云：「雾少了，剑路更清晰。」","「你回来了。可要指点一招？」"],
      leave:"「我先回外门。」"
    },
    helie_npc:{
      ask:["贺炉笑得缺牙：「你家有炉吗？没有也行，我搬个小炉来！」"],
      yes:"他扛着小炉进院：「小心烫——」",
      no:"「那我再等等扩建。」",
      home:["炉火正旺：「刀要养，人更要养。」","「试刀的声音，没扰着你吧？」"],
      leave:"「炉我先搬回铸兵司。」"
    },
    ao_sailor:{
      ask:["潮生：「岸上也要有落脚处。你的院子，收不收船上人？」"],
      yes:"他把潮珠挂在门上：「契约到岸。」",
      no:"「那我还住港边。」",
      home:["潮生：「潮声远了，睡得倒踏实。」","「今日无船，正好晒网。」"],
      leave:"「我回港。船位还是给你留着。」"
    },
    baique_si:{
      ask:["雀四：「……影也可以有固定的落点。若你愿意。」"],
      yes:"黑羽插在门框上：「住下了。」",
      no:"「……楼里也行。」",
      home:["雀四靠在廊柱阴影里，只点了下头。","「你的脚步，我听得见。」"],
      leave:"「回楼。羽还在。」"
    },
    wuxiang_chen:{
      ask:["净尘耳根又红了：「寺外若有一处静室……我愿与你共抄经。」"],
      yes:"他把蒲团放在廊下：「那我住下。」",
      no:"「寺里钟声也清。」",
      home:["净尘在抄经，见你只合十。","「心定了些。院里风好。」"],
      leave:"「我回寺。念珠分你的那串，还在。」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下，朝夕可见。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"对方点头：「等你准备妥当。」",
      home:["对方在院中点头：「你回来了。」","院里多了人气，不那么空。"],
      leave:"对方收拾行装：「我先离开。有约在，不散。」"
    }
  };

  function linesOf(id){
    return LINES[id]||LINES.default;
  }

  function quietSave(){
    if(typeof saveGame==="function")saveGame(state);
  }

  window.inviteResident=function(player,npcId){
    if(typeof ensureFavor==="function")ensureFavor(player);
    var h=homeOf(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先私定终身，方可邀其入住"};
    if(isRes(player,npcId))return{ok:false,msg:"对方已在院中"};
    if((h.residents||[]).length>=resCap(h))
      return{ok:false,msg:"侧房已满（可住"+resCap(h)+"人，可扩建家园）"};
    var L=linesOf(npcId);
    var ask=L.ask[Math.floor(Math.random()*L.ask.length)];
    return{ok:true,phase:"ask",msg:ask,npcId:npcId};
  };

  window.confirmResident=function(player,npcId,agree){
    var h=homeOf(player);
    var L=linesOf(npcId);
    if(!agree){
      player.logs.unshift(L.no);
      return{ok:true,msg:L.no};
    }
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先结缘"};
    if(isRes(player,npcId))return{ok:false,msg:"已在院中"};
    if((h.residents||[]).length>=resCap(h))return{ok:false,msg:"侧房已满"};
    h.residents.push(npcId);
    player.logs.unshift(L.yes);
    return{ok:true,msg:L.yes};
  };

  window.evictResident=function(player,npcId){
    var h=homeOf(player);
    var i=(h.residents||[]).indexOf(npcId);
    if(i<0)return{ok:false,msg:"对方不在院中"};
    h.residents.splice(i,1);
    var msg=linesOf(npcId).leave;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };

  window.talkWithResident=function(player,npcId){
    if(!isRes(player,npcId))return{ok:false,msg:"对方不在院中"};
    var L=linesOf(npcId);
    var line=L.home[Math.floor(Math.random()*L.home.length)];
    var favGain=0;
    if(typeof addFavor==="function"){
      var extra=(typeof hasBond==="function"&&hasBond(player,npcId))?1:0;
      favGain=addFavor(player,npcId,2+extra);
    }
    var msg=line+(favGain?("（好感+"+favGain+"）"):"");
    player.logs.unshift(msg);
    return{ok:true,msg:msg,line:line};
  };

  /* 有同住时，休整额外回血 */
  var _rest=typeof restAtHome==="function"?restAtHome:null;
  if(_rest){
    window.restAtHome=function(player){
      var r=_rest(player);
      if(!r||!r.ok)return r;
      var h=homeOf(player);
      var n=(h.residents||[]).length;
      if(n>0){
        var bonus=Math.floor(player.maxHp*0.05*n);
        var mb=Math.floor(player.maxMp*0.05*n);
        player.hp=Math.min(player.maxHp,player.hp+bonus);
        player.mp=Math.min(player.maxMp,player.mp+mb);
        if(bonus||mb){
          var tip="同住照应，额外气血+"+bonus+"、内力+"+mb;
          player.logs.unshift(tip);
          r.msg=(r.msg||"")+"；"+tip;
        }
      }
      return r;
    };
  }

  function showInviteFlow(p,npcId,backFn){
    var r=inviteResident(p,npcId);
    if(!r.ok){
      p.logs.unshift(r.msg);
      quietSave();
      if(backFn)backFn();
      return;
    }
    openModal(
      '<div class="modal-head"><h2 class="section-title">邀请入住</h2><button class="modal-close" id="mClose">返回</button></div>'+
      '<div class="talk-bubble">'+r.msg+'</div>'+
      '<div class="row" style="margin-top:8px">'+
        '<button class="btn primary" id="agreeIn">安顿下来</button>'+
        '<button class="btn" id="refuseIn">再等等</button>'+
      '</div>'
    );
    qs("#mClose").onclick=function(){if(backFn)backFn();else closeModal();};
    qs("#agreeIn").onclick=function(){
      var rr=confirmResident(p,npcId,true);
      quietSave();
      openModal(
        '<div class="modal-head"><h2 class="section-title">入住</h2><button class="modal-close" id="mClose">返回</button></div>'+
        '<div class="talk-bubble">'+rr.msg+'</div>'
      );
      qs("#mClose").onclick=function(){if(backFn)backFn();else closeModal();};
    };
    qs("#refuseIn").onclick=function(){
      confirmResident(p,npcId,false);
      quietSave();
      if(backFn)backFn();
    };
  }

  /* 增强家园界面 */
  var _modalHome=typeof modalHome==="function"?modalHome:null;
  window.modalHome=function(){
    var p=ensurePlayer(state.player);
    homeOf(p);
    if(_modalHome)_modalHome();
    else{
      openModal('<div class="modal-head"><h2 class="section-title">家园</h2><button class="modal-close" id="mClose">关闭</button></div><p class="small">家园未就绪</p>');
      qs("#mClose").onclick=closeModal;
      return;
    }
    var panel=document.getElementById("modalPanel");
    if(!panel||!p.home||!p.home.unlocked)return;

    var h=p.home;
    var cap=resCap(h);
    var resHtml;
    if(h.residents&&h.residents.length){
      resHtml=h.residents.map(function(id){
        var npc=typeof findPerson==="function"?findPerson(id):null;
        var nm=(p.bonds&&p.bonds[id]&&p.bonds[id].name)||(npc&&npc.name)||id;
        var av=(typeof npcAvatar==="function"&&npc)?npcAvatar(npc,"sm"):"";
        return '<div class="item-row" style="cursor:default">'+av+
          '<div class="item-meta"><b>'+nm+'</b><p class="small">同住院中</p></div>'+
          '<button class="btn sm talk-res" data-id="'+id+'">交谈</button>'+
          '<button class="btn sm evict-res" data-id="'+id+'">搬离</button></div>';
      }).join("");
    }else{
      resHtml='<p class="small">尚无住人。与结缘之人对话可邀其入住，或在下方直接邀请。</p>';
    }

    var bonded=Object.keys(p.bonds||{}).filter(function(id){
      return p.bonds[id]&&!isRes(p,id);
    });
    var inviteRow=bonded.length
      ?('<div class="row" style="margin:6px 0;gap:4px">'+bonded.map(function(id){
          var nm=(p.bonds[id].name)||id;
          return '<button class="btn sm primary invite-res" data-id="'+id+'">邀请'+nm+'</button>';
        }).join("")+'</div>')
      :'<p class="small">无可邀请对象（需已私定终身且未入住）。</p>';

    var block=document.createElement("div");
    block.innerHTML=
      '<hr><h3 class="section-title">同住（'+(h.residents||[]).length+'/'+cap+'）</h3>'+
      resHtml+inviteRow+
      '<p class="small">侧房上限随家园等级提升（1级1人，最高5人）。同住时休整额外回血；院中交谈可增好感。</p>';
    panel.appendChild(block);

    qsa(".talk-res",panel).forEach(function(el){
      el.onclick=function(){
        var r=talkWithResident(p,el.dataset.id);
        quietSave();
        if(!r.ok){p.logs.unshift(r.msg);return;}
        openModal(
          '<div class="modal-head"><h2 class="section-title">院中闲话</h2><button class="modal-close" id="mClose">返回</button></div>'+
          '<div class="talk-bubble">'+(r.line||r.msg)+'</div>'+
          '<button class="btn" id="backHome">回家园</button>'
        );
        qs("#mClose").onclick=function(){modalHome();};
        qs("#backHome").onclick=function(){modalHome();};
      };
    });
    qsa(".evict-res",panel).forEach(function(el){
      el.onclick=function(){
        if(!confirm("请对方搬离小院？"))return;
        var r=evictResident(p,el.dataset.id);
        if(!r.ok)p.logs.unshift(r.msg);
        quietSave();
        modalHome();
      };
    });
    qsa(".invite-res",panel).forEach(function(el){
      el.onclick=function(){
        showInviteFlow(p,el.dataset.id,function(){modalHome();});
      };
    });
  };

  /* 结缘 NPC 对话追加「邀请入住」 */
  function patchNpc(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    window.modalNpc=function(npcId){
      _m(npcId);
      var p=ensurePlayer(state.player);
      var panel=document.getElementById("modalPanel");
      if(!panel)return;
      var h=p.home;
      if(!h||!h.unlocked)return;
      if(!p.bonds||!p.bonds[npcId])return;

      if(isRes(p,npcId)){
        var tip=document.createElement("p");
        tip.className="small";
        tip.style.color="#e8a0a0";
        tip.textContent="已入住你的家园，可在「家园」中与其交谈。";
        panel.appendChild(tip);
        return;
      }

      var b=document.createElement("button");
      b.className="btn primary";
      b.textContent="邀请入住家园";
      b.style.marginTop="8px";
      b.onclick=function(){
        showInviteFlow(p,npcId,function(){modalNpc(npcId);});
      };
      panel.appendChild(b);
    };
  }
  patchNpc();
  setTimeout(patchNpc,0);

})();
