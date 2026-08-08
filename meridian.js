/* 门派NPC扩充 · 经脉系统 */
(function(){

  /* ========== 门派 NPC 扩充 ========== */
  var SECT_NPCS=[
    /* 烟岚剑斋 */
    {id:"shen_tingyun",name:"沈听云",title:"烟岚斋主",loc:"mist_gate",sect:"yanlan",rank:2,
      desc:"白衣执剑，少言。云雾中只见剑光，不见人影。收徒极严。",
      talks:[
        "剑是杀器，也是心器。你持剑时，心里装的是什么？",
        "云雾不散，是因为山还在呼吸。",
        "外门的剑，求快；内门的剑，求稳；亲传的剑，求无剑。",
        "你若只想以武压人，不必入我烟岚。",
        "今日雾浓，适合一个人走山道。"
      ],
      acts:[
        {id:"ask_sword",name:"请教剑意",type:"exp",cost:0,value:30,favorNeed:40},
        {id:"sect_spar",name:"与斋主过招",type:"duel",diff:75,dmg:35,reward:0,favorNeed:60},
        {id:"meridian_guide",name:"请教经脉",type:"talk",favorNeed:30}
      ]},
    {id:"shen_shuheng",name:"沈疏衡",title:"内门师兄",loc:"mist_gate",sect:"yanlan",rank:1,
      desc:"云雾剑意已成，代师授业。性子比斋主温和些。",
      talks:[
        "师尊三年才收两个亲传，你我都还在路上。",
        "山贼清了又来，像人心，扫不净。",
        "内门剑谱残页丢过一次，害得我在旧瓦市蹲了半月。",
        "你贡献够了，可以来找我领内门课业。"
      ],
      acts:[
        {id:"inner_tip",name:"内门指点",type:"exp",cost:15,value:25,favorNeed:20},
        {id:"spar_inner",name:"同门切磋",type:"duel",diff:50,dmg:22,reward:12}
      ]},
    {id:"yanlan_mei",name:"梅疏影",title:"外门女弟子",loc:"mist_gate",sect:"yanlan",rank:0,
      desc:"剑穗是素白的，话也少，常在竹径外独自练剑。",
      talks:[
        "陆云师兄让我盯着山道，我就盯着。",
        "你的剑……还差点意思。",
        "雾大的时候，听得见自己的呼吸，也听得见别人的。",
        "别总盯着我看，看剑。"
      ],
      acts:[
        {id:"chat_mei",name:"闲聊",type:"talk"},
        {id:"spar_mei",name:"比剑",type:"duel",diff:38,dmg:16,reward:10},
        {id:"gift_flower",name:"送一枝山花",type:"favor_gift",cost:5,favor:6}
      ]},

    /* 赤炉刀社 */
    {id:"he_lie",name:"贺烈",title:"赤炉社主",loc:"hearth",sect:"chilu",rank:2,
      desc:"赤膊锻刀，声如洪钟。刀上缺口，是走过的镖路。",
      talks:[
        "刀要养，人也要养。只会砍的，活不过三旬。",
        "一刀断石不难，难的是断了还知道为什么断。",
        "假刀坑商，比山贼更可恨。山贼至少明着抢。",
        "你臂力不错，别浪费在嘴皮子上。"
      ],
      acts:[
        {id:"forge_watch",name:"观摩锻刀",type:"exp",cost:0,value:28,favorNeed:35},
        {id:"sect_spar_cl",name:"向社主请教",type:"duel",diff:78,dmg:38,reward:0,favorNeed:55},
        {id:"meridian_cl",name:"问经脉力法",type:"talk",favorNeed:25}
      ]},
    {id:"jin_duanshi",name:"金断石",title:"护社刀头",loc:"hearth",sect:"chilu",rank:1,
      desc:"走镖无数，刀上有缺口。话少，眼神利。",
      talks:[
        "镖路上死人，比炉里的铁还多。",
        "护货的时候，别想英雄，想活着把货送到。",
        "贺炉那小子烫了又烫，还不肯戴手套。"
      ],
      acts:[
        {id:"escort_tip",name:"请教走镖",type:"exp",cost:12,value:22},
        {id:"spar_jin",name:"试刀",type:"duel",diff:55,dmg:25,reward:15}
      ]},
    {id:"chilu_huo",name:"火娃",title:"外门学徒",loc:"hearth",sect:"chilu",rank:0,
      desc:"脸上有煤灰，笑起来露出缺了一角的牙。",
      talks:[
        "搬矿！搬矿！力气是搬出来的！",
        "社主说我有一天能断石，我信。",
        "你要是来帮忙，我分你半个炊饼。"
      ],
      acts:[
        {id:"help_fire",name:"帮他搬矿",type:"silver",value:10},
        {id:"spar_huo",name:"比划两下",type:"duel",diff:30,dmg:12,reward:8}
      ]},

    /* 回春谷 */
    {id:"su_qingluo",name:"苏青萝",title:"回春谷主",loc:"herb_valley",sect:"huichun",rank:2,
      desc:"青裙执扇，笑意温软。同一掌，可续命，可夺命。",
      talks:[
        "救人比杀人难，也比杀人重要。",
        "毒与药，差一线。人心也是。",
        "你根骨尚可，别拿身体去换一时胜负。",
        "谷中禁地，亲传方得入。你还早。"
      ],
      acts:[
        {id:"pulse",name:"请谷主诊脉",type:"heal",cost:0,value:50,favorNeed:40},
        {id:"ask_med",name:"请教医理",type:"exp",cost:0,value:26,favorNeed:35},
        {id:"meridian_hc",name:"问经脉调息",type:"talk",favorNeed:30}
      ]},
    {id:"su_wanqing",name:"苏晚青",title:"内门医士",loc:"herb_valley",sect:"huichun",rank:1,
      desc:"掌下可生可杀，性子温和，常为村民义诊。",
      talks:[
        "夜里咳血的征兆，我见过一次，不想再看。",
        "药童认药快，就是贪玩。",
        "制毒者混进市集时，我几乎认错人。"
      ],
      acts:[
        {id:"clinic",name:"协助义诊",type:"silver",value:8},
        {id:"learn_pulse",name:"学诊脉",type:"train_stat",stat:"wit",cost:35,value:1,once:true,favorNeed:25}
      ]},
    {id:"huichun_lan",name:"兰草",title:"外门药徒",loc:"herb_valley",sect:"huichun",rank:0,
      desc:"辫子上别着一朵小花，药篓比人高。",
      talks:[
        "这味草能止血，那味会让人睡三天。别混。",
        "谷主笑起来好看，生气的时候更好看——你别告诉她我说的。",
        "你采药的时候，看叶脉，别看花。花会骗人。"
      ],
      acts:[
        {id:"buy_herb_lan",name:"买她采的药",type:"item",cost:10,effect:"heal",value:25},
        {id:"chat_lan",name:"聊药草",type:"talk"}
      ]},

    /* 玄鲸帮 */
    {id:"ao_cang",name:"敖沧",title:"玄鲸帮主",loc:"whale_port",sect:"xuanjing",rank:2,
      desc:"半截鲸骨杖，话少利重。毁约者，碎于礁石。",
      talks:[
        "契约写在纸上，也写在海里。海里记得更久。",
        "深海有鼓声。那是潮，也是警告。",
        "银子可以少，约不能毁。",
        "你水性如何？不如何就别逞能。"
      ],
      acts:[
        {id:"contract_talk",name:"听讲契约",type:"exp",cost:0,value:28,favorNeed:40},
        {id:"sect_spar_xj",name:"请教杖法",type:"duel",diff:80,dmg:36,reward:0,favorNeed:55},
        {id:"meridian_xj",name:"问潮息吐纳",type:"talk",favorNeed:30}
      ]},
    {id:"hai_lie",name:"海裂",title:"船头",loc:"whale_port",sect:"xuanjing",rank:1,
      desc:"护船多年，少言利重。脸上有盐风刻的纹。",
      talks:[
        "货单有假，比风浪更麻烦。",
        "潮生那小子还嫩，你别学他逞能。",
        "近海水贼清过一轮，还会再来。"
      ],
      acts:[
        {id:"ship_guard",name:"随船护航",type:"duel",diff:48,dmg:20,reward:20},
        {id:"nav_tip",name:"请教水路",type:"exp",cost:10,value:20}
      ]},
    {id:"xuan_zhu",name:"珠儿",title:"账房",loc:"whale_port",sect:"xuanjing",rank:0,
      desc:"算盘打得飞快，腰间挂着一串潮珠。",
      talks:[
        "银子要一笔笔记清楚，跟人一样。",
        "帮里规矩多，你先记三条：不毁约、不私吞、不临阵脱逃。",
        "潮珠能养气，真的，我没骗你。"
      ],
      acts:[
        {id:"buy_pearl_zhu",name:"买潮珠",type:"item",cost:32,effect:"mp",value:35},
        {id:"account",name:"帮她对账",type:"silver",value:12}
      ]},

    /* 白雀楼 */
    {id:"que_wuying",name:"雀无影",title:"白雀楼主",loc:"sparrow_den",sect:"baique",rank:2,
      desc:"从不见真容，只闻雀啼。情报是让刀不知道该砍向谁。",
      talks:[
        "……",
        "你听见雀啼了吗？没有？那是你还不够静。",
        "情报的价值，在于别人不知道你知道。",
        "影中人，不需要名字。"
      ],
      acts:[
        {id:"shadow_ask",name:"请教影意",type:"exp",cost:0,value:32,favorNeed:50},
        {id:"sect_spar_bq",name:"影中一试",type:"duel",diff:82,dmg:30,reward:0,favorNeed:65},
        {id:"meridian_bq",name:"问隐脉之法",type:"talk",favorNeed:40}
      ]},
    {id:"que_san",name:"雀三",title:"执事",loc:"sparrow_den",sect:"baique",rank:1,
      desc:"面覆青纱，管线报与考核。声音分不出男女。",
      talks:[
        "名单上有你熟悉的人时，你会怎么做？",
        "假情报是一把刀，要会用。",
        "影七话少，是因为他说多了会露行踪。"
      ],
      acts:[
        {id:"intel_job",name:"接情报差事",type:"silver",value:18,favorNeed:15},
        {id:"spar_que3",name:"考核过招",type:"duel",diff:52,dmg:20,reward:14}
      ]},
    {id:"baique_si",name:"雀四",title:"影卫",loc:"sparrow_den",sect:"baique",rank:0,
      desc:"比影七更年轻，脚步仍会偶尔出声。",
      talks:[
        "楼里不欢迎废话。但……你要是问路径，我可以指一下。",
        "我还在学无声。你别笑。",
        "传信要活着回来，比快更重要。"
      ],
      acts:[
        {id:"msg_si",name:"代传一信",type:"silver",value:14},
        {id:"train_si",name:"一起练影步",type:"exp",cost:8,value:18}
      ]},

    /* 无相寺 */
    {id:"kong_guan",name:"空观",title:"无相寺方丈",loc:"void_temple",sect:"wuxiang",rank:2,
      desc:"盲眼老僧，一指可断金。无相不在指，在放下。",
      talks:[
        "何为无相？答或不答，皆已入门。",
        "心魔住在你心里，我帮不了你打。",
        "抄经磨的是心，不是墨。",
        "你执着于强弱，便已被相所困。"
      ],
      acts:[
        {id:"zen_ask",name:"请教禅意",type:"exp",cost:0,value:30,favorNeed:40},
        {id:"finger_test",name:"领教一指",type:"duel",diff:85,dmg:40,reward:0,favorNeed:60},
        {id:"meridian_wx",name:"问观心经脉",type:"talk",favorNeed:35}
      ]},
    {id:"liao_yin",name:"了因",title:"戒律院",loc:"void_temple",sect:"wuxiang",rank:1,
      desc:"掌戒律，指力已通。面容冷肃，不苟言笑。",
      talks:[
        "破戒者逐出并封功。没有例外。",
        "同门破杀戒时，按寺规处置。你若心软，便也近破戒。",
        "面壁观心，不是罚，是照镜子。"
      ],
      acts:[
        {id:"discipline",name:"协助巡寺",type:"silver",value:6},
        {id:"wall",name:"面壁一日",type:"exp",cost:0,value:24,favorNeed:20}
      ]},
    {id:"wuxiang_chen",name:"净尘",title:"知客僧",loc:"void_temple",sect:"wuxiang",rank:0,
      desc:"比静尘更年轻的师弟，念珠还新。",
      talks:[
        "施主若来挂单，先去斋堂用斋。",
        "我抄经常抄错字，了因师兄罚我面壁。",
        "方丈虽盲，什么都看得见。"
      ],
      acts:[
        {id:"copy_chen",name:"一同抄经",type:"exp",cost:0,value:16},
        {id:"zhai",name:"用斋",type:"heal",cost:0,value:20}
      ]}
  ];

  /* 合并进全局 npcs */
  if(typeof npcs!=="undefined"&&Array.isArray(npcs)){
    SECT_NPCS.forEach(function(n){
      if(!npcs.some(function(x){return x.id===n.id;}))npcs.push(n);
    });
  }

  /* 扩展 interactPerson：favor_gift */
  var _interact=typeof interactPerson==="function"?interactPerson:null;
  if(_interact){
    window.interactPerson=function(player,npc,actId){
      var act=(npc.acts||[]).find(function(a){return a.id===actId;});
      if(act&&act.type==="favor_gift"){
        ensureFavor(player);
        var cost=act.cost||5;
        if(player.silver<cost)return{ok:false,msg:"银两不足"};
        player.silver-=cost;
        var d=addFavor(player,npc.id,act.favor||5);
        var msg="你赠予"+npc.name+"薄礼（银两-"+cost+"，好感+"+d+"）";
        player.logs.unshift(msg);player.logs=player.logs.slice(0,50);
        return{ok:true,msg:msg};
      }
      return _interact(player,npc,actId);
    };
  }

  /* ========== 经脉系统 ========== */
  /* 奇经八脉：每脉最多 5 重，每重永久+对应属性 */
  var MERIDIANS=[
    {id:"ren",name:"任脉",desc:"阴脉之海，主藏精血。",stat:"bone",stat2:"qi",icon:"任",
      costBase:40,contribBase:0,reqDay:0},
    {id:"du",name:"督脉",desc:"阳脉之海，主一身之阳。",stat:"qi",stat2:"wit",icon:"督",
      costBase:40,contribBase:0,reqDay:0},
    {id:"chong",name:"冲脉",desc:"十二经之海，主气血冲要。",stat:"arm",stat2:null,icon:"冲",
      costBase:50,contribBase:5,reqDay:3},
    {id:"dai",name:"带脉",desc:"约束诸经，如带束腰。",stat:"bone",stat2:null,icon:"带",
      costBase:50,contribBase:5,reqDay:3},
    {id:"yinwei",name:"阴维脉",desc:"维系诸阴，主里。",stat:"wit",stat2:null,icon:"阴维",
      costBase:60,contribBase:8,reqDay:5},
    {id:"yangwei",name:"阳维脉",desc:"维系诸阳，主表。",stat:"agi",stat2:null,icon:"阳维",
      costBase:60,contribBase:8,reqDay:5},
    {id:"yinqiao",name:"阴跷脉",desc:"主一身左右之阴。",stat:"luck",stat2:null,icon:"阴跷",
      costBase:70,contribBase:10,reqDay:8},
    {id:"yangqiao",name:"阳跷脉",desc:"主一身左右之阳。",stat:"agi",stat2:"arm",icon:"阳跷",
      costBase:70,contribBase:10,reqDay:8}
  ];
  var MERIDIAN_MAX=5;

  function ensureMeridian(p){
    if(!p.meridians)p.meridians={};
    MERIDIANS.forEach(function(m){
      if(p.meridians[m.id]==null)p.meridians[m.id]=0;
    });
    return p.meridians;
  }

  function meridianLevel(p,id){
    ensureMeridian(p);
    return p.meridians[id]|0;
  }

  function meridianCost(m,lv){
    /* 第 lv→lv+1 重费用 */
    var mul=1+lv*0.85;
    return{
      silver:Math.floor(m.costBase*mul),
      contrib:Math.floor((m.contribBase||0)*mul),
      day:1
    };
  }

  function meridianTotalBonus(p){
    ensureMeridian(p);
    var b={arm:0,agi:0,bone:0,qi:0,wit:0,luck:0};
    MERIDIANS.forEach(function(m){
      var lv=p.meridians[m.id]|0;
      if(lv<=0)return;
      b[m.stat]=(b[m.stat]||0)+lv;
      if(m.stat2)b[m.stat2]=(b[m.stat2]||0)+Math.floor(lv/2);
    });
    return b;
  }

  /** 打通/提升一重经脉 */
  window.openMeridian=function(player,meridianId){
    ensureMeridian(player);
    var m=MERIDIANS.find(function(x){return x.id===meridianId;});
    if(!m)return{ok:false,msg:"经脉不存在"};
    var lv=player.meridians[m.id]|0;
    if(lv>=MERIDIAN_MAX)return{ok:false,msg:m.name+"已至圆满（"+MERIDIAN_MAX+"重）"};
    if((player.day||1)<(m.reqDay||0))
      return{ok:false,msg:"时日尚浅，强行冲击"+m.name+"易走火入魔（需历练至第"+m.reqDay+"日）"};
    var cost=meridianCost(m,lv);
    if(player.silver<cost.silver)return{ok:false,msg:"银两不足（需"+cost.silver+"）"};
    if((player.contrib||0)<cost.contrib)return{ok:false,msg:"门派贡献不足（需"+cost.contrib+"）"};
    /* 内力消耗：冲击经脉 */
    var mpCost=10+lv*8;
    if(player.mp<mpCost)return{ok:false,msg:"内力不足（需"+mpCost+"）"};

    player.silver-=cost.silver;
    if(cost.contrib)player.contrib-=cost.contrib;
    player.mp-=mpCost;
    player.day=(player.day||1)+cost.day;
    player.meridians[m.id]=lv+1;

    /* 永久属性 */
    player.stats[m.stat]=(player.stats[m.stat]||0)+1;
    var extra="";
    if(m.stat2&&(lv+1)%2===0){
      player.stats[m.stat2]=(player.stats[m.stat2]||0)+1;
      extra="、"+(STAT_LABELS[m.stat2]||m.stat2)+"+1";
    }
    /* 根骨/内力影响气血上限 */
    if(m.stat==="bone"||m.stat2==="bone"){
      player.maxHp+=15;
      player.hp=Math.min(player.maxHp,player.hp+15);
    }
    if(m.stat==="qi"||m.stat2==="qi"){
      player.maxMp+=12;
      player.mp=Math.min(player.maxMp,player.mp+8);
    }

    var lab=STAT_LABELS[m.stat]||m.stat;
    var msg="冲击【"+m.name+"】至第"+(lv+1)+"重成功！"+lab+"+1"+extra+
      "（银两-"+cost.silver+(cost.contrib?(" 贡献-"+cost.contrib):"")+" 内力-"+mpCost+"）";
    player.logs.unshift(msg);
    player.logs=player.logs.slice(0,50);
    return{ok:true,msg:msg,level:lv+1};
  };

  function meridianCardHtml(p,m){
    var lv=meridianLevel(p,m.id);
    var full=lv>=MERIDIAN_MAX;
    var cost=full?null:meridianCost(m,lv);
    var lab=STAT_LABELS[m.stat]||m.stat;
    var lab2=m.stat2?(STAT_LABELS[m.stat2]||m.stat2):null;
    var bar=Math.floor(lv/MERIDIAN_MAX*100);
    var tags='<span class="tag">'+lab+(lab2?("/"+lab2):"")+'</span>';
    if(full)tags+=' <span class="tag" style="border-color:var(--gold);color:var(--gold)">圆满</span>';
    var costLine=full?'已圆满':(
      '下一重：'+cost.silver+'两'+
      (cost.contrib?(' · 贡'+cost.contrib):'')+
      ' · 内力'+(10+lv*8)+
      ((m.reqDay&&(p.day||1)<m.reqDay)?(' · 需第'+m.reqDay+'日'):'')
    );
    return '<div class="quest-card'+(full?'':' ready')+'" style="margin-bottom:6px">'+
      '<div class="quest-head"><b>'+m.name+'</b> '+tags+
      ' <span class="small">'+lv+'/'+MERIDIAN_MAX+'重</span></div>'+
      '<p class="small">'+m.desc+'</p>'+
      '<div class="quest-bar"><div class="quest-fill" style="width:'+bar+'%"></div></div>'+
      '<p class="small" style="margin-top:4px">'+costLine+'</p>'+
      (full?'':'<button class="btn primary sm open-meridian" data-id="'+m.id+'">冲击</button>')+
      '</div>';
  }

  window.modalMeridian=function(){
    var p=ensurePlayer(state.player);
    ensureMeridian(p);
    var bonus=meridianTotalBonus(p);
    var bonusLine=Object.keys(STAT_LABELS).map(function(k){
      return bonus[k]?((STAT_LABELS[k])+"+"+bonus[k]):null;
    }).filter(Boolean).join(" · ")||"尚未打通";
    var cards=MERIDIANS.map(function(m){return meridianCardHtml(p,m);}).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">经脉 · 奇经八脉</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">打通经脉可永久提升六维。冲击需银两、内力，部分需门派贡献与历练时日。</p>'+
      '<p class="small">经脉加成累计：<b class="power">'+bonusLine+'</b></p>'+
      '<p class="small">银两 <b>'+p.silver+'</b> · 贡献 <b>'+(p.contrib||0)+'</b> · 内力 <b>'+p.mp+'/'+p.maxMp+'</b></p>'+
      '<div class="quest-list" style="margin-top:8px">'+cards+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa(".open-meridian").forEach(function(el){
      el.onclick=function(){
        var r=openMeridian(p,el.dataset.id);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);
        modalMeridian();
      };
    });
  };

  /* 角色面板加入经脉入口 + 经脉加成提示 */
  var _mChar=typeof modalChar==="function"?modalChar:null;
  if(_mChar){
    modalChar=function(){
      _mChar();
      var p=ensurePlayer(state.player);
      ensureMeridian(p);
      var panel=qs("#modalPanel");
      if(!panel)return;
      var total=0;
      MERIDIANS.forEach(function(m){total+=p.meridians[m.id]|0;});
      var row=panel.querySelector(".row");
      if(row&&!qs("#mMeridian",panel)){
        var b=document.createElement("button");
        b.className="btn primary";b.id="mMeridian";
        b.textContent="经脉"+(total?(" "+total):"");
        b.onclick=function(){modalMeridian();};
        row.insertBefore(b,row.firstChild);
      }
      if(!qs("#meridianHint",panel)){
        var bonus=meridianTotalBonus(p);
        var has=Object.keys(bonus).some(function(k){return bonus[k]>0;});
        if(has){
          var hint=document.createElement("p");
          hint.id="meridianHint";hint.className="small";
          hint.style.marginTop="4px";
          hint.innerHTML="经脉："+Object.keys(STAT_LABELS).map(function(k){
            return bonus[k]?(STAT_LABELS[k]+"+"+bonus[k]):null;
          }).filter(Boolean).join(" · ");
          var radar=panel.querySelector(".radar-wrap");
          if(radar&&radar.nextSibling)panel.insertBefore(hint,radar.nextSibling);
          else panel.appendChild(hint);
        }
      }
    };
  }

  /* 工具栏经脉按钮 */
  function wireMeridianBtn(){
    var bar=document.querySelector(".toolbar");
    if(!bar)return;
    if(!qs("#meridianBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm";b.id="meridianBtn";b.textContent="经脉";
      b.onclick=function(){modalMeridian();};
      var after=qs("#skillBtn",bar)||qs("#charBtn",bar);
      if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);
      else bar.appendChild(b);
    }else{
      qs("#meridianBtn",bar).onclick=function(){modalMeridian();};
    }
  }
  var _rg=renderGame;
  renderGame=function(){_rg();wireMeridianBtn();};

  window.MERIDIANS=MERIDIANS;
  window.ensureMeridian=ensureMeridian;
  window.meridianTotalBonus=meridianTotalBonus;
})();
