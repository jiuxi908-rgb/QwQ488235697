/** Avatar library · assets/avatars/{id}.svg · 全量 23 */
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
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(g.preloadAvatars,100);});
    else setTimeout(g.preloadAvatars,100);
  }
})(typeof window!=="undefined"?window:this);
