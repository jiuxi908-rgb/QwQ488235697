/* 像素风格 UI · 精细化 32×32 头像 */
(function(){

  /* —— 注入像素风样式 —— */
  if(!document.getElementById("pixel-ui-style")){
    var css=document.createElement("style");
    css.id="pixel-ui-style";
    css.textContent=[
      "body.pixel-ui{image-rendering:pixelated;-webkit-font-smoothing:none}",
      "body.pixel-ui .panel,body.pixel-ui .hero-card,body.pixel-ui .modal-panel{",
      "  border-radius:0 !important;border-width:3px !important;border-style:solid !important;",
      "  border-color:#3a2a1c #1a120c #1a120c #3a2a1c !important;",
      "  box-shadow:4px 4px 0 #0a0806, inset 1px 1px 0 rgba(217,173,98,.15) !important}",
      "body.pixel-ui .btn{",
      "  border-radius:0 !important;border-width:2px !important;",
      "  border-color:#6b503a #2a1c12 #2a1c12 #6b503a !important;",
      "  box-shadow:2px 2px 0 #0a0806;text-shadow:1px 1px 0 #000}",
      "body.pixel-ui .btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #0a0806}",
      "body.pixel-ui .btn.primary{border-color:var(--gold) #5a4020 #5a4020 var(--gold) !important;background:#5a3a22 !important}",
      "body.pixel-ui .map-node,body.pixel-ui .choice,body.pixel-ui .quest-card,body.pixel-ui .master-card,",
      "body.pixel-ui .item-icon,body.pixel-ui .talk-bubble,body.pixel-ui .log,body.pixel-ui .tag,",
      "body.pixel-ui .rank-tag,body.pixel-ui .equip-slot{border-radius:0 !important}",
      "body.pixel-ui .map-node{border-width:2px !important;border-color:#4b3a2d #1a120c #1a120c #4b3a2d !important;box-shadow:2px 2px 0 #0a0806}",
      "body.pixel-ui .map-node.current{border-color:var(--gold) !important;box-shadow:0 0 0 2px rgba(217,173,98,.35),2px 2px 0 #0a0806}",
      "body.pixel-ui .title{letter-spacing:2px;text-shadow:3px 3px 0 #000,-1px -1px 0 #5a4020}",
      "body.pixel-ui .section-title{text-shadow:1px 1px 0 #000}",
      "body.pixel-ui .favor-bar,body.pixel-ui .quest-bar{border-radius:0 !important;border-width:2px !important;height:10px !important}",
      "body.pixel-ui .favor-fill,body.pixel-ui .quest-fill{border-radius:0 !important}",
      "body.pixel-ui .modal-mask{background:rgba(0,0,0,.65)}",
      "body.pixel-ui .hud{align-items:center;gap:8px}",
      ".px-avatar{display:inline-block;vertical-align:middle;image-rendering:pixelated;image-rendering:crisp-edges;",
      "  border:2px solid #4b3a2d;box-shadow:2px 2px 0 #0a0806;background:#12100e;flex-shrink:0;overflow:hidden}",
      ".px-avatar svg{display:block;width:100%;height:100%}",
      ".px-avatar.sm{width:28px;height:28px}",
      ".px-avatar.md{width:44px;height:44px}",
      ".px-avatar.lg{width:64px;height:64px}",
      ".px-avatar.xl{width:80px;height:80px}",
      ".px-npc-btn{display:inline-flex;align-items:center;gap:4px}",
      ".px-npc-btn .px-avatar{width:24px;height:24px}",
      ".px-modal-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}"
    ].join("\n");
    document.head.appendChild(css);
  }
  document.body.classList.add("pixel-ui");

  function hash(str){
    str=String(str||"x");
    var h=2166136261;
    for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function pick(h,arr){return arr[h%arr.length];}
  function shade(hex,amt){
    hex=hex.replace("#","");
    if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var n=parseInt(hex,16);
    var r=Math.max(0,Math.min(255,((n>>16)&255)+amt));
    var g=Math.max(0,Math.min(255,((n>>8)&255)+amt));
    var b=Math.max(0,Math.min(255,(n&255)+amt));
    return"#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  var SKINS=["#f0d0b0","#e8c4a0","#d4a574","#c68642","#b07a50","#a06740","#8d5524"];
  var HAIRS=["#0d0d0d","#1a120c","#2c1810","#3d2b1f","#4a3728","#5c4033","#6b4423","#8b6914","#c8b8a0","#e0d8c8"];
  var CLOTH=["#3b2b21","#4a3a2a","#5a3a22","#2a3a4a","#3a2a3a","#2a4a3a","#4a2a2a","#2a2a4a","#1a2a1a","#6b4630","#5a4a3a","#3a4a5a"];
  var ACC=["#d9ad62","#e8c878","#b85b53","#7aae6a","#6a9eae","#c47a5a","#e8a0a0","#c0c8d0","#8a6a45"];
  var BG=["#1a1512","#15120f","#12181a","#1a1218","#121a14"];

  /* NPC 专属外观预设（覆盖随机） */
  var PRESETS={
    zhou:{skin:2,hair:5,cloth:0,acc:0,hairStyle:"top",beard:1,hat:"none",extra:"key"},
    su:{skin:1,hair:3,cloth:10,acc:2,hairStyle:"short",beard:0,hat:"none",extra:"herb"},
    shishu:{skin:3,hair:8,cloth:1,acc:0,hairStyle:"elder",beard:2,hat:"none",extra:"wood"},
    aqing:{skin:0,hair:2,cloth:5,acc:3,hairStyle:"long",beard:0,hat:"leaf",extra:"none",gender:"女"},
    jian_tong:{skin:0,hair:1,cloth:3,acc:6,hairStyle:"young",beard:0,hat:"none",extra:"sword",gender:"男"},
    yubo:{skin:4,hair:8,cloth:0,acc:0,hairStyle:"elder",beard:2,hat:"none",extra:"rope"},
    shuizei:{skin:5,hair:0,cloth:7,acc:2,hairStyle:"short",beard:1,hat:"none",extra:"patch"},
    qianliu:{skin:1,hair:1,cloth:4,acc:0,hairStyle:"slick",beard:0,hat:"none",extra:"coin"},
    stall:{skin:2,hair:8,cloth:10,acc:0,hairStyle:"bun",beard:0,hat:"none",extra:"none",gender:"女"},
    luyun:{skin:0,hair:0,cloth:3,acc:6,hairStyle:"sword",beard:0,hat:"none",extra:"tassel",gender:"男"},
    shen_wai:{skin:1,hair:2,cloth:3,acc:0,hairStyle:"neat",beard:0,hat:"none",extra:"none"},
    tieba:{skin:4,hair:0,cloth:0,acc:2,hairStyle:"wild",beard:1,hat:"none",extra:"scar"},
    helie_npc:{skin:3,hair:3,cloth:0,acc:0,hairStyle:"short",beard:0,hat:"none",extra:"burn"},
    he_forge:{skin:4,hair:8,cloth:1,acc:0,hairStyle:"elder",beard:2,hat:"none",extra:"none"},
    yaotong:{skin:0,hair:4,cloth:5,acc:3,hairStyle:"young",beard:0,hat:"none",extra:"basket",gender:"男"},
    ao_sailor:{skin:5,hair:0,cloth:3,acc:4,hairStyle:"short",beard:0,hat:"none",extra:"shell"},
    que_shadow:{skin:3,hair:0,cloth:7,acc:5,hairStyle:"hidden",beard:0,hat:"mask",extra:"none",role:"shadow"},
    monk_jing:{skin:1,hair:9,cloth:10,acc:0,hairStyle:"monk",beard:0,hat:"none",extra:"beads",role:"monk"},
    hermit:{skin:2,hair:9,cloth:10,acc:0,hairStyle:"elder",beard:2,hat:"none",extra:"none",role:"elder"},
    xie_ren:{skin:3,hair:0,cloth:6,acc:2,hairStyle:"wild",beard:1,hat:"none",extra:"blood",role:"evil"},
    reef_ghost:{skin:6,hair:5,cloth:3,acc:4,hairStyle:"hidden",beard:0,hat:"none",extra:"none",role:"shadow"},
    cave_guard:{skin:6,hair:0,cloth:7,acc:5,hairStyle:"hidden",beard:0,hat:"mask",extra:"metal",role:"shadow"},
    yanlan_mei:{skin:0,hair:1,cloth:3,acc:6,hairStyle:"long",beard:0,hat:"none",extra:"tassel",gender:"女"},
    huichun_lan:{skin:0,hair:4,cloth:5,acc:3,hairStyle:"twin",beard:0,hat:"flower",extra:"none",gender:"女"},
    xuan_zhu:{skin:1,hair:2,cloth:3,acc:4,hairStyle:"neat",beard:0,hat:"none",extra:"pearl",gender:"女"},
    su_wanqing:{skin:0,hair:3,cloth:5,acc:3,hairStyle:"long",beard:0,hat:"none",extra:"herb",gender:"女"},
    shen_shuheng:{skin:0,hair:1,cloth:3,acc:6,hairStyle:"sword",beard:0,hat:"none",extra:"tassel",gender:"男"},
    shen_tingyun:{skin:0,hair:0,cloth:3,acc:6,hairStyle:"long",beard:0,hat:"none",extra:"tassel",gender:"女",role:"elder"},
    he_lie:{skin:4,hair:2,cloth:0,acc:0,hairStyle:"wild",beard:1,hat:"none",extra:"burn"},
    su_qingluo:{skin:0,hair:3,cloth:5,acc:3,hairStyle:"long",beard:0,hat:"none",extra:"herb",gender:"女"},
    ao_cang:{skin:5,hair:8,cloth:3,acc:4,hairStyle:"elder",beard:2,hat:"none",extra:"shell"},
    que_wuying:{skin:3,hair:0,cloth:7,acc:5,hairStyle:"hidden",beard:0,hat:"mask",extra:"none",role:"shadow"},
    que_san:{skin:2,hair:0,cloth:7,acc:5,hairStyle:"hidden",beard:0,hat:"veil",extra:"none",role:"shadow"},
    baique_si:{skin:1,hair:0,cloth:7,acc:5,hairStyle:"hidden",beard:0,hat:"mask",extra:"none",role:"shadow"},
    kong_guan:{skin:2,hair:9,cloth:10,acc:0,hairStyle:"monk",beard:1,hat:"none",extra:"beads",role:"monk"},
    liao_yin:{skin:3,hair:9,cloth:10,acc:0,hairStyle:"monk",beard:0,hat:"none",extra:"beads",role:"monk"},
    wuxiang_chen:{skin:0,hair:9,cloth:10,acc:0,hairStyle:"monk",beard:0,hat:"none",extra:"beads",role:"monk"},
    chilu_huo:{skin:3,hair:3,cloth:0,acc:0,hairStyle:"young",beard:0,hat:"none",extra:"burn"},
    jin_duanshi:{skin:4,hair:1,cloth:0,acc:2,hairStyle:"short",beard:1,hat:"none",extra:"scar"},
    hai_lie:{skin:5,hair:0,cloth:3,acc:4,hairStyle:"short",beard:1,hat:"none",extra:"shell"}
  };

  /**
   * 32×32 精细像素头像
   * opts: seed, gender, role, presetId
   */
  function pixelAvatarSvg(opts){
    opts=opts||{};
    var seed=opts.seed||"anon";
    var g=opts.gender||"其他";
    var role=opts.role||"npc";
    var preset=PRESETS[opts.presetId||seed]||null;
    if(preset){
      if(preset.gender)g=preset.gender;
      if(preset.role)role=preset.role;
    }

    var h=hash(seed+"|"+g+"|"+role);
    var h2=hash(seed+"*face");
    var h3=hash(seed+"*style");

    var skin=preset?SKINS[preset.skin%SKINS.length]:pick(h,SKINS);
    var hair=preset?HAIRS[preset.hair%HAIRS.length]:pick(h2,HAIRS);
    var cloth=preset?CLOTH[preset.cloth%CLOTH.length]:pick(h>>>4,CLOTH);
    var acc=preset?ACC[preset.acc%ACC.length]:pick(h>>>8,ACC);
    var bg=pick(h>>>12,BG);
    var skinD=shade(skin,-22);
    var skinL=shade(skin,18);
    var hairL=shade(hair,25);
    var clothL=shade(cloth,20);
    var clothD=shade(cloth,-25);

    if(role==="monk"){cloth="#6a6558";clothL="#7a7568";clothD="#4a4538";hair="#e8e0d0";hairL="#f0ebe0";}
    if(role==="shadow"){cloth="#1a1a28";clothL="#2a2a38";clothD="#0a0a12";hair="#0a0a0a";}
    if(role==="elder"&&!preset){hair="#d8d0c0";hairL="#e8e4dc";}
    if(role==="evil"){cloth="#4a1a1a";clothL="#5a2a2a";clothD="#2a0a0a";acc="#b85b53";}
    if(role==="player"){
      cloth=pick(h,["#5a3a22","#3a4a5a","#4a3a4a","#3a5a3a","#5a4a2a"]);
      clothL=shade(cloth,22);clothD=shade(cloth,-22);
    }

    var hairStyle=preset&&preset.hairStyle?preset.hairStyle:null;
    if(!hairStyle){
      if(role==="monk")hairStyle="monk";
      else if(role==="elder")hairStyle="elder";
      else if(role==="shadow")hairStyle="hidden";
      else if(g==="女")hairStyle=pick(h3,["long","twin","bun","long","neat"]);
      else if(g==="男")hairStyle=pick(h3,["short","neat","sword","young","wild"]);
      else hairStyle=pick(h3,["neat","short","long","hidden"]);
    }
    var beard=preset?preset.beard:(role==="elder"?2:(g==="男"&&h%5===0?1:0));
    var hat=preset&&preset.hat?preset.hat:"none";
    var extra=preset&&preset.extra?preset.extra:(h%7===0?"tassel":"none");

    var S=32;
    var cells={};
    function set(x,y,c){if(x>=0&&x<S&&y>=0&&y<S)cells[x+","+y]=c;}
    function fill(x0,y0,x1,y1,c){
      for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)set(x,y,c);
    }
    function hline(x0,x1,y,c){for(var x=x0;x<=x1;x++)set(x,y,c);}
    function vline(x,y0,y1,c){for(var y=y0;y<=y1;y++)set(x,y,c);}

    /* 背景渐变感 */
    fill(0,0,31,31,bg);
    fill(1,1,30,30,shade(bg,8));

    /* ===== 衣领/肩 ===== */
    fill(6,26,25,31,cloth);
    fill(5,28,26,31,cloth);
    fill(4,29,27,31,clothD);
    hline(8,23,26,clothL);
    /* 领口 */
    fill(13,25,18,27,skin);
    fill(12,26,19,26,clothL);

    /* ===== 脖子 ===== */
    fill(13,22,18,26,skin);
    vline(13,22,25,skinD);vline(18,22,25,skinD);

    /* ===== 脸型 ===== */
    fill(10,8,21,22,skin);
    fill(11,7,20,7,skin);
    fill(12,6,19,6,skin);
    fill(11,23,20,23,skin);
    fill(12,24,19,24,skin);
    /* 颧骨高光/阴影 */
    fill(11,12,12,16,skinL);
    fill(19,12,20,16,skinD);
    fill(13,20,18,21,skinD);

    /* ===== 发型 ===== */
    drawHair();
    function drawHair(){
      if(hairStyle==="monk"){
        fill(12,4,19,7,skin);
        fill(13,3,18,4,skinL);
        /* 戒疤三点 */
        set(14,5,"#c0a090");set(16,5,"#c0a090");set(15,4,"#c0a090");
        fill(11,6,12,8,hair);fill(19,6,20,8,hair);
        return;
      }
      if(hairStyle==="hidden"){
        fill(9,5,22,10,hair);
        fill(8,6,9,14,hair);fill(22,6,23,14,hair);
        return;
      }
      if(hairStyle==="elder"){
        fill(10,5,21,9,hair);
        fill(9,6,10,10,hair);fill(21,6,22,10,hair);
        fill(11,4,20,5,hairL);
        fill(12,3,19,4,hair);
        return;
      }
      if(hairStyle==="long"){
        fill(9,4,22,10,hair);
        fill(8,6,9,22,hair);fill(22,6,23,22,hair);
        fill(7,10,8,20,hair);fill(23,10,24,20,hair);
        fill(11,3,20,5,hairL);
        /* 刘海 */
        fill(11,7,14,9,hair);fill(17,7,20,9,hair);
        return;
      }
      if(hairStyle==="twin"){
        fill(10,5,21,9,hair);
        fill(8,4,11,8,hair);fill(20,4,23,8,hair); /* 双髻 */
        fill(7,5,9,7,hairL);fill(22,5,24,7,hairL);
        fill(8,8,9,16,hair);fill(22,8,23,16,hair);
        fill(12,6,19,8,hair);
        return;
      }
      if(hairStyle==="bun"){
        fill(12,3,19,6,hair);
        fill(13,2,18,3,hairL);
        fill(10,6,21,9,hair);
        fill(9,7,10,12,hair);fill(21,7,22,12,hair);
        return;
      }
      if(hairStyle==="sword"||hairStyle==="neat"){
        fill(10,4,21,8,hair);
        fill(11,3,20,4,hairL);
        fill(9,5,10,9,hair);fill(21,5,22,9,hair);
        if(hairStyle==="sword"){
          fill(14,2,17,3,acc); /* 冠/簪 */
        }
        /* 整齐刘海 */
        hline(11,20,8,hair);
        return;
      }
      if(hairStyle==="wild"){
        fill(9,3,22,8,hair);
        set(8,4,hair);set(7,5,hair);set(23,4,hair);set(24,5,hair);
        set(10,2,hair);set(21,2,hair);
        fill(9,8,10,12,hair);fill(21,8,22,12,hair);
        return;
      }
      if(hairStyle==="slick"){
        fill(10,5,21,8,hair);
        fill(11,4,20,5,hairL);
        fill(9,6,10,9,hair);fill(21,6,22,9,hair);
        return;
      }
      if(hairStyle==="young"||hairStyle==="short"||hairStyle==="top"){
        fill(10,4,21,8,hair);
        fill(11,3,20,4,hair);
        fill(9,5,10,8,hair);fill(21,5,22,8,hair);
        if(h3%2===0){fill(12,7,15,8,hair);fill(16,7,19,8,hair);}
        else hline(11,20,7,hair);
        return;
      }
      /* default */
      fill(10,4,21,8,hair);
      fill(9,5,10,9,hair);fill(21,5,22,9,hair);
    }

    /* ===== 帽子/面罩 ===== */
    if(hat==="mask"){
      fill(10,10,21,16,"#1a1a22");
      fill(11,11,20,15,"#2a2a32");
      /* 单眼露出 */
      fill(17,12,19,14,skin);
      set(18,13,"#e8e8e8");set(17,13,"#1a120c");
    }else if(hat==="veil"){
      fill(10,9,21,14,"#3a4a4a");
      fill(11,10,20,13,"#4a5a5a");
      hline(12,19,11,"#6a7a7a");
    }else if(hat==="leaf"){
      set(15,3,"#5a8a4a");set(16,2,"#6a9a5a");set(17,3,"#5a8a4a");
      set(14,4,"#4a7a3a");
    }else if(hat==="flower"){
      set(8,6,"#e8a0a0");set(7,7,"#d08080");set(9,7,"#d08080");set(8,8,"#e8a0a0");
      set(8,7,"#e8c878");
    }

    /* ===== 眉毛 ===== */
    if(hat!=="mask"&&hat!=="veil"){
      var brow=shade(hair,-10);
      if(g==="女"){
        hline(11,13,11,brow);hline(18,20,11,brow);
      }else{
        hline(11,14,11,brow);hline(17,20,11,brow);
        if(role==="elder"||beard>=1){hline(11,14,10,brow);hline(17,20,10,brow);}
      }
    }

    /* ===== 眼睛 ===== */
    if(hat!=="mask"&&hat!=="veil"){
      var eyeWhite="#f0e8e0";
      var iris=role==="evil"?"#b85b53":(h2%3===0?"#3a5a4a":"#2a2018");
      var pupil="#0a0806";
      /* 左眼 */
      fill(11,12,13,14,eyeWhite);
      set(12,13,iris);set(12,12,pupil);
      set(13,12,skinL); /* 高光旁 */
      /* 右眼 */
      fill(18,12,20,14,eyeWhite);
      set(19,13,iris);set(19,12,pupil);
      if(role==="evil"){
        set(11,13,"#b85b53");set(20,13,"#b85b53");
      }
      /* 下眼睑 */
      hline(11,13,15,skinD);hline(18,20,15,skinD);
    }else if(hat==="veil"){
      set(12,12,"#1a120c");set(19,12,"#1a120c");
    }

    /* ===== 疤痕 / 眼罩 ===== */
    if(extra==="scar"||extra==="patch"){
      if(extra==="patch"){
        fill(10,11,14,15,"#1a120c");
        hline(10,14,13,"#2a2018");
      }else{
        set(14,10,skinD);set(15,11,"#8a4a4a");set(16,12,skinD);
        set(17,13,"#8a4a4a");
      }
    }
    if(extra==="burn"){
      set(20,16,"#a06040");set(21,17,"#8a5040");set(19,18,"#a06040");
    }
    if(extra==="blood"){
      set(14,17,"#6a2020");set(15,18,"#8a3030");set(16,17,"#6a2020");
    }

    /* ===== 鼻子 ===== */
    set(15,15,skinD);set(16,15,skinD);set(16,16,skinD);

    /* ===== 嘴 ===== */
    var mouthC="#a06050";
    var mtype=h3%5;
    if(g==="女"){
      hline(14,17,19,"#c07070");
      set(15,19,"#d08080");
    }else if(mtype===0){hline(14,17,19,mouthC);}
    else if(mtype===1){hline(13,18,19,mouthC);set(15,18,mouthC);}
    else if(mtype===2){set(14,19,mouthC);set(17,19,mouthC);}
    else if(mtype===3){hline(14,17,19,mouthC);hline(14,17,20,skinD);}
    else{hline(15,16,19,mouthC);}

    /* ===== 胡须 ===== */
    if(beard>=1){
      fill(13,20,18,22,hair);
      if(beard>=2){
        fill(12,21,19,23,hair);
        fill(14,23,17,24,hairL);
      }
    }

    /* ===== 饰品 ===== */
    if(extra==="tassel"){
      vline(24,8,14,acc);set(24,15,shade(acc,-20));set(25,10,acc);
    }
    if(extra==="beads"){
      set(14,25,acc);set(16,25,acc);set(18,25,acc);
      set(15,26,shade(acc,-15));set(17,26,shade(acc,-15));
    }
    if(extra==="pearl"||extra==="shell"){
      set(8,14,acc);set(23,14,acc);
      set(8,15,shade(acc,20));
    }
    if(extra==="coin"){
      set(22,18,acc);set(23,18,shade(acc,20));set(22,19,shade(acc,-20));
    }
    if(extra==="key"){
      set(23,20,acc);set(24,20,acc);set(24,21,shade(acc,-20));
    }
    if(extra==="herb"||extra==="basket"){
      set(7,18,"#5a8a4a");set(6,19,"#4a7a3a");set(7,20,"#6a9a5a");
    }
    if(extra==="sword"){
      vline(25,12,22,"#a0a8b0");set(25,11,acc);set(25,23,"#6a6050");
    }
    if(extra==="rope"){
      hline(22,25,22,"#8a7a5a");hline(22,25,23,"#6a5a4a");
    }
    if(extra==="metal"){
      fill(10,8,12,10,"#6a7078");fill(19,8,21,10,"#6a7078");
    }
    /* 女耳环 */
    if(g==="女"&&hat==="none"&&extra!=="pearl"){
      set(9,14,acc);set(22,14,acc);
    }
    /* 玩家发带 */
    if(role==="player"){
      hline(11,20,5,acc);
      set(10,5,shade(acc,-20));set(21,5,shade(acc,-20));
    }

    /* 组装 SVG：合并同色可优化，此处直接输出 */
    var rects="";
    var keys=Object.keys(cells);
    for(var i=0;i<keys.length;i++){
      var p=keys[i].split(",");
      rects+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" fill="'+cells[keys[i]]+'"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">'+rects+'</svg>';
  }

  function roleForNpc(npc){
    if(!npc)return"npc";
    var id=npc.id||"";
    if(PRESETS[id]&&PRESETS[id].role)return PRESETS[id].role;
    var title=(npc.title||"")+(npc.desc||"");
    if(/僧|寺|方丈|戒律|知客/.test(title)||/monk|kong_|liao_|wuxiang|jing/.test(id))return"monk";
    if(/影|雀|白雀|蒙面|机关/.test(title)||/^que_|shadow|cave_guard|reef_ghost/.test(id))return"shadow";
    if(/隐士|云叟|老者/.test(title)||id==="hermit")return"elder";
    if(/邪|血屠/.test(title)||id==="xie_ren")return"evil";
    return"npc";
  }

  function avatarHtml(seed,gender,role,size,presetId){
    size=size||"md";
    var svg=pixelAvatarSvg({seed:seed,gender:gender,role:role,presetId:presetId||seed});
    return '<span class="px-avatar '+size+'">'+svg+'</span>';
  }

  window.pixelAvatarSvg=pixelAvatarSvg;
  window.avatarHtml=avatarHtml;
  window.roleForNpc=roleForNpc;

  function playerAvatar(p,size){
    return avatarHtml(p.name||"player",p.gender||"其他","player",size||"md",p.name);
  }
  function npcAvatar(npc,size){
    var g="其他";
    if(typeof getNpcProfile==="function"){
      var pr=getNpcProfile(npc);
      if(pr&&pr.gender){
        var gg=String(pr.gender);
        if(gg.indexOf("女")>=0)g="女";
        else if(gg.indexOf("男")>=0)g="男";
      }
    }
    if(PRESETS[npc.id]&&PRESETS[npc.id].gender)g=PRESETS[npc.id].gender;
    return avatarHtml(npc.id||npc.name,g,roleForNpc(npc),size||"md",npc.id);
  }
  window.playerAvatar=playerAvatar;
  window.npcAvatar=npcAvatar;

  /* —— UI 补丁（与前版相同结构） —— */
  var _rg=renderGame;
  renderGame=function(){
    _rg();
    var p=state&&state.player;if(!p)return;
    var hud=document.querySelector(".hud");
    if(hud&&!hud.querySelector(".px-avatar")){
      var wrap=document.createElement("span");
      wrap.innerHTML=playerAvatar(p,"md");
      hud.insertBefore(wrap,hud.firstChild);
    }
    qsa(".npc-btn").forEach(function(btn){
      if(btn.querySelector(".px-avatar"))return;
      var npc=typeof findPerson==="function"?findPerson(btn.dataset.id):null;
      if(!npc)return;
      btn.classList.add("px-npc-btn");
      var av=document.createElement("span");
      av.innerHTML=npcAvatar(npc,"sm");
      btn.insertBefore(av.firstChild,btn.firstChild);
    });
  };

  function patchModalNpc(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    modalNpc=function(npcId){
      _m(npcId);
      var npc=findPerson(npcId);if(!npc)return;
      var panel=qs("#modalPanel");if(!panel)return;
      var head=panel.querySelector(".modal-head");
      if(!head||head.querySelector(".px-avatar"))return;
      var title=head.querySelector(".section-title");if(!title)return;
      var box=document.createElement("div");
      box.className="px-modal-head";
      box.innerHTML=npcAvatar(npc,"lg");
      title.parentNode.insertBefore(box,title);
      box.appendChild(title);
    };
  }
  patchModalNpc();setTimeout(patchModalNpc,0);

  var _mc=typeof modalChar==="function"?modalChar:null;
  if(_mc){
    modalChar=function(){
      _mc();
      var p=ensurePlayer(state.player);
      var panel=qs("#modalPanel");if(!panel||panel.querySelector(".px-char-avatar"))return;
      var head=panel.querySelector(".modal-head");if(!head)return;
      var title=head.querySelector(".section-title");
      var box=document.createElement("div");
      box.className="px-modal-head px-char-avatar";
      box.innerHTML=playerAvatar(p,"xl");
      if(title){head.insertBefore(box,title);box.appendChild(title);}
      else head.insertBefore(box,head.firstChild);
    };
  }

  var _mr=typeof modalRelations==="function"?modalRelations:null;
  if(_mr){
    modalRelations=function(){
      _mr();
      var panel=qs("#modalPanel");if(!panel)return;
      qsa("[data-npc]",panel).forEach(function(card){
        if(card.querySelector(".px-avatar"))return;
        var npc=findPerson(card.dataset.npc);if(!npc)return;
        var head=card.querySelector(".quest-head");if(!head)return;
        var av=document.createElement("span");
        av.innerHTML=npcAvatar(npc,"sm");
        head.insertBefore(av.firstChild,head.firstChild);
      });
    };
  }

  var _rs=typeof renderStart==="function"?renderStart:null;
  if(_rs){
    renderStart=function(){
      _rs();
      var hero=document.querySelector(".hero-card");
      if(hero&&!hero.querySelector(".px-title-avatars")){
        var row=document.createElement("div");
        row.className="px-title-avatars row";
        row.style.cssText="justify-content:center;margin:8px 0;gap:8px";
        row.innerHTML=
          avatarHtml("demo_m","男","player","lg")+
          avatarHtml("aqing","女","npc","lg","aqing")+
          avatarHtml("que_shadow","其他","shadow","lg","que_shadow")+
          avatarHtml("monk_jing","男","monk","lg","monk_jing")+
          avatarHtml("tieba","男","npc","lg","tieba");
        var title=hero.querySelector(".title");
        if(title&&title.nextSibling)hero.insertBefore(row,title.nextSibling);
        else hero.appendChild(row);
      }
    };
  }

})();
