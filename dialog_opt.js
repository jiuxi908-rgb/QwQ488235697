/* 对话系统优化：话题应答 · 交谈记录 · 送礼反馈 · 界面体验 */
(function(){

  var TOPIC_LINES = {
    weather: {
      0: ["天色一般。","风有点大。","今日宜静不宜动。","嗯。"],
      1: ["这天气，出门要小心。","雨欲来，山路滑。","风从北边来，有点紧。"],
      2: ["天气说变就变，和人心一样。","这风……像是要变天。","适合待着，不适合赶路。"],
      3: ["有你陪着说话，天色也暖和些。","这种天气，我倒愿意多站一会。","风声里有熟悉的味道。"],
      4: ["和你一起看天，比一个人强。","风再大，也吹不散我们说的话。","天色暗了，你也别走太远。"],
      5: ["这种天，只想和你多站一会。","风雨再大，有你在身边便不怕。"]
    },
    jianghu: {
      0: ["江湖？远着。","少问。","各人有各人的路。","我管不着。"],
      1: ["最近风声不太平。","黑盐道上刀多。","缉武司的人又在装客商。","南海的船，有去无回的多。"],
      2: ["江湖事，知道越多越危险。","你若真想听，我可以说一点。","有些门派表面和气，底下早较过劲了。"],
      3: ["你够义气，这些话可以说。","白雀楼的影子，最近比以前长。","血石峡谷的人，又往南探了。"],
      4: ["江湖再乱，你我之间，算清净的。","有消息，第一时间告诉你。","自己人面前，不必藏着。"],
      5: ["江湖再宽，也装得下我们这一句交情。","有些局，我只想和你一起破。"]
    },
    advice: {
      0: ["自己悟。","我不是师父。","……少问。","走稳些。"],
      1: ["心静，路才直。","先保命，再谈别的。","别硬拼。","脚步放轻。"],
      2: ["你有几分根骨，别浪费。","可以试着慢半拍，反而看得清。","少逞能，多留后手。"],
      3: ["这一点，我可以点你。","你进步了。继续。","有疑惑，再来问我。"],
      4: ["你已经走到这一步，剩下的路，我陪你看。","我的心得，都给你。","别急。我们有的是时间。"],
      5: ["能教的都教了。往后，你是你自己的师父。","有你在路上，我便放心。"]
    },
    past: {
      0: ["过去的事，不提。","……","你问得太多了。"],
      1: ["过去？不值一提。","每个人都有不想说的事。","你若诚心，或许以后可以说。"],
      2: ["有些事，想起来还疼。","那年……算了，半句就够。","你也有过往吧。"],
      3: ["跟你说这些，是信你。","那时候我还年轻，也蠢。","有些仇，还没报。"],
      4: ["我的过去，你已经听得差不多了。","说给你听，是因为你不会拿去换银子。","以后若再提起，你别笑我。"],
      5: ["过去的伤，因你不那么疼了。","若重来一次，我仍愿在这里遇见你。"]
    },
    secret: {
      0: ["没有。","少打听。","……"],
      1: ["隐秘？我知道的也不多。","说了，对你没好处。","再熟一些再说。"],
      2: ["有一件事，只告诉熟客。","你听过，便当没听过。","别对外说是我说的。"],
      3: ["这事，只有自己人才知道。","记下。用得上。","危险，但真实。"],
      4: ["最后一层，也告诉你。","你我之间，没有必要再瞒。","秘密到你这儿，就停。"],
      5: ["我把底都掏给你了。","这世上我信得过的人，屈指可数——有你。"]
    },
    heart: {
      0: ["……无话可说。","你想多了。"],
      1: ["谈心？还早。","心不静，谈也白谈。"],
      2: ["其实……偶尔也会觉得累。","你愿意听，我便说一点。","江湖人，谁没有心酸。"],
      3: ["有你听着，好多了。","这些话，只说给你。","别走太远。"],
      4: ["心近了，路也近了。","有你在，我不怕。","……今日的话，记在心里就好。"],
      5: ["你来了。想说的话，其实很多。","私定终身那种话……你若想听，我也可以说。","心已许，不必再问。"]
    }
  };

  var NPC_TOPIC = {
    aqing: {
      weather: {2:["雨后的竹叶能止血，你记得。"],4:["雨停了，草还湿着。我刚采的。"],5:["这种雨，只想和你一起躲在竹下。"]},
      advice: {2:["认不清叶脉，就别动手。"],4:["危险时吹叶哨，我听得见。"]},
      heart: {4:["……其实等你来采药，已经习惯了。"],5:["叶哨给你。丢了，我再做一个。"]}
    },
    jian_tong: {
      advice: {1:["你也会剑吗？"],3:["你指点过我！我进步了！"],5:["剑已经擦好了。只等你。"]},
      heart: {4:["……其实我等你很久了。"],5:["叶落无声的时候，我想的都是你。"]}
    },
    yaotong: {
      advice: {2:["救人比杀人难，也比杀人重要。"],4:["受伤了就来，药我现熬。"]},
      heart: {5:["其实我每天都会多备一份，等你。"]}
    },
    zhou: {
      jianghu: {2:["缉武司装客商进过店，我一眼瞧出来了。"],4:["店里的规矩：自己人的事，我当没看见。"]},
      secret: {3:["账本下压着封旧信……你若用得着。"],5:["那封旧信，连同店里的后路，都交给你了。"]}
    },
    su: {
      advice: {1:["少硬拼。"],4:["以后受伤，第一时间来找我。"]},
      heart: {3:["你的命，我救过不止一回。"],5:["……其实每次见你带伤进来，我都怕。"]}
    },
    que_shadow: {
      weather: {0:["……"],2:["风声太响，不适合传信。"]},
      secret: {3:["……算自己人。有信，找我。"],4:["白雀的影子，可以借你一用。"]},
      heart: {0:["……"],4:["你的脚步，终于轻了。"],5:["……需要我时，不必出声。"]}
    },
    monk_jing: {
      advice: {1:["心魔比外敌更难降。"],4:["你心已定。寺门为你开。"]},
      heart: {3:["心魔未尽，但已见光。"],5:["无相无我。有你，亦无碍。"]}
    },
    hermit: {
      past: {2:["天机不是秘密，是时机。"],4:["有些天机，说过便散。"]},
      heart: {4:["缘法已至。你自己知道。"],5:["山认你，风也认你。走吧。"]}
    },
    luyun: {
      advice: {1:["心静，剑才直。"],3:["有一招落脚，我点你。"],5:["雾散见真剑。你已走到。"]},
      jianghu: {2:["内门师兄下山时，剑才是真的。"]}
    },
    tieba: {
      jianghu: {1:["血石峡谷的邪修，吃人不吐骨头。"],4:["黑盐道上，喊一声铁疤，有人会让路。"]},
      heart: {4:["你的仇，也算我的。"]}
    }
  };

  var GIFT_LINES = {
    0: ["……收着。","不必。","嗯。"],
    1: ["有心了。","谢谢。","下次别破费。"],
    2: ["你总记得带东西来。","我收下了。","心意到了就好。"],
    3: ["有你这份心，比礼物重。","我留着。","你总这样，我倒不好意思。"],
    4: ["你送的，我都收。","下回轮到我请你。","……其实等你来，比等礼物更久。"],
    5: ["你送什么，我都喜欢。","不必每次都带。人来了就好。","这份礼，我放在最稳妥的地方。"]
  };

  function tierOf(fav){
    if(typeof dialogueTier==="function") return dialogueTier(fav);
    fav = fav|0;
    if(fav>=95)return 5; if(fav>=80)return 4; if(fav>=60)return 3;
    if(fav>=40)return 2; if(fav>=20)return 1; return 0;
  }
  function pick(arr){
    if(!arr||!arr.length)return "……";
    return arr[Math.floor(Math.random()*arr.length)];
  }
  function topicLine(npc, topicId, favor){
    var tier = tierOf(favor);
    var patch = NPC_TOPIC[npc.id] && NPC_TOPIC[npc.id][topicId];
    if(patch){
      for(var t=tier;t>=0;t--){
        if(patch[t]&&patch[t].length) return pick(patch[t]);
      }
    }
    var base = TOPIC_LINES[topicId];
    if(base){
      for(var t2=tier;t2>=0;t2--){
        if(base[t2]&&base[t2].length) return pick(base[t2]);
      }
    }
    if(typeof getDialogueLine==="function") return getDialogueLine(npc, favor);
    return "……";
  }
  function ensureChatLog(player, npcId){
    if(!player.chatLog) player.chatLog = {};
    if(!player.chatLog[npcId]) player.chatLog[npcId] = [];
    return player.chatLog[npcId];
  }
  function pushChat(player, npcId, role, text){
    var log = ensureChatLog(player, npcId);
    log.push({ role: role, text: text, at: player.day||1 });
    if(log.length>12) log.splice(0, log.length-12);
  }
  window.pushChatLog = pushChat;

  window.chatWithNpc = function(player, npc, topicId){
    if(typeof ensureFavor==="function") ensureFavor(player);
    var topics = (typeof CHAT_TOPICS!=="undefined"?CHAT_TOPICS:[{id:"weather",name:"闲聊",favor:2}]);
    var topic = topics.find(function(t){return t.id===topicId;}) || topics[0];
    var fav = typeof getFavor==="function" ? getFavor(player,npc.id) : 0;
    if(topic.need && fav < topic.need){
      return {ok:false, msg:npc.name+"不愿多谈。（需好感≥"+topic.need+"）"};
    }
    var dayKey = "chat_"+npc.id+"_"+player.day;
    var count = (player.flags&&player.flags[dayKey])|0;
    if(count>=3) return {ok:false, msg:npc.name+"今日话已尽，明日再来。"};
    if(!player.flags) player.flags = {};
    player.flags[dayKey] = count+1;
    var gain = topic.favor||2;
    if(count===1) gain = Math.max(1, Math.floor(gain*0.7));
    if(count>=2) gain = Math.max(1, Math.floor(gain*0.5));
    if(typeof hasBond==="function" && hasBond(player,npc.id)) gain += 1;
    var line = topicLine(npc, topic.id, fav);
    var d = typeof addFavor==="function" ? addFavor(player, npc.id, gain) : 0;
    var newFav = typeof getFavor==="function" ? getFavor(player,npc.id) : fav+d;
    var rank = (typeof favorRank==="function"?favorRank(newFav).name:"");
    pushChat(player, npc.id, "you", "（"+(topic.name||"交谈")+"）");
    pushChat(player, npc.id, "npc", line);
    var msg = npc.name+"：「"+line+"」（好感+"+d+" → "+rank+" "+newFav+"）";
    player.logs.unshift(msg);
    player.logs = player.logs.slice(0,50);
    return {ok:true, msg:msg, line:line, topic:topic.name, gain:d, favor:newFav};
  };

  window.giftNpc = function(player, npc){
    if(typeof ensureFavor==="function") ensureFavor(player);
    var cost = 15;
    if(player.silver < cost) return {ok:false, msg:"银两不足（需"+cost+"）"};
    player.silver -= cost;
    var fav = typeof getFavor==="function" ? getFavor(player,npc.id) : 0;
    var base = 8 + Math.floor(Math.random()*5);
    if(typeof hasBond==="function" && hasBond(player,npc.id)) base += 3;
    var d = typeof addFavor==="function" ? addFavor(player,npc.id,base) : base;
    var newFav = typeof getFavor==="function" ? getFavor(player,npc.id) : fav+d;
    var t = tierOf(newFav);
    var reply = pick(GIFT_LINES[t] || GIFT_LINES[0]);
    if(npc.id==="aqing" && t>=3) reply = pick(["……我收下了。草还湿着。","叶哨我重新做了一枚，给你。"]);
    if(npc.id==="jian_tong" && t>=3) reply = pick(["这、这我怎么好意思！","我给你看剑法！作为回礼！"]);
    if(npc.id==="que_shadow") reply = pick(["……收着。","不必。","……嗯。"]);
    if(npc.id==="yaotong" && t>=4) reply = pick(["药香还热着。这份心，我收下。","你送的，我放在药柜最稳的一格。"]);
    pushChat(player, npc.id, "you", "（送礼）");
    pushChat(player, npc.id, "npc", reply);
    var msg = "你送了礼物给"+npc.name+"。「"+reply+"」（银两-"+cost+"，好感+"+d+" → "+newFav+"）";
    player.logs.unshift(msg);
    player.logs = player.logs.slice(0,50);
    return {ok:true, msg:msg, line:reply, gain:d, favor:newFav};
  };

  function renderChatHistory(player, npcId){
    var log = (player.chatLog && player.chatLog[npcId]) || [];
    if(!log.length) return "";
    var recent = log.slice(-6);
    var html = '<div class="chat-history">';
    recent.forEach(function(m){
      if(m.role==="you") html += '<div class="chat-line you"><span class="chat-tag">你</span> '+m.text+'</div>';
      else html += '<div class="chat-line npc"><span class="chat-tag">对方</span> 「'+m.text+'」</div>';
    });
    return html+"</div>";
  }

  window.modalNpc = function(npcId, opts){
    opts = opts || {};
    var p = ensurePlayer(state.player);
    var npc = typeof findPerson==="function" ? findPerson(npcId) : null;
    if(!npc) return;
    var fav = typeof getFavor==="function" ? getFavor(p,npc.id) : (p.favor[npc.id]|0);
    var rank = typeof favorRank==="function" ? favorRank(fav) : {name:"陌生",color:"#b9a58a"};
    var bonded = typeof hasBond==="function" && hasBond(p,npc.id);
    var greeting = opts.line || (typeof getDialogueLine==="function" ? getDialogueLine(npc,fav) : (npc.talks&&npc.talks[0]) || "……");
    var topics = typeof CHAT_TOPICS!=="undefined" ? CHAT_TOPICS : [{id:"weather",name:"闲聊",favor:2}];
    var dayKey = "chat_"+npc.id+"_"+p.day;
    var chatLeft = Math.max(0, 3-((p.flags&&p.flags[dayKey])|0));

    var topicHtml = "";
    topics.forEach(function(t){
      var locked = t.need && fav < t.need;
      var dis = (locked || chatLeft<=0) ? "disabled" : "";
      topicHtml += '<button class="btn sm chat-topic" data-id="'+t.id+'" '+dis+'>'+t.name+
        (locked?"<span class=\"small\">·锁</span>":"")+'</button>';
    });

    var canRomance = typeof ROMANCE_NPCS!=="undefined" && ROMANCE_NPCS[npc.id];
    var pledgeHtml = "";
    if(canRomance){
      if(bonded) pledgeHtml = '<p class="small" style="color:#e8a0a0;margin:6px 0">已与'+npc.name+'私定终身 · 第'+(p.bonds[npc.id].at||"?")+'日</p>';
      else if(fav>=90) pledgeHtml = '<button class="btn primary" id="pledgeBtn" style="margin:6px 0">私定终身</button>';
      else pledgeHtml = '<p class="small" style="margin:6px 0;opacity:.7">私定终身（需好感≥90，当前'+fav+'）</p>';
    }

    var actHtml = "";
    (npc.acts||[]).forEach(function(a){
      var flagKey = npc.id+"_"+a.id;
      var done = a.once && p.flags && p.flags[flagKey];
      var cost = a.cost||0;
      var extra = "";
      if(a.type==="duel") extra = " · 难度"+a.diff;
      if(a.type==="skill") extra = " · 学武";
      if(done) extra = " · 已完成";
      if(a.favorNeed) extra += " · 好感≥"+a.favorNeed;
      var disc = typeof favorCostDiscount==="function" ? favorCostDiscount(fav) : 1;
      var shopType = a.type==="heal"||a.type==="rest"||a.type==="item"||a.type==="exp";
      var showCost = (cost>0&&shopType) ? Math.max(1,Math.floor(cost*disc)) : cost;
      var priceNote = showCost ? ((disc<1&&shopType)?("（"+showCost+"两·熟客）"):("（"+showCost+"两）")) : "";
      actHtml += '<button class="btn primary npc-act" data-act="'+a.id+'" '+(done?"disabled":"")+'>'+a.name+priceNote+
        (extra?'<span class="small">'+extra+'</span>':"")+'</button>';
    });

    var bondTag = bonded ? ' <span class="rank-tag" style="border-color:#e8a0a0;color:#e8a0a0">已结缘</span>' : "";
    var av = (typeof npcAvatar==="function") ? npcAvatar(npc,"md") : "";
    var hist = renderChatHistory(p, npc.id);
    var lastNote = opts.note ? ('<p class="small dialog-note">'+opts.note+'</p>') : "";

    openModal(
      '<div class="modal-head"><h2 class="section-title">'+(av?av+" ":"")+npc.name+
        ' <span class="tag">'+npc.title+'</span>'+bondTag+'</h2>'+
        '<button class="modal-close" id="mClose">关闭</button></div>'+
      '<p class="small">'+npc.desc+'</p>'+
      '<div class="favor-row"><span class="small">好感</span>'+
        '<div class="favor-bar"><div class="favor-fill" style="width:'+Math.min(100,fav)+'%;background:'+rank.color+'"></div></div>'+
        '<span class="rank-tag" style="border-color:'+rank.color+';color:'+rank.color+'">'+rank.name+' '+fav+'</span></div>'+
      hist+
      '<div class="talk-bubble'+(opts.flash?' flash':'')+'">「'+greeting+'」</div>'+
      lastNote+pledgeHtml+
      '<h3 class="section-title">交谈 <span class="small">今日还可 '+chatLeft+' 次</span></h3>'+
      '<div class="row chat-topics" style="margin-bottom:8px">'+topicHtml+
        '<button class="btn sm" id="giftBtn">送礼（15两）</button></div>'+
      '<h3 class="section-title">互动</h3>'+
      '<div class="row" style="flex-direction:column;gap:5px;align-items:stretch">'+actHtml+'</div>'
    );

    var closeBtn = document.getElementById("mClose");
    if(closeBtn) closeBtn.onclick = function(){ closeModal(); };

    document.querySelectorAll(".chat-topic").forEach(function(el){
      el.onclick = function(){
        var r = chatWithNpc(p, npc, el.dataset.id);
        if(!r.ok){
          if(typeof saveGame==="function") saveGame(state);
          modalNpc(npcId, { line: greeting, note: r.msg });
          return;
        }
        if(typeof saveGame==="function") saveGame(state);
        modalNpc(npcId, { line: r.line, flash: true, note: "好感 +"+r.gain+" · 今日交谈剩余 "+Math.max(0,chatLeft-1)+" 次" });
      };
    });
    var giftBtn = document.getElementById("giftBtn");
    if(giftBtn) giftBtn.onclick = function(){
      var r = giftNpc(p, npc);
      if(!r.ok){
        if(typeof saveGame==="function") saveGame(state);
        modalNpc(npcId, { line: greeting, note: r.msg });
        return;
      }
      if(typeof saveGame==="function") saveGame(state);
      modalNpc(npcId, { line: r.line, flash: true, note: "送礼成功 · 好感 +"+r.gain });
    };
    var pledgeBtn = document.getElementById("pledgeBtn");
    if(pledgeBtn) pledgeBtn.onclick = function(){
      if(!confirm("是否与「"+npc.name+"」私定终身？")) return;
      var r = typeof pledgeLifelong==="function" ? pledgeLifelong(p, npc) : {ok:false,msg:"不可用"};
      if(typeof saveGame==="function") saveGame(state);
      modalNpc(npcId, { line: r.ok ? (r.msg||greeting) : greeting, note: r.ok?"缘定今生":(r.msg||""), flash: r.ok });
    };
    document.querySelectorAll(".npc-act").forEach(function(el){
      el.onclick = function(){
        var r = typeof interactPerson==="function" ? interactPerson(p, npc, el.dataset.act) : {ok:false,msg:"无互动"};
        if(typeof saveGame==="function") saveGame(state);
        var line2 = (r && r.line) || (typeof getDialogueLine==="function" ? getDialogueLine(npc, getFavor(p,npc.id)) : greeting);
        var note = r.ok ? (r.msg || "") : (r.msg || "");
        /* note 过长时只保留括号收益 */
        if(note.length>80){
          var m = note.match(/（[^）]+）/g);
          note = m ? m.join(" ") : note.slice(0,60)+"…";
        }
        modalNpc(npcId, { line: line2, note: note, flash: !!(r&&r.ok) });
      };
    });
  };

  if(!document.getElementById("dialog-opt-style")){
    var st = document.createElement("style");
    st.id = "dialog-opt-style";
    st.textContent = [
      ".chat-history{max-height:120px;overflow-y:auto;margin:6px 0;padding:6px 8px;",
      "  background:#120f0d;border:1px solid #4b3a2d;font-size:11px;line-height:1.45}",
      ".chat-line{margin:3px 0;color:#c4b08a}",
      ".chat-line.you{color:#8a9e7a}",
      ".chat-line.npc{color:#e8d7bd}",
      ".chat-tag{display:inline-block;font-size:10px;padding:0 4px;border:1px solid #4b3a2d;color:#b9a58a;margin-right:4px}",
      ".talk-bubble.flash{animation:bubble-flash .35s ease}",
      "@keyframes bubble-flash{from{background:#2a2418}to{background:#1a1512}}",
      ".dialog-note{color:#d9ad62;margin:4px 0 8px}",
      ".chat-topics .btn.sm{margin:2px}"
    ].join("\n");
    document.head.appendChild(st);
  }
})();
