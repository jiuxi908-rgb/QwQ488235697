/** 精细像素头像包 · gzip 解压 → AVATAR_PACK · 对齐参考立绘风格 */
(function(g){
  var ready=false, waiters=[];
  function done(pack){
    g.AVATAR_PACK=pack||Object.create(null);
    ready=true;
    waiters.splice(0).forEach(function(fn){try{fn(g.AVATAR_PACK);}catch(e){}});
  }
  g.whenAvatarPack=function(fn){ if(ready)fn(g.AVATAR_PACK); else waiters.push(fn); };
  g.avatarPackReady=function(){return ready;};

  function tryDecode(b64){
    try{
      if(typeof atob!=="function"){done({});return;}
      var bin=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0);});
      if(typeof DecompressionStream==="function"&&typeof Response==="function"){
        var ds=new DecompressionStream("gzip");
        var stream=new Response(bin).body.pipeThrough(ds);
        new Response(stream).text().then(function(t){
          try{done(JSON.parse(t));}catch(e){done({});}
        }).catch(function(){done({});});
      }else done({});
    }catch(e){done({});}
  }
  function boot(){
    var a=g.__AV_B64_0||"", b=g.__AV_B64_1||"";
    if(!a||!b){done({});return;}
    tryDecode(a+b);
  }
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,0);});
    else setTimeout(boot,0);
  }else setTimeout(boot,0);
})(typeof window!=="undefined"?window:this);
