/** 头像库 · 对齐参考立绘风格的 120×120 像素
 *  优先级：AVATAR_PACK（精细预生成）→ pixelAvatarSvg 程序生成
 *  assets/avatars/*.svg 仅作资源备份，运行时不强制 img（避免低精度图覆盖）
 */
(function(g){
  var IDS=[
    "hero_ref","zhou","su","shishu","aqing","jian_tong","yubo","shuizei",
    "qianliu","stall","luyun","shen_wai","tieba","helie_npc","he_forge",
    "yaotong","ao_sailor","que_shadow","monk_jing","hermit","xie_ren",
    "reef_ghost","cave_guard"
  ];
  var META={
    hero_ref:{gender:"男",role:"player"},
    zhou:{gender:"男"},su:{gender:"女"},shishu:{gender:"男"},
    aqing:{gender:"女"},jian_tong:{gender:"男"},yubo:{gender:"男"},
    shuizei:{gender:"男"},qianliu:{gender:"男"},stall:{gender:"女"},
    luyun:{gender:"男"},shen_wai:{gender:"男"},tieba:{gender:"男"},
    helie_npc:{gender:"男"},he_forge:{gender:"男"},yaotong:{gender:"女"},
    ao_sailor:{gender:"男"},que_shadow:{gender:"其他",role:"shadow"},
    monk_jing:{gender:"男",role:"monk"},hermit:{gender:"男",role:"elder"},
    xie_ren:{gender:"男",role:"evil"},
    reef_ghost:{gender:"其他",role:"shadow"},cave_guard:{gender:"其他",role:"shadow"}
  };

  g.AVATAR_IDS=IDS;
  g.AVATAR_HAS=function(id){return IDS.indexOf(id)>=0;};
  g.AVATAR_SRC=function(id){return "./assets/avatars/"+id+".svg";};

  /** 从精细包或程序生成取 SVG HTML */
  g.avatarFromLib=function(id,size){
    if(!id)return null;
    size=size||"md";
    if(g.AVATAR_PACK&&g.AVATAR_PACK[id]){
      return '<span class="px-avatar '+size+'">'+g.AVATAR_PACK[id]+'</span>';
    }
    return null;
  };

  /** 预热：用 pixelAvatarSvg 生成全部角色进缓存 */
  g.preloadAvatars=function(){
    if(g.__avatarPreloaded)return;
    g.__avatarPreloaded=1;
    if(typeof pixelAvatarSvg!=="function")return;
    IDS.forEach(function(id){
      var m=META[id]||{};
      try{
        pixelAvatarSvg({
          seed:id,
          gender:m.gender||"其他",
          role:m.role||"npc",
          presetId:id
        });
      }catch(e){}
    });
  };

  g.registerAvatar=function(id,meta){
    if(!id||IDS.indexOf(id)>=0)return;
    IDS.push(id);
    if(meta)META[id]=meta;
  };

  function installBridge(){
    if(typeof avatarHtml!=="function")return;
    if(avatarHtml._bridged)return;
    var _ah=avatarHtml;
    function bridged(seed,gender,role,size,presetId){
      size=size||"md";
      var id=presetId||seed;
      /* 1. 精细预生成包 */
      if(g.AVATAR_PACK&&g.AVATAR_PACK[id]){
        return '<span class="px-avatar '+size+'">'+g.AVATAR_PACK[id]+'</span>';
      }
      /* 2. 程序像素（与参考图同算法，120×120 精细） */
      return _ah(seed,gender,role,size,presetId);
    }
    bridged._bridged=1;
    g.avatarHtml=bridged;

    if(typeof playerAvatar==="function"){
      g.playerAvatar=function(p,size){
        var gen=(p&&p.gender)||"男";
        return bridged((p&&p.name)||"player",gen,"player",size||"md","hero_ref");
      };
    }
    if(typeof npcAvatar==="function"){
      g.npcAvatar=function(npc,size){
        var gen="其他";
        if(typeof getNpcProfile==="function"){
          var pr=getNpcProfile(npc);
          if(pr&&pr.gender){
            var gg=String(pr.gender);
            if(gg.indexOf("女")>=0)gen="女";
            else if(gg.indexOf("男")>=0)gen="男";
          }
        }
        var id=npc&&(npc.id||npc.name);
        if(META[id]&&META[id].gender)gen=META[id].gender;
        var role=typeof roleForNpc==="function"?roleForNpc(npc):(META[id]&&META[id].role)||"npc";
        return bridged(id,gen,role,size||"md",id);
      };
    }
  }

  function boot(){
    installBridge();
    g.preloadAvatars();
  }
  if(typeof document!=="undefined"){
    if(document.readyState==="loading"){
      document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,0);});
    }else setTimeout(boot,0);
  }
  setTimeout(boot,50);
  setTimeout(boot,200);
  if(typeof g.whenAvatarPack==="function"){
    g.whenAvatarPack(function(){ installBridge(); });
  }
})(typeof window!=="undefined"?window:this);
