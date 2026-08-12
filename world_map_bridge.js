/* world_map_bridge.js — 统一旧地图与分层天下舆图入口 */
(function(g){"use strict";
function sync(){
  if(typeof document==="undefined"||typeof g.WORLD_MAP_LAYERED==="undefined")return;
  var bars=document.querySelectorAll(".toolbar");
  for(var i=0;i<bars.length;i++){
    var buttons=bars[i].querySelectorAll("button");
    var found=false;
    for(var j=0;j<buttons.length;j++){
      if((buttons[j].textContent||"").indexOf("天下舆图")>=0){
        buttons[j].onclick=g.WORLD_MAP_LAYERED.open;
        buttons[j].setAttribute("data-world-layered","1");
        found=true;
      }
    }
    if(found){
      var v2=bars[i].querySelectorAll("[data-world-v2]");
      for(var k=0;k<v2.length;k++)if(v2[k].getAttribute("data-world-v2")==="1"&&!v2[k].hasAttribute("data-world-layered"))v2[k].remove();
    }
  }
}
if(typeof document!=="undefined"){setTimeout(sync,100);setInterval(sync,1000);if(g.Game&&Game.on)Game.on("render:after",sync)}
})(typeof window!=="undefined"?window:this);
