/* 性向精细化结缘对话 */
(function(){

  function npcGender(npc){
    var pr=typeof getNpcProfile==="function"?getNpcProfile(npc):null;
    if(pr&&pr.gender){
      var g=String(pr.gender);
      if(g.indexOf("女")>=0)return"女";
      if(g.indexOf("男")>=0)return"男";
      return"其他";
    }
    /* 兜底：名字/称谓粗判 */
    var id=npc&&npc.id||"";
    var femaleIds={"aqing":1,"yanlan_mei":1,"huichun_lan":1,"xuan_zhu":1,"su_wanqing":1,"stall":1};
    if(femaleIds[id])return"女";
    if(id==="que_shadow"||id==="que_wuying"||id==="que_san"||id==="reef_ghost"||id==="cave_guard")return"其他";
    return"男";
  }

  function playerGender(player){
    var g=player&&player.gender?String(player.gender):"其他";
    if(g==="男"||g==="女")return g;
    return"其他";
  }

  /**
   * 配对类型：
   * mf  男主-女配  fm  女主-男配
   * mm  男主-男配  ff  女主-女配
   * xo  任一方为「其他」/不明
   */
  function pairKey(player,npc){
    var pg=playerGender(player);
    var ng=npcGender(npc);
    if(pg==="其他"||ng==="其他")return"xo";
    if(pg==="男"&&ng==="女")return"mf";
    if(pg==="女"&&ng==="男")return"fm";
    if(pg==="男"&&ng==="男")return"mm";
    if(pg==="女"&&ng==="女")return"ff";
    return"xo";
  }

  function bondKindLabel(key){
    if(key==="mf"||key==="fm")return"道侣";
    if(key==="mm"||key==="ff")return"知己侣";
    return"知音";
  }

  /** 各 NPC 按性向分支的台词；缺省回退到 conf.lines */
  var ORIENT_LINES={
    aqing:{
      mf:[
        "阿青捏着药草，耳尖通红：「……你是男子，我是女子。这话若说出口，竹林都要听去。你……当真？」",
        "她把叶哨塞进你掌心，声音细：「私定终身。男婚女嫁的话，阿青也会说。你要听吗？」",
        "雨丝沾在她眉上：「江湖路远。若你愿护我，我便为你采一生的药。」"
      ],
      ff:[
        "阿青愣了愣，随即轻轻笑了：「女子与女子……竹林不忌。你若认真，阿青也认真。」",
        "她把叶哨一掰两半：「一人一半。私定终身，不必非男非女，只要心定。」",
        "她靠得近了些：「别人怎么说，不用管。你愿意，我便愿意。」"
      ],
      xo:[
        "阿青看着你，认真道：「阿青不问你是谁。只问——愿不愿与我同行。」",
        "叶哨递到你手心：「私定终身。缘分不看形，只看心。」"
      ]
    },
    jian_tong:{
      fm:[
        "竹间脸涨得通红：「师……姐姐？不，你若是女子，我、我更不敢怠慢。愿与你共练一世！」",
        "他握紧剑柄：「私定终身！我敢说！你是女侠，我便以剑护你。」",
        "剑穗轻晃：「有你在，竹林再长，我也走得出去。」"
      ],
      mm:[
        "竹间深吸一口气：「男儿之间……也可以有约。若你不嫌我剑法生疏，愿与你共鞘。」",
        "他目光发亮：「私定终身。不是结义那么简单——是我想与你一直练下去。」",
        "他把自己编的剑穗分你一根：「丑是丑，是我的心。」"
      ],
      xo:[
        "竹间认真道：「不问男女。只问你敢不敢应我一声——共练一世。」"
      ]
    },
    yaotong:{
      mf:[
        "药童把药篓放下：「谷主说救人比杀人难。若你是我的……夫君般的人，我愿为你熬药到白头。」",
        "她递过新采的药，耳根红：「私定终身。男婚女嫁，药也要慢熬。」",
        "笑意里带着羞涩：「以后受伤，第一时间来找我。」"
      ],
      ff:[
        "药童眨眨眼：「女子与女子的约，谷里也有人说过。你若愿意，我的药只给你留最好的。」",
        "她把药包一分为二：「私定终身。情如药，同性亦可同心。」",
        "「以后采药，我们一起。谁受伤，谁先给谁敷。」"
      ],
      xo:[
        "药童点头：「阿青不问出身。药童也不问。只问你要不要这包药——和我的余生。」"
      ]
    },
    yanlan_mei:{
      mf:[
        "梅疏影声音仍淡：「男子与我约终身……山门不禁。剑可共练，路也可共走。你守不守？」",
        "她把素白剑穗塞进你掌心：「我的穗，分你一半。你若负我，雾也不饶你。」",
        "「私定终身。说出来，便要守。」"
      ],
      ff:[
        "梅疏影抬眼，雾气在睫上：「女子之间的剑，也可以交心。你若认真，我便应你。」",
        "剑穗一分为二：「私定终身。不看世俗眼，只看剑是否同向。」",
        "她极轻地笑了一下：「山花为媒，也可以是两朵。」"
      ],
      xo:[
        "梅疏影：「不问你是谁。只问剑意与心，是否同路。」"
      ]
    },
    huichun_lan:{
      mf:[
        "兰草把辫上小花摘下递你：「你若是公子，那……花给你，人也可以给你？」",
        "耳尖红透：「私定终身可以吗？药篓我背，路你走。」",
        "「谷主说救人重要。那你，也让我救着点。」"
      ],
      ff:[
        "兰草眼睛亮亮的：「姐姐……不对，你若也是女儿身，我们约终身，谷里花都要开了。」",
        "「私定终身！药篓两人抬，花两朵戴。」",
        "她把小花别到你鬓边：「好不好？」"
      ],
      xo:[
        "兰草：「花不问人。人若真心，兰草便真心。」"
      ]
    },
    xuan_zhu:{
      mf:[
        "珠儿拨完算盘：「账要清楚。男婚女嫁的账，我也算得。你可愿入我名下？」",
        "潮珠套上你腕：「私定终身。契约写明：我不毁约，你亦然。」",
        "「信物。丢了要赔——赔的是心。」"
      ],
      ff:[
        "珠儿敲了敲算盘：「女子与女子的契约，帮规不禁。写清楚，我便守。」",
        "潮珠分成两串：「私定终身。账本上并排两个名字。」",
        "「海不认男女，只认契约。」"
      ],
      xo:[
        "珠儿：「名字是谁不重要。愿不愿意入账，才重要。」"
      ]
    },
    luyun:{
      fm:[
        "陆云握剑的手紧了紧：「女侠与我同道已久。若你愿意，剑可共鞘，心可共守。」",
        "雾中他声音仍稳：「私定终身。外门弟子，也敢护你一生。」",
        "沾露的剑穗解下一缕：「你收着。」"
      ],
      mm:[
        "陆云望着雾：「男儿之约，可以是结义，也可以是……更深的共鞘。你若愿，我便应。」",
        "「私定终身。不问旁人眼色，只问剑意是否同向。」",
        "他把剑穗分你一缕：「云雾为证。」"
      ],
      xo:[
        "陆云：「剑不问身份。心若同，鞘可共。」"
      ]
    },
    helie_npc:{
      fm:[
        "贺炉擦汗，缺牙的笑有点傻：「女侠……刀要养，人也要养。你让我养着点，成不成？」",
        "炉火映脸：「私定终身！我敢说！你敢应吗？」",
        "刚冷的刀坯塞给你：「丑是丑，是我打的。」"
      ],
      mm:[
        "贺炉拍了拍胸：「男儿之间也能有约。炉火不灭，约也不灭。你敢不敢？」",
        "「私定终身！不是结义那么淡——是我想跟你一直打刀。」",
        "刀坯一掰两半：「一人一半！」"
      ],
      xo:[
        "贺炉：「炉不认人。人真心，炉就亮。」"
      ]
    },
    ao_sailor:{
      fm:[
        "潮生拍贝壳串：「女侠若点头，契约写进海里，我守一辈子。」",
        "浪声里：「私定终身。毁约者——我自己也不会是。」",
        "潮珠按进你掌心：「信物。」"
      ],
      mm:[
        "潮生认真道：「男儿的契约，一样沉得进海。你若点头，我便守。」",
        "「私定终身。帮规不禁同心之人。」",
        "潮珠一分为二：「一人一枚。」"
      ],
      xo:[
        "潮生：「海不问你是谁。契约问。」"
      ]
    },
    baique_si:{
      fm:[
        "雀四面具后声音发紧：「……女侠的脚步，已经很轻了。若你愿意，影也可以成双。」",
        "沉默很久：「私定终身。楼规不禁。我……想说。」",
        "无字黑羽落在你手心。"
      ],
      mm:[
        "雀四：「男儿之影，亦可成双。若你不弃，我愿与你同隐同现。」",
        "「私定终身。无声处，有约。」",
        "黑羽一分为二。"
      ],
      xo:[
        "雀四：「影不问形。心若同，羽可共。」"
      ]
    },
    wuxiang_chen:{
      fm:[
        "净尘耳根通红：「女施主……寺规未禁俗家之约。我查过了。若你愿意……」",
        "「私定终身。抄经可以抄歪，心不能歪。」",
        "抄歪的经页塞给你：「丑，但是我写的。」"
      ],
      mm:[
        "净尘捏着念珠：「同修之间……也可以有俗家之念。你若愿，我愿把心抄清楚。」",
        "「私定终身。佛门说众生平等，情亦然。」",
        "经页与念珠各分一半。"
      ],
      xo:[
        "净尘：「经上不问男女。心定，即是约。」"
      ]
    },
    su_wanqing:{
      mf:[
        "苏晚青把脉的手指顿住：「男子的脉……有些乱。是我的心，还是你的？」",
        "轻声：「私定终身。医人易，医心难。我愿试。」",
        "写着你名字的药包，推到你面前。"
      ],
      ff:[
        "苏晚青微笑：「女子与女子的脉，也可以同频。你若愿意，我愿把心也诊清楚。」",
        "「私定终身。情如药，同性亦可同剂。」",
        "药包上两个名字并排。"
      ],
      xo:[
        "苏晚青：「脉不问身份。心若同跳，便是缘。」"
      ]
    },
    shen_shuheng:{
      fm:[
        "沈疏衡望着雾：「女侠同门已久。若你不嫌，剑可同锋，路可同尽。」",
        "「私定终身。内门弟子，也有私心——向你。」",
        "云纹小佩放在你掌心。"
      ],
      mm:[
        "沈疏衡：「男儿之约，可以比结义更深。剑同锋，心同向。你愿否？」",
        "「私定终身。不问世俗，只问雾散之后是否仍在。」",
        "云纹佩一分为二。"
      ],
      xo:[
        "沈疏衡：「雾不问人。心若同，佩可共。」"
      ]
    },
    /* 结义/知音型：弱化男女，强调义与知 */
    zhou:{
      mf:[
        "老周叹了口气：「姑娘……不，少侠。老了还被你砸中。行，店里有你一席，一辈子。」",
        "「私定终身？算结义也成。钥匙给你。」"
      ],
      fm:[
        "老周拍桌：「女侠抬举我。老周认你——结义、知己，都行。后厨暗间钥匙你收着。」"
      ],
      mm:[
        "老周：「男儿之间这句话最重。我老周认你，算结义。」",
        "钥匙塞进你手里：「一辈子。」"
      ],
      ff:[
        "老周搓手：「两位女侠的事，我不多嘴。店里有你一席，这话算数。」"
      ],
      xo:[
        "老周：「不问是谁。自己人，就是自己人。」"
      ]
    },
    yubo:{
      mm:[
        "老余抽了口烟：「男儿义气，江上最认。船永远给你留。」",
        "缆绳扣递过来：「私定终身也好，结义也好。风浪里我站你这边。」"
      ],
      fm:[
        "老余：「女侠义气不让须眉。船位给你留。风浪里，我站你这边。」"
      ],
      xo:[
        "老余：「江不问人。义气到了，船就在。」"
      ]
    },
    tieba:{
      mm:[
        "铁疤摸疤：「男儿之间，刀可共鞘，人也可同生共死。你敢吗？」",
        "刀柄旧布条解下一截：「盐道上不兴花活，只兴这句话。」"
      ],
      fm:[
        "铁疤：「女侠的刀，比许多男儿直。共鞘，你敢吗？」",
        "旧布条给你：「同生共死。」"
      ],
      xo:[
        "铁疤：「刀不问人。敢，就握。」"
      ]
    },
    que_shadow:{
      mf:[
        "影七很久无声：「……影可以成双。不问你是男是女。若你愿意。」",
        "面具后三字：「私定终身。」黑羽无声落袖。"
      ],
      fm:[
        "影七：「……女侠的影，已够轻。若愿成双，羽在此。」"
      ],
      mm:[
        "影七：「男儿之影，亦可无声成双。」",
        "黑羽落在你袖上。"
      ],
      ff:[
        "影七：「……女子之影，一样可以并立。若你愿意。」"
      ],
      xo:[
        "影七：「影不问形。」"
      ]
    },
    monk_jing:{
      mf:[
        "静尘合十又放下：「佛门不禁俗家之念。女施主若心定，愿与你共守一心。」",
        "念珠分你一半：「道侣也好，知己也好。」"
      ],
      fm:[
        "静尘：「女施主心定，贫僧愿以俗家之约相应。」"
      ],
      mm:[
        "静尘：「同修之约，可以深过结义。心灯不灭即可。」",
        "念珠一分为二。"
      ],
      xo:[
        "静尘：「众生平等。约亦平等。」"
      ]
    },
    hermit:{
      xo:[
        "云叟望着云海：「缘法不问男女、不问形骸。你问天机，天机便是你。山可共坐。」",
        "「私定终身——或作忘年知音。云上云下，有你一声。」",
        "残碑温玉敲下一小块给你。"
      ],
      mf:[
        "云叟笑了：「男儿女娘，在云上都是过客。缘至了，便坐。」"
      ],
      mm:[
        "云叟：「男儿之交，可淡可浓。云海为盟。」"
      ],
      ff:[
        "云叟：「女侠与女侠的缘，山也认得。」"
      ]
    }
  };

  var ACCEPT_BY_KEY={
    mf:"你们结为道侣，私定终身。",
    fm:"你们结为道侣，私定终身。",
    mm:"你们以知己之约私定终身，同心同行。",
    ff:"你们以知己之约私定终身，同心同行。",
    xo:"你们结为知音，私定终身，不问形骸。"
  };

  function pickOrientLines(npcId,key,fallback){
    var pack=ORIENT_LINES[npcId];
    if(pack){
      if(pack[key]&&pack[key].length)return pack[key];
      if(pack.xo&&pack.xo.length)return pack.xo;
      /* 同性可回退到另一同性，异性可互退 */
      if(key==="mm"&&pack.fm)return pack.fm;
      if(key==="ff"&&pack.mf)return pack.mf;
      if(key==="mf"&&pack.fm)return pack.fm;
      if(key==="fm"&&pack.mf)return pack.mf;
    }
    return fallback||["……愿与你私定终身。"];
  }

  function pickLine(arr){
    if(!arr||!arr.length)return"……";
    return arr[Math.floor(Math.random()*arr.length)];
  }

  /** 覆盖私定终身：按性向选文案，补全 buff 属性 */
  window.pledgeLifelong=function(player,npc){
    ensureFavor(player);
    var conf=(typeof ROMANCE_NPCS!=="undefined"?ROMANCE_NPCS[npc.id]:null);
    if(!conf)return{ok:false,msg:npc.name+"与你无此缘分。"};
    if(hasBond(player,npc.id))return{ok:false,msg:conf.already};
    var fav=getFavor(player,npc.id);
    if(fav<90)return{ok:false,msg:conf.rejectNeed+"（需好感≥90，当前"+fav+"）"};

    var key=pairKey(player,npc);
    var kind=bondKindLabel(key);
    var lines=pickOrientLines(npc.id,key,conf.lines);
    var line=pickLine(lines);
    var acceptExtra=ACCEPT_BY_KEY[key]||conf.accept;
    var accept=(conf.accept||"")+(conf.accept&&acceptExtra&&conf.accept.indexOf("私定")>=0?"":" "+acceptExtra);
    /* 更干净的接受句：优先用身份句 + 性向句 */
    accept=conf.accept+"（"+kind+"·"+({mf:"男女",fm:"女男",mm:"双男",ff:"双女",xo:"不拘"}[key]||"")+"）";

    player.bonds[npc.id]={
      name:conf.name||npc.name,
      at:player.day||1,
      buff:conf.buff||null,
      pair:key,
      kind:kind
    };
    addFavor(player,npc.id,100-fav);

    if(conf.buff){
      var b=conf.buff;
      ["arm","agi","bone","qi","wit","luck"].forEach(function(k){
        if(b[k])player.stats[k]=(player.stats[k]||0)+b[k];
      });
    }

    var msg=line+" 「"+accept+"」"+(conf.buff&&conf.buff.desc?("（"+conf.buff.desc+"）"):"");
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg,pair:key,kind:kind};
  };

  window.pairKey=pairKey;
  window.npcGender=npcGender;
  window.bondKindLabel=bondKindLabel;

  /* 关系界面补充性向标签 */
  var _modalRel=typeof modalRelations==="function"?modalRelations:null;
  if(_modalRel){
    window.modalRelations=function(){
      _modalRel();
      var p=ensurePlayer(state.player);
      var panel=qs("#modalPanel");
      if(!panel)return;
      qsa("[data-npc]",panel).forEach(function(el){
        var id=el.dataset.npc;
        var bond=p.bonds&&p.bonds[id];
        if(!bond||!bond.kind)return;
        var head=el.querySelector(".quest-head");
        if(!head||head.innerHTML.indexOf(bond.kind)>=0)return;
        var tag=document.createElement("span");
        tag.className="rank-tag";
        tag.style.borderColor="#e8a0a0";
        tag.style.color="#e8a0a0";
        tag.textContent=bond.kind;
        head.appendChild(document.createTextNode(" "));
        head.appendChild(tag);
      });
      var tip=document.createElement("p");
      tip.className="small";
      tip.style.marginTop="6px";
      tip.textContent="结缘文案随你与对方的性别组合变化：道侣（异性）、知己侣（同性）、知音（不拘）。";
      panel.appendChild(tip);
    };
  }

})();
