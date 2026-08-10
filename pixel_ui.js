/* 像素头像 · 对齐参考立绘（墨发/锐眼/开领浅衫/褐绦） */
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
      "  border:2px solid #4b3a2d;box-shadow:2px 2px 0 #0a0806;background:#0a0806;flex-shrink:0;overflow:hidden}",
      ".px-avatar img,.px-avatar svg{display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;image-rendering:crisp-edges}",
      ".px-avatar.sm{width:28px;height:34px}",
      ".px-avatar.md{width:40px;height:48px}",
      ".px-avatar.lg{width:56px;height:68px}",
      ".px-avatar.xl{width:80px;height:96px}",
      ".px-npc-btn{display:inline-flex;align-items:center;gap:4px}",
      ".px-npc-btn .px-avatar{width:24px;height:28px}",
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

  /* 参考立绘色板 */
  var SKINS=["#f0d0b0","#e8c4a0","#dcb089","#c9956a","#b07a50","#9a6840"];
  var HAIRS=["#0c0c0e","#121018","#1a1410","#221810","#2a1c14","#3a2818"];
  var ROBES=["#ebe4d8","#e0d8cc","#d4cfc4","#f2ede4","#c8c0b4","#d8d0c4"];
  var SASHES=["#8a5a3a","#6b4423","#a07048","#5a3a22","#9a6040"];
  var CLOTH_DARK=["#3b2b21","#2a3a4a","#3a2a3a","#2a4a3a","#4a2a2a","#1a2a1a","#2a2a4a"];

  var PRESETS={
    /* 主角默认 = 参考立绘 */
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
   * 40×48 半身像素像
   * 参考图特征：纯黑底、墨黑乱发尖簇、剑眉锐眼高光、开领浅衫、褐绦斜跨
   */
  function pixelAvatarSvg(opts){
    opts=opts||{};
    var seed=opts.seed||"anon";
    var g=opts.gender||"其他";
    var role=opts.role||"npc";
    var presetId=opts.presetId||seed;
    var preset=PRESETS[presetId]||PRESETS[seed]||null;

    /* 玩家默认强制参考立绘风格 */
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

    var skinD=shade(skin,-30), skinL=shade(skin,18), skinM=shade(skin,-14);
    var hairL=shade(hair,28), hairD=shade(hair,-12);
    var robeL=shade(robe,16), robeD=shade(robe,-24);
    var sashD=shade(sash,-22), sashL=shade(sash,18);

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

    var W=40, H=48;
    var cells={};
    function set(x,y,c){if(x>=0&&x<W&&y>=0&&y<H)cells[x+","+y]=c;}
    function fill(x0,y0,x1,y1,c){for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)set(x,y,c);}
    function hline(x0,x1,y,c){for(var x=x0;x<=x1;x++)set(x,y,c);}
    function vline(x,y0,y1,c){for(var y=y0;y<=y1;y++)set(x,y,c);}

    /* 纯黑底 — 对齐参考图 */
    fill(0,0,W-1,H-1,"#050403");

    /* ===== 肩与衣（半身截止） ===== */
    fill(5,33,34,47,robe);
    fill(3,38,36,47,robe);
    fill(2,43,37,47,robeD);
    /* 开领：露出锁骨与胸口 — 参考核心 */
    fill(15,31,24,38,skin);
    fill(16,30,23,32,skin);
    fill(14,33,16,41,robe);
    fill(23,33,25,41,robe);
    hline(15,24,32,robeL);
    /* 衣褶高光/阴影 */
    vline(7,36,46,robeL);
    vline(8,35,42,robeL);
    vline(32,36,46,robeD);
    vline(31,35,42,robeD);
    /* 褐绦斜跨胸前 */
    for(var i=0;i<16;i++){
      var sx=9+i, sy=35+Math.floor(i*0.5);
      set(sx,sy,sash);set(sx,sy+1,sash);set(sx+1,sy,sashD);
      if(i%3===0)set(sx,sy,sashL);
    }
    fill(21,40,29,44,sash);
    fill(23,42,31,46,sashD);

    /* ===== 颈 ===== */
    fill(16,27,23,33,skin);
    vline(16,27,32,skinD);vline(23,27,32,skinD);
    fill(17,32,22,33,skinM);

    /* ===== 脸型（偏瘦、下颌清晰） ===== */
    fill(12,9,27,27,skin);
    fill(13,8,26,8,skin);
    fill(14,7,25,7,skin);
    fill(13,28,26,28,skin);
    fill(14,29,25,29,skin);
    fill(15,30,24,30,skin);
    /* 颧高光 / 右脸阴影 */
    fill(12,13,14,19,skinL);
    fill(25,13,27,20,skinD);
    fill(15,25,24,28,skinM);
    fill(18,26,21,28,skinD);

    /* ===== 发型 ===== */
    drawHair();
    function drawHair(){
      if(style==="monk"){
        fill(14,5,25,12,skin);
        fill(15,4,24,6,skinL);
        set(17,6,"#c0a090");set(20,6,"#c0a090");set(18,5,"#c0a090");
        fill(12,7,13,14,hair);fill(26,7,27,14,hair);
        return;
      }
      if(style==="mask"){
        fill(11,5,28,14,hair);
        fill(10,7,12,22,hair);fill(27,7,29,22,hair);
        fill(12,13,27,22,"#1a1a22");
        fill(13,14,26,19,"#2a2a32");
        fill(22,15,25,18,skin);
        set(23,16,"#e8e8e8");set(24,16,"#1a120c");set(23,17,"#1a120c");
        return;
      }

      /* —— hero：严格对齐参考立绘 —— */
      if(style==="hero"||style==="short"||style==="wild"){
        /* 发顶厚实 + 尖簇 */
        fill(11,3,28,11,hair);
        fill(12,2,27,3,hair);
        fill(13,1,26,2,hairD);
        /* 头顶乱翘 */
        set(17,0,hair);set(18,0,hairD);set(19,0,hair);set(20,0,hairD);set(21,0,hair);
        set(15,1,hair);set(16,1,hair);set(22,1,hair);set(23,1,hair);
        set(14,2,hair);set(24,2,hair);
        /* 两侧蓬起（参考体积感） */
        fill(9,5,12,16,hair);fill(27,5,30,16,hair);
        fill(8,7,10,14,hair);fill(29,7,31,14,hair);
        fill(10,15,12,22,hair);fill(27,15,29,22,hair);
        /* 额前碎发中分感 */
        fill(13,7,17,12,hair);
        fill(22,7,26,12,hair);
        fill(17,8,22,11,hair);
        set(15,11,hairD);set(16,12,hairD);
        set(23,11,hairD);set(24,12,hairD);
        /* 侧发贴颊向下 */
        fill(11,16,13,24,hair);fill(26,16,28,24,hair);
        fill(12,22,13,27,hair);fill(26,22,27,27,hair);
        /* 后发压暗 */
        fill(14,4,25,6,hairD);
        if(style==="hero"){
          set(16,3,hairL);set(22,3,hairL);set(19,2,hairL);
          set(12,6,hairL);set(27,6,hairL);
        }
        if(style==="wild"){
          set(7,6,hair);set(6,9,hair);set(32,6,hair);set(33,9,hair);
          set(13,0,hair);set(25,0,hair);
        }
        return;
      }

      if(style==="long"||style==="twin"){
        fill(11,3,28,12,hair);
        fill(12,2,27,3,hair);
        fill(10,6,12,30,hair);fill(27,6,29,30,hair);
        fill(9,12,10,28,hair);fill(29,12,30,28,hair);
        fill(13,7,18,12,hair);fill(21,7,26,12,hair);
        if(style==="twin"){
          fill(8,3,13,10,hair);fill(26,3,31,10,hair);
          fill(9,2,12,4,hairL);fill(27,2,30,4,hairL);
        }else{
          fill(13,2,26,4,hairL);
        }
        return;
      }
      if(style==="elder"){
        fill(12,3,27,11,hairL);
        fill(11,5,12,14,hairL);fill(27,5,28,14,hairL);
        fill(14,2,25,4,"#e8e4dc");
        return;
      }
      /* neat / short fallback */
      fill(12,3,27,11,hair);
      fill(13,2,26,3,hairL);
      fill(11,6,12,16,hair);fill(27,6,28,16,hair);
      fill(14,7,17,11,hair);fill(22,7,25,11,hair);
    }

    /* ===== 剑眉（参考：细长微挑） ===== */
    if(style!=="mask"){
      var brow=hairD;
      if(g==="女"){
        hline(13,16,11,brow);hline(23,26,11,brow);
        set(16,10,brow);set(23,10,brow);
      }else{
        hline(12,17,11,brow);hline(22,27,11,brow);
        set(17,10,brow);set(22,10,brow);
        hline(13,16,10,brow);hline(23,26,10,brow);
      }
    }

    /* ===== 锐眼 + 高光（参考最大特征） ===== */
    if(style!=="mask"){
      var eyeW="#f8f4ee";
      var iris=role==="evil"?"#8a3030":"#2a2018";
      var pupil="#080604";
      /* 左眼 */
      fill(13,12,17,16,eyeW);
      fill(14,13,16,15,iris);
      set(15,13,pupil);
      set(16,12,"#ffffff"); /* 高光 */
      hline(13,17,16,skinD);
      set(12,13,skinM);set(13,14,skinM);
      /* 右眼 */
      fill(22,12,26,16,eyeW);
      fill(23,13,25,15,iris);
      set(24,13,pupil);
      set(25,12,"#ffffff");
      hline(22,26,16,skinD);
      set(26,13,skinM);set(27,14,skinM);
    }

    if(acc==="scar"){set(18,11,skinD);set(19,12,"#8a4a4a");set(20,13,skinD);}
    if(acc==="burn"){set(26,19,"#a06040");set(27,20,"#8a5040");}
    if(acc==="blood"){set(18,21,"#6a2020");set(19,22,"#8a3030");}

    /* 鼻 */
    set(19,17,skinD);set(20,17,skinM);
    set(20,18,skinD);set(19,18,skinM);

    /* 抿唇（参考：薄、中性） */
    if(g==="女"){
      hline(17,22,22,"#c07070");
      set(19,22,"#d08080");set(20,22,"#d08080");
    }else{
      hline(17,22,22,"#a06858");
      set(18,22,"#8a5848");set(21,22,"#8a5848");
    }

    if(beard>=1){
      fill(16,24,23,28,hair);
      if(beard>=2){fill(15,26,24,30,hairL);fill(17,28,22,31,hairL);}
    }

    if(acc==="tassel"){vline(32,11,22,"#d9ad62");set(32,23,"#8a6a45");set(33,13,"#d9ad62");}
    if(acc==="leaf"){set(18,2,"#5a8a4a");set(19,1,"#6a9a5a");set(20,2,"#5a8a4a");}
    if(acc==="flower"){set(11,7,"#e8a0a0");set(10,8,"#d08080");set(12,8,"#d08080");set(11,8,"#e8c878");}
    if(acc==="pearl"){set(11,15,"#e8e0d0");set(28,15,"#e8e0d0");}
    if(acc==="shell"){set(31,36,"#6a9eae");set(32,37,"#8ab8c8");}
    if(g==="女"&&acc==="none"){set(11,15,"#d9ad62");set(28,15,"#d9ad62");}

    var rects="";
    var keys=Object.keys(cells);
    for(var i=0;i<keys.length;i++){
      var p=keys[i].split(",");
      rects+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" fill="'+cells[keys[i]]+'"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" shape-rendering="crispEdges">'+rects+'</svg>';
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
    /* 主角固定参考立绘 hero 预设，名字作种子微调 */
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

  /* dialog_opt / favor_ui 已自带头像时不再重复插入 */
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
