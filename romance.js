/* 私定终身扩展 · 关系界面 */
(function(){

  /** 追加可结缘对象（合并进 ROMANCE_NPCS） */
  var MORE_ROMANCE={
    yanlan_mei:{
      name:"梅疏影",
      lines:[
        "梅疏影剑穗轻晃，声音仍淡：「……若你认真，便把这枝山花收好。剑可共练，路也可共走。」",
        "雾气里她终于抬眼：「私定终身。说出来，便要守。你守不守？」",
        "她把一截素白剑穗塞进你掌心：「我的穗，分你一半。」"
      ],
      accept:"你与梅疏影私定终身。山花为媒，剑穗为证。",
      rejectNeed:"她摇头：「再等等。剑未成，心未定。」",
      already:"梅疏影轻声：「已经约过了。」",
      buff:{agi:1,desc:"影侣·身法+1"}
    },
    huichun_lan:{
      name:"兰草",
      lines:[
        "兰草把辫上的小花摘下来递给你：「谷主说救人重要……那你，也让我救着点，好不好？」",
        "她耳尖红透：「私定终身可以吗？药篓我背，路你走。」",
        "笑意里带着一点认真：「以后采药，只与你一起。」"
      ],
      accept:"你与兰草私定终身。药香与花香缠在一处。",
      rejectNeed:"兰草摆手：「再熟一些嘛。」",
      already:"兰草点头：「约过啦。」",
      buff:{wit:1,desc:"草缘·悟性+1"}
    },
    xuan_zhu:{
      name:"珠儿",
      lines:[
        "珠儿拨完算盘，抬眼：「账要一笔笔记清楚。人……也是。你可愿入我的账？」",
        "潮珠在她指间转：「私定终身。契约写清楚，我不毁约。」",
        "她把一串潮珠套上你腕：「信物。丢了要赔。」"
      ],
      accept:"你与珠儿私定终身。潮珠为契，海风为证。",
      rejectNeed:"珠儿摇头：「账未平，心未定。」",
      already:"珠儿敲了敲算盘：「记过了。」",
      buff:{luck:1,desc:"珠契·福缘+1"}
    },
    luyun:{
      name:"陆云",
      lines:[
        "陆云握剑的手紧了紧：「同道已久。若你愿意，剑可共鞘。」",
        "雾中他声音仍稳：「私定终身。外门弟子也敢说这句话。」",
        "他把沾露的剑穗解下一缕：「你收着。」"
      ],
      accept:"你与陆云私定终身。云雾为证，剑意同路。",
      rejectNeed:"陆云：「心再静些，剑再直些。」",
      already:"陆云点头：「约过了。」",
      buff:{agi:1,desc:"云剑·身法+1"}
    },
    helie_npc:{
      name:"贺炉",
      lines:[
        "贺炉擦了擦额上的汗，缺牙的笑有点傻：「刀要养，人也要养。你……让我养着点？」",
        "炉火映着他脸：「私定终身！我敢说！你敢应吗？」",
        "他塞给你一块刚冷的刀坯：「丑是丑，是我打的。」"
      ],
      accept:"你与贺炉私定终身。炉火不灭，约亦不灭。",
      rejectNeed:"贺炉抓头：「再搬几回矿……等我再稳点。」",
      already:"贺炉大笑：「约过了！」",
      buff:{arm:1,desc:"炉约·臂力+1"}
    },
    ao_sailor:{
      name:"潮生",
      lines:[
        "潮生拍了拍贝壳串：「契约写在海里。你若点头，我便守一辈子。」",
        "浪声里他认真道：「私定终身。毁约者——我自己也不会是。」",
        "他把一枚潮珠按进你掌心：「信物。」"
      ],
      accept:"你与潮生私定终身。潮汐为证，契约入海。",
      rejectNeed:"潮生：「再护几趟船。让我更信你。」",
      already:"潮生：「约过了。船位永远给你留。」",
      buff:{qi:1,desc:"潮契·内力+1"}
    },
    baique_si:{
      name:"雀四",
      lines:[
        "雀四的声音从面具后传来：「……脚步，已经很轻了。若你愿意，影也可以成双。」",
        "他沉默很久：「私定终身。楼规不禁。我……想说。」",
        "一枚无字的黑羽落到你手心。"
      ],
      accept:"你与雀四私定终身。影中有约，羽落无声。",
      rejectNeed:"雀四：「再等等。我还不够无声。」",
      already:"雀四：「……约过了。」",
      buff:{agi:1,desc:"影约·身法+1"}
    },
    wuxiang_chen:{
      name:"净尘",
      lines:[
        "净尘捏着新念珠，耳根通红：「抄经常抄错……但若你愿意，我愿把心也抄清楚。」",
        "他深吸一口气：「私定终身。寺规未禁俗家之约——我查过了。」",
        "一本抄歪的经页塞给你：「丑，但是我写的。」"
      ],
      accept:"你与净尘私定终身。经页为盟，钟声为证。",
      rejectNeed:"净尘低头：「再面壁几日……心再定些。」",
      already:"净尘小声：「约过了。」",
      buff:{wit:1,desc:"经缘·悟性+1"}
    },
    su_wanqing:{
      name:"苏晚青",
      lines:[
        "苏晚青把脉的手指顿了顿：「脉象……有些乱。是我的，还是你的？」",
        "她轻声：「私定终身。医人易，医心难。我愿试。」",
        "一包写着你名字的药，推到你面前。"
      ],
      accept:"你与苏晚青私定终身。药香为媒，谷风为证。",
      rejectNeed:"苏晚青：「再熟一些。情如药，宜慢不宜躁。」",
      already:"苏晚青微笑：「约过了。药还是会给你留。」",
      buff:{bone:1,desc:"医侣·根骨+1"}
    },
    shen_shuheng:{
      name:"沈疏衡",
      lines:[
        "沈疏衡望着雾：「同门已久。若你不嫌，剑可同锋，路可同尽。」",
        "他声音清朗：「私定终身。内门弟子，也有私心。」",
        "一枚云纹小佩，放在你掌心。"
      ],
      accept:"你与沈疏衡私定终身。云雾不散，约亦不散。",
      rejectNeed:"沈疏衡：「剑意再深一层，我便应你。」",
      already:"沈疏衡：「约过了。」",
      buff:{wit:1,desc:"衡剑·悟性+1"}
    },
    /* 部分年长/特殊角色：结义式或知己式「终身之约」 */
    zhou:{
      name:"老周",
      lines:[
        "老周叹了口气，却笑了：「老了老了，还被你这句话砸中。行，店里有你一席之地，一辈子。」",
        "他拍桌：「私定终身？江湖人爱说大话。我老周认你——算结义也成。」",
        "一把后厨暗间的钥匙，塞进你手里。"
      ],
      accept:"你与老周结下终身之约。客栈为家，人情为盟。",
      rejectNeed:"老周摇头：「再住几晚。心定了再说。」",
      already:"老周：「约过了。钥匙你不是有吗？」",
      buff:{luck:1,desc:"店缘·福缘+1"}
    },
    yubo:{
      name:"老余",
      lines:[
        "老余抽了口烟：「江上过了半辈子，独认你一句义气。若你愿，船永远给你留。」",
        "他粗糙的手握了握你的：「私定终身也好，结义也好。风浪里，我站你这边。」",
        "一枚磨亮的缆绳扣，递过来。"
      ],
      accept:"你与老余结下终身之约。渡口有灯，船不为空。",
      rejectNeed:"老余：「再拉几回纤。看看你。」",
      already:"老余：「约过了。上船。」",
      buff:{qi:1,desc:"江约·内力+1"}
    },
    tieba:{
      name:"铁疤",
      lines:[
        "铁疤摸了摸脸上的疤：「刀可以共鞘。人……也可以。你敢吗？」",
        "他声音硬：「私定终身。盐道上不兴花活，只兴一句：同生共死。」",
        "刀柄上的旧布条，解下一截给你。"
      ],
      accept:"你与铁疤结下终身之约。刀下有约，道上同行。",
      rejectNeed:"铁疤：「再走一遭黑盐道。看看你。」",
      already:"铁疤：「约过了。别废话。」",
      buff:{arm:1,desc:"刀侣·臂力+1"}
    },
    que_shadow:{
      name:"影七",
      lines:[
        "影七很久没有出声：「……影可以成双。若你愿意。」",
        "面具后只落三个字：「私定终身。」",
        "一枚无字黑羽，无声落在你袖上。"
      ],
      accept:"你与影七私定终身。影中无言，约在无声处。",
      rejectNeed:"影七：「……再轻些。」",
      already:"影七：「……约过了。」",
      buff:{agi:1,desc:"影契·身法+1"}
    },
    monk_jing:{
      name:"静尘",
      lines:[
        "静尘合十，又放下：「佛门不禁俗家之念。若你心定，我愿与你共守一心。」",
        "念珠在指间停住：「私定终身。可以是道侣，也可以是知己。」",
        "一串磨亮的念珠，分你一半。"
      ],
      accept:"你与静尘结下终身之约。钟声为证，心灯不灭。",
      rejectNeed:"静尘：「再坐一刻。心再定。」",
      already:"静尘：「约过了。」",
      buff:{qi:1,desc:"禅缘·内力+1"}
    },
    hermit:{
      name:"云叟",
      lines:[
        "云叟望着云海，忽然笑了：「缘法至了。你问天机，天机便是你。若愿，山可共坐。」",
        "他声音像风：「私定终身——或作忘年之交。云上云下，有你一声。」",
        "残碑上的一小块温玉，被他敲下给你。"
      ],
      accept:"你与云叟结下终身之约。云海为盟，天机不散。",
      rejectNeed:"云叟：「缘法未满。再来。」",
      already:"云叟：「约过了。风还在。」",
      buff:{luck:2,desc:"云缘·福缘+2"}
    }
  };

  if(typeof ROMANCE_NPCS==="undefined")window.ROMANCE_NPCS={};
  Object.keys(MORE_ROMANCE).forEach(function(id){
    if(!ROMANCE_NPCS[id])ROMANCE_NPCS[id]=MORE_ROMANCE[id];
  });

  /** 关系列表：好感档 + 是否结缘 */
  function listRelations(player){
    ensureFavor(player);
    var rows=[];
    var seen={};
    /* 有好感的 */
    Object.keys(player.favor||{}).forEach(function(id){
      var fav=player.favor[id]|0;
      if(fav<=0)return;
      var npc=typeof findPerson==="function"?findPerson(id):null;
      if(!npc)return;
      seen[id]=1;
      var rank=typeof favorRank==="function"?favorRank(fav):{name:"",color:"#b9a58a"};
      var bond=player.bonds&&player.bonds[id];
      var canRom=!!(ROMANCE_NPCS&&ROMANCE_NPCS[id]);
      rows.push({id:id,name:npc.name,title:npc.title,loc:npc.loc,fav:fav,rank:rank,bond:bond,canRom:canRom});
    });
    /* 已结缘但好感可能显示 */
    Object.keys(player.bonds||{}).forEach(function(id){
      if(seen[id])return;
      if(!player.bonds[id])return;
      var npc=typeof findPerson==="function"?findPerson(id):null;
      var fav=(player.favor&&player.favor[id])|0;
      var rank=typeof favorRank==="function"?favorRank(fav||100):{name:"倾心",color:"#e8a0a0"};
      rows.push({
        id:id,
        name:(player.bonds[id].name)||(npc&&npc.name)||id,
        title:npc?npc.title:"",
        loc:npc?npc.loc:"",
        fav:fav||100,
        rank:rank,
        bond:player.bonds[id],
        canRom:true
      });
    });
    rows.sort(function(a,b){
      if(!!a.bond!==!!b.bond)return a.bond?-1:1;
      return b.fav-a.fav;
    });
    return rows;
  }

  function locName(id){
    if(typeof getMapById!=="function")return id||"？";
    var m=getMapById(id);
    return m?m.name:(id||"？");
  }

  window.modalRelations=function(){
    var p=ensurePlayer(state.player);
    ensureFavor(p);
    var rows=listRelations(p);
    var bondCount=typeof getBondCount==="function"?getBondCount(p):Object.keys(p.bonds||{}).filter(function(k){return p.bonds[k];}).length;
    var romList=Object.keys(ROMANCE_NPCS||{});
    var romMet=romList.filter(function(id){
      return (p.favor&&(p.favor[id]|0)>0)||(p.bonds&&p.bonds[id]);
    }).length;

    var cards="";
    if(!rows.length){
      cards='<p class="small">尚无与任何人结下深交。多交谈、送礼、办事，可提升好感。</p>'+
        '<p class="small">可私定终身的对象共 '+romList.length+' 位；相遇并培养好感≥90 后可结缘。</p>';
    }else{
      cards=rows.map(function(r){
        var bondTag=r.bond
          ?'<span class="rank-tag" style="border-color:#e8a0a0;color:#e8a0a0">已结缘'+(r.bond.at?(' · 第'+r.bond.at+'日'):'')+'</span>'
          :(r.canRom
            ?(r.fav>=90
              ?'<span class="rank-tag" style="border-color:#e8a0a0;color:#e8a0a0">可私定终身</span>'
              :'<span class="tag">可结缘 · 需好感90</span>')
            :'');
        var buff=r.bond&&r.bond.buff&&r.bond.buff.desc?('<p class="small" style="color:#e8a0a0">'+r.bond.buff.desc+'</p>'):'';
        var bar=Math.min(100,r.fav);
        return '<div class="quest-card'+(r.bond?' ready':'')+'" style="margin-bottom:6px;cursor:pointer" data-npc="'+r.id+'">'+
          '<div class="quest-head"><b>'+r.name+'</b> <span class="tag">'+(r.title||'')+'</span> '+bondTag+'</div>'+
          '<p class="small">'+locName(r.loc)+' · <span style="color:'+r.rank.color+'">'+r.rank.name+' '+r.fav+'</span></p>'+
          '<div class="favor-bar" style="margin-top:4px"><div class="favor-fill" style="width:'+bar+'%;background:'+r.rank.color+'"></div></div>'+
          buff+
          '</div>';
      }).join('');
    }

    /* 可结缘名录（未相遇也显示） */
    var roster=romList.map(function(id){
      var conf=ROMANCE_NPCS[id];
      var npc=typeof findPerson==="function"?findPerson(id):null;
      var fav=(p.favor&&p.favor[id])|0;
      var bonded=p.bonds&&p.bonds[id];
      var st=bonded?'已结缘':(fav>=90?'可结缘':(fav>0?('好感'+fav):'未深交'));
      return '<span class="tag" style="margin:2px">'+(conf.name||id)+' · '+st+'</span>';
    }).join(' ');

    openModal(
      '<div class="modal-head"><h2 class="section-title">关系</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">结缘 <b class="power" style="color:#e8a0a0">'+bondCount+'</b> 人 · 已相遇可结缘对象 '+romMet+'/'+romList.length+'</p>'+
      '<p class="small">好感≥90 的可结缘对象，可在对话中选择「私定终身」。</p>'+
      '<h3 class="section-title">知交名录</h3>'+
      '<div class="quest-list">'+cards+'</div>'+
      '<h3 class="section-title" style="margin-top:10px">可结缘名册</h3>'+
      '<div class="row">'+roster+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa("[data-npc]").forEach(function(el){
      el.onclick=function(){
        if(typeof modalNpc==="function")modalNpc(el.dataset.npc);
      };
    });
  };

  window.listRelations=listRelations;

  /* 工具栏「关系」按钮 */
  function wireRelBtn(){
    var bar=document.querySelector(".toolbar");
    if(!bar)return;
    if(!qs("#relBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm";b.id="relBtn";b.textContent="关系";
      b.onclick=function(){modalRelations();};
      var after=qs("#charBtn",bar)||qs("#skillBtn",bar);
      if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);
      else bar.appendChild(b);
    }else{
      qs("#relBtn",bar).onclick=function(){modalRelations();};
    }
  }
  var _rg=renderGame;
  renderGame=function(){_rg();wireRelBtn();};

  /* 角色面板入口 */
  var _mChar=typeof modalChar==="function"?modalChar:null;
  if(_mChar){
    modalChar=function(){
      _mChar();
      var panel=qs("#modalPanel");
      if(!panel||qs("#mRel",panel))return;
      var row=panel.querySelector(".row");
      if(!row)return;
      var b=document.createElement("button");
      b.className="btn";b.id="mRel";b.textContent="关系";
      b.onclick=function(){modalRelations();};
      row.appendChild(b);
    };
  }

})();
