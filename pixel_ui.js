/* 像素风格 UI · 程序化头像 */
(function(){

  /* —— 注入像素风样式 —— */
  var css=document.createElement("style");
  css.id="pixel-ui-style";
  css.textContent=[
    "body.pixel-ui{",
    "  image-rendering:pixelated;",
    "  font-smooth:never;",
    "  -webkit-font-smoothing:none;",
    "}",
    "body.pixel-ui .panel,body.pixel-ui .hero-card,body.pixel-ui .modal-panel{",
    "  border-radius:0 !important;",
    "  border-width:3px !important;",
    "  border-style:solid !important;",
    "  border-color:#3a2a1c #1a120c #1a120c #3a2a1c !important;",
    "  box-shadow:4px 4px 0 #0a0806, inset 1px 1px 0 rgba(217,173,98,.15) !important;",
    "}",
    "body.pixel-ui .btn{",
    "  border-radius:0 !important;",
    "  border-width:2px !important;",
    "  border-color:#6b503a #2a1c12 #2a1c12 #6b503a !important;",
    "  box-shadow:2px 2px 0 #0a0806;",
    "  image-rendering:pixelated;",
    "  text-shadow:1px 1px 0 #000;",
    "}",
    "body.pixel-ui .btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #0a0806}",
    "body.pixel-ui .btn.primary{",
    "  border-color:var(--gold) #5a4020 #5a4020 var(--gold) !important;",
    "  background:#5a3a22 !important;",
    "}",
    "body.pixel-ui .map-node,body.pixel-ui .choice,body.pixel-ui .quest-card,",
    "body.pixel-ui .master-card,body.pixel-ui .item-icon,body.pixel-ui .talk-bubble,",
    "body.pixel-ui .log,body.pixel-ui .tag,body.pixel-ui .rank-tag,body.pixel-ui .equip-slot{",
    "  border-radius:0 !important;",
    "}",
    "body.pixel-ui .map-node{",
    "  border-width:2px !important;",
    "  border-color:#4b3a2d #1a120c #1a120c #4b3a2d !important;",
    "  box-shadow:2px 2px 0 #0a0806;",
    "}",
    "body.pixel-ui .map-node.current{",
    "  border-color:var(--gold) !important;",
    "  box-shadow:0 0 0 2px rgba(217,173,98,.35), 2px 2px 0 #0a0806;",
    "}",
    "body.pixel-ui .title{",
    "  letter-spacing:2px;",
    "  text-shadow:3px 3px 0 #000, -1px -1px 0 #5a4020;",
    "}",
    "body.pixel-ui .section-title{",
    "  text-shadow:1px 1px 0 #000;",
    "}",
    "body.pixel-ui .favor-bar,body.pixel-ui .quest-bar{",
    "  border-radius:0 !important;",
    "  border-width:2px !important;",
    "  height:10px !important;",
    "}",
    "body.pixel-ui .favor-fill,body.pixel-ui .quest-fill{",
    "  border-radius:0 !important;",
    "  image-rendering:pixelated;",
    "}",
    "body.pixel-ui .modal-mask{",
    "  background:rgba(0,0,0,.65);",
    "}",
    "body.pixel-ui .hud{",
    "  align-items:center;",
    "  gap:8px;",
    "}",
    ".px-avatar{",
    "  display:inline-block;",
    "  vertical-align:middle;",
    "  image-rendering:pixelated;",
    "  image-rendering:crisp-edges;",
    "  border:2px solid #4b3a2d;",
    "  box-shadow:2px 2px 0 #0a0806;",
    "  background:#1a1512;",
    "  flex-shrink:0;",
    "}",
    ".px-avatar svg{display:block;width:100%;height:100%}",
    ".px-avatar.sm{width:28px;height:28px}",
    ".px-avatar.md{width:40px;height:40px}",
    ".px-avatar.lg{width:56px;height:56px}",
    ".px-avatar.xl{width:72px;height:72px}",
    ".px-hud-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    ".px-npc-btn{display:inline-flex;align-items:center;gap:4px}",
    ".px-npc-btn .px-avatar{width:22px;height:22px}",
    ".px-modal-head{display:flex;align-items:center;gap:10px}",
    ".px-scanlines::after{",
    "  content:'';pointer-events:none;position:fixed;inset:0;z-index:9999;",
    "  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);",
    "  opacity:.5;",
    "}"
  ].join("\n");
  document.head.appendChild(css);
  document.body.classList.add("pixel-ui");

  /* —— 程序化像素头像 —— */
  function hash(str){
    str=String(str||"x");
    var h=2166136261;
    for(var i=0;i<str.length;i++){
      h^=str.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }
  function pick(h,arr){return arr[h%arr.length];}

  var SKINS=["#e8c4a0","#d4a574","#c68642","#f5d0b0","#a67c52","#8d5524"];
  var HAIRS=["#1a120c","#2c1810","#4a3728","#6b4423","#3d2b1f","#0d0d0d","#5c4033","#8b6914"];
  var CLOTH=["#3b2b21","#4a3a2a","#2a3a4a","#3a2a3a","#2a4a3a","#5a3a22","#1a2a1a","#4a2a2a","#2a2a4a","#6b4630"];
  var ACC=["#d9ad62","#b85b53","#7aae6a","#6a9eae","#c47a5a","#e8a0a0","#8a6a45"];

  /**
   * 16x16 像素脸：返回 SVG 字符串
   * opts: {seed, gender, role} role: player|npc|monk|shadow|elder|evil
   */
  function pixelAvatarSvg(opts){
    opts=opts||{};
    var seed=opts.seed||"anon";
    var g=opts.gender||"其他";
    var role=opts.role||"npc";
    var h=hash(seed+"|"+g+"|"+role);
    var h2=hash(seed+"rev");

    var skin=pick(h,SKINS);
    var hair=pick(h2,HAIRS);
    var cloth=pick(h>>>4,CLOTH);
    var acc=pick(h>>>8,ACC);
    if(role==="monk"){cloth="#6a6a5a";hair="#e8e0d0";}
    if(role==="shadow"){cloth="#1a1a22";hair="#0a0a0a";skin=pick(h,["#c4a882","#a08060"]);}
    if(role==="elder"){hair="#d8d0c0";cloth="#4a4035";}
    if(role==="evil"){cloth="#4a1a1a";acc="#b85b53";}
    if(role==="player"){cloth=pick(h,["#5a3a22","#3a4a5a","#4a3a4a","#3a5a3a"]);}

    var S=16; /* 网格 */
    var cells={}; /* "x,y" -> color */
    function set(x,y,c){if(x>=0&&x<S&&y>=0&&y<S)cells[x+","+y]=c;}
    function fill(x0,y0,x1,y1,c){
      for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)set(x,y,c);
    }

    /* 背景 */
    fill(0,0,15,15,"#1a1512");

    /* 衣领/肩 底部 */
    fill(3,13,12,15,cloth);
    fill(2,14,13,15,cloth);

    /* 脖子 */
    fill(6,11,9,13,skin);

    /* 脸 */
    fill(4,4,11,11,skin);
    fill(5,3,10,3,skin);
    fill(5,12,10,12,skin);

    /* 发型 */
    var hairStyle=h%5;
    if(g==="女"||(g!=="男"&&(h%3===0))){
      /* 长发/披发 */
      fill(3,2,12,5,hair);
      fill(2,3,3,11,hair);
      fill(12,3,13,11,hair);
      if(hairStyle===0){fill(2,8,2,12,hair);fill(13,8,13,12,hair);}
      if(hairStyle===1){fill(4,2,5,2,hair);fill(10,2,11,2,hair);} /* 双髻感 */
      if(hairStyle===2){fill(3,1,12,2,hair);}
    }else if(role==="elder"||g==="男"){
      fill(4,2,11,4,hair);
      fill(3,3,3,5,hair);
      fill(12,3,12,5,hair);
      if(hairStyle===0)fill(5,1,10,2,hair);
      if(hairStyle===1){fill(3,4,3,6,hair);fill(12,4,12,6,hair);} /* 鬓 */
      if(role==="elder"){fill(5,2,10,3,"#d8d0c0");fill(4,10,5,11,hair);fill(10,10,11,11,hair);} /* 须意 */
    }else{
      fill(4,2,11,5,hair);
      fill(3,3,13,4,hair);
    }

    /* 刘海 */
    if(h%2===0)fill(5,3,10,4,hair);
    else{fill(5,3,7,4,hair);fill(9,3,11,4,hair);}

    /* 眼睛 */
    var eyeY=7;
    set(5,eyeY,"#1a120c");set(6,eyeY,"#1a120c");
    set(9,eyeY,"#1a120c");set(10,eyeY,"#1a120c");
    if(role==="shadow"){
      fill(4,6,7,8,"#1a1a22"); /* 半面具 */
      set(9,eyeY,"#1a120c");set(10,eyeY,"#c0c0c0");
    }
    if(role==="evil"){
      set(5,eyeY,"#b85b53");set(6,eyeY,"#1a120c");
      set(9,eyeY,"#1a120c");set(10,eyeY,"#b85b53");
    }

    /* 嘴 */
    var mouth=h%4;
    if(mouth===0){set(7,10,"#8a5a4a");set(8,10,"#8a5a4a");}
    else if(mouth===1){set(6,10,"#8a5a4a");set(7,10,"#8a5a4a");set(8,10,"#8a5a4a");}
    else if(mouth===2){set(7,9,"#8a5a4a");set(7,10,"#8a5a4a");set(8,10,"#8a5a4a");}
    else{set(6,10,"#8a5a4a");set(8,10,"#8a5a4a");}

    /* 饰品：发带/耳环/剑穗感 */
    if(role==="player"||h%3===1){
      fill(4,2,11,2,acc);
    }
    if(g==="女"&&h%2===0){
      set(3,7,acc);set(12,7,acc);
    }
    if(role==="monk"){
      fill(6,1,9,2,"#e8e0d0"); /* 戒疤/头顶 */
      fill(5,2,10,2,hair);
    }

    /* 组装 SVG */
    var rects="";
    Object.keys(cells).forEach(function(k){
      var p=k.split(",");
      var x=+p[0],y=+p[1],c=cells[k];
      rects+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+c+'"/>';
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">'+rects+'</svg>';
  }

  function roleForNpc(npc){
    if(!npc)return"npc";
    var id=npc.id||"";
    var title=(npc.title||"")+(npc.desc||"");
    if(/僧|寺|方丈|戒律|知客/.test(title)||/monk|kong_|liao_|wuxiang|jing|chen/.test(id))return"monk";
    if(/影|雀|白雀|蒙面/.test(title)||/^que_|shadow|cave_guard/.test(id))return"shadow";
    if(/隐士|云叟|老者|方丈/.test(title)||id==="hermit"||id==="kong_guan")return"elder";
    if(/邪|血屠|血石/.test(title)||id==="xie_ren")return"evil";
    return"npc";
  }

  function avatarHtml(seed,gender,role,size){
    size=size||"md";
    var svg=pixelAvatarSvg({seed:seed,gender:gender,role:role});
    return '<span class="px-avatar '+size+'" title="">'+svg+'</span>';
  }

  window.pixelAvatarSvg=pixelAvatarSvg;
  window.avatarHtml=avatarHtml;
  window.roleForNpc=roleForNpc;

  function playerAvatar(p,size){
    return avatarHtml(p.name||"player",p.gender||"其他","player",size||"md");
  }
  function npcAvatar(npc,size){
    var g=typeof npcGender==="function"?npcGender(npc):(npc.gender||"其他");
    if(typeof getNpcProfile==="function"){
      var pr=getNpcProfile(npc);
      if(pr&&pr.gender){
        var gg=String(pr.gender);
        if(gg.indexOf("女")>=0)g="女";
        else if(gg.indexOf("男")>=0)g="男";
        else g="其他";
      }
    }
    return avatarHtml(npc.id||npc.name,g,roleForNpc(npc),size||"md");
  }
  window.playerAvatar=playerAvatar;
  window.npcAvatar=npcAvatar;

  /* —— 补丁：主界面 HUD 头像 —— */
  var _rg=renderGame;
  renderGame=function(){
    _rg();
    var p=state&&state.player;if(!p)return;
    var hud=document.querySelector(".hud");
    if(hud&&!hud.querySelector(".px-avatar")){
      var wrap=document.createElement("span");
      wrap.className="px-hud-avatar";
      wrap.innerHTML=playerAvatar(p,"md");
      hud.insertBefore(wrap,hud.firstChild);
    }
    /* 地图人物按钮加小头像 */
    qsa(".npc-btn").forEach(function(btn){
      if(btn.querySelector(".px-avatar"))return;
      var id=btn.dataset.id;
      var npc=typeof findPerson==="function"?findPerson(id):null;
      if(!npc)return;
      btn.classList.add("px-npc-btn");
      var av=document.createElement("span");
      av.innerHTML=npcAvatar(npc,"sm");
      btn.insertBefore(av.firstChild,btn.firstChild);
    });
  };

  /* —— 补丁：NPC 对话头像 —— */
  function patchModalNpc(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    modalNpc=function(npcId){
      _m(npcId);
      var npc=findPerson(npcId);if(!npc)return;
      var panel=qs("#modalPanel");if(!panel)return;
      var head=panel.querySelector(".modal-head");
      if(!head||head.querySelector(".px-avatar"))return;
      var title=head.querySelector(".section-title");
      if(!title)return;
      var box=document.createElement("div");
      box.className="px-modal-head";
      box.innerHTML=npcAvatar(npc,"lg");
      title.parentNode.insertBefore(box,title);
      box.appendChild(title);
    };
  }
  patchModalNpc();
  setTimeout(patchModalNpc,0);

  /* —— 补丁：角色面板头像 —— */
  var _mc=typeof modalChar==="function"?modalChar:null;
  if(_mc){
    modalChar=function(){
      _mc();
      var p=ensurePlayer(state.player);
      var panel=qs("#modalPanel");if(!panel)return;
      if(panel.querySelector(".px-char-avatar"))return;
      var head=panel.querySelector(".modal-head");
      if(!head)return;
      var title=head.querySelector(".section-title");
      var box=document.createElement("div");
      box.className="px-modal-head px-char-avatar";
      box.innerHTML=playerAvatar(p,"xl");
      if(title){
        head.insertBefore(box,title);
        box.appendChild(title);
      }else head.insertBefore(box,head.firstChild);
    };
  }

  /* —— 补丁：关系列表小头像 —— */
  var _mr=typeof modalRelations==="function"?modalRelations:null;
  if(_mr){
    modalRelations=function(){
      _mr();
      var panel=qs("#modalPanel");if(!panel)return;
      qsa("[data-npc]",panel).forEach(function(card){
        if(card.querySelector(".px-avatar"))return;
        var npc=findPerson(card.dataset.npc);if(!npc)return;
        var head=card.querySelector(".quest-head");
        if(!head)return;
        var av=document.createElement("span");
        av.innerHTML=npcAvatar(npc,"sm");
        head.insertBefore(av.firstChild,head.firstChild);
      });
    };
  }

  /* 开始页装饰 */
  var _rs=typeof renderStart==="function"?renderStart:null;
  if(_rs){
    renderStart=function(){
      _rs();
      var hero=document.querySelector(".hero-card");
      if(hero&&!hero.querySelector(".px-title-avatars")){
        var row=document.createElement("div");
        row.className="px-title-avatars row";
        row.style.justifyContent="center";
        row.style.margin="8px 0";
        row.innerHTML=
          avatarHtml("demo_m","男","player","lg")+
          avatarHtml("demo_f","女","player","lg")+
          avatarHtml("demo_s","其他","shadow","lg")+
          avatarHtml("demo_k","男","monk","lg");
        var title=hero.querySelector(".title");
        if(title&&title.nextSibling)hero.insertBefore(row,title.nextSibling);
        else hero.appendChild(row);
      }
    };
  }

})();
