/** Avatar library · paths under assets/avatars/ */
(function(g){
  var IDS=["ao_sailor","aqing","cave_guard","he_forge","helie_npc","hermit","hero_ref","jian_tong","luyun","monk_jing","qianliu","que_shadow","reef_ghost","shen_wai","shishu","shuizei","stall","su","tieba","xie_ren","yaotong","yubo","zhou"];
  var BASE="./assets/avatars/";
  var HAS=Object.create(null);
  IDS.forEach(function(id){HAS[id]=1;});
  g.AVATAR_IDS=IDS;
  g.AVATAR_HAS=function(id){return !!HAS[id];};
  g.AVATAR_SRC=function(id){return BASE+id+".svg";};
  /** Prefer file library; returns HTML or null */
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
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(g.preloadAvatars,100);});
    else setTimeout(g.preloadAvatars,100);
  }
})(typeof window!=="undefined"?window:this);
