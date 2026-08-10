/** 头像库 · assets/avatars/{id}.svg + 程序生成回退 */
(function(g){
  var IDS=[
    "hero_ref","zhou","su","shishu","aqing","jian_tong","yubo","shuizei",
    "qianliu","stall","luyun","shen_wai","tieba","helie_npc","he_forge",
    "yaotong","ao_sailor","que_shadow","monk_jing","hermit","xie_ren",
    "reef_ghost","cave_guard"
  ];
  var BASE="./assets/avatars/";
  var HAS=Object.create(null);
  IDS.forEach(function(id){HAS[id]=1;});

  g.AVATAR_IDS=IDS;
  g.AVATAR_HAS=function(id){return !!HAS[id];};
  g.AVATAR_SRC=function(id){return BASE+id+".svg";};
  g.avatarFromLib=function(id,size){
    if(!id||!HAS[id])return null;
    size=size||"md";
    return '<span class="px-avatar '+size+'"><img src="'+BASE+id+'.svg" width="120" height="120" alt="" decoding="async"/></span>';
  };
  g.preloadAvatars=function(){
    if(g.__avatarPreloaded)return;
    g.__avatarPreloaded=1;
    IDS.forEach(function(id){
      var im=new Image();
      im.decoding="async";
      im.src=BASE+id+".svg";
    });
  };
  g.registerAvatar=function(id){
    if(!id||HAS[id])return;
    HAS[id]=1;
    IDS.push(id);
  };

  function installBridge(){
    if(typeof avatarHtml!=="function")return;
    if(avatarHtml._bridged)return;
    var _ah=avatarHtml;
    function bridged(seed,gender,role,size,presetId){
      size=size||"md";
      var id=presetId||seed;
      var h=g.avatarFromLib(id,size);
      if(h)return h;
      if(g.AVATAR_PACK&&g.AVATAR_PACK[id]){
        return '<span class="px-avatar '+size+'">'+g.AVATAR_PACK[id]+'</span>';
      }
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
        var role=typeof roleForNpc==="function"?roleForNpc(npc):"npc";
        return bridged(id,gen,role,size||"md",id);
      };
    }
  }

  if(typeof document!=="undefined"){
    if(document.readyState==="loading"){
      document.addEventListener("DOMContentLoaded",function(){
        setTimeout(g.preloadAvatars,100);
        setTimeout(installBridge,0);
      });
    }else{
      setTimeout(g.preloadAvatars,100);
      setTimeout(installBridge,0);
    }
  }
  /* pixel_ui 在本文件之后加载时，需再挂一次 */
  setTimeout(installBridge,50);
  setTimeout(installBridge,200);
})(typeof window!=="undefined"?window:this);
