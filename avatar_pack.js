/** 压缩像素头像包 · 启动解压到 AVATAR_PACK（依赖 av_b64_0/1.js） */
(function(g){
  var ready=false;
  var waiters=[];
  function done(pack){
    g.AVATAR_PACK=pack||Object.create(null);
    ready=true;
    waiters.splice(0).forEach(function(fn){try{fn(g.AVATAR_PACK);}catch(e){}});
  }
  g.whenAvatarPack=function(fn){
    if(ready)fn(g.AVATAR_PACK);
    else waiters.push(fn);
  };
  g.avatarPackReady=function(){return ready;};
  function fail(msg){console.warn("[avatar_pack]",msg||"fail");done(Object.create(null));}
  function tryDecode(b64){
    try{
      if(typeof atob!=="function"){fail("no atob");return;}
      var bin=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0);});
      if(typeof DecompressionStream==="function"&&typeof Response==="function"){
        var ds=new DecompressionStream("gzip");
        var stream=new Response(bin).body.pipeThrough(ds);
        new Response(stream).text().then(function(t){
          try{done(JSON.parse(t));}catch(e){fail("json");}
        }).catch(function(){fail("gunzip");});
      }else fail("no DecompressionStream");
    }catch(e){fail(String(e));}
  }
  function boot(){
    var a=g.__AV_B64_0||"";
    var b=g.__AV_B64_1||"";
    if(!a||!b){fail("missing b64 parts");return;}
    tryDecode(a+b);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,0);});
  else setTimeout(boot,0);
})(typeof window!=="undefined"?window:this);
