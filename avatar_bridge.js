/** 头像引用桥：库文件 / 内存包 → 程序生成 */
(function(){
  function wrap(){
    if(typeof avatarHtml!=="function")return;
    if(avatarHtml._bridged)return;
    var _ah=avatarHtml;
    function bridged(seed,gender,role,size,presetId){
      size=size||"md";
      var id=presetId||seed;
      if(typeof avatarFromLib==="function"){
        var h=avatarFromLib(id,size);
        if(h)return h;
      }
      if(typeof AVATAR_PACK==="object"&&AVATAR_PACK&&AVATAR_PACK[id]){
        return '<span class="px-avatar '+size+'">'+AVATAR_PACK[id]+'</span>';
      }
      return _ah(seed,gender,role,size,presetId);
    }
    bridged._bridged=1;
    window.avatarHtml=bridged;

    if(typeof playerAvatar==="function"){
      window.playerAvatar=function(p,size){
        var g=(p&&p.gender)||"男";
        return bridged((p&&p.name)||"player",g,"player",size||"md","hero_ref");
      };
    }
    if(typeof npcAvatar==="function"){
      window.npcAvatar=function(npc,size){
        var g="其他";
        if(typeof getNpcProfile==="function"){
          var pr=getNpcProfile(npc);
          if(pr&&pr.gender){
            var gg=String(pr.gender);
            if(gg.indexOf("女")>=0)g="女";
            else if(gg.indexOf("男")>=0)g="男";
          }
        }
        var id=npc&&(npc.id||npc.name);
        return bridged(id,g,typeof roleForNpc==="function"?roleForNpc(npc):"npc",size||"md",id);
      };
    }
  }
  wrap();
  setTimeout(wrap,0);
  if(typeof whenAvatarPack==="function"){
    whenAvatarPack(function(){ /* pack ready, next render uses it */ });
  }
})();
