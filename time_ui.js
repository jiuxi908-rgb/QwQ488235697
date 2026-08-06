/* 时辰 HUD 补丁 */
(function(){
  if(typeof renderGame!=="function")return;
  var _rg=renderGame;
  renderGame=function(){
    if(state.player&&typeof ensureClock==="function")ensureClock(state.player);
    _rg();
    var hud=document.querySelector(".hud");
    if(!hud||!state.player||typeof formatClock!=="function")return;
    var spans=hud.querySelectorAll("span");
    for(var i=0;i<spans.length;i++){
      var t=(spans[i].textContent||"").trim();
      if(/^第\d+日$/.test(t)){
        spans[i].textContent=formatClock(state.player);
        spans[i].style.color="var(--gold)";
        spans[i].style.fontWeight="600";
        break;
      }
    }
    var jq=typeof currentJieqi==="function"?currentJieqi(state.player):null;
    if(jq){
      var tip=document.createElement("span");
      tip.className="tag";
      tip.textContent=jq.name;
      tip.title=(typeof JIEQI_EVENTS!=="undefined"&&JIEQI_EVENTS[jq.name])||"";
      hud.appendChild(tip);
    }
  };
  if(typeof ensurePlayer==="function"){
    var _ep=ensurePlayer;
    ensurePlayer=function(p){
      p=_ep(p);
      if(typeof ensureClock==="function")ensureClock(p);
      return p;
    };
  }
})();
