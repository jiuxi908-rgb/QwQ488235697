/**
 * avatar_lib.js — NPC 头像统一渲染层
 *
 * 目标：
 * 1. 统一 NPC / 玩家头像尺寸、边框和像素风格。
 * 2. 优先使用 AVATAR_PACK，其次使用 pixelAvatarSvg。
 * 3. 根据 NPC 身份提供稳定的头像元数据。
 * 4. 支持好感状态、头像状态标记和移动端高 DPI 显示。
 */
(function(g){
  "use strict";

  var IDS=[
    "hero_ref","zhou","su","shishu","aqing","jian_tong","yubo","shuizei",
    "qianliu","stall","luyun","shen_wai","tieba","helie_npc","he_forge",
    "yaotong","ao_sailor","que_shadow","monk_jing","hermit","xie_ren",
    "reef_ghost","cave_guard"
  ];

  var META={
    hero_ref:{gender:"男",role:"player",tone:"gold"},
    zhou:{gender:"男",role:"merchant",tone:"warm"},
    su:{gender:"女",role:"doctor",tone:"jade"},
    shishu:{gender:"男",role:"storyteller",tone:"amber"},
    aqing:{gender:"女",role:"herbalist",tone:"green"},
    jian_tong:{gender:"男",role:"swordsman",tone:"steel"},
    yubo:{gender:"男",role:"ferryman",tone:"blue"},
    shuizei:{gender:"男",role:"outlaw",tone:"red"},
    qianliu:{gender:"男",role:"blackmarket",tone:"violet"},
    stall:{gender:"女",role:"vendor",tone:"warm"},
    luyun:{gender:"男",role:"swordsman",tone:"mist"},
    shen_wai:{gender:"男",role:"official",tone:"steel"},
    tieba:{gender:"男",role:"outlaw",tone:"red"},
    helie_npc:{gender:"男",role:"smith",tone:"ember"},
    he_forge:{gender:"男",role:"smith",tone:"ember"},
    yaotong:{gender:"女",role:"herbalist",tone:"green"},
    ao_sailor:{gender:"男",role:"sailor",tone:"blue"},
    que_shadow:{gender:"其他",role:"shadow",tone:"dark"},
    monk_jing:{gender:"男",role:"monk",tone:"jade"},
    hermit:{gender:"男",role:"elder",tone:"mist"},
    xie_ren:{gender:"男",role:"evil",tone:"red"},
    reef_ghost:{gender:"其他",role:"shadow",tone:"dark"},
    cave_guard:{gender:"其他",role:"shadow",tone:"dark"}
  };

  g.AVATAR_IDS=IDS;
  g.AVATAR_META=META;
  g.AVATAR_HAS=function(id){return IDS.indexOf(id)>=0;};
  g.AVATAR_SRC=function(id){return "./assets/avatars/"+id+".svg";};

  function injectStyle(){
    if(typeof document==="undefined"||document.getElementById("avatar-ui-style"))return;
    var s=document.createElement("style");
    s.id="avatar-ui-style";
    s.textContent=[
      ".px-avatar{display:inline-grid;place-items:center;position:relative;overflow:hidden;vertical-align:middle;flex:0 0 auto;background:#17120f;border:1px solid #4b3a2d;box-shadow:0 3px 10px rgba(0,0,0,.28);image-rendering:pixelated;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}",
      ".px-avatar svg{display:block;width:100%;height:100%;image-rendering:pixelated}",
      ".px-avatar.sm{width:38px;height:38px;border-radius:8px}.px-avatar.md{width:58px;height:58px;border-radius:10px}.px-avatar.lg{width:86px;height:86px;border-radius:12px}.px-avatar.xl{width:112px;height:112px;border-radius:14px}",
      ".px-avatar.npc:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.34);border-color:#d9ad62}",
      ".px-avatar.tone-gold{border-color:#d9ad62}.px-avatar.tone-jade{border-color:#6f9f7c}.px-avatar.tone-red{border-color:#a95c55}.px-avatar.tone-blue{border-color:#607f9d}.px-avatar.tone-ember{border-color:#b9784e}.px-avatar.tone-violet{border-color:#8d70a4}",
      ".avatar-card{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #4b3a2d;border-radius:10px;background:linear-gradient(135deg,#211914,#17120f);min-width:0}",
      ".avatar-card .avatar-main{min-width:0;flex:1}.avatar-card .avatar-name{font-weight:700;color:#f5e8cf;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.avatar-card .avatar-title{font-size:10px;color:#b9a58a;margin-top:2px}",
      ".avatar-mood{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:99px;font-size:9px;border:1px solid #4b3a2d;color:#b9a58a}.avatar-mood.friendly{color:#7aae6a;border-color:#5f8055}.avatar-mood.trusted{color:#d9ad62;border-color:#9a7948}.avatar-mood.hostile{color:#b85b53;border-color:#8c4944}",
      ".talk-bubble .dialogue-avatar{float:left;margin:0 8px 4px 0}.talk-bubble:after{content:'';display:block;clear:both}",
      "@media(max-width:600px){.px-avatar.md{width:52px;height:52px}.px-avatar.lg{width:76px;height:76px}.avatar-card{padding:7px 8px}.avatar-card .avatar-name{font-size:13px}}"
    ].join("");
    document.head.appendChild(s);
  }

  function moodForFavor(favor){
    favor=favor|0;
    if(favor>=80)return {name:"知交",cls:"trusted"};
    if(favor>=40)return {name:"相熟",cls:"friendly"};
    if(favor<10)return {name:"陌路",cls:""};
    return {name:"相识",cls:"friendly"};
  }

  g.avatarMood=function(player,npcId){
    if(!player||!npcId||typeof getFavor!=="function")return "";
    var m=moodForFavor(getFavor(player,npcId));
    return '<span class="avatar-mood '+m.cls+'">'+m.name+'</span>';
  };

  g.avatarFromLib=function(id,size,extraClass){
    if(!id)return null;
    size=size||"md";
    var meta=META[id]||{};
    var classes="px-avatar "+size+" npc tone-"+(meta.tone||"gold")+(extraClass?" "+extraClass:"");
    if(g.AVATAR_PACK&&g.AVATAR_PACK[id]){
      return '<span class="'+classes+'" data-avatar-id="'+id+'">'+g.AVATAR_PACK[id]+'</span>';
    }
    return null;
  };

  function generated(seed,gender,role,size,presetId){
    if(typeof pixelAvatarSvg!=="function")return "";
    try{
      return pixelAvatarSvg({seed:seed,gender:gender||"其他",role:role||"npc",presetId:presetId||seed});
    }catch(e){return "";}
  }

  g.preloadAvatars=function(){
    if(g.__avatarPreloaded)return;
    g.__avatarPreloaded=1;
    IDS.forEach(function(id){
      var m=META[id]||{};
      generated(id,m.gender||"其他",m.role||"npc","md",id);
    });
  };

  g.registerAvatar=function(id,meta){
    if(!id||IDS.indexOf(id)>=0)return;
    IDS.push(id);
    if(meta)META[id]=meta;
  };

  function baseAvatarHtml(seed,gender,role,size,presetId){
    size=size||"md";
    var id=presetId||seed;
    var meta=META[id]||{};
    var packed=avatarFromLib(id,size);
    if(packed)return packed;
    var svg=generated(seed,gender,role,size,id);
    if(!svg)return '<span class="px-avatar '+size+' npc tone-'+(meta.tone||"gold")+'" data-avatar-id="'+id+'">侠</span>';
    return '<span class="px-avatar '+size+' npc tone-'+(meta.tone||"gold")+'" data-avatar-id="'+id+'">'+svg+'</span>';
  }

  function installBridge(){
    injectStyle();
    if(typeof avatarHtml!=="function")return;
    if(avatarHtml._enhanced)return;
    var oldAvatarHtml=avatarHtml;
    function bridged(seed,gender,role,size,presetId){
      var id=presetId||seed;
      var packed=avatarFromLib(id,size||"md");
      if(packed)return packed;
      var result=oldAvatarHtml(seed,gender,role,size||"md",presetId);
      var meta=META[id]||{};
      return '<span class="px-avatar '+(size||"md")+' npc tone-'+(meta.tone||"gold")+'" data-avatar-id="'+id+'">'+result+'</span>';
    }
    bridged._enhanced=true;
    g.avatarHtml=bridged;

    if(typeof playerAvatar==="function"){
      g.playerAvatar=function(p,size){
        var gen=(p&&p.gender)||"男";
        return bridged((p&&p.name)||"player",gen,"player",size||"md","hero_ref");
      };
    }
    g.npcAvatar=function(npc,size){
      npc=npc||{};
      var id=npc.id||npc.name||"unknown";
      var meta=META[id]||{};
      var gen=meta.gender||"其他";
      if(typeof getNpcProfile==="function"){
        try{
          var pr=getNpcProfile(npc);
          if(pr&&pr.gender){
            var gg=String(pr.gender);
            if(gg.indexOf("女")>=0)gen="女";
            else if(gg.indexOf("男")>=0)gen="男";
          }
        }catch(e){}
      }
      var role=meta.role||(typeof roleForNpc==="function"?roleForNpc(npc):"npc");
      return bridged(id,gen,role,size||"md",id);
    };
  }

  g.avatarCardHtml=function(npc,player,size){
    if(!npc)return "";
    var id=npc.id||npc.name||"unknown";
    var av=g.npcAvatar?g.npcAvatar(npc,size||"md"):baseAvatarHtml(id,"其他","npc",size||"md",id);
    var mood=g.avatarMood?g.avatarMood(player,id):"";
    return '<div class="avatar-card">'+av+'<div class="avatar-main"><div class="avatar-name">'+(npc.name||"未知人物")+mood+'</div><div class="avatar-title">'+(npc.title||"江湖人物")+'</div></div></div>';
  };

  function boot(){
    injectStyle();
    installBridge();
    preloadAvatars();
  }

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,0);});
    else setTimeout(boot,0);
  }
  setTimeout(boot,50);
  setTimeout(boot,200);
})(typeof window!=="undefined"?window:this);
