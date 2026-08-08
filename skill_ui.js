/* 武学界面优化 · 武功 / 内功 / 身法 分栏 · 身法效果强化 */
(function(){

  var CAT_WUGONG=["剑法","刀法","拳掌","暗器"];
  var CAT_NEIGONG=["内功"];
  var CAT_SHENFA=["轻功"];

  function skillCategory(s){
    var t=s.type||"";
    if(CAT_NEIGONG.indexOf(t)>=0)return"neigong";
    if(CAT_SHENFA.indexOf(t)>=0)return"shenfa";
    return"wugong";
  }
  function catLabel(c){
    return{wugong:"武功",neigong:"内功",shenfa:"身法"}[c]||c;
  }
  function catColor(c){
    return{wugong:"#c47a5a",neigong:"#6a9eae",shenfa:"#7aae6a"}[c]||"var(--gold)";
  }

  /* 解析 effect 字符串为可读列表 */
  function parseEffects(effect,realm){
    if(!effect)return[];
    realm=realm||0;
    var mul=1+realm*0.15;
    var list=[];
    String(effect).split(",").forEach(function(p){
      p=p.trim();
      if(!p)return;
      var m=p.match(/^(\w+)\+(\d+)$/);
      if(m){
        var key=m[1],val=Math.floor(parseInt(m[2],10)*mul);
        var map={
          dodge:"闪避 +"+val,
          first:"先手 +"+val,
          attack:"外功攻击 +"+val,
          maxHp:"气血上限 +"+val,
          maxMp:"内力上限 +"+val,
          arm:"臂力 +"+val,
          agi:"身法 +"+val,
          bone:"根骨 +"+val,
          qi:"内力属性 +"+val,
          wit:"悟性 +"+val,
          luck:"福缘 +"+val,
          move:"赶路耗日 -"+(val>3?1:0)+"（身法厚）",
          speed:"游历耗时减轻"
        };
        list.push(map[key]||(key+"+"+val));
        return;
      }
      /* 状态类 */
      var statusMap={
        "破绽":"命中后易使敌露出破绽",
        "流血":"造成持续失血",
        "迟滞":"减缓敌方动作",
        "内伤":"损伤敌方内息",
        "heal":"可转化伤势为恢复"
      };
      list.push(statusMap[p]||p);
    });
    return list;
  }

  /* 身法合计加成（供面板与战斗） */
  function sumShenfa(player){
    var dodge=0,first=0,move=0,speed=0;
    (player.skills||[]).forEach(function(s){
      if(skillCategory(s)!=="shenfa")return;
      if(!s.effect||typeof s.effect!=="string")return;
      var mul=1+(s.realm||0)*0.15;
      s.effect.split(",").forEach(function(p){
        p=p.trim();
        var m=p.match(/^(\w+)\+(\d+)$/);
        if(!m)return;
        var k=m[1],v=Math.floor(parseInt(m[2],10)*mul);
        if(k==="dodge")dodge+=v;
        else if(k==="first")first+=v;
        else if(k==="move")move+=v;
        else if(k==="speed")speed+=v;
      });
    });
    return{dodge:dodge,first:first,move:move,speed:speed};
  }

  function sumNeigong(player){
    var maxHp=0,maxMp=0,qi=0,bone=0,attack=0;
    (player.skills||[]).forEach(function(s){
      if(skillCategory(s)!=="neigong")return;
      if(!s.effect||typeof s.effect!=="string")return;
      var mul=1+(s.realm||0)*0.1;
      s.effect.split(",").forEach(function(p){
        var m=p.trim().match(/^(\w+)\+(\d+)$/);
        if(!m)return;
        var k=m[1],v=Math.floor(parseInt(m[2],10)*mul);
        if(k==="maxHp")maxHp+=v;
        else if(k==="maxMp")maxMp+=v;
        else if(k==="qi")qi+=v;
        else if(k==="bone")bone+=v;
        else if(k==="attack")attack+=v;
      });
    });
    return{maxHp:maxHp,maxMp:maxMp,qi:qi,bone:bone,attack:attack};
  }

  function sumWugong(player){
    var power=0,count=0;
    (player.skills||[]).forEach(function(s){
      if(skillCategory(s)!=="wugong")return;
      count++;
      power+=Math.floor((s.power||0)*(1+(s.realm||0)*0.25));
    });
    return{power:power,count:count};
  }

  window.sumShenfa=sumShenfa;
  window.sumNeigong=sumNeigong;
  window.skillCategory=skillCategory;

  /* 强化 derived：身法先手写入 dodge 展示外，另计 first */
  var _derived=typeof derived==="function"?derived:null;
  if(_derived){
    window.derived=function(player){
      var d=_derived(player);
      var sf=sumShenfa(player);
      d.dodge=(d.dodge||0); /* 已含 dodge+ 解析 */
      d.first=sf.first||0;
      d.shenfa=sf;
      d.neigong=sumNeigong(player);
      d.wugong=sumWugong(player);
      return d;
    };
  }

  /* 身法影响游历/赶路：高身法偶减耗日 */
  var _move=typeof movePlayer==="function"?movePlayer:null;
  if(_move){
    window.movePlayer=function(player,targetId){
      var r=_move(player,targetId);
      if(r&&r.ok){
        var sf=sumShenfa(player);
        /* move 点数高或身法属性高时，有概率不耗日（已在 _move 中 +1，此处退回） */
        var chance=Math.min(0.45,(sf.move||0)*0.04+(player.stats.agi||0)*0.008);
        if(chance>0&&Math.random()<chance&&player.day>1){
          player.day-=1;
          player.logs[0]=(player.logs[0]||"")+"（身法精妙，赶路不耗时辰）";
        }
      }
      return r;
    };
  }

  /* 身法影响战斗：先手高时完胜阈值略增 */
  var _resolve=typeof resolveThreat==="function"?resolveThreat:null;
  if(_resolve){
    window.resolveThreat=function(player,diff,baseDamage){
      var sf=sumShenfa(player);
      var adjDiff=diff;
      if(sf.first>0)adjDiff=Math.max(1,Math.floor(diff*(1-Math.min(0.2,sf.first*0.012))));
      if(sf.dodge>8)adjDiff=Math.max(1,Math.floor(adjDiff*(1-Math.min(0.1,(sf.dodge-8)*0.008))));
      var r=_resolve(player,adjDiff,baseDamage);
      if(sf.first>=6&&r.outcome==="险胜"&&Math.random()<0.25){
        r.outcome="完胜";
        r.damage=0;
        player.hp=Math.min(player.maxHp,player.hp+Math.floor(baseDamage*0.3)); /* 退回部分伤害体感 */
      }
      return r;
    };
  }

  function skillCard(s){
    var cat=skillCategory(s);
    var realmName=(typeof SKILL_DESIGN!=="undefined"&&SKILL_DESIGN.realms)?SKILL_DESIGN.realms[s.realm]||("境"+s.realm):("境"+s.realm);
    var effects=parseEffects(s.effect,s.realm);
    var effectHtml=effects.length
      ?('<p class="small" style="color:'+catColor(cat)+'">'+effects.join(" · ")+'</p>')
      :'<p class="small">无额外特效</p>';
    var powerLine=cat==="wugong"
      ?('威势 '+(s.power||0)+' → '+Math.floor((s.power||0)*(1+(s.realm||0)*0.25)))
      :cat==="neigong"
        ?('内功心法')
        :('身法步法');
    var mpLine=(s.mp>0)?(' · 耗内'+(s.mp||0)):"";
    var bar=s.maxExp?Math.min(100,Math.floor((s.exp||0)/s.maxExp*100)):0;
    var full=s.realm>=4;
    return '<div class="quest-card skill-card" data-cat="'+cat+'" style="border-left:3px solid '+catColor(cat)+'">'+
      '<div class="quest-head">'+
        '<b>'+s.name+'</b> '+
        '<span class="tag">'+s.quality+'</span> '+
        '<span class="tag" style="border-color:'+catColor(cat)+';color:'+catColor(cat)+'">'+(s.type||catLabel(cat))+'</span>'+
      '</div>'+
      '<p class="small">'+realmName+' · 经验 '+(s.exp||0)+'/'+(s.maxExp||0)+' · '+powerLine+mpLine+'</p>'+
      effectHtml+
      '<div class="quest-bar"><div class="quest-fill" style="width:'+bar+'%;background:linear-gradient(90deg,#3b2b21,'+catColor(cat)+')"></div></div>'+
      '<div class="row" style="margin-top:6px">'+
        '<button class="btn sm primary train" data-id="'+s.id+'" '+(full?'disabled':'')+'>'+(full?'圆满':'修炼')+'</button>'+
      '</div></div>';
  }

  function summaryHtml(p){
    var d=typeof derived==="function"?derived(p):{attack:0,dodge:0};
    var sf=sumShenfa(p);
    var ng=sumNeigong(p);
    var wg=sumWugong(p);
    return '<div class="stat-grid" style="margin:6px 0 10px">'+
      '<div class="stat"><b style="color:#c47a5a">武功威势</b><span>'+wg.power+'（'+wg.count+'门）</span></div>'+
      '<div class="stat"><b style="color:#6a9eae">内功</b><span>气+'+(ng.maxMp||0)+' 血+'+(ng.maxHp||0)+'</span></div>'+
      '<div class="stat"><b style="color:#7aae6a">身法闪避</b><span>+'+sf.dodge+'</span></div>'+
      '<div class="stat"><b style="color:#7aae6a">身法先手</b><span>+'+sf.first+'</span></div>'+
      '<div class="stat"><b>攻/闪</b><span>'+(d.attack||0)+'/'+(d.dodge||0)+'</span></div>'+
      '<div class="stat"><b>战力</b><span class="power">'+calcCombatPower(p)+'</span></div>'+
      '</div>';
  }

  window.modalSkills=function(tab){
    var p=ensurePlayer(state.player);
    tab=tab||"all";
    var list=p.skills||[];
    var filtered=list.filter(function(s){
      if(tab==="all")return true;
      return skillCategory(s)===tab;
    });
    var counts={all:list.length,wugong:0,neigong:0,shenfa:0};
    list.forEach(function(s){counts[skillCategory(s)]++;});

    var tabs=[
      {id:"all",name:"全部"},
      {id:"wugong",name:"武功"},
      {id:"neigong",name:"内功"},
      {id:"shenfa",name:"身法"}
    ].map(function(t){
      var active=tab===t.id;
      return '<button class="btn sm'+(active?' primary':'')+' skill-tab" data-tab="'+t.id+'">'+t.name+' '+(counts[t.id]|0)+'</button>';
    }).join("");

    var tip={
      all:"武功主攻、内功养气、身法闪避与先手。",
      wugong:"剑、刀、拳掌、暗器。修炼提升威势，影响战力与招式效果。",
      neigong:"内功心法。提升气血/内力上限与属性，是持久战的根本。",
      shenfa:"轻功身法。提升闪避、先手；高身法赶路更轻快，战斗中更易占上风。"
    }[tab]||"";

    var body=filtered.length
      ?('<div class="quest-list">'+filtered.map(skillCard).join("")+'</div>')
      :'<p class="small">此类尚无武学。可在地图学招、门派兑换或任务领悟。</p>';

    openModal(
      '<div class="modal-head"><h2 class="section-title">武学</h2><button class="modal-close" id="mClose">关闭</button></div>'+
      summaryHtml(p)+
      '<div class="row" style="margin-bottom:6px">'+tabs+'</div>'+
      '<p class="small">'+tip+'</p>'+
      body
    );
    qs("#mClose").onclick=function(){closeModal();};
    qsa(".skill-tab").forEach(function(el){
      el.onclick=function(){modalSkills(el.dataset.tab);};
    });
    qsa(".train").forEach(function(el){
      el.onclick=function(){
        var amt=15+Math.floor((p.stats.wit||0)/2);
        trainSkill(p,el.dataset.id,amt);
        /* 身法修炼额外提示 */
        var sk=(p.skills||[]).find(function(x){return x.id===el.dataset.id;});
        if(sk&&skillCategory(sk)==="shenfa"){
          p.logs.unshift("修炼身法【"+sk.name+"】，步法更灵动。");
        }
        saveGame(state);
        modalSkills(tab);
      };
    });
  };

  /* 为部分轻功补充/强化 effect（若仍是旧数据） */
  function enrichShenfaSkills(){
    if(typeof skills==="undefined"||!Array.isArray(skills))return;
    var boost={
      basic_qinggong:{effect:"dodge+3,speed+1",desc:"入门轻功，略增闪避与赶路。"},
      baique_qinggong:{effect:"dodge+8,first+2,move+2",desc:"白雀掠影，身形如雀，先手与赶路皆利。"},
      cloud_step:{effect:"dodge+6,first+3,speed+2",desc:"云踪步，踏云而行，先机在握。"},
      night_shadow:{effect:"dodge+12,first+5,move+3",desc:"夜行影步，暗中夺先，赶路近乎无踪。"},
      silent_pass:{effect:"dodge+4,move+1",desc:"无声渡，落地无声，利于潜行赶路。"}
    };
    skills.forEach(function(s){
      if(s.type!=="轻功")return;
      var b=boost[s.id];
      if(b){
        if(!s.effect||s.effect.indexOf("first")<0&&b.effect.indexOf("first")>=0)s.effect=b.effect;
        else if(!s.effect)s.effect=b.effect;
        if(b.desc)s.desc=b.desc;
      }else if(!s.effect){
        s.effect="dodge+2";
      }
    });
  }
  enrichShenfaSkills();

  /* 已学会的轻功，同步强化 effect（不重复加属性，只补展示与战斗用字段） */
  function syncPlayerShenfaEffects(p){
    if(!p||!p.skills)return;
    p.skills.forEach(function(ps){
      var def=typeof getSkillById==="function"?getSkillById(ps.id):null;
      if(def&&def.type==="轻功"&&def.effect)ps.effect=def.effect;
    });
  }
  var _ensure=typeof ensurePlayer==="function"?ensurePlayer:null;
  if(_ensure){
    window.ensurePlayer=function(p){
      p=_ensure(p);
      syncPlayerShenfaEffects(p);
      return p;
    };
  }

})();
