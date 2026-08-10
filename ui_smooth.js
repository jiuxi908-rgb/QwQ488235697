/* 二级界面体验：滚动保持 · 背景锁定 · 轻量观察器 */
(function(){

  var scrollY=0;
  var modalScroll=0;
  var modalKey="";
  var skipCloseOnRender=false;
  var bodyLocked=false;

  function savePageScroll(){
    scrollY=window.scrollY||document.documentElement.scrollTop||0;
  }
  function restorePageScroll(){
    var y=scrollY;
    requestAnimationFrame(function(){
      window.scrollTo(0,y);
    });
  }

  function saveModalScroll(){
    var panel=document.getElementById("modalPanel");
    if(panel)modalScroll=panel.scrollTop||0;
  }
  function restoreModalScroll(){
    var y=modalScroll;
    requestAnimationFrame(function(){
      var panel=document.getElementById("modalPanel");
      if(panel)panel.scrollTop=y;
    });
  }

  function lockBody(){
    if(bodyLocked)return;
    bodyLocked=true;
    savePageScroll();
    document.body.classList.add("modal-open");
    document.body.style.position="fixed";
    document.body.style.top=(-scrollY)+"px";
    document.body.style.left="0";
    document.body.style.right="0";
    document.body.style.width="100%";
    document.body.style.overflow="hidden";
  }
  function unlockBody(){
    if(!bodyLocked)return;
    bodyLocked=false;
    document.body.classList.remove("modal-open");
    document.body.style.position="";
    document.body.style.top="";
    document.body.style.left="";
    document.body.style.right="";
    document.body.style.width="";
    document.body.style.overflow="";
    window.scrollTo(0,scrollY);
  }

  window.openModal=function(html,opts){
    opts=opts||{};
    saveModalScroll();
    var prevKey=modalKey;
    if(opts.key)modalKey=opts.key;

    var root=document.getElementById("modalRoot")||modalRoot;
    root.innerHTML='<div class="modal-mask" id="modalMask"><div class="modal-panel" id="modalPanel">'+html+'</div></div>';
    lockBody();

    var mask=document.getElementById("modalMask");
    if(mask&&!mask._bound){
      mask._bound=1;
      mask.addEventListener("click",function(e){
        if(e.target.id==="modalMask"){
          e.preventDefault();
          e.stopPropagation();
          window.closeModal({refresh:false});
        }
      });
      mask.addEventListener("touchmove",function(e){
        if(e.target.id==="modalMask")e.preventDefault();
      },{passive:false});
    }

    var panel=document.getElementById("modalPanel");
    if(panel){
      panel.addEventListener("click",function(e){e.stopPropagation();});
      if(opts.key&&opts.key===prevKey&&modalScroll>0){
        restoreModalScroll();
      }else if(!opts.key&&modalScroll>0&&prevKey){
        restoreModalScroll();
      }else{
        modalScroll=0;
        panel.scrollTop=0;
      }
    }

    /* 直接绑定关闭，不靠 MutationObserver 全树扫描 */
    var btn=document.getElementById("mClose");
    if(btn){
      btn.onclick=function(e){
        if(e){e.preventDefault();e.stopPropagation();}
        window.closeModal({refresh:false});
      };
    }
  };

  window.closeModal=function(opts){
    opts=opts||{};
    saveModalScroll();
    var root=document.getElementById("modalRoot")||modalRoot;
    root.innerHTML="";
    modalKey="";
    unlockBody();
    if(opts.refresh){
      savePageScroll();
      if(typeof renderGame==="function"&&state&&state.player){
        skipCloseOnRender=true;
        renderGame();
        skipCloseOnRender=false;
        restorePageScroll();
      }
    }
  };

  var _renderGame=typeof renderGame==="function"?renderGame:null;
  if(_renderGame){
    window.renderGame=function(){
      savePageScroll();
      if(!skipCloseOnRender){
        if(!document.getElementById("modalPanel")){
          var root=document.getElementById("modalRoot")||modalRoot;
          if(root)root.innerHTML="";
          unlockBody();
        }
      }
      _renderGame();
      restorePageScroll();
    };
  }

  function quietSave(){
    if(typeof saveGame==="function")saveGame(state);
  }

  function wireCloseOnly(btn){
    if(!btn)return;
    btn.onclick=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      window.closeModal({refresh:false});
    };
  }

  function patchNpc(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    window.modalNpc=function(npcId){
      saveModalScroll();
      modalKey="npc:"+npcId;
      _m(npcId);
      wireCloseOnly(document.getElementById("mClose"));
      restoreModalScroll();
    };
  }
  patchNpc();
  setTimeout(patchNpc,0);

  function patchSect(){
    if(typeof modalSect!=="function")return;
    var _s=modalSect;
    window.modalSect=function(sect){
      saveModalScroll();
      modalKey="sect:"+(sect&&sect.id);
      _s(sect);
      wireCloseOnly(document.getElementById("mClose"));
      restoreModalScroll();
    };
  }
  patchSect();

  ["modalChar","modalSkills","modalBag","modalRelations","modalQuest","modalMeridian","modalHome"].forEach(function(name){
    if(typeof window[name]!=="function")return;
    var _fn=window[name];
    window[name]=function(){
      var args=arguments;
      saveModalScroll();
      modalKey=name;
      var ret=_fn.apply(this,args);
      wireCloseOnly(document.getElementById("mClose"));
      return ret;
    };
  });

  var _rg2=window.renderGame;
  window.renderGame=function(){
    savePageScroll();
    _rg2();
    restorePageScroll();
    ["#charBtn","#skillBtn","#bagBtn","#sectBtn","#relBtn","#questBtn","#homeBtn"].forEach(function(sel){
      var el=document.querySelector(sel);
      if(!el||el.dataset.smoothScroll)return;
      el.dataset.smoothScroll="1";
      var prev=el.onclick;
      el.onclick=function(e){
        savePageScroll();
        if(prev)return prev.call(this,e);
      };
    });
  };

  if(!document.getElementById("ui-smooth-style")){
    var st=document.createElement("style");
    st.id="ui-smooth-style";
    st.textContent=[
      ".modal-mask{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}",
      ".modal-panel{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}",
      "body.modal-open{overflow:hidden;touch-action:none}",
      ".btn,.map-node,.npc-btn{-webkit-tap-highlight-color:transparent}",
      ".modal-panel .btn{touch-action:manipulation}"
    ].join("\n");
    document.head.appendChild(st);
  }

  window.__uiSmooth={
    savePageScroll:savePageScroll,
    restorePageScroll:restorePageScroll,
    saveModalScroll:saveModalScroll,
    restoreModalScroll:restoreModalScroll,
    quietSave:quietSave
  };

})();
