/* 背包 UI */
(function(){
  function rarityTag(r){
    var c=RARITY_COLOR[r]||"#b9a58a";
    return '<span class="tag" style="border-color:'+c+';color:'+c+'">'+r+'</span>';
  }
  function itemLine(stack,player){
    var def=getItemById(stack.id);if(!def)return"";
    var icon=ITEM_ICON[def.type]||"物";
    var cnt=stack.count>1?(" ×"+stack.count):"";
    return '<div class="item-row" data-id="'+def.id+'">'+'
      '<span class="item-icon">'+icon+'</span>'+'
      '<div class="item-meta"><b>'+def.name+'</b>'+cnt+' '+rarityTag(def.rarity)+
      '<p class="small">'+def.type+(def.atk?" · 攻+"+def.atk:"")+(def.def?" · 防+"+def.def:"")+(def.heal?" · 血+"+def.heal:"")+(def.mp?" · 内+"+def.mp:"")+(def.gift?" · 礼+"+def.gift:"")+'</p></div></div>';
  }
  window.modalBag=function(filter){
    var p=ensurePlayer(state.player);ensureBag(p);
    filter=filter||"全部";
    var types=["全部"].concat(ITEM_TYPES);
    var list=p.bag.filter(function(s){
      if(filter==="全部")return true;
      var d=getItemById(s.id);return d&&d.type===filter;
    });
    var eq=p.equip;
    function eqName(slot){
      if(!eq[slot])return"空";
      var d=getItemById(eq[slot]);return d?d.name:eq[slot];
    }
    var filtHtml=types.map(function(t){
      return '<button class="btn sm bag-filter'+(t===filter?" primary":"")+'" data-f="'+t+'">'+t+'</button>';
    }).join("");
    var listHtml=list.length?list.map(function(s){return itemLine(s,p);}).join(""):'<p class="small">背包空空如也。</p>';
    openModal(
      '<div class="modal-head"><h2 class="section-title">背包 '+bagUsed(p)+'/'+p.bagCap+'</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<div class="equip-row small">'+
        '<span>武器：<b>'+eqName("weapon")+'</b> '+(eq.weapon?'<button class="btn sm unequip" data-slot="weapon">卸</button>':'')+'</span> '+
        '<span>防具：<b>'+eqName("armor")+'</b> '+(eq.armor?'<button class="btn sm unequip" data-slot="armor">卸</button>':'')+'</span> '+
        '<span>饰品：<b>'+eqName("accessory")+'</b> '+(eq.accessory?'<button class="btn sm unequip" data-slot="accessory">卸</button>':'')+'</span>'+
      '</div>'+
      '<div class="row" style="margin:6px 0">'+filtHtml+'</div>'+
      '<div class="item-list">'+listHtml+'</div>'+
      '<div id="itemDetail" class="item-detail small">点击物品查看详情</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa(".bag-filter").forEach(function(el){
      el.onclick=function(){modalBag(el.dataset.f);};
    });
    qsa(".unequip").forEach(function(el){
      el.onclick=function(){
        var r=unequipItem(p,el.dataset.slot);
        p.logs.unshift(r.msg);saveGame(state);modalBag(filter);
      };
    });
    qsa(".item-row").forEach(function(el){
      el.onclick=function(){showItemDetail(p,el.dataset.id,filter);};
    });
  };
  function showItemDetail(p,itemId,filter){
    var def=getItemById(itemId);if(!def)return;
    var box=qs("#itemDetail");if(!box)return;
    var stats="";
    if(def.atk)stats+="攻击+"+def.atk+" ";
    if(def.def)stats+="防御+"+def.def+" ";
    if(def.heal)stats+="回复气血"+def.heal+" ";
    if(def.mp)stats+="回复内力"+def.mp+" ";
    if(def.exp)stats+="武学经验+"+def.exp+" ";
    if(def.gift)stats+="赠礼好感+"+def.gift+" ";
    if(def.temp)stats+="临时增益 ";
    var actions="";
    if(def.type==="武器"||def.type==="防具"||def.type==="饰品")actions+='<button class="btn primary sm" id="btnEquip">装备</button> ';
    else if(def.type==="消耗品"&&!def.gift)actions+='<button class="btn primary sm" id="btnUse">使用</button> ';
    else if(def.type==="书卷")actions+='<button class="btn primary sm" id="btnUse">研读</button> ';
    if(!def.quest)actions+='<button class="btn sm" id="btnDrop">丢弃</button>';
    box.innerHTML='<b>'+def.name+'</b> '+rarityTag(def.rarity)+' <span class="tag">'+def.type+'</span>'+
      '<p>'+def.desc+'</p><p>'+stats+'</p><div class="row">'+actions+'</div>';
    if(qs("#btnEquip"))qs("#btnEquip").onclick=function(){
      var r=equipItem(p,itemId);p.logs.unshift(r.msg);saveGame(state);modalBag(filter);
    };
    if(qs("#btnUse"))qs("#btnUse").onclick=function(){
      var r=useItem(p,itemId);p.logs.unshift(r.msg);saveGame(state);modalBag(filter);
    };
    if(qs("#btnDrop"))qs("#btnDrop").onclick=function(){
      var r=discardItem(p,itemId,1);p.logs.unshift(r.msg);saveGame(state);modalBag(filter);
    };
  }

  var _rg=renderGame;
  renderGame=function(){
    _rg();
    var bar=document.querySelector(".toolbar");
    if(bar&&!qs("#bagBtn",bar)){
      var b=document.createElement("button");
      b.className="btn sm";b.id="bagBtn";b.textContent="背包";
      b.onclick=function(){modalBag();};
      var save=qs("#save",bar);
      if(save)bar.insertBefore(b,save);else bar.appendChild(b);
    }
  };
  var _ep=ensurePlayer;
  ensurePlayer=function(p){
    p=_ep(p);
    ensureBag(p);
    return p;
  };

  var _mNpc=modalNpc;
  modalNpc=function(npcId){
    _mNpc(npcId);
    var p=ensurePlayer(state.player);ensureBag(p);
    var gifts=p.bag.filter(function(s){var d=getItemById(s.id);return d&&d.gift;});
    if(!gifts.length)return;
    var panel=qs("#modalPanel");if(!panel)return;
    var div=document.createElement("div");
    div.innerHTML='<h3 class="section-title">赠礼</h3><div class="row" id="giftItems"></div>';
    panel.appendChild(div);
    var row=qs("#giftItems");
    gifts.forEach(function(s){
      var d=getItemById(s.id);
      var btn=document.createElement("button");
      btn.className="btn sm";btn.textContent=d.name+"（+"+d.gift+"）";
      btn.onclick=function(){
        var r=giftItemToNpc(p,findPerson(npcId),s.id);
        if(!r.ok)p.logs.unshift(r.msg);
        saveGame(state);modalNpc(npcId);
      };
      row.appendChild(btn);
    });
  };

  window.modalShop=function(locId){
    var p=ensurePlayer(state.player);
    var stock=SHOP_STOCK[locId]||[];
    if(!stock.length){p.logs.unshift("此地无店。");return;}
    var priceMod=typeof xunPriceMod==="function"?xunPriceMod(p):1;
    var html=stock.map(function(id){
      var d=getItemById(id);if(!d)return"";
      var cost=Math.max(1,Math.floor((d.price||10)*priceMod));
      return '<button class="btn sm buy-item" data-id="'+id+'" data-cost="'+cost+'">'+d.name+' '+cost+'两</button>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">购入</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<div class="row">'+html+'</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
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
  };
  var _rg2=renderGame;
  renderGame=function(){
    _rg2();
    var loc=state.player&&state.player.location;
    if(loc&&SHOP_STOCK[loc]){
      var panel=document.querySelectorAll(".panel")[1];
      if(panel&&!qs("#shopBtn")){
        var row=document.createElement("div");
        row.className="row compact-block";
        row.innerHTML='<button class="btn sm primary" id="shopBtn">商店</button>';
        panel.appendChild(row);
        qs("#shopBtn").onclick=function(){modalShop(loc);};
      }
    }
  };
})();
