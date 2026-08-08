/* 像素风格 UI · 参考立绘精细化头像 */
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
      ".px-avatar img,.px-avatar svg{display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated}",
      ".px-avatar.sm{width:28px;height:28px}",
      ".px-avatar.md{width:48px;height:48px}",
      ".px-avatar.lg{width:72px;height:72px}",
      ".px-avatar.xl{width:96px;height:96px}",
      ".px-npc-btn{display:inline-flex;align-items:center;gap:4px}",
      ".px-npc-btn .px-avatar{width:24px;height:24px}",
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

  /* 参考立绘色板：浅色开领劲装 + 褐绦 + 墨发 */
  var SKINS=["#f2d2b4","#e8c4a0","#dcb089","#c9956a","#b07a50","#9a6840"];
  var HAIRS=["#0a0a0c","#121018","#1a1410","#221810","#2a1c14","#3a2818"];
  var ROBES=["#e8e0d4","#d4cfc4","#c8c0b4","#f0ebe4","#d0c8bc","#e0d8cc"];
  var SASHES=["#8a5a3a","#6b4423","#a07048","#5a3a22","#9a6040"];
  var CLOTH_DARK=["#3b2b21","#2a3a4a","#3a2a3a","#2a4a3a","#4a2a2a","#1a2a1a","#2a2a4a"];

  var PRESETS={
    zhou:{skin:3,hair:3,robe:1,sash:1,style:"elder",beard:2},
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
    helie_npc:{skin:3,hair:2,robe:5,sash:1,style:"short",acc:"burn"}
  };

  /**
   * 40×48 半身像风格像素头像（参考用户立绘：墨发、凌厉眼、开领浅衫、褐绦）
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
    var h2=hash(seed+":face");
    var h3=hash(seed+":style");

    var skin=preset?SKINS[preset.skin%SKINS.length]:pick(h,SKINS);
    var hair=preset?HAIRS[preset.hair%HAIRS.length]:pick(h2,HAIRS);
    var robe,sash;
    if(role==="monk"){robe="#c8c4b8";sash="#6a6558";hair="#e8e0d0";}
    else if(role==="shadow"){robe="#1a1a28";sash="#2a2a38";hair="#0a0a0a";}
    else if(role==="evil"){robe="#3a1a1a";sash="#6a2020";}
    else if(role==="player"||(preset&&preset.style==="hero")||g==="男"&&!preset){
      /* 参考立绘：浅色开领 */
      robe=preset?ROBES[preset.robe%ROBES.length]:pick(h,ROBES);
      sash=preset?SASHES[preset.sash%SASHES.length]:pick(h>>>4,SASHES);
    }else if(g==="女"){
      robe=preset?ROBES[preset.robe%ROBES.length]:pick(h,["#e8e0d4","#d4c8c0","#e0d0d8","#d0d8d0"]);
      sash=preset?SASHES[preset.sash%SASHES.length]:pick(h>>>4,SASHES);
    }else{
      robe=preset?ROBES[(preset.robe||0)%ROBES.length]:pick(h,CLOTH_DARK);
      sash=preset?SASHES[(preset.sash||0)%SASHES.length]:pick(h>>>4,SASHES);
    }

    var skinD=shade(skin,-28), skinL=shade(skin,20), skinM=shade(skin,-12);
    var hairL=shade(hair,30), hairD=shade(hair,-15);
    var robeL=shade(robe,18), robeD=shade(robe,-22);
    var sashD=shade(sash,-20);

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

    /* 纯黑背景（参考立绘） */
    fill(0,0,W-1,H-1,"#0a0806");

    /* ===== 肩与衣 ===== */
    fill(6,34,33,47,robe);
    fill(4,38,35,47,robe);
    fill(3,42,36,47,robeD);
    /* 开领 —— 参考图核心特征 */
    fill(15,32,24,38,skin);
    fill(14,34,16,40,robe);
    fill(23,34,25,40,robe);
    hline(15,24,33,robeL);
    /* 左襟高光 */
    vline(8,36,46,robeL);
    vline(9,35,40,robeL);
    /* 右襟阴影 */
    vline(31,36,46,robeD);
    /* 褐绦斜跨（参考图） */
    for(var i=0;i<14;i++){
      var sx=10+i, sy=36+Math.floor(i*0.55);
      set(sx,sy,sash);set(sx,sy+1,sash);set(sx+1,sy,sashD);
    }
    fill(22,40,28,43,sash);
    fill(24,42,30,45,sashD);

    /* ===== 颈 ===== */
    fill(16,28,23,34,skin);
    vline(16,28,33,skinD);vline(23,28,33,skinD);
    fill(17,33,22,34,skinM);

    /* ===== 脸 ===== */
    fill(12,10,27,28,skin);
    fill(13,9,26,9,skin);
    fill(14,8,25,8,skin);
    fill(13,29,26,29,skin);
    fill(14,30,25,30,skin);
    /* 颧骨与下颌 */
    fill(12,14,14,20,skinL);
    fill(25,14,27,20,skinD);
    fill(15,26,24,28,skinM);
    fill(18,27,21,28,skinD);

    /* ===== 发型（参考：额前碎发、两侧蓬起、后发压黑） ===== */
    drawHair();
    function drawHair(){
      if(style==="monk"){
        fill(14,6,25,12,skin);
        fill(15,5,24,7,skinL);
        set(17,7,"#c0a090");set(20,7,"#c0a090");set(18,6,"#c0a090");
        fill(13,8,14,12,hair);fill(25,8,26,12,hair);
        return;
      }
      if(style==="mask"){
        fill(11,6,28,14,hair);
        fill(10,8,12,22,hair);fill(27,8,29,22,hair);
        fill(12,14,27,22,"#1a1a22");
        fill(13,15,26,20,"#2a2a32");
        fill(22,16,25,19,skin);
        set(23,17,"#e8e8e8");set(24,17,"#1a120c");set(23,18,"#1a120c");
        return;
      }
      /* 通用发顶 */
      fill(12,4,27,11,hair);
      fill(13,3,26,4,hair);
      fill(14,2,25,3,hairD);
      fill(11,6,12,14,hair);fill(27,6,28,14,hair);
      fill(10,8,11,16,hair);fill(28,8,29,16,hair);

      if(style==="hero"||style==="short"||style==="wild"){
        /* 参考立绘：头顶尖簇、额前中分碎发 */
        set(18,1,hair);set(19,1,hairD);set(20,1,hair);
        set(17,2,hair);set(21,2,hair);
        set(15,2,hair);set(23,2,hair);
        /* 额前 */
        fill(14,8,17,12,hair);
        fill(22,8,25,12,hair);
        fill(18,9,21,11,hair);
        set(16,11,hairD);set(23,11,hairD);
        /* 侧发贴脸 */
        fill(11,12,13,20,hair);fill(26,12,28,20,hair);
        fill(12,18,13,24,hair);fill(26,18,27,24,hair);
        if(style==="wild"){
          set(9,6,hair);set(8,8,hair);set(30,6,hair);set(31,8,hair);
          set(14,1,hair);set(25,1,hair);
        }
        if(style==="hero"){
          /* 发丝高光 */
          set(16,4,hairL);set(22,4,hairL);set(19,3,hairL);
        }
        return;
      }
      if(style==="long"||style==="twin"){
        fill(10,6,12,28,hair);fill(27,6,29,28,hair);
        fill(9,12,10,26,hair);fill(29,12,30,26,hair);
        fill(14,8,18,12,hair);fill(21,8,25,12,hair);
        if(style==="twin"){
          fill(9,4,13,10,hair);fill(26,4,30,10,hair);
          fill(10,3,12,5,hairL);fill(27,3,29,5,hairL);
        }else{
          fill(13,3,26,5,hairL);
        }
        return;
      }
      if(style==="elder"){
        fill(12,4,27,10,hairL);
        fill(11,6,12,12,hairL);fill(27,6,28,12,hairL);
        fill(14,3,25,4,"#e8e4dc");
        return;
      }
      if(style==="neat"||style==="twin"){
        fill(13,3,26,5,hairL);
        fill(14,8,25,10,hair);
        return;
      }
      fill(14,8,17,11,hair);fill(22,8,25,11,hair);
    }

    /* ===== 眉（参考：剑眉） ===== */
    if(style!=="mask"){
      var brow=hairD;
      if(g==="女"){
        hline(13,16,12,brow);hline(23,26,12,brow);
        set(16,11,brow);set(23,11,brow);
      }else{
        hline(13,17,12,brow);hline(22,26,12,brow);
        set(17,11,brow);set(22,11,brow);
        hline(13,16,11,brow);hline(23,26,11,brow);
      }
    }

    /* ===== 眼（参考：大而锐利、有高光） ===== */
    if(style!=="mask"){
      var eyeW="#f5f0ea";
      var iris=role==="evil"?"#8a3030":"#2a2218";
      var pupil="#0a0806";
      /* 左 */
      fill(13,13,17,16,eyeW);
      fill(14,14,16,15,iris);
      set(15,14,pupil);set(16,13,"#ffffff");
      hline(13,17,17,skinD);
      /* 右 */
      fill(22,13,26,16,eyeW);
      fill(23,14,25,15,iris);
      set(24,14,pupil);set(25,13,"#ffffff");
      hline(22,26,17,skinD);
      /* 眼角 */
      set(13,14,skinM);set(26,14,skinM);
    }

    /* 疤/伤 */
    if(acc==="scar"){set(18,12,skinD);set(19,13,"#8a4a4a");set(20,14,skinD);}
    if(acc==="burn"){set(26,20,"#a06040");set(27,21,"#8a5040");}
    if(acc==="blood"){set(18,22,"#6a2020");set(19,23,"#8a3030");}

    /* ===== 鼻 ===== */
    set(19,18,skinD);set(20,18,skinM);set(20,19,skinD);set(19,19,skinM);

    /* ===== 嘴（参考：抿唇） ===== */
    if(g==="女"){
      hline(17,22,23,"#c07070");set(19,23,"#d08080");set(20,23,"#d08080");
    }else{
      hline(17,22,23,"#a06858");
      set(18,23,"#8a5848");set(21,23,"#8a5848");
    }

    /* ===== 须 ===== */
    if(beard>=1){
      fill(16,25,23,28,hair);
      if(beard>=2){fill(15,27,24,30,hairL);fill(17,29,22,31,hairL);}
    }

    /* 饰品 */
    if(acc==="tassel"){vline(32,12,22,"#d9ad62");set(32,23,"#8a6a45");set(33,14,"#d9ad62");}
    if(acc==="leaf"){set(18,3,"#5a8a4a");set(19,2,"#6a9a5a");set(20,3,"#5a8a4a");}
    if(acc==="flower"){set(11,8,"#e8a0a0");set(10,9,"#d08080");set(12,9,"#d08080");set(11,9,"#e8c878");}
    if(acc==="pearl"){set(11,16,"#e8e0d0");set(28,16,"#e8e0d0");}
    if(acc==="shell"){set(31,36,"#6a9eae");set(32,37,"#8ab8c8");}
    if(g==="女"&&acc==="none"){set(11,16,"#d9ad62");set(28,16,"#d9ad62");}

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
    if(/影|雀|蒙面|机关/.test(title)||/^que_|shadow|cave_guard|reef/.test(id))return"shadow";
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
        row.style.cssText="justify-content:center;margin:8px 0;gap:6px";
        row.innerHTML=
          avatarHtml("hero_ref","男","player","lg")+
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
