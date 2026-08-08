/* 家园入住 · 结缘者可入驻小院 */
(function(){

  function ensureHome(p){
    if(typeof window.ensureHome==="function"&&window.ensureHome!==ensureHome){
      /* 若已有 ensureHome 则不覆盖逻辑，只补字段 */
    }
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.storage)p.home.storage=[];
    if(!p.home.residents)p.home.residents=[];
    if(p.home.cap==null)p.home.cap=10+(p.home.level||0)*5;
    return p.home;
  }
  /* 暴露补全，供家园系统使用 */
  var _eh=window.ensureHome;
  window.ensureHome=function(p){
    var h=_eh?_eh(p):(p.home||(p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0}));
    if(!h.residents)h.residents=[];
    return h;
  };

  function residentCap(h){
    /* 1级1人，每级+1，满级5人 */
    return Math.max(1, Math.min(5, (h.level||1)));
  }

  function isResident(player,npcId){
    var h=ensureHome(player);
    return (h.residents||[]).indexOf(npcId)>=0;
  }

  function listBondedForInvite(player){
    ensureFavor(player);
    var h=ensureHome(player);
    var out=[];
    Object.keys(player.bonds||{}).forEach(function(id){
      if(!player.bonds[id])return;
      if(isResident(player,id))return;
      var npc=typeof findPerson==="function"?findPerson(id):null;
      out.push({
        id:id,
        name:(player.bonds[id].name)||(npc&&npc.name)||id,
        title:npc?npc.title:"",
        kind:player.bonds[id].kind||"道侣"
      });
    });
    return out;
  }

  /** 入住对话（按人物个性） */
  var MOVE_IN_LINES={
    aqing:{
      ask:[
        "阿青看了看院墙边的空地：「……你家院子，能种药吗？」",
        "她捏着叶哨：「私定终身之后，总想有个能一起待着的地方。你的小院，收不收我？」"
      ],
      yes:"阿青把药篓往门槛边一放：「那我就住下了。明儿起，院里的草，我看着。」",
      no:"阿青点点头：「也好。等你院子再收拾整齐些。」",
      home:[
        "阿青蹲在药圃边：「今早露水好，草都精神。」",
        "她递来一碗温水：「游历累了就歇着，别硬撑。」",
        "竹叶声里，她轻声：「有院墙挡着，比山里踏实些。」"
      ],
      leave:"阿青背起药篓：「那我先回竹林。叶哨还在，你吹，我听得见。」"
    },
    jian_tong:{
      ask:[
        "竹间眼睛发亮：「你家院子能练剑吗？我、我想搬过来！」",
        "他握紧剑柄：「私定终身了，总该有个能朝夕见的地方。」"
      ],
      yes:"竹间把剑架在廊柱上：「从今天起，这里也是我的道场！」",
      no:"竹间有点失望：「那我再等等……你扩建的时候喊我。」",
      home:[
        "竹间正在院中劈竹叶：「你回来了！看我这一招——」",
        "他擦着剑：「有院子真好，再也不怕砸到别人的药苗。」",
        "「今晚月色不错，要不要对练一回？」"
      ],
      leave:"竹间收剑：「那我先回竹林住。想我了就来找！」"
    },
    yaotong:{
      ask:["药童抱着药篓：「你家有灶吗？我想搬过来熬药……可以吗？」"],
      yes:"她把药篓放进厨房角落：「那我的药，以后都在这儿熬。」",
      no:"药童点头：「等你厨房收拾好。」",
      home:[
        "药香从灶间飘出来：「刚熬好，你先喝一口。」",
        "「院里风软，比谷里还适合养伤。」"
      ],
      leave:"药童：「那我先回谷里。药方我抄了一份放桌上。」"
    },
    yanlan_mei:{
      ask:["梅疏影望着院中空地：「雾少了些。若你愿意，我可在此暂住，朝夕练剑。」"],
      yes:"她把剑穗挂在廊柱上：「那便住下。剑声若扰了你，说一声。」",
      no:"「也好。山门那边，也还清净。」",
      home:[
        "梅疏影在院中收势：「你回来了。」",
        "「这里无雾，反而看得清剑路。」"
      ],
      leave:"她取下剑穗：「我回山门。有事，吹哨也行——我听得见。」"
    },
    huichun_lan:{
      ask:["兰草晃着辫子：「你家院子能种花吗？我想搬过来！」"],
      yes:"她把小花插在门边：「那我住下啦！药篓放厨房！」",
      no:"「那等你把花圃留好——」",
      home:["兰草从花圃探头：「你回来啦！今天的花开得正好。」","「药熬好了，当心烫。」"],
      leave:"兰草背起药篓：「我先回谷里，想我了就来找！」"
    },
    xuan_zhu:{
      ask:["珠儿敲了敲算盘：「你的院子，算不算一笔固定资产？我想入住——写入契约。」"],
      yes:"她把算盘搁在窗台：「账本迁过来了。我不毁约。」",
      no:"「等你把房契条款写清楚。」",
      home:["珠儿：「今日流水已记。你若带回战利品，我帮你估。」","「潮声远了，院子倒安静。」"],
      leave:"珠儿收起算盘：「契约暂停。想续约，再来。」"
    },
    su_wanqing:{
      ask:["苏晚青轻声：「若你不嫌，我想在院中设一处药柜。方便……也安心。」"],
      yes:"她把药柜钥匙放桌上：「晚间若咳血，不必再跑回春谷。」",
      no:"「也好。谷里的药柜，也还够用。」",
      home:["苏晚青：「脉象稳些了。今日不必硬撑。」","药香从侧房传来：「新方子，你试试。」"],
      leave:"「我暂回医馆。钥匙你收着，随时可来谷里。」"
    },
    shen_shuheng:{ask:["沈疏衡：「同门已久。若院中有一席之地，剑可同锋。」"],yes:"他将云纹佩挂于廊柱：「那便住下。」",no:"「雾中也清静。」",home:["沈疏衡在院中舞剑，见你只点头。」","「心静，剑才直。此处正好。」"],leave:"「我回山门。有约，不散。」"},
    luyun:{ask:["陆云：「外门弟子也能有个落脚处。你的院子，可留我一席？」"],yes:"他把剑架在廊下：「从今日起，在此练剑。」",no:"「山门也清静。」",home:["陆云：「雾少了，剑路更清晰。」","「你回来了。可要指点一招？」"],leave:"「我先回外门。剑穗还在你那。」"},
    helie_npc:{ask:["贺炉笑得缺牙：「你家有炉吗？没有也行，我搬个小炉来！」"],yes:"他扛着小炉进院：「小心烫——」",no:"「那我再等等扩建。」",home:["炉火正旺：「刀要养，人更要养。」","「试刀的声音，没扰着你吧？」"],leave:"「炉我先搬回铸兵司。想打刀，还来找我。」"},
    ao_sailor:{ask:["潮生：「岸上也要有落脚处。你的院子，收不收船上人？」"],yes:"他把潮珠挂在门上：「契约到岸。」",no:"「那我还住港边。」",home:["潮生：「潮声远了，睡得倒踏实。」","「今日无船，正好晒网。」"],leave:"「我回港。船位还是给你留着。」"},
    baique_si:{ask:["雀四：「……影也可以有固定的落点。若你愿意。」"],yes:"黑羽插在门框上：「住下了。」",no:"「……楼里也行。」",home:["雀四靠在廊柱阴影里，只点了下头。","「你的脚步，我听得见。」"],leave:"「回楼。羽还在。」"},
    wuxiang_chen:{ask:["净尘耳根又红了：「寺外若有一处静室……我愿与你共抄经。」"],yes:"他把蒲团放在廊下：「那我住下。」",no:"「寺里钟声也清。」",home:["净尘在抄经，见你只合十。","「心定了些。院里风好。」"],leave:"「我回寺。念珠分你的那串，还在。」"},
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下，朝夕可见。」"],
      yes:"对方把简单的行装放进侧房：「那我便住下了。」",
      no:"对方点头：「也好。等你准备妥当。」",
      home:["对方在院中向你点头：「你回来了。」","院里多了人气，显得不那么空。"],
      leave:"对方收拾行装：「我先离开。有约在，不散。」"
    }
  };

  function linesOf(npcId){
    return MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
  }
  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」","她捏着叶哨：「私定终身之后，总想有个能一起待着的地方。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。明儿起，院里的草，我看着。」",
      no:"阿青点头：「也好。等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好，草都精神。」","她递来温水：「游历累了就歇着。」","「有院墙挡着，比山里踏实。」"],
      leave:"阿青背起药篓：「我先回竹林。叶哨还在，你吹，我听得见。」"
    },
    jian_tong:{
      ask:["竹间眼睛发亮：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「从今天起，这里也是我的道场！」",
      no:"竹间：「那我再等等……扩建时喊我。」",
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
    shen_shuheng:{ask:["沈疏衡：「若院中有一席，剑可同锋。」"],yes:"云纹佩挂于廊柱：「那便住下。」",no:"「雾中也清静。」",home:["沈疏衡在院中舞剑，见你只点头。","「此处正好练心。」"],leave:"「我回山门。有约不散。」"},
    luyun:{ask:["陆云：「你的院子，可留我一席？」"],yes:"剑架在廊下：「从今日起在此练剑。」",no:"「山门也清静。」",home:["陆云：「雾少了，剑路更清晰。」","「你回来了。可要指点一招？」"],leave:"「我先回外门。」"},
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"对方点头：「等你准备妥当。」",
      home:["对方在院中向你点头：「你回来了。」","院里多了人气，不那么空。」"],
      leave:"对方收拾行装：「我先离开。有约在，不散。」"
    }
  };

  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}
  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。明儿起，院里的草，我看着。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」","「有院墙，比山里踏实。」"],
      leave:"阿青背起药篓：「我先回竹林。叶哨还在。」"
    },
    jian_tong:{
      ask:["竹间眼睛发亮：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「从今天起，这里也是我的道场！」",
      no:"「那我再等等……扩建时喊我。」",
      home:["竹间正在劈竹叶：「你回来了！」","「有院子真好。」"],
      leave:"竹间收剑：「我先回竹林。」"
    },
    yanlan_mei:{
      ask:["梅疏影：「雾少了些。若你愿意，我可在此暂住。」"],
      yes:"剑穗挂在廊柱：「那便住下。」",
      no:"「山门也还清净。」",
      home:["梅疏影收势：「你回来了。」","「这里无雾，剑路更清晰。」"],
      leave:"「我回山门。」"
    },
    huichun_lan:{
      ask:["兰草：「你家能种花吗？我想搬过来！」"],
      yes:"小花插在门边：「那我住下啦！」",
      no:"「等你把花圃留好。」",
      home:["兰草从花圃探头：「你回来啦！」","「药熬好了，当心烫。」"],
      leave:"「我先回谷里！」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方在院中点头：「你回来了。」","院里多了人气，不那么空。"],
      leave:"「我先离开。有约在，不散。」"
    }
  };
  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}

  function ensureHomeLocal(p){
    if(typeof ensureHome==="function")return ensureHome(p);
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    return p.home;
  }

  function residentCap(h){return Math.max(1,Math.min(5,h.level||1));}
  function isResident(player,npcId){
    var h=ensureHomeLocal(player);
    return (h.residents||[]).indexOf(npcId)>=0;
  }

  window.inviteResident=function(player,npcId){
    ensureFavor(player);
    var h=ensureHomeLocal(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先私定终身，方可邀其入住"};
    if(isResident(player,npcId))return{ok:false,msg:"对方已在院中"};
    if((h.residents||[]).length>=residentCap(h)){
      return{ok:false,msg:"侧房已满（当前可住"+residentCap(h)+"人，可扩建家园）"};
    }
    var lines=linesOf(npcId);
    var ask=lines.ask[Math.floor(Math.random()*lines.ask.length)];
    return{ok:true,phase:"ask",msg:ask,npcId:npcId};
  };

  window.confirmResident=function(player,npcId,agree){
    ensureFavor(player);
    var h=ensureHomeLocal(player);
    var lines=linesOf(npcId);
    if(!agree){
      player.logs.unshift(lines.no);
      return{ok:true,msg:lines.no};
    }
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先结缘"};
    if(isResident(player,npcId))return{ok:false,msg:"已在院中"};
    if((h.residents||[]).length>=residentCap(h))return{ok:false,msg:"侧房已满"};
    h.residents.push(npcId);
    var msg=lines.yes;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };

  window.evictResident=function(player,npcId){
    var h=ensureHomeLocal(player);
    var i=(h.residents||[]).indexOf(npcId);
    if(i<0)return{ok:false,msg:"对方不在院中"};
    h.residents.splice(i,1);
    var lines=linesOf(npcId);
    var msg=lines.leave;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };

  window.talkWithResident=function(player,npcId){
    if(!isResident(player,npcId))return{ok:false,msg:"对方不在院中"};
    var lines=linesOf(npcId);
    var line=lines.home[Math.floor(Math.random()*lines.home.length)];
    var favGain=0;
    if(typeof addFavor==="function"){
      favGain=addFavor(player,npcId,2+(hasBond(player,npcId)?1:0));
    }
    var msg=line+(favGain?("（好感+"+favGain+"）"):"");
    player.logs.unshift(msg);
    return{ok:true,msg:msg,line:line};
  };

  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}
  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」","「有院墙，比山里踏实。」"],
      leave:"阿青背起药篓：「我先回竹林。」"
    },
    jian_tong:{
      ask:["竹间眼睛发亮：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「从今天起，这里也是我的道场！」",
      no:"「扩建时喊我。」",
      home:["竹间正在劈竹叶：「你回来了！」","「有院子真好。」"],
      leave:"竹间收剑：「我先回竹林。」"
    },
    yanlan_mei:{
      ask:["梅疏影：「雾少了些。若你愿意，我可在此暂住。」"],
      yes:"剑穗挂在廊柱：「那便住下。」",
      no:"「山门也还清净。」",
      home:["梅疏影收势：「你回来了。」","「这里无雾，剑路更清晰。」"],
      leave:"「我回山门。」"
    },
    huichun_lan:{
      ask:["兰草：「你家能种花吗？我想搬过来！」"],
      yes:"小花插在门边：「那我住下啦！」",
      no:"「等你把花圃留好。」",
      home:["兰草从花圃探头：「你回来啦！」","「药熬好了，当心烫。」"],
      leave:"「我先回谷里！」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方在院中点头：「你回来了。」","院里多了人气，不那么空。"],
      leave:"「我先离开。有约在，不散。」"
    }
  };
  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}

  function ensureHomeLocal(p){
    if(typeof ensureHome==="function"){
      var h=ensureHome(p);
      if(!h.residents)h.residents=[];
      return h;
    }
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    return p.home;
  }
  function residentCap(h){return Math.max(1,Math.min(5,h.level||1));}
  function isResident(player,npcId){
    return (ensureHomeLocal(player).residents||[]).indexOf(npcId)>=0;
  }

  window.inviteResident=function(player,npcId){
    ensureFavor(player);
    var h=ensureHomeLocal(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先私定终身，方可邀其入住"};
    if(isResident(player,npcId))return{ok:false,msg:"对方已在院中"};
    if((h.residents||[]).length>=residentCap(h))
      return{ok:false,msg:"侧房已满（可住"+residentCap(h)+"人，可扩建）"};
    var lines=linesOf(npcId);
    var ask=lines.ask[Math.floor(Math.random()*lines.ask.length)];
    return{ok:true,phase:"ask",msg:ask,npcId:npcId};
  };
  window.confirmResident=function(player,npcId,agree){
    var h=ensureHomeLocal(player);
    var lines=linesOf(npcId);
    if(!agree){player.logs.unshift(lines.no);return{ok:true,msg:lines.no};}
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先结缘"};
    if(isResident(player,npcId))return{ok:false,msg:"已在院中"};
    if((h.residents||[]).length>=residentCap(h))return{ok:false,msg:"侧房已满"};
    h.residents.push(npcId);
    player.logs.unshift(lines.yes);
    return{ok:true,msg:lines.yes};
  };
  window.evictResident=function(player,npcId){
    var h=ensureHomeLocal(player);
    var i=(h.residents||[]).indexOf(npcId);
    if(i<0)return{ok:false,msg:"对方不在院中"};
    h.residents.splice(i,1);
    var msg=linesOf(npcId).leave;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };
  window.talkWithResident=function(player,npcId){
    if(!isResident(player,npcId))return{ok:false,msg:"对方不在院中"};
    var lines=linesOf(npcId);
    var line=lines.home[Math.floor(Math.random()*lines.home.length)];
    var favGain=0;
    if(typeof addFavor==="function")favGain=addFavor(player,npcId,2+(typeof hasBond==="function"&&hasBond(player,npcId)?1:0));
    var msg=line+(favGain?("（好感+"+favGain+"）"):"");
    player.logs.unshift(msg);
    return{ok:true,msg:msg,line:line};
  };
  function isResident(player,npcId){
    var h=player.home;return h&&h.residents&&h.residents.indexOf(npcId)>=0;
  }
  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}
  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」"],
      leave:"阿青背起药篓：「我先回竹林。」"
    },
    jian_tong:{
      ask:["竹间：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「这里也是我的道场！」",
      no:"「扩建时喊我。」",
      home:["竹间：「你回来了！看我这一招——」","「有院子真好。」"],
      leave:"「我先回竹林。」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方点头：「你回来了。」","院里多了人气。」"],
      leave:"「我先离开。有约在，不散。」"
    }
  };
  function linesOf(id){return MOVE_IN_LINES[id]||MOVE_IN_LINES.default;}

  function ensureHomeRes(p){
    if(typeof ensureHome==="function"){
      var hh=ensureHome(p);
      if(!hh.residents)hh.residents=[];
      return hh;
    }
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    return p.home;
  }
  function residentCap(h){return Math.max(1,Math.min(5,h.level||1));}
  function isResident(player,id){return (ensureHomeRes(player).residents||[]).indexOf(id)>=0;}

  window.inviteResident=function(player,npcId){
    ensureFavor(player);
    var h=ensureHomeRes(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先私定终身，方可邀其入住"};
    if(isResident(player,npcId))return{ok:false,msg:"对方已在院中"};
    if((h.residents||[]).length>=residentCap(h))
      return{ok:false,msg:"侧房已满（可住"+residentCap(h)+"人，可扩建）"};
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    return{ok:true,phase:"ask",msg:lines.ask[Math.floor(Math.random()*lines.ask.length)],npcId:npcId};
  };
  window.confirmResident=function(player,npcId,agree){
    var h=ensureHomeRes(player);
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    if(!agree){player.logs.unshift(lines.no);return{ok:true,msg:lines.no};}
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先结缘"};
    if(isResident(player,npcId))return{ok:false,msg:"已在院中"};
    if((h.residents||[]).length>=residentCap(h))return{ok:false,msg:"侧房已满"};
    h.residents.push(npcId);
    player.logs.unshift(lines.yes);
    return{ok:true,msg:lines.yes};
  };
  window.evictResident=function(player,npcId){
    var h=ensureHomeRes(player);
    var i=(h.residents||[]).indexOf(npcId);
    if(i<0)return{ok:false,msg:"对方不在院中"};
    h.residents.splice(i,1);
    var msg=(MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default).leave;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };
  window.talkWithResident=function(player,npcId){
    var h=ensureHomeRes(player);
    if((h.residents||[]).indexOf(npcId)<0)return{ok:false,msg:"对方不在院中"};
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    var line=lines.home[Math.floor(Math.random()*lines.home.length)];
    var favGain=0;
    if(typeof addFavor==="function")favGain=addFavor(player,npcId,2+(typeof hasBond==="function"&&hasBond(player,npcId)?1:0));
    var msg=line+(favGain?("（好感+"+favGain+"）"):"");
    player.logs.unshift(msg);
    return{ok:true,msg:msg,line:line};
  };

  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」"],
      leave:"阿青背起药篓：「我先回竹林。」"
    },
    jian_tong:{
      ask:["竹间：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「这里也是我的道场！」",
      no:"「扩建时喊我。」",
      home:["竹间：「你回来了！」","「有院子真好。」"],
      leave:"「我先回竹林。」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方点头：「你回来了。」","院里多了人气。」"],
      leave:"「我先离开。有约在，不散。」"
    }
  };

  /* 增强家园界面：入住者列表 */
  var _modalHome=typeof modalHome==="function"?modalHome:null;
  window.modalHome=function(){
    var p=ensurePlayer(state.player);
    if(typeof ensureHome==="function")ensureHome(p);
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,residents:[]};
    if(!p.home.residents)p.home.residents=[];

    if(_modalHome){
      _modalHome();
    }else{
      openModal('<div class="modal-head"><h2 class="section-title">家园</h2><button class="modal-close" id="mClose">关闭</button></div><p class="small">家园系统加载中</p>');
      wireCloseOnly(qs("#mClose"));
      return;
    }

    var panel=document.getElementById("modalPanel");
    if(!panel||!p.home.unlocked){
      wireCloseOnly(qs("#mClose"));
      return;
    }

    /* 在家园界面追加入住区域 */
    var h=p.home;
    var cap=Math.max(1,Math.min(5,h.level||1));
    var resHtml="";
    if(h.residents.length){
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
      resHtml='<p class="small">尚无住人。与结缘之人在对话中可邀其入住（或在此邀请）。</p>';
    }

    var bonded=Object.keys(p.bonds||{}).filter(function(id){
      return p.bonds[id]&&(h.residents||[]).indexOf(id)<0;
    });
    var inviteRow=bonded.length
      ?('<div class="row" style="margin:6px 0">'+bonded.map(function(id){
          var nm=(p.bonds[id].name)||id;
          return '<button class="btn sm primary invite-res" data-id="'+id+'">邀请'+nm+'</button>';
        }).join("")+'</div>')
      :'<p class="small">无可邀请对象（需已私定终身且未入住）。</p>';

    var block=document.createElement("div");
    block.innerHTML=
      '<hr><h3 class="section-title">同住（'+(h.residents||[]).length+'/'+Math.max(1,Math.min(5,h.level||1))+'）</h3>'+
      resHtml+inviteRow+
      '<p class="small">侧房上限随家园等级提升（1级1人，最高5人）。入住后可在院中交谈增好感。</p>';
    var panel=document.getElementById("modalPanel");
    if(panel){
      panel.appendChild(block);
      wireCloseOnly(qs("#mClose",panel));
      qsa(".talk-res",panel).forEach(function(el){
        el.onclick=function(){
          var r=talkWithResident(p,el.dataset.id);
          if(!r.ok)p.logs.unshift(r.msg);
          else{
            openModal(
              '<div class="modal-head"><h2 class="section-title">院中闲话</h2><button class="modal-close" id="mClose">返回</button></div>'+
              '<div class="talk-bubble">「'+(r.line||r.msg)+'」</div>'+
              '<button class="btn" id="backHome">回家园</button>'
            );
            qs("#mClose").onclick=function(){modalHome();};
            qs("#backHome").onclick=function(){modalHome();};
          }
          quietSave();
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
          var id=el.dataset.id;
          var r=inviteResident(p,id);
          if(!r.ok){p.logs.unshift(r.msg);quietSave();return;}
          openModal(
            '<div class="modal-head"><h2 class="section-title">邀请入住</h2><button class="modal-close" id="mClose">返回</button></div>'+
            '<div class="talk-bubble">「'+r.msg+'」</div>'+
            '<div class="row" style="margin-top:8px">'+
              '<button class="btn primary" id="agreeIn">答应安顿</button>'+
              '<button class="btn" id="refuseIn">再等等</button>'+
            '</div>'
          );
          qs("#mClose").onclick=function(){modalHome();};
          qs("#agreeIn").onclick=function(){
            var rr=confirmResident(p,id,true);
            quietSave();
            openModal(
              '<div class="modal-head"><h2 class="section-title">入住</h2><button class="modal-close" id="mClose">回家园</button></div>'+
              '<div class="talk-bubble">「'+rr.msg+'」</div>'
            );
            qs("#mClose").onclick=function(){modalHome();};
          };
          qs("#refuseIn").onclick=function(){
            confirmResident(p,id,false);
            quietSave();
            modalHome();
          };
        };
      });
    }
  };

  /* 在结缘 NPC 对话中增加「邀请入住」 */
  function patchNpcInvite(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    window.modalNpc=function(npcId){
      _m(npcId);
      var p=ensurePlayer(state.player);
      var panel=document.getElementById("modalPanel");
      if(!panel)return;
      wireCloseOnly(qs("#mClose",panel));
      var h=p.home;
      if(!h||!h.unlocked)return;
      if(!p.bonds||!p.bonds[npcId])return;
      if((h.residents||[]).indexOf(npcId)>=0){
        var tip=document.createElement("p");
        tip.className="small";
        tip.style.color="#e8a0a0";
        tip.textContent="已入住你的家园。可在家园中与其交谈。";
        panel.appendChild(tip);
        return;
      }
      if(typeof inviteResident!=="function")return;
      var row=panel.querySelector(".row")||panel;
      var b=document.createElement("button");
      b.className="btn primary";
      b.textContent="邀请入住家园";
      b.style.marginTop="8px";
      b.onclick=function(){
        var r=inviteResident(p,npcId);
        if(!r.ok){p.logs.unshift(r.msg);quietSave();return;}
        openModal(
          '<div class="modal-head"><h2 class="section-title">邀请入住</h2><button class="modal-close" id="mClose">关闭</button></div>'+
          '<div class="talk-bubble">「'+r.msg+'」</div>'+
          '<div class="row" style="margin-top:8px">'+
            '<button class="btn primary" id="agreeIn">安顿下来</button>'+
            '<button class="btn" id="refuseIn">再等等</button>'+
          '</div>'
        );
        wireCloseOnly(qs("#mClose"));
        qs("#agreeIn").onclick=function(){
          var rr=confirmResident(p,npcId,true);
          quietSave();
          openModal(
            '<div class="modal-head"><h2 class="section-title">入住</h2><button class="modal-close" id="mClose">关闭</button></div>'+
            '<div class="talk-bubble">「'+rr.msg+'」</div>'
          );
          wireCloseOnly(qs("#mClose"));
        };
        qs("#refuseIn").onclick=function(){
          confirmResident(p,npcId,false);
          quietSave();
          modalNpc(npcId);
        };
      };
      panel.appendChild(b);
    };
  }
  setTimeout(patchNpcInvite,0);
  function patchNpcInvite(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    window.modalNpc=function(npcId){
      _m(npcId);
      var p=ensurePlayer(state.player);
      wireCloseOnly(document.getElementById("mClose"));
      var panel=document.getElementById("modalPanel");
      if(!panel||!p.home||!p.home.unlocked)return;
      if(!p.bonds||!p.bonds[npcId])return;
      if(p.home.residents&&p.home.residents.indexOf(npcId)>=0){
        var tip=document.createElement("p");
        tip.className="small";tip.style.color="#e8a0a0";
        tip.textContent="已入住你的家园。";
        panel.appendChild(tip);
        return;
      }
      if(typeof inviteResident!=="function")return;
      var b=document.createElement("button");
      b.className="btn primary";b.textContent="邀请入住家园";b.style.marginTop="8px";
      b.onclick=function(){
        var r=inviteResident(p,npcId);
        if(!r.ok){p.logs.unshift(r.msg);quietSave();return;}
        openModal(
          '<div class="modal-head"><h2 class="section-title">邀请入住</h2><button class="modal-close" id="mClose">关闭</button></div>'+
          '<div class="talk-bubble">「'+r.msg+'」</div>'+
          '<div class="row" style="margin-top:8px">'+
            '<button class="btn primary" id="agreeIn">安顿下来</button>'+
            '<button class="btn" id="refuseIn">再等等</button></div>'
        );
        wireCloseOnly(qs("#mClose"));
        qs("#agreeIn").onclick=function(){
          var rr=confirmResident(p,npcId,true);
          quietSave();
          openModal(
            '<div class="modal-head"><h2 class="section-title">入住</h2><button class="modal-close" id="mClose">关闭</button></div>'+
            '<div class="talk-bubble">「'+rr.msg+'」</div>'
          );
          wireCloseOnly(qs("#mClose"));
        };
        qs("#refuseIn").onclick=function(){
          confirmResident(p,npcId,false);
          quietSave();
          modalNpc(npcId);
        };
      };
      var panel=document.getElementById("modalPanel");
      if(panel)panel.appendChild(b);
    };
  }
  setTimeout(patchNpcInvite,50);

  function ensureHomeRes(p){
    if(typeof ensureHome==="function"){
      var hh=ensureHome(p);
      if(!hh.residents)hh.residents=[];
      return hh;
    }
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:10,lastRestDay:0,residents:[]};
    if(!p.home.residents)p.home.residents=[];
    return p.home;
  }
  function residentCap(h){return Math.max(1,Math.min(5,h.level||1));}
  function isResident(player,id){return (ensureHomeRes(player).residents||[]).indexOf(id)>=0;}

  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」"],
      leave:"阿青背起药篓：「我先回竹林。」"
    },
    jian_tong:{
      ask:["竹间：「院子能练剑吗？我想搬过来！」"],
      yes:"竹间把剑架在廊柱上：「这里也是我的道场！」",
      no:"「扩建时喊我。」",
      home:["竹间：「你回来了！」","「有院子真好。」"],
      leave:"「我先回竹林。」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方点头：「你回来了。」","院里多了人气。」"],
      leave:"「我先离开。有约在，不散。」"
    }
  };

  window.inviteResident=function(player,npcId){
    ensureFavor(player);
    if(typeof ensureHome==="function")ensureHome(player);
    if(!player.home||!player.home.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(!player.home.residents)player.home.residents=[];
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先私定终身，方可邀其入住"};
    if(player.home.residents.indexOf(npcId)>=0)return{ok:false,msg:"对方已在院中"};
    var cap=Math.max(1,Math.min(5,player.home.level||1));
    if(player.home.residents.length>=cap)return{ok:false,msg:"侧房已满（可住"+cap+"人）"};
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    return{ok:true,phase:"ask",msg:lines.ask[Math.floor(Math.random()*lines.ask.length)],npcId:npcId};
  };
  window.confirmResident=function(player,npcId,agree){
    if(typeof ensureHome==="function")ensureHome(player);
    if(!player.home.residents)player.home.residents=[];
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    if(!agree){player.logs.unshift(lines.no);return{ok:true,msg:lines.no};}
    if(!player.bonds||!player.bonds[npcId])return{ok:false,msg:"需先结缘"};
    if(player.home.residents.indexOf(npcId)>=0)return{ok:false,msg:"已在院中"};
    var cap=Math.max(1,Math.min(5,player.home.level||1));
    if(player.home.residents.length>=cap)return{ok:false,msg:"侧房已满"};
    player.home.residents.push(npcId);
    player.logs.unshift(lines.yes);
    return{ok:true,msg:lines.yes};
  };
  window.evictResident=function(player,npcId){
    if(!player.home||!player.home.residents)return{ok:false,msg:"对方不在院中"};
    var i=player.home.residents.indexOf(npcId);
    if(i<0)return{ok:false,msg:"对方不在院中"};
    player.home.residents.splice(i,1);
    var msg=(MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default).leave;
    player.logs.unshift(msg);
    return{ok:true,msg:msg};
  };
  window.talkWithResident=function(player,npcId){
    if(!player.home||!player.home.residents||player.home.residents.indexOf(npcId)<0)
      return{ok:false,msg:"对方不在院中"};
    var lines=MOVE_IN_LINES[npcId]||MOVE_IN_LINES.default;
    var line=lines.home[Math.floor(Math.random()*lines.home.length)];
    var favGain=0;
    if(typeof addFavor==="function")favGain=addFavor(player,npcId,2+(typeof hasBond==="function"&&hasBond(player,npcId)?1:0));
    var msg=line+(favGain?("（好感+"+favGain+"）"):"");
    player.logs.unshift(msg);
    return{ok:true,msg:msg,line:line};
  };

  var MOVE_IN_LINES={
    aqing:{
      ask:["阿青看了看院角：「……你家院子，能种药吗？我想住下。」"],
      yes:"阿青把药篓放在门槛边：「那我就住下了。」",
      no:"阿青点头：「等你院子再整齐些。」",
      home:["阿青蹲在药圃边：「今早露水好。」","她递来温水：「游历累了就歇着。」"],
      leave:"阿青背起药篓：「我先回竹林。」"
    },
    default:{
      ask:["对方望着小院：「若你愿意，我想在此住下。」"],
      yes:"对方把行装放进侧房：「那我便住下了。」",
      no:"「等你准备妥当。」",
      home:["对方点头：「你回来了。」","院里多了人气。」"],
      leave:"「我先离开。有约在，不散。」"
    }
  };

})();
