/* 120×120 精细像素头像 · 参考立绘：墨发锐眼开领褐绦 */
(function(){

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
      "body.pixel-ui .hud{align-items:center;gap:8px}",
      ".px-avatar{display:inline-block;vertical-align:middle;image-rendering:pixelated;image-rendering:crisp-edges;",
      "  border:2px solid #4b3a2d;box-shadow:2px 2px 0 #0a0806;background:#050403;flex-shrink:0;overflow:hidden}",
      ".px-avatar img,.px-avatar svg{display:block;width:100%;height:100%;object-fit:cover;",
      "  image-rendering:pixelated;image-rendering:crisp-edges}",
      /* 显示尺寸：源图 120×120，按场景缩放 */
      ".px-avatar.sm{width:36px;height:36px}",
      ".px-avatar.md{width:56px;height:56px}",
      ".px-avatar.lg{width:88px;height:88px}",
      ".px-avatar.xl{width:120px;height:120px}",
      ".px-npc-btn{display:inline-flex;align-items:center;gap:4px}",
      ".px-npc-btn .px-avatar{width:32px;height:32px}",
      ".px-modal-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}"
    ].join("\n");
    document.head.appendChild(css);
  }
  document.body.classList.add("pixel-ui");

  function hash(str){
    str=String(str||"x");var h=2166136261;
    for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function pick(h,arr){return arr[h%arr.length];}
  function shade(hex,amt){
    hex=String(hex).replace("#","");
    if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var n=parseInt(hex,16);
    if(isNaN(n))return hex;
    var r=Math.max(0,Math.min(255,((n>>16)&255)+amt));
    var g=Math.max(0,Math.min(255,((n>>8)&255)+amt));
    var b=Math.max(0,Math.min(255,(n&255)+amt));
    return"#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  var SKINS=["#f0d0b0","#e8c4a0","#dcb089","#c9956a","#b07a50","#9a6840"];
  var HAIRS=["#0c0c0e","#121018","#1a1410","#221810","#2a1c14","#3a2818"];
  var ROBES=["#ebe4d8","#e0d8cc","#d4cfc4","#f2ede4","#c8c0b4","#d8d0c4"];
  var SASHES=["#8a5a3a","#6b4423","#a07048","#5a3a22","#9a6040"];
  var CLOTH_DARK=["#3b2b21","#2a3a4a","#3a2a3a","#2a4a3a","#4a2a2a","#1a2a1a","#2a2a4a"];

  var PRESETS={
    hero_ref:{skin:0,hair:0,robe:0,sash:1,style:"hero",gender:"男"},
    player:{skin:0,hair:0,robe:0,sash:1,style:"hero",gender:"男"},
    zhou:{skin:3,hair:3,robe:5,sash:1,style:"elder",beard:2},
    su:{skin:1,hair:2,robe:0,sash:0,style:"neat",gender:"女"},
    aqing:{skin:0,hair:1,robe:0,sash:3,style:"long",gender:"女",acc:"leaf"},
    jian_tong:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男"},
    yubo:{skin:4,hair:4,robe:5,sash:1,style:"elder",beard:2},
    luyun:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男",acc:"tassel"},
    yanlan_mei:{skin:0,hair:0,robe:0,sash:0,style:"long",gender:"女",acc:"tassel"},
    huichun_lan:{skin:0,hair:2,robe:0,sash:2,style:"twin",gender:"女",acc:"flower"},
    tieba:{skin:4,hair:0,robe:5,sash:1,style:"wild",beard:1,acc:"scar"},
    que_shadow:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow"},
    monk_jing:{skin:1,hair:0,robe:1,sash:1,style:"monk",role:"monk"},
    hermit:{skin:2,hair:0,robe:5,sash:1,style:"elder",beard:2,role:"elder"},
    xie_ren:{skin:3,hair:0,robe:5,sash:4,style:"wild",role:"evil",acc:"blood"},
    su_wanqing:{skin:0,hair:2,robe:0,sash:2,style:"long",gender:"女"},
    shen_shuheng:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男"},
    shen_tingyun:{skin:0,hair:0,robe:0,sash:0,style:"long",gender:"女",role:"elder"},
    baique_si:{skin:1,hair:0,robe:5,sash:1,style:"mask",role:"shadow"},
    wuxiang_chen:{skin:0,hair:0,robe:1,sash:1,style:"monk",role:"monk"},
    xuan_zhu:{skin:1,hair:1,robe:0,sash:0,style:"neat",gender:"女",acc:"pearl"},
    ao_sailor:{skin:4,hair:0,robe:2,sash:0,style:"short",gender:"男",acc:"shell"},
    helie_npc:{skin:3,hair:2,robe:5,sash:1,style:"short",acc:"burn"},
    shishu:{skin:2,hair:3,robe:5,sash:1,style:"elder",beard:1},
    qianliu:{skin:2,hair:0,robe:5,sash:4,style:"short",gender:"男"},
    stall:{skin:3,hair:4,robe:1,sash:1,style:"elder",gender:"女",beard:0},
    shuizei:{skin:4,hair:0,robe:5,sash:1,style:"wild",acc:"scar"},
    shen_wai:{skin:1,hair:0,robe:0,sash:0,style:"hero",gender:"男"},
    he_forge:{skin:3,hair:4,robe:5,sash:1,style:"elder",beard:1},
    yaotong:{skin:0,hair:2,robe:0,sash:2,style:"long",gender:"女",acc:"flower"},
    reef_ghost:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow"},
    cave_guard:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow"}
  };

  /**
   * 120×120 精细半身像素像
   */
  function pixelAvatarSvg(opts){
    opts=opts||{};
    var seed=opts.seed||"anon";
    var g=opts.gender||"其他";
    var role=opts.role||"npc";
    var presetId=opts.presetId||seed;
    var preset=PRESETS[presetId]||PRESETS[seed]||null;

    if(role==="player" && !PRESETS[presetId]){
      preset={skin:0,hair:0,robe:0,sash:1,style:"hero",gender:g==="女"?"女":"男"};
      if(g==="女"){preset.style="long";preset.sash=2;}
    }
    if(preset){
      if(preset.gender)g=preset.gender;
      if(preset.role)role=preset.role;
    }

    var h=hash(seed+"|"+g+"|"+role);
    var h2=hash(seed+":face");
    var h3=hash(seed+":style");

    var skin=preset?SKINS[preset.skin%SKINS.length]:pick(h,SKINS);
    var hair=preset?HAIRS[preset.hair%HAIRS.length]:pick(h2,HAIRS);
    var robe,sash;
    if(role==="monk"){robe="#c8c4b8";sash="#6a6558";hair="#e8e0d0";}
    else if(role==="shadow"){robe="#1a1a28";sash="#2a2a38";hair="#0a0a0a";}
    else if(role==="evil"){robe="#3a1a1a";sash="#6a2020";}
    else if(role==="player"||(preset&&preset.style==="hero")||(g==="男"&&!preset)){
      robe=preset?ROBES[preset.robe%ROBES.length]:ROBES[0];
      sash=preset?SASHES[preset.sash%SASHES.length]:SASHES[1];
    }else if(g==="女"){
      robe=preset?ROBES[preset.robe%ROBES.length]:pick(h,["#ebe4d8","#d4c8c0","#e0d0d8","#d0d8d0"]);
      sash=preset?SASHES[preset.sash%SASHES.length]:pick(h>>>4,SASHES);
    }else{
      robe=preset?ROBES[(preset.robe||0)%ROBES.length]:pick(h,CLOTH_DARK);
      sash=preset?SASHES[(preset.sash||0)%SASHES.length]:pick(h>>>4,SASHES);
    }

    var skinD=shade(skin,-32), skinL=shade(skin,20), skinM=shade(skin,-14);
    var skinDD=shade(skin,-48), skinLL=shade(skin,32);
    var hairL=shade(hair,30), hairD=shade(hair,-14), hairDD=shade(hair,-28);
    var robeL=shade(robe,18), robeD=shade(robe,-26), robeDD=shade(robe,-40);
    var sashD=shade(sash,-24), sashL=shade(sash,20);

    var style=preset&&preset.style?preset.style:null;
    if(!style){
      if(role==="monk")style="monk";
      else if(role==="shadow")style="mask";
      else if(role==="elder")style="elder";
      else if(role==="player")style="hero";
      else if(g==="女")style=pick(h3,["long","twin","neat","long"]);
      else style=pick(h3,["hero","short","wild","neat"]);
    }
    var beard=preset&&preset.beard!=null?preset.beard:(style==="elder"?2:0);
    var acc=preset&&preset.acc?preset.acc:"none";

    var W=120, H=120;
    var cells={};
    function set(x,y,c){if(x>=0&&x<W&&y>=0&&y<H)cells[x+","+y]=c;}
    function fill(x0,y0,x1,y1,c){
      for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)set(x,y,c);
    }
    function hline(x0,x1,y,c){for(var x=x0;x<=x1;x++)set(x,y,c);}
    function vline(x,y0,y1,c){for(var y=y0;y<=y1;y++)set(x,y,c);}
    function rect(x,y,w,h,c){fill(x,y,x+w-1,y+h-1,c);}

    /* 纯黑底 */
    fill(0,0,W-1,H-1,"#050403");

    /* ========== 肩与衣（约 y=78 起） ========== */
    fill(12,82,107,119,robe);
    fill(6,92,113,119,robe);
    fill(2,104,117,119,robeD);
    fill(0,112,119,119,robeDD);
    /* 开领露肤 */
    fill(44,76,75,92,skin);
    fill(46,74,73,78,skin);
    fill(42,80,48,98,robe);
    fill(71,80,77,98,robe);
    hline(44,75,78,robeL);
    /* 衣褶 */
    vline(18,90,118,robeL);vline(20,88,110,robeL);
    vline(100,90,118,robeD);vline(98,88,110,robeD);
    /* 褐绦斜跨 */
    for(var i=0;i<48;i++){
      var sx=24+i, sy=86+Math.floor(i*0.48);
      set(sx,sy,sash);set(sx,sy+1,sash);set(sx,sy+2,sash);
      set(sx+1,sy,sashD);set(sx+1,sy+1,sashD);
      if(i%4===0)set(sx,sy,sashL);
    }
    fill(62,100,92,112,sash);
    fill(68,106,98,118,sashD);

    /* ========== 颈 ========== */
    fill(48,68,71,82,skin);
    vline(48,68,80,skinD);vline(71,68,80,skinD);
    fill(50,78,69,82,skinM);

    /* ========== 脸（居中偏上） ========== */
    fill(36,22,83,72,skin);
    fill(40,18,79,22,skin);
    fill(44,14,75,18,skin);
    fill(48,12,71,14,skin);
    fill(40,72,79,76,skin);
    fill(44,76,75,78,skin);
    /* 颧骨高光 / 右脸阴影 */
    fill(36,30,44,50,skinL);
    fill(76,30,83,52,skinD);
    fill(44,62,75,72,skinM);
    fill(52,66,67,74,skinD);
    /* 下颌轮廓 */
    hline(42,77,73,skinDD);

    /* ========== 发型 ========== */
    drawHair();
    function drawHair(){
      if(style==="monk"){
        fill(42,14,77,32,skin);
        fill(46,10,73,16,skinL);
        set(52,16,"#c0a090");set(60,14,"#c0a090");set(68,16,"#c0a090");
        fill(36,18,42,36,hair);fill(77,18,83,36,hair);
        return;
      }
      if(style==="mask"){
        fill(32,12,87,36,hair);
        fill(28,18,36,58,hair);fill(83,18,91,58,hair);
        fill(36,34,83,60,"#1a1a22");
        fill(40,36,79,52,"#2a2a32");
        fill(66,40,76,50,skin);
        set(70,44,"#e8e8e8");set(72,44,"#1a120c");set(70,46,"#1a120c");
        return;
      }

      /* hero / short / wild — 对齐参考立绘 */
      if(style==="hero"||style==="short"||style==="wild"){
        /* 发顶厚实 */
        fill(30,8,89,30,hair);
        fill(34,4,85,10,hair);
        fill(38,2,81,6,hairD);
        fill(42,0,77,3,hairDD);
        /* 尖簇乱翘 */
        for(var t=0;t<9;t++){
          var tx=48+t*4;
          set(tx,0,hair);set(tx+1,0,hairD);set(tx,1,hair);
          set(tx-1,2,hair);set(tx+2,2,hairD);
        }
        set(44,1,hair);set(74,1,hair);
        set(40,3,hair);set(78,3,hair);
        /* 两侧体积 */
        fill(24,12,36,44,hair);fill(83,12,95,44,hair);
        fill(20,16,28,38,hair);fill(91,16,99,38,hair);
        fill(26,40,36,58,hair);fill(83,40,93,58,hair);
        fill(28,56,38,70,hair);fill(81,56,91,70,hair);
        /* 额前碎发 */
        fill(38,18,52,32,hair);
        fill(67,18,81,32,hair);
        fill(50,20,69,28,hair);
        fill(42,28,48,34,hairD);fill(71,28,77,34,hairD);
        /* 侧发贴颊 */
        fill(32,44,40,68,hair);fill(79,44,87,68,hair);
        fill(34,64,42,76,hair);fill(77,64,85,76,hair);
        /* 后发压暗 */
        fill(42,8,77,16,hairD);
        if(style==="hero"){
          set(48,6,hairL);set(56,4,hairL);set(64,6,hairL);
          set(32,14,hairL);set(87,14,hairL);
          set(40,10,hairL);set(79,10,hairL);
        }
        if(style==="wild"){
          set(16,14,hair);set(14,20,hair);set(104,14,hair);set(106,20,hair);
          set(36,0,hair);set(82,0,hair);
        }
        return;
      }

      if(style==="long"||style==="twin"){
        fill(30,8,89,32,hair);
        fill(34,4,85,10,hair);
        fill(26,14,36,78,hair);fill(83,14,93,78,hair);
        fill(22,28,30,74,hair);fill(89,28,97,74,hair);
        fill(38,18,54,32,hair);fill(65,18,81,32,hair);
        if(style==="twin"){
          fill(22,6,40,28,hair);fill(79,6,97,28,hair);
          fill(26,4,36,10,hairL);fill(83,4,93,10,hairL);
        }else{
          fill(38,4,81,10,hairL);
        }
        return;
      }
      if(style==="elder"){
        fill(34,8,85,28,hairL);
        fill(30,12,36,36,hairL);fill(83,12,89,36,hairL);
        fill(42,4,77,10,"#e8e4dc");
        return;
      }
      /* neat */
      fill(34,8,85,28,hair);
      fill(38,4,81,10,hairL);
      fill(30,14,36,42,hair);fill(83,14,89,42,hair);
      fill(40,18,52,28,hair);fill(67,18,79,28,hair);
    }

    /* ========== 剑眉 ========== */
    if(style!=="mask"){
      var brow=hairD;
      if(g==="女"){
        hline(40,50,26,brow);hline(69,79,26,brow);
        set(50,25,brow);set(69,25,brow);
        hline(42,48,25,brow);hline(71,77,25,brow);
      }else{
        hline(38,52,26,brow);hline(67,81,26,brow);
        set(52,25,brow);set(67,25,brow);
        hline(40,50,25,brow);hline(69,79,25,brow);
        hline(42,48,24,brow);hline(71,77,24,brow);
      }
    }

    /* ========== 锐眼 + 高光 ========== */
    if(style!=="mask"){
      var eyeW="#f8f4ee";
      var iris=role==="evil"?"#8a3030":"#2a2018";
      var pupil="#080604";
      /* 左眼 */
      fill(40,30,52,42,eyeW);
      fill(42,32,50,40,iris);
      fill(44,34,48,38,pupil);
      set(48,32,"#ffffff");set(49,33,"#ffffff"); /* 高光 */
      hline(40,52,42,skinD);
      set(38,32,skinM);set(39,34,skinM);
      /* 右眼 */
      fill(67,30,79,42,eyeW);
      fill(69,32,77,40,iris);
      fill(71,34,75,38,pupil);
      set(75,32,"#ffffff");set(76,33,"#ffffff");
      hline(67,79,42,skinD);
      set(80,32,skinM);set(81,34,skinM);
    }

    if(acc==="scar"){
      set(56,28,skinD);set(58,30,"#8a4a4a");set(60,32,skinD);
      set(57,29,"#8a4a4a");set(59,31,skinD);
    }
    if(acc==="burn"){
      fill(78,50,84,56,"#a06040");set(82,54,"#8a5040");
    }
    if(acc==="blood"){
      set(56,56,"#6a2020");set(58,58,"#8a3030");set(57,57,"#6a2020");
    }

    /* 鼻 */
    set(58,46,skinD);set(60,46,skinM);
    set(60,48,skinD);set(58,48,skinM);
    set(59,50,skinD);

    /* 抿唇 */
    if(g==="女"){
      hline(52,67,58,"#c07070");
      set(58,58,"#d08080");set(60,58,"#d08080");
      hline(54,65,59,"#b06060");
    }else{
      hline(52,67,58,"#a06858");
      set(54,58,"#8a5848");set(65,58,"#8a5848");
      hline(54,65,59,"#8a5848");
    }

    if(beard>=1){
      fill(48,62,71,74,hair);
      if(beard>=2){
        fill(44,68,75,80,hairL);
        fill(50,74,69,84,hairL);
      }
    }

    /* 饰品 */
    if(acc==="tassel"){
      vline(100,28,58,"#d9ad62");vline(101,28,58,"#c49a50");
      set(100,60,"#8a6a45");set(102,32,"#d9ad62");
    }
    if(acc==="leaf"){
      set(56,4,"#5a8a4a");set(58,2,"#6a9a5a");set(60,4,"#5a8a4a");
      set(57,3,"#6a9a5a");set(59,3,"#5a8a4a");
    }
    if(acc==="flower"){
      set(32,18,"#e8a0a0");set(30,20,"#d08080");set(34,20,"#d08080");
      set(32,20,"#e8c878");set(32,22,"#d08080");
    }
    if(acc==="pearl"){
      set(34,40,"#e8e0d0");set(85,40,"#e8e0d0");
      set(34,41,"#d0c8b8");set(85,41,"#d0c8b8");
    }
    if(acc==="shell"){
      set(96,92,"#6a9eae");set(98,94,"#8ab8c8");set(97,93,"#7aacbc");
    }
    if(g==="女"&&acc==="none"){
      set(34,40,"#d9ad62");set(85,40,"#d9ad62");
    }

    /* 输出：合并同色矩形可减小体积，这里按像素输出保证 crispEdges */
    var rects="";
    var keys=Object.keys(cells);
    for(var i=0;i<keys.length;i++){
      var p=keys[i].split(",");
      rects+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" fill="'+cells[keys[i]]+'"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" shape-rendering="crispEdges">'+rects+'</svg>';
  }

  function roleForNpc(npc){
    if(!npc)return"npc";
    var id=npc.id||"";
    if(PRESETS[id]&&PRESETS[id].role)return PRESETS[id].role;
    var title=(npc.title||"")+(npc.desc||"");
    if(/僧|寺|方丈/.test(title)||/monk|kong_|liao_|wuxiang|jing/.test(id))return"monk";
    if(/影|雀|蒙面|机关|遗迹/.test(title)||/^que_|shadow|cave_guard|reef/.test(id))return"shadow";
    if(/隐士|云叟/.test(title)||id==="hermit")return"elder";
    if(/邪|血屠/.test(title)||id==="xie_ren")return"evil";
    return"npc";
  }

  function avatarHtml(seed,gender,role,size,presetId){
    size=size||"md";
    var svg=pixelAvatarSvg({seed:seed,gender:gender,role:role||"npc",presetId:presetId||seed});
    return '<span class="px-avatar '+size+'">'+svg+'</span>';
  }

  window.pixelAvatarSvg=pixelAvatarSvg;
  window.avatarHtml=avatarHtml;
  window.roleForNpc=roleForNpc;

  function playerAvatar(p,size){
    var g=p.gender||"男";
    return avatarHtml(p.name||"player",g,"player",size||"md","hero_ref");
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

  var _rg=renderGame;
  renderGame=function(){
    _rg();
    var p=state&&state.player;if(!p)return;
    var hud=document.querySelector(".hud");
    if(hud){
      var old=hud.querySelector(".px-avatar");
      if(old)old.parentNode.removeChild(old);
      var wrap=document.createElement("span");
      wrap.innerHTML=playerAvatar(p,"md");
      hud.insertBefore(wrap.firstChild,hud.firstChild);
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
    modalNpc=function(npcId,opts){
      _m(npcId,opts);
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
      var panel=qs("#modalPanel");if(!panel)return;
      var exist=panel.querySelector(".px-char-avatar");
      if(exist)exist.parentNode.removeChild(exist);
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
        row.style.cssText="justify-content:center;margin:8px 0;gap:6px";
        row.innerHTML=
          avatarHtml("hero_ref","男","player","lg","hero_ref")+
          avatarHtml("aqing","女","npc","lg","aqing")+
          avatarHtml("luyun","男","npc","lg","luyun")+
          avatarHtml("que_shadow","其他","shadow","lg","que_shadow")+
          avatarHtml("monk_jing","男","monk","lg","monk_jing");
        var title=hero.querySelector(".title");
        if(title&&title.nextSibling)hero.insertBefore(row,title.nextSibling);
        else hero.appendChild(row);
      }
    };
  }

})();
