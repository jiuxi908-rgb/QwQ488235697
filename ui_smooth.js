/* 二级界面体验：滚动保持 · 背景锁定 · 弹窗内刷新不跳页 */
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
      /* 再补一次，防止部分浏览器布局后跳动 */
      setTimeout(function(){window.scrollTo(0,y);},0);
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
      if(panel){
        panel.scrollTop=y;
        setTimeout(function(){
          var p2=document.getElementById("modalPanel");
          if(p2)p2.scrollTop=y;
        },0);
      }
    });
  }

  function lockBody(){
    if(bodyLocked)return;
    bodyLocked=true;
    savePageScroll();
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
    document.body.style.position="";
    document.body.style.top="";
    document.body.style.left="";
    document.body.style.right="";
    document.body.style.width="";
    document.body.style.overflow="";
    window.scrollTo(0,scrollY);
  }

  /* —— 重写 openModal / closeModal —— */
  var _openModal=typeof openModal==="function"?openModal:null;
  var _closeModal=typeof closeModal==="function"?closeModal:null;

  window.openModal=function(html,opts){
    opts=opts||{};
    /* 若已有弹窗，先记下滚动，便于同级刷新（对话/门派内操作） */
    saveModalScroll();
    var prevKey=modalKey;
    if(opts.key)modalKey=opts.key;

    modalRoot.innerHTML='<div class="modal-mask" id="modalMask"><div class="modal-panel" id="modalPanel">'+html+'</div></div>';
    lockBody();

    var mask=document.getElementById("modalMask");
    if(mask){
      mask.addEventListener("click",function(e){
        if(e.target.id==="modalMask"){
          e.preventDefault();
          e.stopPropagation();
          window.closeModal({refresh:false});
        }
      });
      /* 阻止遮罩上的 touchmove 带动背后页面（iOS） */
      mask.addEventListener("touchmove",function(e){
        if(e.target.id==="modalMask")e.preventDefault();
      },{passive:false});
    }

    var panel=document.getElementById("modalPanel");
    if(panel){
      panel.addEventListener("click",function(e){e.stopPropagation();});
      /* 同 key 刷新时恢复弹窗内滚动 */
      if(opts.key&&opts.key===prevKey&&modalScroll>0){
        restoreModalScroll();
      }else if(!opts.key&&modalScroll>0&&prevKey){
        restoreModalScroll();
      }else{
        modalScroll=0;
        panel.scrollTop=0;
      }
    }
  };

  window.closeModal=function(opts){
    opts=opts||{};
    saveModalScroll();
    modalRoot.innerHTML="";
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

  /* —— renderGame：保留滚动，避免无意义关窗后跳顶 —— */
  var _renderGame=typeof renderGame==="function"?renderGame:null;
  if(_renderGame){
    window.renderGame=function(){
      savePageScroll();
      if(!skipCloseOnRender){
        /* 仅在没有弹窗时顺带清空；有弹窗时由调用方决定 */
        if(!document.getElementById("modalPanel")){
          if(_closeModal){/* use new close without refresh */
            modalRoot.innerHTML="";
            unlockBody();
          }
        }
      }
      _renderGame();
      restorePageScroll();
    };
  }

  /* 包装：弹窗内操作只刷新弹窗，主界面静默存档不整页重绘 */
  function quietSave(){
    if(typeof saveGame==="function")saveGame(state);
  }

  /* 关闭按钮统一：只关窗，不强制 renderGame（避免滑动重置） */
  function wireCloseOnly(btn){
    if(!btn)return;
    btn.onclick=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      window.closeModal({refresh:false});
    };
  }

  /* 观察弹窗打开后，把 #mClose 绑成「只关闭」 */
  var obs=new MutationObserver(function(){
    var btn=document.getElementById("mClose");
    if(btn&&!btn.dataset.smooth){
      btn.dataset.smooth="1";
      wireCloseOnly(btn);
    }
  });
  if(modalRoot)obs.observe(modalRoot,{childList:true,subtree:true});

  /* —— 覆盖常见「关窗+整页刷新」路径 —— */
  /* NPC 对话：操作后只重开弹窗，关窗不 renderGame */
  function patchNpc(){
    if(typeof modalNpc!=="function")return;
    var _m=modalNpc;
    window.modalNpc=function(npcId){
      saveModalScroll();
      modalKey="npc:"+npcId;
      _m(npcId);
      /* 覆盖可能被旧逻辑写成 close+render 的关闭 */
      var btn=document.getElementById("mClose");
      wireCloseOnly(btn);
      restoreModalScroll();
    };
  }
  patchNpc();
  setTimeout(patchNpc,0);

  /* 门派弹窗 */
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

  /* 角色/武学/背包/关系/任务等：关窗不刷主界面 */
  ["modalChar","modalSkills","modalBag","modalRelations","modalQuest","modalMeridian","modalHome"].forEach(function(name){
    if(typeof window[name]!=="function")return;
    var _fn=window[name];
    window[name]=function(){
      var args=arguments;
      saveModalScroll();
      modalKey=name;
      var ret=_fn.apply(this,args);
      wireCloseOnly(document.getElementById("mClose"));
      /* 若函数内部再次 openModal，滚动在 openModal 里处理 */
      return ret;
    };
  });

  /* 工具栏按钮：打开前记下滚动，关窗后仍在原处 */
  var _rg2=window.renderGame;
  window.renderGame=function(){
    savePageScroll();
    _rg2();
    restorePageScroll();
    /* 重新绑定工具栏：打开弹窗前存滚动 */
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

  /* CSS：弹窗滚动更顺，防止橡皮筋带动背后 */
  var st=document.createElement("style");
  st.id="ui-smooth-style";
  st.textContent=[
    ".modal-mask{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}",
    ".modal-panel{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}",
    "body.modal-open{overflow:hidden;touch-action:none}",
    /* 防止点击高亮导致误触重排 */
    ".btn,.map-node,.npc-btn{-webkit-tap-highlight-color:transparent}",
    ".modal-panel .btn{touch-action:manipulation}"
  ].join("\n");
  document.head.appendChild(st);

  /* 给 body 加 class 方便样式 */
  var _lock=lockBody,_unlock=unlockBody;
  lockBody=function(){_lock();document.body.classList.add("modal-open");};
  unlockBody=function(){_unlock();document.body.classList.remove("modal-open");};

  window.__uiSmooth={
    savePageScroll:savePageScroll,
    restorePageScroll:restorePageScroll,
    saveModalScroll:saveModalScroll,
    restoreModalScroll:restoreModalScroll,
    quietSave:quietSave
  };

})();
