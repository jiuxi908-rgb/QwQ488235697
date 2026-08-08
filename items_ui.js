/* 背包 · 装备 · 商店 UI */
(function(){
  function rarityTag(r){
    var c=RARITY_COLOR[r]||"#b9a58a";
    return '<span class="tag" style="border-color:'+c+';color:'+c+'">'+r+'</span>';
  }
  function rarityBorder(r){
    return RARITY_COLOR[r]||"#4b3a2d";
  }
  function itemLine(stack,player){
    var def=getItemById(stack.id);if(!def)return"";
    var icon=ITEM_ICON[def.type]||"物";
    var cnt=stack.count>1?(" ×"+stack.count):"";
    var tip=typeof formatItemStats==="function"?formatItemStats(def):"";
    var eq=isEquipped(player,def.id);
    var eqMark=eq?'<span class="tag" style="border-color:var(--gold);color:var(--gold)">穿</span> ':"";
    var bc=rarityBorder(def.rarity);
    return '<div class="item-row'+(eq?" equipped":"")+'" data-id="'+def.id+'">'+
      '<span class="item-icon" style="border-color:'+bc+';color:'+bc+'">'+icon+'</span>'+
      '<div class="item-meta"><b>'+eqMark+def.name+'</b>'+cnt+' '+rarityTag(def.rarity)+
      '<p class="small">'+def.type+(tip?(" · "+tip):"")+'</p></div></div>';
  }
  function equipSlotCard(player,slot,label){
    var id=player.equip[slot];
    if(!id){
      return '<div class="equip-slot empty" data-slot="'+slot+'">'+
        '<div class="equip-slot-label">'+label+'</div>'+
        '<div class="equip-slot-body"><span class="small">空</span></div></div>';
    }
    var d=getItemById(id);
    var name=d?d.name:id;
    var tip=d&&typeof formatItemStats==="function"?formatItemStats(d):"";
    var rc=d?rarityBorder(d.rarity):"#4b3a2d";
    var icon=d?(ITEM_ICON[d.type]||"物"):"?";
    return '<div class="equip-slot filled" data-slot="'+slot+'" style="border-color:'+rc+'">'+
      '<div class="equip-slot-label">'+label+'</div>'+
      '<div class="equip-slot-body">'+
        '<span class="item-icon sm" style="border-color:'+rc+';color:'+rc+'">'+icon+'</span>'+
        '<div><b style="font-size:12px">'+name+'</b>'+(d?" "+rarityTag(d.rarity):"")+
        (tip?'<p class="small" style="margin:2px 0 0">'+tip+'</p>':"")+'</div>'+
        '<button class="btn sm unequip" data-slot="'+slot+'">卸</button>'+
      '</div></div>';
  }
  window.modalBag=function(filter){
    if(!state||!state.player)return;
    var p=ensurePlayer(state.player);ensureBag(p);
    filter=filter||"全部";
    var types=["全部","武器","防具","饰品","消耗品","材料","书卷","任务"];
    var list=p.bag.filter(function(s){
      if(filter==="全部")return true;
      var d=getItemById(s.id);return d&&d.type===filter;
    });
    var filtHtml=types.map(function(t){
      return '<button class="btn sm bag-filter'+(t===filter?" primary":"")+'" data-f="'+t+'">'+t+'</button>';
    }).join("");
    var listHtml=list.length?list.map(function(s){return itemLine(s,p);}).join(""):'<p class="small">背包空空如也。</p>';
    var sum=typeof equipSummaryText==="function"?equipSummaryText(p):"";
    var buffHtml="";
    if(p.tempBuffs&&p.tempBuffs.length){
      buffHtml='<p class="small" style="margin:4px 0">临时：'+p.tempBuffs.map(function(tb){
        return (tb.name||"增益")+"剩"+tb.left+"日";
      }).join("、")+'</p>';
    }
    openModal(
      '<div class="modal-head"><h2 class="section-title">背包 '+bagUsed(p)+'/'+p.bagCap+'</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<div class="equip-grid">'+
        equipSlotCard(p,"weapon","武器")+
        equipSlotCard(p,"armor","防具")+
        equipSlotCard(p,"accessory","饰品")+
      '</div>'+
      '<p class="small equip-sum">装备加成：<b class="power">'+sum+'</b></p>'+
      buffHtml+
      '<div class="row" style="margin:6px 0;gap:4px">'+filtHtml+'</div>'+
      '<div class="item-list">'+listHtml+'</div>'+
      '<div id="itemDetail" class="item-detail small">点击物品查看详情与操作</div>'
    );
    qs("#mClose").onclick=function(){closeModal();renderGame();};
    qsa(".bag-filter").forEach(function(el){
      el.onclick=function(){modalBag(el.dataset.f);};
    });
    qsa(".unequip").forEach(function(el){
      el.onclick=function(e){
        e.stopPropagation();
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
    var stats=typeof formatItemStats==="function"?formatItemStats(def):"";
    var compare="";
    var slot=equipSlotOf(def.type);
    if(slot&&p.equip[slot]&&p.equip[slot]!==itemId){
      var cur=getItemById(p.equip[slot]);
      if(cur){
        var diffs=[];
        ["atk","def","mpBonus","arm","agi","wit","luck"].forEach(function(k){
          var a=def[k]||0,b=cur[k]||0;
          if(a!==b){
            var lab={atk:"攻",def:"防",mpBonus:"内限",arm:"臂",agi:"身",wit:"悟",luck:"福"}[k];
            var dlt=a-b;
            diffs.push(lab+(dlt>0?"+":"")+dlt);
          }
        });
        if(diffs.length)compare='<p class="small" style="color:var(--gold)">相对当前装备：'+diffs.join(" · ")+'</p>';
        else compare='<p class="small">与当前装备属性相近</p>';
      }
    }
    var actions="";
    if(def.type==="武器"||def.type==="防具"||def.type==="饰品"){
      if(isEquipped(p,itemId))actions+='<span class="tag" style="border-color:var(--gold);color:var(--gold)">已装备</span> ';
      else actions+='<button class="btn primary sm" id="btnEquip">装备</button> ';
    }else if(def.type==="消耗品"&&!def.gift)actions+='<button class="btn primary sm" id="btnUse">使用</button> ';
    else if(def.type==="书卷")actions+='<button class="btn primary sm" id="btnUse">研读</button> ';
    else if(def.quest&&def.flag)actions+='<button class="btn primary sm" id="btnUse">使用</button> ';
    if(!def.quest&&!isEquipped(p,itemId))actions+='<button class="btn sm" id="btnDrop">丢弃</button>';
    box.innerHTML='<b>'+def.name+'</b> '+rarityTag(def.rarity)+' <span class="tag">'+def.type+'</span>'+
      '<p>'+def.desc+'</p>'+
      (stats?'<p class="power">'+stats+'</p>':"")+
      compare+
      '<div class="row" style="margin-top:6px">'+actions+'</div>';
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

  function wireBagBtn(){
    var btn=qs("#bagBtn");
    if(btn){
      btn.onclick=function(){if(typeof modalBag==="function")modalBag();};
    }
  }

  var _ep=ensurePlayer;
  ensurePlayer=function(p){
    p=_ep(p);
    ensureBag(p);
    return p;
  };

  var _mChar=modalChar;
  if(typeof modalChar==="function"){
    modalChar=function(){
      _mChar();
      var p=ensurePlayer(state.player);ensureBag(p);
      var panel=qs("#modalPanel");if(!panel)return;
      var eq=p.equip;
      function eqLine(slot,label){
        if(!eq[slot])return label+"：空";
        var d=getItemById(eq[slot]);
        var tip=d&&typeof formatItemStats==="function"?(" "+formatItemStats(d)):"";
        return label+"：<b>"+(d?d.name:eq[slot])+"</b><span class=\"small\">"+tip+"</span>";
      }
      var sum=typeof equipSummaryText==="function"?equipSummaryText(p):"";
      var div=document.createElement("div");
      div.className="small";
      div.style.marginTop="8px";
      div.innerHTML='<hr><p class="section-title" style="font-size:13px;margin:4px 0">装备</p>'+
        '<p>'+eqLine("weapon","武器")+'</p>'+
        '<p>'+eqLine("armor","防具")+'</p>'+
        '<p>'+eqLine("accessory","饰品")+'</p>'+
        '<p class="power" style="margin-top:4px">总加成：'+sum+'</p>';
      panel.appendChild(div);
    };
  }

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
      var tip=typeof formatItemStats==="function"?formatItemStats(d):"";
      return '<div class="item-row buy-row" style="cursor:default">'+
        '<span class="item-icon" style="border-color:'+rarityBorder(d.rarity)+';color:'+rarityBorder(d.rarity)+'">'+(ITEM_ICON[d.type]||"物")+'</span>'+
        '<div class="item-meta"><b>'+d.name+'</b> '+rarityTag(d.rarity)+
        '<p class="small">'+(tip||d.type)+'</p></div>'+
        '<button class="btn sm primary buy-item" data-id="'+id+'" data-cost="'+cost+'">'+cost+'两</button></div>';
    }).join("");
    openModal(
      '<div class="modal-head"><h2 class="section-title">购入</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">银两：<b class="power">'+p.silver+'</b> · 时价×'+priceMod.toFixed(2)+'</p>'+
      '<div class="item-list">'+html+'</div>'
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
    wireBagBtn();
    var loc=state.player&&state.player.location;
    if(loc&&SHOP_STOCK[loc]){
      var panels=document.querySelectorAll(".panel");
      var panel=panels[1];
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
