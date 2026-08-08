/* NPC 身份档案 · 基础信息 / 态度 / 外观 / 好恶 / 实力 */
(function(){

  var POWER_RANKS=[
    {min:0,name:"手无缚鸡",color:"#8a8070"},
    {min:20,name:"初涉江湖",color:"#7aae6a"},
    {min:35,name:"略有所成",color:"#d9ad62"},
    {min:50,name:"一方好手",color:"#c47a5a"},
    {min:65,name:"成名高手",color:"#b85b53"},
    {min:80,name:"宗师之姿",color:"#9b3a3a"},
    {min:95,name:"深不可测",color:"#6b3a8a"}
  ];
  function powerLabel(n){
    n=n|0;var r=POWER_RANKS[0];
    for(var i=0;i<POWER_RANKS.length;i++)if(n>=POWER_RANKS[i].min)r=POWER_RANKS[i];
    return r;
  }

  /** 各 NPC 档案（按 id） */
  var NPC_PROFILES={
    zhou:{
      nickname:"万事通周",
      gender:"男",age:48,
      faction:"清河客栈（市井）",align:"中立",
      attitude:"和气，先做生意再谈江湖",
      look:"微胖，灰布长衫，腰间挂着一串旧钥匙，笑起来眼角有纹。",
      likes:["银两准时","不在店里打架","听客闻"],
      dislikes:["白吃白住","血染床单","缉武司上门"],
      power:12,powerNote:"几乎不会武，但消息比刀快。"
    },
    su:{
      nickname:"半仙苏",
      gender:"男",age:41,
      faction:"清河医馆（游医）",align:"正",
      attitude:"嘴硬心软，见伤先骂再治",
      look:"清瘦，青衫袖口常有药渍，指尖被药草染成淡绿。",
      likes:["惜命的人","真金创药钱","安静的病人"],
      dislikes:["硬拼内伤还嘴硬","假药贩子","半夜砸门"],
      power:28,powerNote:"医术胜于武，点穴止血尚可。"
    },
    shishu:{
      nickname:"醒木王",
      gender:"男",age:56,
      faction:"无（说书人）",align:"中立",
      attitude:"热络，茶钱到位便知无不言",
      look:"瘦高，一把油亮醒木，茶棚下永远一杯半凉的粗茶。",
      likes:["茶钱","新鲜秘闻","听书的人多"],
      dislikes:["白听不给钱","有人拆穿他掺的水"],
      power:8,powerNote:"腿脚利索，打架不行。"
    },
    aqing:{
      nickname:"药青",
      gender:"女",age:17,
      faction:"无（采药）",align:"正",
      attitude:"羞涩谨慎，熟了之后话会多些",
      look:"布裙挽袖，药篓比人显眼，发间常别一枝竹叶。",
      likes:["识药的人","晴天","回春谷的消息"],
      dislikes:["踩坏药苗","在竹林里动刀","油嘴滑舌"],
      power:18,powerNote:"识毒避蛇，真正动手仍稚嫩。"
    },
    jian_tong:{
      nickname:"竹叶剑",
      gender:"男",age:15,
      faction:"无（求拜烟岚）",align:"正",
      attitude:"热切，把每个会剑的人都当前辈",
      look:"青布短打，木剑磨得发白，额上常有汗。",
      likes:["剑法指点","烟岚的传闻","劈中落叶"],
      dislikes:["被嘲笑","有人说他不行"],
      power:16,powerNote:"招式生疏，心却够稳。"
    },
    yubo:{
      nickname:"老纤余",
      gender:"男",age:62,
      faction:"白沙渡船帮（松散）",align:"中立",
      attitude:"沉稳，把过江人当熟客",
      look:"皮肤如树皮，双手老茧层层，烟袋锅常亮着。",
      likes:["老实付船钱","会水性的后生","江上平静"],
      dislikes:["水贼","赊账","在船上比武"],
      power:22,powerNote:"年轻时能打，如今以经验压人。"
    },
    shuizei:{
      nickname:"独眼鲨",
      gender:"男",age:34,
      faction:"前水贼（已脱帮）",align:"邪偏中",
      attitude:"戒备，银子够才松口",
      look:"左眼罩黑布，刀疤爬过眉骨，身上有海藻味。",
      likes:["银子","酒","别提当年"],
      dislikes:["官差","旧帮来寻","被人当软柿子"],
      power:38,powerNote:"水上功夫未废，岸上略逊。"
    },
    qianliu:{
      nickname:"狐狸六",
      gender:"男",age:29,
      faction:"旧瓦市黑市",align:"中立偏邪",
      attitude:"笑面，价码里藏刀",
      look:"窄袖短袍，手指上总转着一枚铜钱，眼神滴溜转。",
      likes:["成交","难辨的真假货","酒"],
      dislikes:["白看不买","缉武司便衣","被人拆台"],
      power:30,powerNote:"暗器上手快，正面硬刚一般。"
    },
    stall:{
      nickname:"炊饼张",
      gender:"女",age:53,
      faction:"旧瓦市井",align:"正",
      attitude:"慈和，闲话里夹着情报",
      look:"围裙沾面粉，发髻插一根骨簪，嗓门亮。",
      likes:["热气腾腾的生意","懂事的后生","公道话"],
      dislikes:["白吃","欺负小贩","半夜吵闹"],
      power:6,powerNote:"炊饼能砸人，武功谈不上。"
    },
    luyun:{
      nickname:"露穗陆",
      gender:"男",age:24,
      faction:"烟岚剑斋·外门",align:"正",
      attitude:"寡言，以剑代话",
      look:"白衣青穗，剑穗常湿，站姿如松。",
      likes:["心静的对剑","雾天练剑","守山有功"],
      dislikes:["山门喧哗","蛮力压人","心浮气躁"],
      power:42,powerNote:"外门翘楚，剑意初成。"
    },
    shen_wai:{
      nickname:"记名沈",
      gender:"男",age:31,
      faction:"烟岚剑斋·外门执事",align:"正",
      attitude:"公事公办，略显刻板",
      look:"青衫整齐，袖中常备名册，眉宇严肃。",
      likes:["规矩","贡献记清","弟子守礼"],
      dislikes:["逃值","谎报山情","走关系"],
      power:40,powerNote:"剑不如陆云，事却比谁都清。"
    },
    tieba:{
      nickname:"铁疤刀",
      gender:"男",age:37,
      faction:"无（浪人）",align:"中立",
      attitude:"冷硬，刀比话多",
      look:"脸侧长疤，劲装束腰，刀柄磨得发亮发黑。",
      likes:["痛快的对刀","好刀","够狠的对手"],
      dislikes:["假仁假义","拖泥带水","软骨头"],
      power:58,powerNote:"盐道上活下来的人，刀上有数。"
    },
    helie_npc:{
      nickname:"烫手炉",
      gender:"男",age:19,
      faction:"赤炉刀社·外门",align:"中",
      attitude:"直爽，力气比脑子快",
      look:"手臂烫伤斑驳，汗巾常湿，笑起来缺一角牙。",
      likes:["搬矿","试刀","社主夸奖"],
      dislikes:["假刀","偷懒","被叫学徒蛋"],
      power:36,powerNote:"力足招糙，成长快。"
    },
    he_forge:{
      nickname:"响锤金",
      gender:"男",age:54,
      faction:"赤炉刀社·铸兵",align:"中",
      attitude:"少言，只信火与铁",
      look:"须发被火燎得发黄，耳聋半边，锤不离手。",
      likes:["好铁","肯养刀的人","安静的炉边"],
      dislikes:["空谈刀意","催活","劣铁"],
      power:34,powerNote:"铸兵一流，交手只中上。"
    },
    yaotong:{
      nickname:"百草童",
      gender:"男",age:16,
      faction:"回春谷·外门",align:"正",
      attitude:"开朗，见人就想塞一包草药",
      look:"药篓高过肩，笑窝深，指尖常有草汁。",
      likes:["识药问答","义诊","甜食"],
      dislikes:["毒师","浪费药材","吓人的刀光"],
      power:20,powerNote:"辨药一流，武功刚入门。"
    },
    ao_sailor:{
      nickname:"潮生贝",
      gender:"男",age:26,
      faction:"玄鲸帮·帮众",align:"中",
      attitude:"爽利，契约说一不二",
      look:"皮肤黝黑，腰串贝壳，脚上常沾盐花。",
      likes:["守约","好风浪","潮珠"],
      dislikes:["毁约","临阵脱逃","旱鸭子逞能"],
      power:46,powerNote:"水上难逢敌手，陆战亦不弱。"
    },
    que_shadow:{
      nickname:"影七",
      gender:"不明",age:"？",
      faction:"白雀楼·影卫",align:"亦正亦邪",
      attitude:"疏离，话少到只剩必要的字",
      look:"黑衣蒙面，气息极轻，站着像一截影子。",
      likes:["安静","活着回来的信","轻的脚步"],
      dislikes:["废话","曝光","拖后腿"],
      power:55,powerNote:"影步与刺杀并重，正面硬拼非所长。"
    },
    monk_jing:{
      nickname:"静尘僧",
      gender:"男",age:23,
      faction:"无相寺·知客",align:"正",
      attitude:"恭谨，不劝人却也不拒人",
      look:"灰僧衣，念珠磨亮，目光平直不避。",
      likes:["抄经","清净","有人真心问禅"],
      dislikes:["寺中喧哗","破戒","强求答案"],
      power:38,powerNote:"禅定深，指力初通。"
    },
    hermit:{
      nickname:"云海叟",
      gender:"男",age:"约七十",
      faction:"无（隐世）",align:"超然",
      attitude:"淡，像风，不主动留人",
      look:"白发束得松，坐在残碑旁，衣襟常被云气打湿。",
      likes:["沉默的对坐","不问天机的人","清风"],
      dislikes:["强问天机","山巅喧哗","把福缘当买卖"],
      power:78,powerNote:"深藏不露，你看不透他。"
    },
    xie_ren:{
      nickname:"血屠",
      gender:"男",age:33,
      faction:"血石邪修（散）",align:"邪",
      attitude:"挑衅，享受别人的怕",
      look:"衣襟暗褐，刀不入鞘，笑时眼不笑。",
      likes:["血","求饶声","敢接刀的人"],
      dislikes:["正道说教","临阵脱逃","假慈悲"],
      power:68,powerNote:"杀意压人，硬碰硬极凶。"
    },
    reef_ghost:{
      nickname:"潮声守",
      gender:"不明",age:"？",
      faction:"沉沙遗迹",align:"不明",
      attitude:"冷漠如潮，只按古法行事",
      look:"影如石，声如潮，看不清眉目。",
      likes:["懂古法者","潮信准时"],
      dislikes:["强闯潮门","扰动遗骨"],
      power:82,powerNote:"与遗迹同在，非人间寻常武学可衡量。"
    },
    cave_guard:{
      nickname:"齿合",
      gender:"不明",age:"？",
      faction:"影窟机关",align:"中立（机械）",
      attitude:"无态度，只执行禁令",
      look:"关节金属光，行动带咔声，面无表情。",
      likes:[],
      dislikes:["闯入者"],
      power:60,powerNote:"机关与武并重，拆解或硬闯皆险。"
    },

    /* 门派扩充 NPC（meridian.js） */
    shen_tingyun:{
      nickname:"烟岚一剑",
      gender:"女",age:36,
      faction:"烟岚剑斋·斋主",align:"正",
      attitude:"清冷，问剑不问人",
      look:"白衣无绣，剑在鞘中仍有雾意，眉目如洗。",
      likes:["悟性","心器之剑","雾中独行"],
      dislikes:["以武压人","心浮","辱剑"],
      power:92,powerNote:"剑意通玄，亲传亦难望其项背。"
    },
    shen_shuheng:{
      nickname:"疏衡剑",
      gender:"男",age:28,
      faction:"烟岚剑斋·内门",align:"正",
      attitude:"温和有度，代师授业",
      look:"青衫束发，剑穗素白，笑时淡。",
      likes:["同门精进","查清失谱","雾中比剑"],
      dislikes:["山贼","心术不正","欺外门"],
      power:62,powerNote:"云雾剑意已成，内门第一。"
    },
    yanlan_mei:{
      nickname:"疏影梅",
      gender:"女",age:20,
      faction:"烟岚剑斋·外门",align:"正",
      attitude:"冷淡，熟后仍话少",
      look:"素衣，剑穗白，常在竹径外独练。",
      likes:["安静练剑","山花","被认真对待的剑"],
      dislikes:["被盯着看","喧哗","敷衍的比剑"],
      power:38,powerNote:"外门中上，剑路清正。"
    },
    he_lie:{
      nickname:"断石贺",
      gender:"男",age:45,
      faction:"赤炉刀社·社主",align:"中",
      attitude:"豪直，认刀也认人",
      look:"赤膊锻刀，声如洪钟，臂肌如铁。",
      likes:["真刀","守诺","一刀断石的后生"],
      dislikes:["假刀坑商","毁诺","油滑"],
      power:90,powerNote:"一刀断石，镖路与炉火都服他。"
    },
    jin_duanshi:{
      nickname:"缺口金",
      gender:"男",age:39,
      faction:"赤炉刀社·护社刀头",align:"中",
      attitude:"少言利落，镖路上不废话",
      look:"刀有缺口，眼神利，劲装沾炉灰。",
      likes:["货到人在","干脆的对手"],
      dislikes:["拖镖期","内鬼","软刀"],
      power:64,powerNote:"走镖无数，刀上缺口都是命换的。"
    },
    chilu_huo:{
      nickname:"火娃",
      gender:"男",age:17,
      faction:"赤炉刀社·外门",align:"中",
      attitude:"热络，见人就想比划",
      look:"脸黑有煤灰，缺一牙，笑大声。",
      likes:["搬矿","比试","炊饼"],
      dislikes:["偷懒","被小看"],
      power:28,powerNote:"力气够，火候未到。"
    },
    su_qingluo:{
      nickname:"青萝掌",
      gender:"女",age:34,
      faction:"回春谷·谷主",align:"正",
      attitude:"温软，笑里有分寸",
      look:"青裙执扇，药香若有若无，指白。",
      likes:["救人","懂医的后辈","安静的谷"],
      dislikes:["滥杀","制毒","拿命换名"],
      power:88,powerNote:"生杀一掌，医武皆宗师。"
    },
    su_wanqing:{
      nickname:"晚青医",
      gender:"女",age:27,
      faction:"回春谷·内门",align:"正",
      attitude:"温和耐心，义诊不拒",
      look:"淡青衫，药囊不离身，眉目清。",
      likes:["义诊","好学的人","早发现的病征"],
      dislikes:["讳疾忌医","毒师","浪费药材"],
      power:58,powerNote:"医术精，掌力亦能伤人。"
    },
    huichun_lan:{
      nickname:"兰草",
      gender:"女",age:18,
      faction:"回春谷·外门",align:"正",
      attitude:"活泼，话多时爱跑题",
      look:"辫上小花，药篓高，笑易。",
      likes:["花","认药游戏","谷主的笑"],
      dislikes:["毒草","吓人","被当小孩哄"],
      power:22,powerNote:"识药强，交手仍嫩。"
    },
    ao_cang:{
      nickname:"鲸骨敖",
      gender:"男",age:47,
      faction:"玄鲸帮·帮主",align:"中",
      attitude:"话少，契约重过天",
      look:"半截鲸骨杖，鬓有盐霜，目深。",
      likes:["守约","能扛风浪的人","干净的账"],
      dislikes:["毁约","内鬼","空口白话"],
      power:91,powerNote:"杖下毁约者无数，深海亦忌他。"
    },
    hai_lie:{
      nickname:"海裂",
      gender:"男",age:35,
      faction:"玄鲸帮·船头",align:"中",
      attitude:"务实，银货与人命一起算",
      look:"盐风刻脸，缆绳茧厚，话短。",
      likes:["船期准","敢护船的人"],
      dislikes:["假货单","临阵怯"],
      power:60,powerNote:"护船多年，水战一流。"
    },
    xuan_zhu:{
      nickname:"珠算",
      gender:"女",age:24,
      faction:"玄鲸帮·账房",align:"中",
      attitude:"精明和气，账目不容错",
      look:"算盘不离手，腰串潮珠，衣整。",
      likes:["账平","守规矩的帮众","真潮珠"],
      dislikes:["糊涂账","私吞","赖账"],
      power:24,powerNote:"武功平平，账能要命。"
    },
    que_wuying:{
      nickname:"雀无影",
      gender:"不明",age:"？",
      faction:"白雀楼·楼主",align:"亦正亦邪",
      attitude:"不可测，只闻雀啼",
      look:"从不见真容，存在感像一阵风。",
      likes:["有用的情报","活棋","静"],
      dislikes:["曝光楼中事","废物棋子"],
      power:95,powerNote:"深不可测，情报与杀机同体。"
    },
    que_san:{
      nickname:"雀三",
      gender:"不明",age:"约三十",
      faction:"白雀楼·执事",align:"亦正亦邪",
      attitude:"考核式，每句话都像在试你",
      look:"面覆青纱，声线中性，指尖无茧却稳。",
      likes:["合格的影卫","漂亮的假情报"],
      dislikes:["漏名单","心软误事"],
      power:66,powerNote:"执事级，考核与肃清都经其手。"
    },
    baique_si:{
      nickname:"雀四",
      gender:"男",age:21,
      faction:"白雀楼·影卫",align:"亦正亦邪",
      attitude:"略生涩，仍在学无声",
      look:"黑衣，脚步偶有声，面具较新。",
      likes:["被认可","传信成功"],
      dislikes:["被笑","拖累同伴"],
      power:40,powerNote:"影卫新人，潜力在。"
    },
    kong_guan:{
      nickname:"盲指空观",
      gender:"男",age:68,
      faction:"无相寺·方丈",align:"正",
      attitude:"慈悲而不纵，一指可断金",
      look:"盲眼，僧衣旧，念珠大，立如钉。",
      likes:["放下","真问","戒律严明"],
      dislikes:["执相","破戒","以武炫人"],
      power:96,powerNote:"无相指通神，目盲而心明。"
    },
    liao_yin:{
      nickname:"戒律了因",
      gender:"男",age:42,
      faction:"无相寺·戒律院",align:"正",
      attitude:"冷肃，寺规大于人情",
      look:"僧衣整，指节粗，面无笑容。",
      likes:["守戒","面壁有得","寺清"],
      dislikes:["破戒","徇私","嬉闹"],
      power:70,powerNote:"指力已通，专掌戒律。"
    },
    wuxiang_chen:{
      nickname:"净尘",
      gender:"男",age:19,
      faction:"无相寺·知客",align:"正",
      attitude:"腼腆，抄经常出错",
      look:"新念珠，僧鞋干净，目光躲。",
      likes:["斋饭","少罚","有人一起抄经"],
      dislikes:["面壁","被人说笨"],
      power:26,powerNote:"入门不久，心善。"
    }
  };

  function getProfile(npc){
    if(!npc)return null;
    var p=NPC_PROFILES[npc.id];
    if(p)return p;
    /* 无档案时用 desc 生成简档 */
    return{
      nickname:npc.title||"—",
      gender:"？",age:"？",
      faction:npc.sect?("门派关联·"+npc.sect):"江湖散人",
      align:"？",
      attitude:"尚不明确",
      look:npc.desc||"",
      likes:[],dislikes:[],
      power:30,powerNote:"情报不足。"
    };
  }

  function profileHtml(npc){
    var pr=getProfile(npc);
    if(!pr)return"";
    var prank=powerLabel(pr.power);
    var likes=(pr.likes&&pr.likes.length)?pr.likes.join("、"):"不详";
    var dis=(pr.dislikes&&pr.dislikes.length)?pr.dislikes.join("、"):"不详";
    return '<div id="npcProfile" class="npc-profile" style="margin:8px 0;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#1a1512">'+
      '<div class="row" style="justify-content:space-between;margin-bottom:4px">'+
        '<span class="small" style="color:var(--gold)">身份档案</span>'+
        '<button class="btn sm" id="toggleProfile">收起</button></div>'+
      '<div id="profileBody">'+
        '<div class="stat-grid">'+
          '<div class="stat"><b>姓名</b><span>'+npc.name+'</span></div>'+
          '<div class="stat"><b>诨号</b><span>'+pr.nickname+'</span></div>'+
          '<div class="stat"><b>性别</b><span>'+pr.gender+'</span></div>'+
          '<div class="stat"><b>年龄</b><span>'+pr.age+'</span></div>'+
          '<div class="stat"><b>势力</b><span>'+pr.faction+'</span></div>'+
          '<div class="stat"><b>立场</b><span>'+pr.align+'</span></div>'+
        '</div>'+
        '<p class="small" style="margin:6px 0 2px"><b>第一印象</b> · '+pr.attitude+'</p>'+
        '<p class="small"><b>外观</b> · '+pr.look+'</p>'+
        '<p class="small"><b>喜好</b> · '+likes+'</p>'+
        '<p class="small"><b>厌恶</b> · '+dis+'</p>'+
        '<p class="small" style="margin-top:4px"><b>实力</b> · <span style="color:'+prank.color+'">'+prank.name+'</span>（估'+pr.power+'） · '+pr.powerNote+'</p>'+
      '</div></div>';
  }

  window.getNpcProfile=getProfile;
  window.NPC_PROFILES=NPC_PROFILES;
  window.powerLabel=powerLabel;

  /* 包裹 modalNpc：插入档案 */
  function patchModalNpc(){
    if(typeof modalNpc!=="function")return;
    var _modal=modalNpc;
    modalNpc=function(npcId){
      _modal(npcId);
      var npc=findPerson(npcId);
      if(!npc)return;
      var panel=qs("#modalPanel");
      if(!panel||qs("#npcProfile",panel))return;
      var desc=panel.querySelector("p.small");
      var box=document.createElement("div");
      box.innerHTML=profileHtml(npc);
      var node=box.firstChild;
      if(desc&&desc.parentNode){
        desc.parentNode.insertBefore(node,desc.nextSibling);
      }else{
        var head=panel.querySelector(".modal-head");
        if(head&&head.nextSibling)panel.insertBefore(node,head.nextSibling);
        else panel.appendChild(node);
      }
      /* 标题补诨号 */
      var titleEl=panel.querySelector(".modal-head .section-title");
      var pr=getProfile(npc);
      if(titleEl&&pr&&pr.nickname){
        if(titleEl.innerHTML.indexOf(pr.nickname)<0){
          titleEl.innerHTML=npc.name+' <span class="tag">'+pr.nickname+'</span> <span class="tag">'+npc.title+'</span>'+
            (titleEl.innerHTML.indexOf("已结缘")>=0?' <span class="rank-tag" style="border-color:#e8a0a0;color:#e8a0a0">已结缘</span>':'');
        }
      }
      var collapsed=false;
      var btn=qs("#toggleProfile",panel);
      var body=qs("#profileBody",panel);
      if(btn&&body){
        btn.onclick=function(){
          collapsed=!collapsed;
          body.style.display=collapsed?"none":"";
          btn.textContent=collapsed?"展开档案":"收起";
        };
      }
    };
  }
  patchModalNpc();
  /* 若 favor_ui 稍后重写，再补丁一次 */
  setTimeout(patchModalNpc,0);

})();
