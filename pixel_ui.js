/*
 * pixel_ui.js — 分层人物头像生成器 v3
 *
 * 头像由独立视觉层组成：背景光、衣身、衣领、脖颈、脸型、耳朵、发后层、发丝、眉眼、瞳孔、鼻梁、鼻影、嘴唇、年龄纹理、胡须、饰物和高光。
 * 输出保持 120×120 SVG，并兼容原有 pixelAvatarSvg / avatarHtml / playerAvatar / npcAvatar API。
 */
(function(){
  "use strict";

  if(typeof document!=="undefined"&&!document.getElementById("pixel-ui-style")){
    var css=document.createElement("style");css.id="pixel-ui-style";
    css.textContent=[
      "body.pixel-ui{image-rendering:pixelated;-webkit-font-smoothing:none}",
      "body.pixel-ui .panel,body.pixel-ui .hero-card,body.pixel-ui .modal-panel{border-radius:0!important;border-width:3px!important;border-style:solid!important;border-color:#3a2a1c #1a120c #1a120c #3a2a1c!important;box-shadow:4px 4px 0 #0a0806,inset 1px 1px 0 rgba(217,173,98,.15)!important}",
      "body.pixel-ui .btn{border-radius:0!important;border-width:2px!important;box-shadow:2px 2px 0 #0a0806;text-shadow:1px 1px 0 #000}",
      "body.pixel-ui .btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #0a0806}",
      "body.pixel-ui .map-node,body.pixel-ui .choice,body.pixel-ui .quest-card,body.pixel-ui .master-card,body.pixel-ui .item-icon,body.pixel-ui .talk-bubble,body.pixel-ui .log,body.pixel-ui .tag,body.pixel-ui .rank-tag,body.pixel-ui .equip-slot{border-radius:0!important}",
      ".px-avatar{display:inline-grid;place-items:center;vertical-align:middle;position:relative;overflow:hidden;flex:0 0 auto;background:#050403;border:2px solid #4b3a2d;box-shadow:2px 2px 0 #0a0806;image-rendering:pixelated}",
      ".px-avatar svg{display:block;width:100%;height:100%;image-rendering:pixelated;shape-rendering:crispEdges}",
      ".px-avatar.sm{width:36px;height:36px}.px-avatar.md{width:56px;height:56px}.px-avatar.lg{width:88px;height:88px}.px-avatar.xl{width:120px;height:120px}",
      ".px-avatar:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.07),transparent 38%,rgba(0,0,0,.14))}",
      ".px-npc-btn{display:inline-flex;align-items:center;gap:5px}.px-npc-btn .px-avatar{width:32px;height:32px}.px-modal-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}"
    ].join("\n");document.head.appendChild(css);
  }
  if(typeof document!=="undefined"&&document.body)document.body.classList.add("pixel-ui");

  function hash(str){str=String(str||"x");var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function pick(h,a){return a[h%a.length]}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function shade(hex,amt){hex=String(hex||"#000").replace("#","");if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];var n=parseInt(hex,16);if(isNaN(n))return"#000000";var r=clamp(((n>>16)&255)+amt,0,255),g=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);return"#"+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}

  var SKINS=["#f2d3b5","#e9c5a1","#ddb18a","#ca956b","#b37b53","#986640"];
  var HAIRS=["#101014","#151218","#1d1713","#291d16","#382619","#51402c"];
  var ROBES=["#eee7db","#ddd5c9","#cfc7bb","#f4efe6","#c2bbb0","#d7cfc3"];
  var SASHES=["#8d5c3a","#704725","#a16d46","#5b3b25","#9b5e42"];
  var DARK_CLOTH=["#382820","#29394a","#392a3b","#294638","#492b2b","#202c24","#2d2d4b"];

  var AGE={child:{face:.96,eye:1.12,wrinkle:0,chin:0},young:{face:1,eye:1.05,wrinkle:0,chin:1},adult:{face:1.02,eye:1,wrinkle:0,chin:2},mature:{face:1.04,eye:.96,wrinkle:1,chin:3},elder:{face:1.06,eye:.9,wrinkle:2,chin:4}};

  var PRESETS={
    hero_ref:{skin:0,hair:0,robe:0,sash:1,style:"hero",gender:"男",age:"young"},player:{skin:0,hair:0,robe:0,sash:1,style:"hero",gender:"男",age:"young"},
    zhou:{skin:3,hair:3,robe:5,sash:1,style:"elder",beard:2,age:"mature"},su:{skin:1,hair:2,robe:0,sash:0,style:"neat",gender:"女",age:"adult"},
    aqing:{skin:0,hair:1,robe:0,sash:3,style:"long",gender:"女",acc:"leaf",age:"young"},jian_tong:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男",age:"young"},
    yubo:{skin:4,hair:4,robe:5,sash:1,style:"elder",beard:2,age:"elder"},luyun:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男",acc:"tassel",age:"adult"},
    yanlan_mei:{skin:0,hair:0,robe:0,sash:0,style:"long",gender:"女",acc:"tassel",age:"adult"},huichun_lan:{skin:0,hair:2,robe:0,sash:2,style:"twin",gender:"女",acc:"flower",age:"adult"},
    tieba:{skin:4,hair:0,robe:5,sash:1,style:"wild",beard:1,acc:"scar",age:"mature"},que_shadow:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow",age:"adult"},
    monk_jing:{skin:1,hair:0,robe:1,sash:1,style:"monk",role:"monk",age:"adult"},hermit:{skin:2,hair:0,robe:5,sash:1,style:"elder",beard:2,role:"elder",age:"elder"},
    xie_ren:{skin:3,hair:0,robe:5,sash:4,style:"wild",role:"evil",acc:"blood",age:"mature"},su_wanqing:{skin:0,hair:2,robe:0,sash:2,style:"long",gender:"女",age:"adult"},
    shen_shuheng:{skin:0,hair:0,robe:0,sash:0,style:"hero",gender:"男",age:"adult"},shen_tingyun:{skin:0,hair:0,robe:0,sash:0,style:"long",gender:"女",role:"elder",age:"mature"},
    baique_si:{skin:1,hair:0,robe:5,sash:1,style:"mask",role:"shadow",age:"adult"},wuxiang_chen:{skin:0,hair:0,robe:1,sash:1,style:"monk",role:"monk",age:"mature"},
    xuan_zhu:{skin:1,hair:1,robe:0,sash:0,style:"neat",gender:"女",acc:"pearl",age:"adult"},ao_sailor:{skin:4,hair:0,robe:2,sash:0,style:"short",gender:"男",acc:"shell",age:"mature"},
    helie_npc:{skin:3,hair:2,robe:5,sash:1,style:"short",acc:"burn",age:"mature"},shishu:{skin:2,hair:3,robe:5,sash:1,style:"elder",beard:1,age:"elder"},
    qianliu:{skin:2,hair:0,robe:5,sash:4,style:"short",gender:"男",age:"mature"},stall:{skin:3,hair:4,robe:1,sash:1,style:"elder",gender:"女",age:"mature"},
    shuizei:{skin:4,hair:0,robe:5,sash:1,style:"wild",acc:"scar",age:"adult"},shen_wai:{skin:1,hair:0,robe:0,sash:0,style:"hero",gender:"男",age:"adult"},
    he_forge:{skin:3,hair:4,robe:5,sash:1,style:"elder",beard:1,age:"mature"},yaotong:{skin:0,hair:2,robe:0,sash:2,style:"long",gender:"女",acc:"flower",age:"child"},
    reef_ghost:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow",age:"adult"},cave_guard:{skin:2,hair:0,robe:5,sash:1,style:"mask",role:"shadow",age:"mature"}
  };

  var CACHE=Object.create(null),CACHE_LIMIT=100;
  function add(c,x,y,v){if(x>=0&&x<120&&y>=0&&y<120)c[x+","+y]=v}
  function fill(c,x0,y0,x1,y1,v){for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)add(c,x,y,v)}
  function line(c,x0,y0,x1,y1,v){var dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;while(true){add(c,x0,y0,v);if(x0===x1&&y0===y1)break;var e=2*err;if(e>-dy){err-=dy;x0+=sx}if(e<dx){err+=dx;y0+=sy}}}

  function mergeSvg(cells){
    var W=120,H=120,grid=new Array(H),keys=Object.keys(cells),i,p;
    for(var y=0;y<H;y++){grid[y]=new Array(W);for(var x=0;x<W;x++)grid[y][x]=null}
    for(i=0;i<keys.length;i++){p=keys[i].split(",");grid[+p[1]][+p[0]]=cells[keys[i]]}
    var spans=[];
    for(y=0;y<H;y++){x=0;while(x<W){var c=grid[y][x];if(c==null){x++;continue}var x0=x;while(x<W&&grid[y][x]===c)x++;spans.push({x:x0,y:y,w:x-x0,h:1,c:c})}}
    spans.sort(function(a,b){return a.c===b.c?(a.x===b.x?(a.w===b.w?a.y-b.y:a.w-b.w):a.x-b.x):(a.c<b.c?-1:1)});
    var out=[];
    for(i=0;i<spans.length;i++){var q=spans[i],last=out[out.length-1];if(last&&last.c===q.c&&last.x===q.x&&last.w===q.w&&last.y+last.h===q.y)last.h++;else out.push({x:q.x,y:q.y,w:q.w,h:1,c:q.c})}
    var rects="";for(i=0;i<out.length;i++){q=out[i];rects+='<rect x="'+q.x+'" y="'+q.y+'" width="'+q.w+'" height="'+q.h+'" fill="'+q.c+'"/>'}
    return '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" shape-rendering="crispEdges">'+rects+'</svg>';
  }

  function pixelAvatarSvg(opts){
    opts=opts||{};var seed=opts.seed||"anon",g=opts.gender||"其他",role=opts.role||"npc",presetId=opts.presetId||seed;
    var preset=PRESETS[presetId]||PRESETS[seed]||{};if(preset.gender)g=preset.gender;if(preset.role)role=preset.role;
    var ageKey=opts.age||preset.age||((role==="elder"||preset.style==="elder")?"elder":"adult"),age=AGE[ageKey]||AGE.adult;
    var expression=opts.expression||preset.expression||(role==="evil"?"cold":"calm"),light=opts.light||"upperLeft";
    var cacheKey=[seed,g,role,presetId,ageKey,expression,light].join("|");if(CACHE[cacheKey])return CACHE[cacheKey];
    var h=hash(cacheKey),hf=hash(seed+":face"),hh=hash(seed+":hair");
    var skin=preset.skin!=null?SKINS[preset.skin%SKINS.length]:pick(h,SKINS),hair=preset.hair!=null?HAIRS[preset.hair%HAIRS.length]:pick(hh,HAIRS),robe,sash;
    if(role==="monk"){robe="#c8c4b8";sash="#6a6558";hair="#e1d9c9"}else if(role==="shadow"){robe="#1b1b27";sash="#343443";hair="#09090b"}else if(role==="evil"){robe="#3a1a1d";sash="#76282b"}else if(preset.style==="hero"||role==="player"){robe=ROBES[(preset.robe||0)%ROBES.length];sash=SASHES[(preset.sash||0)%SASHES.length]}else if(g==="女"){robe=ROBES[(preset.robe||h)%ROBES.length];sash=SASHES[(preset.sash||h>>>4)%SASHES.length]}else{robe=preset.robe!=null?ROBES[preset.robe%ROBES.length]:pick(h,DARK_CLOTH);sash=preset.sash!=null?SASHES[preset.sash%SASHES.length]:pick(h>>>4,SASHES)}
    var skinD=shade(skin,-28),skinDD=shade(skin,-48),skinL=shade(skin,24),skinM=shade(skin,-12),hairL=shade(hair,30),hairD=shade(hair,-18),hairDD=shade(hair,-35),robeL=shade(robe,18),robeD=shade(robe,-24),robeDD=shade(robe,-40),sashD=shade(sash,-24),sashL=shade(sash,20);
    var c={};fill(c,0,0,119,119,"#050403");

    /* 1. 衣身与衣领 */
    fill(c,8,92,111,119,robe);fill(c,0,108,119,119,robeD);fill(c,0,116,119,119,robeDD);fill(c,18,88,42,119,robeL);fill(c,78,88,101,119,robeD);
    line(c,20,90,8,118,robeL);line(c,99,90,111,118,robeD);fill(c,47,82,72,102,skinD);fill(c,48,90,71,98,skin);
    line(c,42,84,59,104,sash);line(c,77,84,60,104,sashD);line(c,48,101,72,101,sashL);fill(c,58,101,64,118,sash);fill(c,64,106,72,118,sashD);

    /* 2. 脸型、耳朵、下颌 */
    var faceW=Math.round(38*age.face),left=Math.round(60-faceW/2),right=119-left,top=20+(ageKey==="elder"?2:0),bottom=78+age.chin;
    fill(c,left+5,top,right-5,bottom,skin);fill(c,left+1,top+9,left+6,bottom-17,skinD);fill(c,right-6,top+9,right-1,bottom-17,skinD);fill(c,left+8,bottom-15,right-8,bottom,skinM);fill(c,left+12,bottom-5,right-12,bottom+age.chin,skinD);
    fill(c,left-2,45,left+4,58,skinD);fill(c,right-4,45,right+2,58,skinD);fill(c,left-1,47,left+3,55,skinL);fill(c,right-3,47,right+1,55,skinL);

    /* 3. 发后层 */
    var style=preset.style||"neat";if(role==="monk")style="monk";if(role==="shadow")style="mask";
    if(style==="long"||style==="twin"){fill(c,left-4,13,left+7,76,hair);fill(c,right-7,13,right+4,76,hair);fill(c,left-9,30,left-3,68,hairD);fill(c,right+3,30,right+9,68,hairD)}
    else if(style==="elder"){fill(c,left-2,13,left+10,46,hairL);fill(c,right-10,13,right+2,46,hairL)}
    else if(style==="mask"){fill(c,left-7,13,right+7,58,hair);fill(c,left-10,25,left-2,68,hairD);fill(c,right+2,25,right+10,68,hairD)}
    else{fill(c,left-5,12,right+5,43,hair);fill(c,left-9,24,left+1,67,hairD);fill(c,right-1,24,right+9,67,hairD)}

    /* 4. 发丝 / 刘海独立层 */
    if(style==="monk"){fill(c,left+5,12,right-5,27,hair);fill(c,left+11,8,right-11,13,hairL);for(var m=0;m<5;m++)line(c,left+15+m*7,9,left+13+m*7,18,hairL)}
    else if(style==="mask"){fill(c,left-1,10,right+1,34,hair);fill(c,left+5,31,right-5,49,"#1a1a22");fill(c,right-16,36,right-5,47,skin)}
    else if(style==="long"||style==="twin"){fill(c,left+2,9,right-2,29,hair);fill(c,left+8,5,right-8,12,hairD);line(c,left+15,5,left+11,24,hairL);line(c,left+27,4,left+24,28,hairL);line(c,right-25,4,right-28,28,hairL);line(c,right-13,6,right-10,23,hairL)}
    else if(style==="elder"){fill(c,left+2,10,right-2,28,hairL);fill(c,left+8,6,right-8,13,"#e9e3d8");line(c,left+15,8,left+12,25,"#c8c0b5");line(c,right-16,8,right-12,25,"#c8c0b5")}
    else{fill(c,left-2,8,right+2,30,hair);fill(c,left+5,3,right-5,11,hairD);line(c,left+13,5,left+10,26,hairL);line(c,left+25,2,left+22,23,hairL);line(c,right-22,3,right-25,24,hairL);line(c,right-10,6,right-7,22,hairL);if(style==="wild"){line(c,left-7,10,left-14,25,hair);line(c,right+7,10,right+14,25,hair)}}

    /* 5. 眉眼 */
    if(style!=="mask"){
      var eyeY=34,eyeOpen=Math.max(4,Math.round(7*age.eye)),brow=hairD;
      line(c,left+11,eyeY-5,left+24,eyeY-7,brow);line(c,right-24,eyeY-7,right-11,eyeY-5,brow);
      fill(c,left+9,eyeY,left+25,eyeY+eyeOpen,shade(skin,16));fill(c,right-25,eyeY,right-9,eyeY+eyeOpen,shade(skin,16));
      line(c,left+9,eyeY,left+25,eyeY,skinD);line(c,right-25,eyeY,right-9,eyeY,skinD);
      var iris=role==="evil"?"#7b292d":"#30231c",pupil="#090705",lx=left+18,rx=right-18;
      fill(c,lx-3,eyeY+1,lx+3,eyeY+5,iris);fill(c,rx-3,eyeY+1,rx+3,eyeY+5,iris);fill(c,lx-1,eyeY+2,lx+1,eyeY+5,pupil);fill(c,rx-1,eyeY+2,rx+1,eyeY+5,pupil);add(c,lx-2,eyeY+1,"#fff8ed");add(c,rx-2,eyeY+1,"#fff8ed");
      if(expression==="tired"){line(c,left+10,eyeY+eyeOpen+2,left+25,eyeY+eyeOpen+1,skinD);line(c,right-25,eyeY+eyeOpen+1,right-10,eyeY+eyeOpen+2,skinD)}
      if(expression==="angry"){line(c,left+10,eyeY-5,left+23,eyeY-8,hairDD);line(c,right-23,eyeY-8,right-10,eyeY-5,hairDD)}
    }

    /* 6. 鼻梁、鼻翼与面部体积 */
    var cx=60;line(c,cx,41,cx-2,55,skinL);line(c,cx+2,42,cx+1,56,skinD);line(c,cx-2,56,cx+4,58,skinD);add(c,cx+5,57,skinDD);add(c,cx-4,57,skinM);line(c,left+7,51,left+11,59,skinL);line(c,right-7,51,right-11,59,skinD);

    /* 7. 嘴型 */
    var mouthY=65;
    if(expression==="smile"){line(c,cx-9,mouthY,cx-2,mouthY+2,skinD);line(c,cx+2,mouthY+2,cx+9,mouthY,skinD);line(c,cx-6,mouthY+3,cx+6,mouthY+3,"#9d5d5c")}
    else if(expression==="cold"){line(c,cx-8,mouthY+1,cx+8,mouthY+1,"#8e5b54");line(c,cx-4,mouthY+2,cx+4,mouthY+2,skinDD)}
    else{line(c,cx-8,mouthY,cx+8,mouthY,"#a76862");line(c,cx-5,mouthY+2,cx+5,mouthY+2,shade(skin,-35))}

    /* 8. 年龄纹理 */
    if(age.wrinkle>=1){line(c,left+8,eyeY+10,left+16,eyeY+12,skinD);line(c,right-16,eyeY+12,right-8,eyeY+10,skinD);line(c,left+10,58,left+16,59,skinD);line(c,right-16,59,right-10,58,skinD)}
    if(age.wrinkle>=2){line(c,left+9,eyeY-2,left+15,eyeY-1,skinD);line(c,right-15,eyeY-1,right-9,eyeY-2,skinD);line(c,left+13,67,left+19,68,skinD);line(c,right-19,68,right-13,67,skinD);fill(c,left+10,16,left+15,18,hairL);fill(c,right-15,16,right-10,18,hairL)}

    /* 9. 胡须、前景发丝与配饰 */
    var beard=preset.beard!=null?preset.beard:(style==="elder"?2:0);
    if(beard>=1){fill(c,left+11,70,right-11,78,hairD);line(c,left+16,76,cx,87,hairL);line(c,right-16,76,cx,87,hairL);if(beard>=2){fill(c,cx-7,78,cx+7,88,hairL);line(c,cx,79,cx,91,hairD)}}
    if(style!=="mask"){line(c,left+4,22,left+8,45,hair);line(c,right-4,22,right-8,45,hairD);line(c,left+14,15,left+12,32,hairL);line(c,right-14,15,right-12,32,hairL)}
    var acc=preset.acc||"none";
    if(acc==="scar"){line(c,left+28,27,left+24,39,"#8d4b4b");line(c,left+27,31,left+23,42,skinD)}
    if(acc==="burn"){fill(c,right-9,47,right-4,54,"#a15f45");add(c,right-7,55,"#8b5140")}
    if(acc==="blood"){add(c,cx-2,57,"#762326");add(c,cx,59,"#8e3034")}
    if(acc==="leaf"){add(c,cx-2,5,"#6b9957");add(c,cx,3,"#79a965");add(c,cx+2,5,"#5b8a4c")}
    if(acc==="flower"){add(c,left+2,18,"#e39a9a");add(c,left+4,20,"#d27e7e");add(c,left,20,"#d27e7e");add(c,left+2,20,"#e8ca79")}
    if(acc==="pearl"){fill(c,left+3,42,left+5,44,"#e8dfce");fill(c,right-5,42,right-3,44,"#e8dfce")}
    if(acc==="tassel"){line(c,right+3,27,right+3,61,"#d9ad62");line(c,right+5,29,right+5,58,"#9d7b48")}
    if(acc==="shell"){add(c,100,92,"#74a7b7");add(c,102,94,"#96c1cc");add(c,101,93,"#84b6c3")}

    /* 10. 定向高光 */
    if(light==="upperRight"){line(c,right-16,28,right-10,44,skinL);line(c,right-13,48,right-10,55,skinL);line(c,right-8,92,right-18,109,robeL)}
    else{line(c,left+10,28,left+5,44,skinL);line(c,left+13,48,left+10,55,skinL);line(c,left+8,92,left+18,109,robeL)}

    var svg=mergeSvg(c),ks=Object.keys(CACHE);if(ks.length>=CACHE_LIMIT)for(var z=0;z<Math.floor(ks.length/2);z++)delete CACHE[ks[z]];CACHE[cacheKey]=svg;return svg;
  }

  function roleForNpc(npc){
    if(!npc)return"npc";var id=npc.id||"",title=(npc.title||"")+(npc.desc||"");
    if(PRESETS[id]&&PRESETS[id].role)return PRESETS[id].role;
    if(/僧|寺|方丈/.test(title)||/monk|kong_|liao_|wuxiang|jing/.test(id))return"monk";
    if(/影|雀|蒙面|机关|遗迹/.test(title)||/^que_|shadow|cave_guard|reef/.test(id))return"shadow";
    if(/隐士|云叟/.test(title)||id==="hermit")return"elder";
    if(/邪|血屠/.test(title)||id==="xie_ren")return"evil";
    return"npc";
  }

  function avatarHtml(seed,gender,role,size,presetId,extra){
    size=size||"md";var svg=pixelAvatarSvg({seed:seed,gender:gender||"其他",role:role||"npc",presetId:presetId||seed,age:extra&&extra.age,expression:extra&&extra.expression,light:extra&&extra.light});
    return '<span class="px-avatar '+size+'" data-avatar-id="'+String(presetId||seed).replace(/[^a-zA-Z0-9_-]/g,"_")+'">'+svg+'</span>';
  }
  function playerAvatar(p,size){p=p||{};return avatarHtml(p.name||"player",p.gender||"男","player",size||"md","hero_ref",{age:p.age})}
  function npcAvatar(npc,size){
    npc=npc||{};var id=npc.id||npc.name||"unknown",g="其他";
    if(typeof getNpcProfile==="function"){try{var pr=getNpcProfile(npc);if(pr&&pr.gender){var gg=String(pr.gender);if(gg.indexOf("女")>=0)g="女";else if(gg.indexOf("男")>=0)g="男"}}catch(e){}}
    if(PRESETS[id]&&PRESETS[id].gender)g=PRESETS[id].gender;return avatarHtml(id,g,roleForNpc(npc),size||"md",id);
  }

  window.pixelAvatarSvg=pixelAvatarSvg;window.avatarHtml=avatarHtml;window.roleForNpc=roleForNpc;window.playerAvatar=playerAvatar;window.npcAvatar=npcAvatar;
  window.PIXEL_AVATAR_PRESETS=PRESETS;window.PIXEL_AVATAR_AGES=AGE;window.clearAvatarCache=function(){CACHE=Object.create(null)};

  /* 兼容旧 HUD/NPC 按钮，不要求 renderGame 必须存在。 */
  var hooked=false;
  function hookRender(){
    if(hooked||typeof window.renderGame!=="function")return;hooked=true;var old=window.renderGame;
    window.renderGame=function(){var r=old.apply(this,arguments);try{
      var p=window.state&&state.player,hud=document.querySelector(".hud");
      if(hud&&p&&!hud.querySelector(".px-avatar")){var w=document.createElement("span");w.innerHTML=playerAvatar(p,"md");hud.insertBefore(w.firstChild,hud.firstChild)}
      document.querySelectorAll(".npc-btn").forEach(function(btn){if(btn.querySelector(".px-avatar"))return;var npc=typeof findPerson==="function"?findPerson(btn.dataset.id):null;if(!npc)return;var q=document.createElement("span");q.innerHTML=npcAvatar(npc,"sm");btn.insertBefore(q.firstChild,btn.firstChild);btn.classList.add("px-npc-btn")});
    }catch(e){}return r};
  }
  hookRender();if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hookRender);else setTimeout(hookRender,0)}
})();
