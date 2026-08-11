/* 武学第二条获取路：门派任务/贡献、奇遇、NPC 传授 */
(function(){
  var PATH_TASKS={
    yanlan:[
      {id:"yl_ng1",name:"云雾吐纳",desc:"雾中连吐纳七日，悟云海吐纳",contrib:40,rank:1,skill:"yunhai_tuna",once:true},
      {id:"yl_sw1",name:"听雨剑课",desc:"雨中对竹练剑三百式",contrib:35,rank:0,skill:"tingyu_jian",once:true}
    ],
    chilu:[
      {id:"cl_ct1",name:"炉心淬体",desc:"在炉边挨过一季暑热",contrib:38,rank:1,skill:"chilu_cuiti",once:true}
    ],
    huichun:[
      {id:"hc_yx1",name:"养心夜课",desc:"随内门抄养心诀",contrib:32,rank:0,skill:"qingluo_yangxin",once:true},
      {id:"hc_qb1",name:"药香步法",desc:"背篓穿谷不惊鸟",contrib:28,rank:0,skill:"yaoxiang_bu",once:true}
    ],
    xuanjing:[
      {id:"xj_tl1",name:"踏浪试炼",desc:"潮头走浪不湿靴",contrib:30,rank:0,skill:"talang_bu",once:true}
    ],
    baique:[
      {id:"bq_yx1",name:"影息入门",desc:"闭气影中一个时辰",contrib:45,rank:1,skill:"yingxi",once:true},
      {id:"bq_wy1",name:"无影考核",desc:"楼主面前走过而不被察觉",contrib:80,rank:2,skill:"wuying_zong",once:true}
    ],
    wuxiang:[
      {id:"wx_lb1",name:"凌波悟步",desc:"钟下走圆不溅水",contrib:50,rank:1,skill:"lingbo",once:true}
    ]
  };

  function mergePathTasks(){
    if(typeof sects==="undefined")return;
    sects.forEach(function(sect){
      var extra=PATH_TASKS[sect.id];
      if(!extra)return;
      if(!sect.tasks)sect.tasks=[];
      extra.forEach(function(t){
        if(!sect.tasks.some(function(x){return x.id===t.id;}))sect.tasks.push(t);
      });
      if(!sect.shop)sect.shop=[];
      extra.forEach(function(t){
        if(!t.skill)return;
        var sid="path_"+t.skill;
        if(sect.shop.some(function(x){return x.id===sid;}))return;
        var sk=typeof getSkillById==="function"?getSkillById(t.skill):null;
        sect.shop.push({
          id:sid,
          name:(sk?sk.name:t.skill)+"·贡献授",
          cost:Math.min(80,(t.contrib||30)),
          contribNeed:Math.max(20,(t.contrib||30)-5),
          skill:t.skill
        });
      });
      if(!sect.skills)sect.skills=[];
      extra.forEach(function(t){
        if(t.skill&&sect.skills.indexOf(t.skill)<0)sect.skills.push(t.skill);
      });
    });
  }
  mergePathTasks();

  var ENCOUNTER_SKILLS={
    cloud_peak:[{id:"hunyuan",w:8},{id:"lingbo",w:12},{id:"wan_jian",w:5}],
    secret_cave:[{id:"wuying_zong",w:8},{id:"yingxi",w:12},{id:"phantom_palm",w:5}],
    secret_reef:[{id:"dragon_neigong",w:8},{id:"hunyuan",w:6}],
    blood_ravine:[{id:"fenjiang",w:6},{id:"bengshan",w:10}],
    bamboo:[{id:"tingyu_jian",w:10},{id:"xiaozhoutian",w:15}],
    market:[{id:"lihua_zhen",w:12},{id:"wusheng_du",w:14}]
  };

  function tryEncounterSkill(player,locId){
    var table=ENCOUNTER_SKILLS[locId];
    if(!table||!table.length)return null;
    if(Math.random()>0.12)return null;
    var luck=(player.stats&&player.stats.luck)||5;
    if(Math.random()>0.35+luck*0.02)return null;
    var total=0;table.forEach(function(t){total+=t.w;});
    var r=Math.random()*total,pick=table[0].id;
    for(var i=0;i<table.length;i++){r-=table[i].w;if(r<=0){pick=table[i].id;break;}}
    if(player.skills&&player.skills.some(function(s){return s.id===pick;}))return null;
    var sk=typeof getSkillById==="function"?getSkillById(pick):null;
    if(!sk)return null;
    if(sk.req){
      for(var k in sk.req){
        if((player.stats[k]||0)<sk.req[k]-2){
          player.logs.unshift("你拾得【"+sk.name+"】残页，然功力未够，只能先记下轮廓。");
          player.flags=player.flags||{};
          player.flags["scroll_"+pick]=1;
          return{scroll:true,id:pick,name:sk.name};
        }
      }
    }
    var lr=learnSkill(player,Object.assign({},sk,{cost:0}));
    if(lr&&lr.ok){
      player.logs.unshift("【奇遇】你在绝境中强行领悟【"+sk.name+"】！");
      return{learned:true,id:pick,name:sk.name};
    }
    return null;
  }

  var TEACH={
    luyun:{skill:"cloud_step",favor:50,actName:"请他授云踪步"},
    aqing:{skill:"xiaozhoutian",favor:40,actName:"请教吐纳"},
    que_shadow:{skill:"baique_qinggong",favor:55,actName:"求授掠影"},
    hermit:{skill:"lingbo",favor:60,actName:"求问步法"},
    tieba:{skill:"falling_leaf",favor:45,actName:"讨教刀法"}
  };

  function ensureTeachActs(){
    if(typeof npcs==="undefined")return;
    Object.keys(TEACH).forEach(function(nid){
      var npc=npcs.find(function(n){return n.id===nid;});
      if(!npc)return;
      if(!npc.acts)npc.acts=[];
      var t=TEACH[nid];
      if(npc.acts.some(function(a){return a.id==="teach_"+t.skill;}))return;
      npc.acts.push({id:"teach_"+t.skill,name:t.actName,type:"teach_skill",skill:t.skill,needFavor:t.favor});
    });
  }
  ensureTeachActs();

  setTimeout(function(){
    if(typeof exploreLocation==="function"){
      var _ex=exploreLocation;
      exploreLocation=function(player){
        var r=_ex(player);
        if(r&&r.ok)tryEncounterSkill(player,player.location);
        return r;
      };
    }
    if(typeof interactPerson==="function"){
      var _ip=interactPerson;
      interactPerson=function(player,npc,act){
        if(act&&String(act).indexOf("teach_")==0){
          var skillId=act.replace("teach_","");
          var conf=TEACH[npc.id];
          var need=(conf&&conf.favor)||40;
          var fav=typeof getFavor==="function"?getFavor(player,npc.id):(player.favor&&player.favor[npc.id])|0;
          if(fav<need)return{ok:false,msg:npc.name+"摇头：缘法未到（好感需≥"+need+"）。"};
          if(player.skills&&player.skills.some(function(s){return s.id===skillId;}))
            return{ok:false,msg:"你已会此功。"};
          var sk=getSkillById(skillId);
          if(!sk)return{ok:false,msg:"武学不存在"};
          var lr=learnSkill(player,Object.assign({},sk,{cost:0}));
          if(lr&&lr.ok){
            player.logs.unshift(npc.name+"亲自指点，你学会了【"+sk.name+"】！");
            return{ok:true,msg:"学会"+sk.name};
          }
          return lr||{ok:false,msg:"未能学会"};
        }
        return _ip(player,npc,act);
      };
    }
  },0);

  window.tryClaimScroll=function(player,skillId){
    if(!player.flags||!player.flags["scroll_"+skillId])return{ok:false,msg:"无此残页"};
    if(player.skills&&player.skills.some(function(s){return s.id===skillId;})){
      delete player.flags["scroll_"+skillId];
      return{ok:false,msg:"已会"};
    }
    var sk=getSkillById(skillId);
    if(!sk)return{ok:false,msg:"无效"};
    if(sk.req){
      for(var k in sk.req){
        if((player.stats[k]||0)<sk.req[k])
          return{ok:false,msg:"属性未足"};
      }
    }
    var lr=learnSkill(player,Object.assign({},sk,{cost:0}));
    if(lr&&lr.ok){
      delete player.flags["scroll_"+skillId];
      player.logs.unshift("你对照残页苦修，终于练成【"+sk.name+"】！");
      return{ok:true,msg:sk.name};
    }
    return lr;
  };

  if(typeof DB!=="undefined"&&DB.rebuild){
    try{DB.rebuild();}catch(e){}
  }
})();
