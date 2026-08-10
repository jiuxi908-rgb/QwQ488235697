/** 像素头像包 · 分片加载后可用 */
(function(g){
  g.AVATAR_PACK=g.AVATAR_PACK||Object.create(null);
  g.avatarPackReady=function(){return Object.keys(g.AVATAR_PACK).length>0;};
  g.whenAvatarPack=function(fn){fn(g.AVATAR_PACK);};
})(typeof window!=="undefined"?window:this);
