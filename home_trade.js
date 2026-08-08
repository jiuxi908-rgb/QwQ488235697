/* 角色雷达 · 家园 · 交易出售 */
(function(){
  var HOME_UNLOCK_COST=200;
  var HOME_BASE_CAP=10;
  var SELL_RATE_SHOP=0.45;
  var SELL_RATE_BASE=0.3;

  function ensureHome(p){
    if(!p.home)p.home={unlocked:false,level:0,storage:[],cap:HOME_BASE_CAP,lastRestDay:0};
    if(!p.home.storage)p.home.storage=[];
    if(p.home.cap==null)p.home.cap=HOME_BASE_CAP+(p.home.level||0)*5;
    return p.home;
  }

  function radarSvg(stats,size){
    size=size||180;
    var keys=["arm","agi","bone","qi","wit","luck"];
    var labels=keys.map(function(k){return (STAT_LABELS&&STAT_LABELS[k])||k;});
    var cx=size/2,cy=size/2,R=size*0.36;
    var maxV=20;
    keys.forEach(function(k){if((stats[k]||0)>maxV)maxV=stats[k];});
    maxV=Math.max(12,Math.ceil(maxV/4)*4);
    var n=keys.length;
    function pt(i,r){
      var a=-Math.PI/2+i*2*Math.PI/n;
      return [cx+r*Math.cos(a),cy+r*Math.sin(a)];
    }
    var rings="";
    for(var lv=1;lv<=4;lv++){
      var pts=[];
      for(var i=0;i<n;i++){var p=pt(i,R*lv/4);pts.push(p[0].toFixed(1)+","+p[1].toFixed(1));}
      rings+='<polygon points="'+pts.join(" ")+'" fill="none" stroke="#4b3a2d" stroke-width="1" opacity="0.7"/>';
    }
    var axes="";
    for(var i=0;i<n;i++){
      var p=pt(i,R);
      axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" stroke="#4b3a2d" stroke-width="1"/>';
    }
    var dataPts=[];
    for(var i=0;i<n;i++){
      var v=Math.min(1,(stats[keys[i]]||0)/maxV);
      var p=pt(i,R*v);
      dataPts.push(p[0].toFixed(1)+","+p[1].toFixed(1));
    }
    var poly='<polygon points="'+dataPts.join(" ")+'" fill="rgba(217,173,98,0.35)" stroke="#d9ad62" stroke-width="2"/>';
    var dots="";
    for(var i=0;i<n;i++){
      var v=Math.min(1,(stats[keys[i]]||0)/maxV);
      var p=pt(i,R*v);
      dots+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="#d9ad62"/>';
    }
    var labs="";
    for(var i=0;i<n;i++){
      var p=pt(i,R+16);
      var val=stats[keys[i]]||0;
      labs+='<text x="'+p[0].toFixed(1)+'" y="'+p[1].toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" fill="#f5e8cf" font-size="10">'+labels[i]+' '+val+'</text>';
    }
    return '<svg class="radar-svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+rings+axes+poly+dots+labs+'</svg>';
  }

  function sellPrice(def,atShop){
    if(!def||!def.price)return 0;
    if(def.quest)return 0;
    var rate=atShop?SELL_RATE_SHOP:SELL_RATE_BASE;
    return Math.max(1,Math.floor(def.price*rate));
  }
  function canSellHere(loc){
    return loc&&typeof SHOP_STOCK!=="undefined"&&SHOP_STOCK[loc];
  }
  window.sellItem=function(player,itemId,count){
    ensureBag(player);
    count=count||1;
    var def=getItemById(itemId);
    if(!def)return{ok:false,msg:"无效物品"};
    if(def.quest)return{ok:false,msg:"任务物品不可出售"};
    if(typeof isEquipped==="function"&&isEquipped(player,itemId))return{ok:false,msg:"请先卸下再卖"};
    if(!hasItem(player,itemId,count))return{ok:false,msg:"数量不足"};
    var atShop=canSellHere(player.location);
    var unit=sellPrice(def,atShop);
    if(unit<=0)return{ok:false,msg:"此物无人收购"};
    if(!removeItem(player,itemId,count))return{ok:false,msg:"扣除失败"};
    var gain=unit*count;
    player.silver+=gain;
    var msg="售出【"+def.name+"】×"+count+"（银两+"+gain+(atShop?"·店收":"·估货")+"）";
    player.logs.unshift(msg);
    return{ok:true,msg:msg,gain:gain};
  };

  window.unlockHome=function(player){
    var h=ensureHome(player);
    if(h.unlocked)return{ok:false,msg:"已有家园"};
    if(player.silver<HOME_UNLOCK_COST)return{ok:false,msg:"银两不足（需"+HOME_UNLOCK_COST+"）"};
    player.silver-=HOME_UNLOCK_COST;
    h.unlocked=true;h.level=1;h.cap=HOME_BASE_CAP;
    player.logs.unshift("你在清河镇置下一处小院，是为家园（银两-"+HOME_UNLOCK_COST+"）。");
    return{ok:true,msg:"置办家园成功"};
  };
  window.upgradeHome=function(player){
    var h=ensureHome(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(h.level>=5)return{ok:false,msg:"家园已至满级"};
    var cost=150+h.level*100;
    if(player.silver<cost)return{ok:false,msg:"银两不足（需"+cost+"）"};
    player.silver-=cost;
    h.level+=1;
    h.cap=HOME_BASE_CAP+h.level*5;
    player.logs.unshift("家园扩建至"+h.level+"级，仓储上限"+h.cap+"（银两-"+cost+"）。");
    return{ok:true,msg:"扩建成功"};
  };
  window.restAtHome=function(player){
    var h=ensureHome(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    if(h.lastRestDay===player.day)return{ok:false,msg:"今日已在家中休整过"};
    h.lastRestDay=player.day;
    var heal=Math.floor(player.maxHp*0.4);
    var mp=Math.floor(player.maxMp*0.4);
    player.hp=Math.min(player.maxHp,player.hp+heal);
    player.mp=Math.min(player.maxMp,player.mp+mp);
    player.logs.unshift("在家园休整，气血+"+heal+"，内力+"+mp+"。");
    return{ok:true,msg:"休整完毕"};
  };
  function storageUsed(h){return (h.storage||[]).reduce(function(n){return n+1;},0);}
  window.depositToHome=function(player,itemId,count){
    var h=ensureHome(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    count=count||1;
    var def=getItemById(itemId);
    if(!def)return{ok:false,msg:"无效"};
    if(def.quest)return{ok:false,msg:"任务物品不可存"};
    if(typeof isEquipped==="function"&&isEquipped(player,itemId))return{ok:false,msg:"请先卸下"};
    if(!hasItem(player,itemId,count))return{ok:false,msg:"背包没有"};
    if(storageUsed(h)>=h.cap)return{ok:false,msg:"仓储已满"};
    if(!removeItem(player,itemId,count))return{ok:false,msg:"扣除失败"};
    var stackMax=def.stack||1;
    if(stackMax>1){
      var exist=h.storage.find(function(s){return s.id===itemId;});
      if(exist){exist.count+=count;}
      else h.storage.push({id:itemId,count:count});
    }else{
      for(var i=0;i<count;i++){
        if(storageUsed(h)>=h.cap)break;
        h.storage.push({id:itemId,count:1});
      }
    }
    return{ok:true,msg:"存入【"+def.name+"】×"+count};
  };
  window.withdrawFromHome=function(player,itemId,count){
    var h=ensureHome(player);
    if(!h.unlocked)return{ok:false,msg:"尚未置办家园"};
    count=count||1;
    var left=count;
    for(var i=h.storage.length-1;i>=0&&left>0;i--){
      var s=h.storage[i];
      if(s.id!==itemId)continue;
      if(s.count<=left){left-=s.count;h.storage.splice(i,1);}
      else{s.count-=left;left=0;}
    }
    if(left===count)return{ok:false,msg:"仓储中没有"};
    var got=count-left;
    var r=addItem(player,itemId,got);
    if(!r.ok){
      h.storage.push({id:itemId,count:got});
      return{ok:false,msg:r.msg||"背包已满"};
    }
    return{ok:true,msg:"取出【"+(getItemById(itemId)||{}).name+"】×"+got};
  };

  window.modalHome=function(){
    var p=ensurePlayer(state.player);
    var h=ensureHome(p);
    if(!h.unlocked){
      openModal(
        '<div class="modal-head"><h2 class="section-title">家园</h2><button class="modal-close" id="mClose">关闭</button></div>'+
        '<p class="small">江湖人漂泊久了，总想有个落脚处。</p>'+
        '<p>在清河镇置办一处小院，需 <b class="power">'+HOME_UNLOCK_COST+'</b> 两银子。</p>'+
        '<p class="small">解锁后可：休整回血、仓储物品、逐步扩建。</p>'+
        '<div class="row" style="margin-top:10px"><button class="btn primary" id="buyHome">置办家园（'+HOME_UNLOCK_COST+'两）</button></div>'
      );
      qs("#mClose").onclick=function(){closeModal();renderGame();};
      qs("#buyHome").onclick=function(){
        var r=unlockHome(p);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalHome();
      };
      return;
    }
    var storeHtml=h.storage.length?h.storage.map(function(s){
      var d=getItemById(s.id);if(!d)return"";
      var cnt=s.count>1?(" ×"+s.count):"";
      return '<div class="item-row home-store" data-id="'+d.id+'">'+
        '<span class="item-icon">'+(ITEM_ICON[d.type]||"物")+'</span>'+
        '<div class="item-meta"><b>'+d.name+'</b>'+cnt+
        '<p class="small">'+d.type+'</p></div>'+
        '<button class="btn sm withdraw" data-id="'+d.id+'">取</button></div>';
    }).join(""):'<p class="small">仓储空空。</p>';
    var upCost=h.level>=5?0:(150+h.level*100);
    openModal(
      '<div class="modal-head"><h2 class="section-title">家园 · '+h.level+'级</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">清河小院 · 仓储 '+storageUsed(h)+'/'+h.cap+' · 银两 '+p.silver+'</p>'+
      '<div class="row" style="margin:8px 0">'+
        '<button class="btn primary sm" id="homeRest">休整回血</button>'+
        (h.level<5?'<button class="btn sm" id="homeUp">扩建（'+upCost+'两）</button>':'<span class="tag">满级</span>')+
        '<button class="btn sm" id="homeDep">从背包存入</button>'+
      '</div>'+
      '<h3 class="section-title">仓储</h3>'+
      '<div class="item-list">'+storeHtml+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qs("#homeRest").onclick=function(){
      var r=restAtHome(p);if(!r.ok)p.logs.unshift(r.msg);
      saveGame(state);modalHome();
    };
    if(qs("#homeUp"))qs("#homeUp").onclick=function(){
      var r=upgradeHome(p);if(!r.ok)p.logs.unshift(r.msg);
      saveGame(state);modalHome();
    };
    qs("#homeDep").onclick=function(){modalHomeDeposit();};
    qsa(".withdraw").forEach(function(el){
      el.onclick=function(){
        var r=withdrawFromHome(p,el.dataset.id,1);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalHome();
      };
    });
  };
  function modalHomeDeposit(){
    var p=ensurePlayer(state.player);
    var list=p.bag.filter(function(s){
      var d=getItemById(s.id);
      return d&&!d.quest&&!(typeof isEquipped==="function"&&isEquipped(p,s.id));
    });
    var html=list.length?list.map(function(s){
      var d=getItemById(s.id);
      return '<button class="btn sm dep-item" data-id="'+d.id+'">'+d.name+(s.count>1?("×"+s.count):"")+'</button>';
    }).join(" "):'<p class="small">背包无可存物品</p>';
    openModal(
      '<div class="modal-head"><h2 class="section-title">存入家园</h2><button class="modal-close" id="mClose">返回</button></div>'+
      '<div class="row">'+html+'</div>'
    );
    qs("#mClose").onclick=function(){modalHome();};
    qsa(".dep-item").forEach(function(el){
      el.onclick=function(){
        var r=depositToHome(p,el.dataset.id,1);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalHomeDeposit();
      };
    });
  }

  var _mChar=modalChar;
  modalChar=function(){
    var p=ensurePlayer(state.player);
    var d=derived(p);var power=calcCombatPower(p);
    var mySect=p.sect?getSectById(p.sect):null;
    var rankName=mySect?(RANK_NAMES[p.sectRank]||"弟子"):"";
    var originName=(origins.find(function(o){return o.id===p.origin;})||{}).name||p.origin||"—";
    var talentName=(talents.find(function(t){return t.id===p.talent;})||{}).name||p.talent||"—";
    var h=ensureHome(p);
    var eqSum=typeof equipSummaryText==="function"?equipSummaryText(p):"";
    var bondLine="";
    if(p.bonds){
      var bk=Object.keys(p.bonds).filter(function(k){return p.bonds[k];});
      if(bk.length)bondLine='<p class="small" style="color:#e8a0a0">结缘：'+bk.map(function(k){return (p.bonds[k].name||k);}).join("、")+'</p>';
    }
    openModal(
      '<div class="modal-head"><h2 class="section-title">角色 · '+p.name+'</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">'+p.gender+' · '+(p.age||16)+'岁 · 第'+p.day+'日'+(mySect?(' · '+mySect.name+' · '+rankName+'（贡'+p.contrib+'）'):'')+'</p>'+
      '<p class="small">出身 '+originName+' · 天赋 '+talentName+'</p>'+
      '<div class="radar-wrap">'+radarSvg(p.stats,180)+'</div>'+
      '<div class="stat-grid" style="margin-top:4px">'+
        Object.keys(STAT_LABELS).map(function(k){
          return '<div class="stat"><b>'+STAT_LABELS[k]+'</b><span>'+p.stats[k]+'</span></div>';
        }).join("")+
      '</div>'+
      '<hr>'+
      '<div class="stat-grid">'+
        '<div class="stat"><b>气血</b><span>'+p.hp+'/'+p.maxHp+'</span></div>'+
        '<div class="stat"><b>内力</b><span>'+p.mp+'/'+p.maxMp+'</span></div>'+
        '<div class="stat"><b>银两</b><span>'+p.silver+'</span></div>'+
        '<div class="stat"><b>攻/闪</b><span>'+d.attack+'/'+d.dodge+'</span></div>'+
        '<div class="stat"><b>战力</b><span class="power">'+power+'</span></div>'+
        '<div class="stat"><b>武学</b><span>'+(p.skills?p.skills.length:0)+'</span></div>'+
      '</div>'+
      (eqSum?'<p class="small" style="margin-top:6px">装备：'+eqSum+'</p>':'')+
      bondLine+
      (h.unlocked?'<p class="small">家园 '+h.level+'级 · 仓 '+storageUsed(h)+'/'+h.cap+'</p>':'')+
      '<div class="row" style="margin-top:10px">'+
        '<button class="btn" id="mSkill">武学</button>'+
        '<button class="btn" id="mBag">背包</button>'+
        '<button class="btn primary" id="mHome">家园</button>'+
        '<button class="btn" id="mSave">保存</button>'+
        '<button class="btn" id="mDel">删档</button>'+
      '</div>'
    );
    qs("#mClose").onclick=closeModal;
    qs("#mSkill").onclick=function(){modalSkills();};
    if(qs("#mBag"))qs("#mBag").onclick=function(){if(typeof modalBag==="function")modalBag();};
    qs("#mHome").onclick=function(){modalHome();};
    qs("#mSave").onclick=function(){saveGame(state);p.logs.unshift("保存了江湖足迹。");closeModal();renderGame();};
    qs("#mDel").onclick=function(){if(confirm("确定删除存档？")){deleteSave();closeModal();renderStart();}};
  };

  window.modalSell=function(){
    var p=ensurePlayer(state.player);
    var atShop=canSellHere(p.location);
    var rate=atShop?SELL_RATE_SHOP:SELL_RATE_BASE;
    var list=p.bag.filter(function(s){
      var d=getItemById(s.id);
      return d&&!d.quest&&d.price&&!(typeof isEquipped==="function"&&isEquipped(p,s.id));
    });
    var html=list.length?list.map(function(s){
      var d=getItemById(s.id);
      var unit=sellPrice(d,atShop);
      return '<div class="item-row" style="cursor:default">'+
        '<span class="item-icon">'+(ITEM_ICON[d.type]||"物")+'</span>'+
        '<div class="item-meta"><b>'+d.name+'</b>'+(s.count>1?(" ×"+s.count):"")+
        '<p class="small">原价'+d.price+' · 回收'+unit+'两</p></div>'+
        '<button class="btn sm primary sell-one" data-id="'+d.id+'">卖</button></div>';
    }).join(""):'<p class="small">没有可出售的物品。</p>';
    openModal(
      '<div class="modal-head"><h2 class="section-title">出售</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">'+(atShop?"本地商铺收购 · ":"估货收购 · ")+"回收约"+Math.floor(rate*100)+"% 原价 · 银两 "+p.silver+'</p>'+
      '<div class="item-list">'+html+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa(".sell-one").forEach(function(el){
      el.onclick=function(){
        var r=sellItem(p,el.dataset.id,1);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalSell();
      };
    });
  };

  window.modalShop=function(locId){
    var p=ensurePlayer(state.player);
    var stock=(typeof SHOP_STOCK!=="undefined"&&SHOP_STOCK[locId])||[];
    if(!stock.length){p.logs.unshift("此地无店。");return;}
    var priceMod=typeof xunPriceMod==="function"?xunPriceMod(p):1;
    var buyHtml=stock.map(function(id){
      var d=getItemById(id);if(!d)return"";
      var cost=Math.max(1,Math.floor((d.price||10)*priceMod));
      var tip=typeof formatItemStats==="function"?formatItemStats(d):"";
      return '<div class="item-row buy-row" style="cursor:default">'+
        '<span class="item-icon">'+(ITEM_ICON[d.type]||"物")+'</span>'+
        '<div class="item-meta"><b>'+d.name+'</b>'+
        '<p class="small">'+(tip||d.type)+'</p></div>'+
        '<button class="btn sm primary buy-item" data-id="'+id+'" data-cost="'+cost+'">'+cost+'两</button></div>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">商铺</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">银两：<b class="power">'+p.silver+'</b> · 时价×'+priceMod.toFixed(2)+'</p>'+
      '<div class="row" style="margin:6px 0">'+
        '<button class="btn sm primary" id="tabBuy">购入</button>'+
        '<button class="btn sm" id="tabSell">出售</button>'+
      '</div>'+
      '<div id="shopBody" class="item-list">'+buyHtml+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    function bindBuy(){
      qsa(".buy-item").forEach(function(el){
        el.onclick=function(){
          var cost=parseInt(el.dataset.cost,10);
          if(p.silver<cost){p.logs.unshift("银两不足");saveGame(state);return;}
          var r=addItem(p,el.dataset.id,1);
          if(!r.ok){p.logs.unshift(r.msg);saveGame(state);return;}
          p.silver-=cost;
          p.logs.unshift("购入【"+getItemById(el.dataset.id).name+"】（银两-"+cost+"）");
          saveGame(state);modalShop(locId);
        };
      });
    }
    bindBuy();
    qs("#tabBuy").onclick=function(){modalShop(locId);};
    qs("#tabSell").onclick=function(){
      qs("#tabBuy").classList.remove("primary");
      qs("#tabSell").classList.add("primary");
      var list=p.bag.filter(function(s){
        var d=getItemById(s.id);
        return d&&!d.quest&&d.price&&!(typeof isEquipped==="function"&&isEquipped(p,s.id));
      });
      var sellHtml=list.length?list.map(function(s){
        var d=getItemById(s.id);
        var unit=sellPrice(d,true);
        return '<div class="item-row" style="cursor:default">'+
          '<span class="item-icon">'+(ITEM_ICON[d.type]||"物")+'</span>'+
          '<div class="item-meta"><b>'+d.name+'</b>'+(s.count>1?("×"+s.count):"")+
          '<p class="small">回收 '+unit+'两</p></div>'+
          '<button class="btn sm primary sell-one" data-id="'+d.id+'">卖</button></div>';
      }).join(""):'<p class="small">没有可售物品</p>';
      qs("#shopBody").innerHTML=sellHtml;
      qsa(".sell-one").forEach(function(el){
        el.onclick=function(){
          var r=sellItem(p,el.dataset.id,1);
          if(!r.ok)p.logs.unshift(r.msg);
          saveGame(state);
          qs("#tabSell").onclick();
        };
      });
    };
  };

  function wireExtra(){
    var bar=document.querySelector(".toolbar");
    if(!bar)return;
    if(!qs("#homeBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm";b.id="homeBtn";b.textContent="家园";
      b.onclick=function(){modalHome();};
      var after=qs("#bagBtn",bar)||qs("#skillBtn",bar);
      if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);
      else bar.appendChild(b);
    }else{
      qs("#homeBtn",bar).onclick=function(){modalHome();};
    }
    if(!qs("#sellBtn",bar)){
      var s=document.createElement("button");
      s.className="btn sm";s.id="sellBtn";s.textContent="出售";
      s.onclick=function(){modalSell();};
      var hb=qs("#homeBtn",bar);
      if(hb&&hb.nextSibling)bar.insertBefore(s,hb.nextSibling);
      else bar.appendChild(s);
    }else{
      qs("#sellBtn",bar).onclick=function(){modalSell();};
    }
  }
  var _rg=renderGame;
  renderGame=function(){_rg();wireExtra();};
})();
