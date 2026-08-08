/* 物品 · 背包 · 装备 · 掉落 · 商店 */
const ITEM_TYPES=["武器","防具","饰品","消耗品","材料","书卷","任务"];
const ITEM_RARITY=["凡品","良品","精品","绝品"];
const RARITY_COLOR={"凡品":"#b9a58a","良品":"#7aae6a","精品":"#6a9ecf","绝品":"#d9ad62"};
const ITEM_ICON={"武器":"剑","防具":"甲","饰品":"佩","消耗品":"丹","材料":"材","书卷":"卷","任务":"令"};
const SLOT_LABEL={weapon:"武器",armor:"防具",accessory:"饰品"};

const ITEMS=[
  /* ========== 武器 ========== */
  {id:"wood_sword",name:"木剑",type:"武器",rarity:"凡品",desc:"练手用的木剑，聊胜于无。",atk:3,price:15,stack:1},
  {id:"iron_blade",name:"精铁刀",type:"武器",rarity:"良品",desc:"市集常见的精铁刀，分量足。",atk:8,price:60,stack:1},
  {id:"bamboo_spear",name:"青竹枪",type:"武器",rarity:"良品",desc:"竹径所出，轻而韧。",atk:7,agi:1,price:55,stack:1},
  {id:"bronze_mace",name:"青铜锏",type:"武器",rarity:"良品",desc:"沉重铜锏，开山裂石。",atk:10,arm:1,price:75,stack:1},
  {id:"qingfeng_sword",name:"青锋剑",type:"武器",rarity:"精品",desc:"剑身映青，出鞘有风声。",atk:15,price:180,stack:1},
  {id:"night_dagger",name:"夜行短匕",type:"武器",rarity:"精品",desc:"白雀坞暗器师所铸，便于贴身。",atk:12,agi:1,price:160,stack:1},
  {id:"whip_snake",name:"柔丝鞭",type:"武器",rarity:"精品",desc:"软鞭如蛇，专破硬刚。",atk:13,agi:1,wit:1,price:190,stack:1},
  {id:"yanlan_jian",name:"烟岚剑",type:"武器",rarity:"绝品",desc:"烟岚剑斋外传的佩剑，云纹缠柄。",atk:28,wit:1,price:500,stack:1},
  {id:"chilu_dao",name:"赤炉刀",type:"武器",rarity:"绝品",desc:"赤炉刀社试刀所出，刃口仍带热气。",atk:30,arm:1,price:520,stack:1},
  {id:"whale_bone",name:"鲸骨杖",type:"武器",rarity:"绝品",desc:"玄鲸帮式样，沉重如潮。",atk:26,def:3,price:480,stack:1},
  {id:"blood_blade",name:"血海刀",type:"武器",rarity:"绝品",desc:"血石峡谷邪修之器，增攻损心神。",atk:32,arm:1,wit:-1,price:550,stack:1},
  {id:"void_finger",name:"无相指套",type:"武器",rarity:"绝品",desc:"无相寺点穴用指套，攻防一体。",atk:20,def:4,wit:2,price:460,stack:1},

  /* ========== 防具 ========== */
  {id:"cloth_robe",name:"粗布衣",type:"防具",rarity:"凡品",desc:"寻常粗布，挡风而已。",def:2,price:10,stack:1},
  {id:"travel_cloak",name:"行囊披",type:"防具",rarity:"凡品",desc:"过路客常用，略挡风寒。",def:3,price:18,stack:1},
  {id:"leather_armor",name:"软甲",type:"防具",rarity:"良品",desc:"牛皮软甲，可卸部分刀劲。",def:7,price:70,stack:1},
  {id:"scale_vest",name:"鱼鳞甲",type:"防具",rarity:"良品",desc:"江上渔民改制，轻便耐用。",def:8,agi:1,price:85,stack:1},
  {id:"iron_guard",name:"铁护心",type:"防具",rarity:"精品",desc:"护住心口要害，走镖人爱用。",def:14,price:160,stack:1},
  {id:"monk_robe",name:"无相僧衣",type:"防具",rarity:"精品",desc:"无相寺外门僧衣，略增定力。",def:10,wit:1,mpBonus:10,price:140,stack:1},
  {id:"sparrow_cloak",name:"雀影衣",type:"防具",rarity:"精品",desc:"白雀坞影卫所着，身法略增。",def:11,agi:2,price:200,stack:1},
  {id:"mist_cloak",name:"烟罗披风",type:"防具",rarity:"绝品",desc:"薄如蝉翼，却能卸力。",def:22,agi:1,price:400,stack:1},
  {id:"flame_armor",name:"赤炉重铠",type:"防具",rarity:"绝品",desc:"赤炉刀社重甲，厚重难破。",def:26,arm:1,agi:-1,price:450,stack:1},
  {id:"cloud_silk",name:"云纹罗衣",type:"防具",rarity:"绝品",desc:"云巅隐士所遗，轻若无物。",def:18,wit:2,mpBonus:20,price:420,stack:1},

  /* ========== 饰品 ========== */
  {id:"copper_ring",name:"铜指环",type:"饰品",rarity:"凡品",desc:"一枚旧铜环，略增气机。",atk:1,def:1,price:20,stack:1},
  {id:"bone_bracelet",name:"兽骨镯",type:"饰品",rarity:"凡品",desc:"兽骨打磨，略增臂力。",arm:1,price:25,stack:1},
  {id:"jade_pendant",name:"平安玉佩",type:"饰品",rarity:"良品",desc:"温润玉佩，心神略定。",mpBonus:15,price:80,stack:1},
  {id:"silver_bell",name:"银铃",type:"饰品",rarity:"良品",desc:"清脆银铃，身法略敏。",agi:1,price:70,stack:1},
  {id:"luck_bead",name:"福缘珠",type:"饰品",rarity:"精品",desc:"据说能招来机缘。",luck:1,price:200,stack:1},
  {id:"blood_talisman",name:"血符",type:"饰品",rarity:"精品",desc:"血谷遗物，增臂力却伤神。",arm:2,wit:-1,price:180,stack:1},
  {id:"tide_amulet",name:"潮汐护符",type:"饰品",rarity:"精品",desc:"玄鲸港所出，内息悠长。",mpBonus:25,def:2,price:210,stack:1},
  {id:"void_bead",name:"定心珠",type:"饰品",rarity:"绝品",desc:"无相寺所出，压得住心魔。",def:5,mpBonus:30,wit:1,price:450,stack:1},
  {id:"dragon_scale",name:"龙纹佩",type:"饰品",rarity:"绝品",desc:"上古龙纹，攻防皆增。",atk:5,def:5,luck:1,price:500,stack:1},
  {id:"heart_lock",name:"同心锁",type:"饰品",rarity:"绝品",desc:"据说有情人佩之可增福缘。",luck:2,mpBonus:15,price:480,stack:1},

  /* ========== 消耗品 ========== */
  {id:"jinchuang",name:"金创药",type:"消耗品",rarity:"凡品",desc:"常见金创药，止血生肌。",heal:35,price:20,stack:99},
  {id:"huichun_san",name:"回春散",type:"消耗品",rarity:"良品",desc:"回春谷制法，药效更稳。",heal:60,price:45,stack:99},
  {id:"qingxin_dan",name:"清心丹",type:"消耗品",rarity:"良品",desc:"清心宁神，回复内力。",mp:40,price:40,stack:99},
  {id:"dali_wan",name:"大力丸",type:"消耗品",rarity:"精品",desc:"一时臂力暴涨，数日后消退。",temp:{arm:2},duration:3,price:80,stack:20},
  {id:"shenxing_san",name:"神行散",type:"消耗品",rarity:"精品",desc:"身法轻灵数日。",temp:{agi:2},duration:3,price:80,stack:20},
  {id:"tide_pearl",name:"潮珠",type:"消耗品",rarity:"良品",desc:"玄鲸港的潮珠，含一口海息。",mp:50,price:50,stack:30},
  {id:"big_heal",name:"九转还魂丹",type:"消耗品",rarity:"绝品",desc:"起死回生之药，极为珍贵。",heal:150,mp:80,price:300,stack:5},
  {id:"gift_tea",name:"雨前茶",type:"消耗品",rarity:"凡品",desc:"一包雨前茶，送人正好。",gift:6,price:18,stack:20},
  {id:"gift_wine",name:"陈年烧刀",type:"消耗品",rarity:"良品",desc:"烈酒，刀客和船夫都爱。",gift:12,price:35,stack:10},
  {id:"gift_jade",name:"小玉坠",type:"消耗品",rarity:"精品",desc:"精致玉坠，可作厚礼。",gift:20,price:90,stack:5},
  {id:"qiankun_bag",name:"小乾坤袋",type:"消耗品",rarity:"精品",desc:"使用后永久增加背包容量+5。",bagExpand:5,price:250,stack:3},

  /* ========== 材料 ========== */
  {id:"herb_stop",name:"止血草",type:"材料",rarity:"凡品",desc:"竹径常见药草。",price:8,stack:99},
  {id:"iron_ore",name:"精铁矿",type:"材料",rarity:"良品",desc:"赤炉山庄常用矿石。",price:25,stack:99},
  {id:"beast_bone",name:"兽骨",type:"材料",rarity:"凡品",desc:"野外猎得的骨头。",price:12,stack:99},
  {id:"silk_thread",name:"金丝线",type:"材料",rarity:"精品",desc:"绣软甲的细线。",price:40,stack:50},
  {id:"spirit_herb",name:"灵芝草",type:"材料",rarity:"精品",desc:"回春谷深处偶得。",price:60,stack:20},

  /* ========== 书卷 ========== */
  {id:"note_fist",name:"拳谱残页",type:"书卷",rarity:"凡品",desc:"半页拳谱，可增武学经验。",exp:20,price:30,stack:10},
  {id:"note_sword",name:"剑诀抄本",type:"书卷",rarity:"良品",desc:"基础剑意摘录。",exp:40,price:70,stack:10},
  {id:"note_neigong",name:"内功心得",type:"书卷",rarity:"精品",desc:"吐纳要诀，经验丰厚。",exp:60,price:120,stack:5},

  /* ========== 任务 ========== */
  {id:"sect_token",name:"门派令牌",type:"任务",rarity:"良品",desc:"证明身份的令牌，不可交易。",price:0,stack:1,quest:true},
  {id:"secret_letter",name:"密信",type:"任务",rarity:"精品",desc:"封口完好的密信，不知写给谁。",price:0,stack:1,quest:true,flag:"has_secret_letter"},
  {id:"jade_box",name:"玉匣",type:"任务",rarity:"绝品",desc:"上锁的玉匣，需特定之人开启。",price:0,stack:1,quest:true,flag:"has_jade_box"}
];

const BAG_DEFAULT_CAP=20;
const DROP_TABLE={
  qinghe:[{id:"jinchuang",w:3},{id:"wood_sword",w:1},{id:"gift_tea",w:2},{id:"herb_stop",w:2},{id:"travel_cloak",w:1}],
  bamboo:[{id:"herb_stop",w:4},{id:"jinchuang",w:2},{id:"note_fist",w:1},{id:"bamboo_spear",w:1},{id:"bone_bracelet",w:1}],
  market:[{id:"copper_ring",w:1},{id:"jinchuang",w:2},{id:"note_sword",w:1},{id:"gift_tea",w:2},{id:"silver_bell",w:1}],
  ferry:[{id:"tide_pearl",w:1},{id:"jinchuang",w:2},{id:"beast_bone",w:2},{id:"scale_vest",w:1}],
  salt_road:[{id:"iron_blade",w:1},{id:"beast_bone",w:3},{id:"jinchuang",w:2},{id:"night_dagger",w:1},{id:"bronze_mace",w:1}],
  mist_gate:[{id:"qingxin_dan",w:2},{id:"note_sword",w:2},{id:"qingfeng_sword",w:1},{id:"yanlan_jian",w:1}],
  hearth:[{id:"iron_ore",w:3},{id:"iron_blade",w:1},{id:"chilu_dao",w:1},{id:"flame_armor",w:1}],
  herb_valley:[{id:"huichun_san",w:2},{id:"herb_stop",w:3},{id:"qingxin_dan",w:1},{id:"spirit_herb",w:1}],
  whale_port:[{id:"tide_pearl",w:3},{id:"gift_wine",w:1},{id:"tide_amulet",w:1},{id:"whale_bone",w:1}],
  sparrow_den:[{id:"silk_thread",w:2},{id:"secret_letter",w:1},{id:"night_dagger",w:1},{id:"sparrow_cloak",w:1}],
  void_temple:[{id:"qingxin_dan",w:2},{id:"void_bead",w:1},{id:"monk_robe",w:1},{id:"void_finger",w:1}],
  cloud_peak:[{id:"jade_pendant",w:1},{id:"luck_bead",w:1},{id:"note_neigong",w:1},{id:"cloud_silk",w:1}],
  blood_ravine:[{id:"iron_blade",w:2},{id:"beast_bone",w:2},{id:"blood_talisman",w:1},{id:"blood_blade",w:1}],
  secret_reef:[{id:"tide_pearl",w:3},{id:"jade_pendant",w:1},{id:"big_heal",w:1},{id:"dragon_scale",w:1}],
  secret_cave:[{id:"silk_thread",w:2},{id:"note_sword",w:1},{id:"qiankun_bag",w:1},{id:"heart_lock",w:1}]
};
const SHOP_STOCK={
  qinghe:["jinchuang","wood_sword","cloth_robe","travel_cloak","gift_tea"],
  market:["jinchuang","qingxin_dan","iron_blade","leather_armor","copper_ring","silver_bell","gift_wine","note_fist","qiankun_bag","bronze_mace"],
  herb_valley:["huichun_san","qingxin_dan","herb_stop","spirit_herb"],
  whale_port:["tide_pearl","gift_wine","tide_amulet","scale_vest"],
  hearth:["iron_ore","iron_blade","bronze_mace"],
  mist_gate:["qingfeng_sword","jade_pendant","whip_snake"],
  void_temple:["qingxin_dan","monk_robe","void_bead"]
};

function getItemById(id){return ITEMS.find(function(i){return i.id===id;});}
function ensureBag(player){
  if(!player.bag)player.bag=[];
  if(!player.equip)player.equip={weapon:null,armor:null,accessory:null};
  if(player.bagCap==null)player.bagCap=BAG_DEFAULT_CAP;
  if(!player.tempBuffs)player.tempBuffs=[];
  return player;
}
function bagUsed(player){
  ensureBag(player);
  return player.bag.reduce(function(n){return n+1;},0);
}
function findBagStack(player,itemId){
  ensureBag(player);
  return player.bag.find(function(s){return s.id===itemId;});
}
function addItem(player,itemId,count){
  ensureBag(player);
  count=count||1;
  const def=getItemById(itemId);
  if(!def)return{ok:false,msg:"未知物品"};
  const stackMax=def.stack||1;
  let left=count;
  if(stackMax>1){
    const exist=findBagStack(player,itemId);
    if(exist){
      const can=stackMax-exist.count;
      const add=Math.min(can,left);
      exist.count+=add;left-=add;
    }
  }
  while(left>0){
    if(bagUsed(player)>=player.bagCap)return{ok:false,msg:"背包已满",partial:count-left};
    const put=Math.min(stackMax,left);
    player.bag.push({id:itemId,count:put});
    left-=put;
  }
  return{ok:true,msg:"获得【"+def.name+"】×"+count};
}
function removeItem(player,itemId,count){
  ensureBag(player);
  count=count||1;
  let need=count;
  for(let i=player.bag.length-1;i>=0&&need>0;i--){
    const s=player.bag[i];
    if(s.id!==itemId)continue;
    if(s.count<=need){need-=s.count;player.bag.splice(i,1);}
    else{s.count-=need;need=0;}
  }
  return need===0;
}
function hasItem(player,itemId,count){
  ensureBag(player);
  count=count||1;
  let n=0;
  player.bag.forEach(function(s){if(s.id===itemId)n+=s.count;});
  return n>=count;
}
function equipSlotOf(type){
  if(type==="武器")return"weapon";
  if(type==="防具")return"armor";
  if(type==="饰品")return"accessory";
  return null;
}
function isEquipped(player,itemId){
  ensureBag(player);
  const eq=player.equip;
  return eq.weapon===itemId||eq.armor===itemId||eq.accessory===itemId;
}
function formatItemStats(def){
  if(!def)return"";
  const parts=[];
  if(def.atk)parts.push("攻"+(def.atk>0?"+":"")+def.atk);
  if(def.def)parts.push("防"+(def.def>0?"+":"")+def.def);
  if(def.mpBonus)parts.push("内限+"+def.mpBonus);
  if(def.arm)parts.push("臂"+(def.arm>0?"+":"")+def.arm);
  if(def.agi)parts.push("身"+(def.agi>0?"+":"")+def.agi);
  if(def.wit)parts.push("悟"+(def.wit>0?"+":"")+def.wit);
  if(def.luck)parts.push("福"+(def.luck>0?"+":"")+def.luck);
  if(def.heal)parts.push("血+"+def.heal);
  if(def.mp)parts.push("内+"+def.mp);
  if(def.exp)parts.push("经验+"+def.exp);
  if(def.gift)parts.push("礼+"+def.gift);
  if(def.bagExpand)parts.push("容+"+def.bagExpand);
  if(def.temp)parts.push("临时");
  return parts.join(" · ");
}
function getEquipBonuses(player){
  ensureBag(player);
  const b={atk:0,def:0,mpBonus:0,arm:0,agi:0,bone:0,qi:0,wit:0,luck:0};
  ["weapon","armor","accessory"].forEach(function(slot){
    const id=player.equip[slot];
    if(!id)return;
    const it=getItemById(id);
    if(!it)return;
    if(it.atk)b.atk+=it.atk;
    if(it.def)b.def+=it.def;
    if(it.mpBonus)b.mpBonus+=it.mpBonus;
    ["arm","agi","bone","qi","wit","luck"].forEach(function(k){if(it[k])b[k]=(b[k]||0)+it[k];});
  });
  (player.tempBuffs||[]).forEach(function(tb){
    if(tb.temp)Object.keys(tb.temp).forEach(function(k){b[k]=(b[k]||0)+tb.temp[k];});
  });
  return b;
}
function equipSummaryText(player){
  const b=getEquipBonuses(player);
  const parts=[];
  if(b.atk)parts.push("攻+"+b.atk);
  if(b.def)parts.push("防+"+b.def);
  if(b.mpBonus)parts.push("内限+"+b.mpBonus);
  if(b.arm)parts.push("臂"+(b.arm>0?"+":"")+b.arm);
  if(b.agi)parts.push("身"+(b.agi>0?"+":"")+b.agi);
  if(b.wit)parts.push("悟"+(b.wit>0?"+":"")+b.wit);
  if(b.luck)parts.push("福"+(b.luck>0?"+":"")+b.luck);
  return parts.length?parts.join(" · "):"无加成";
}
function equipItem(player,itemId){
  ensureBag(player);
  const def=getItemById(itemId);
  if(!def)return{ok:false,msg:"无效物品"};
  const slot=equipSlotOf(def.type);
  if(!slot)return{ok:false,msg:"不可装备"};
  if(!hasItem(player,itemId,1))return{ok:false,msg:"背包中没有"};
  if(player.equip[slot]){
    const old=player.equip[slot];
    const oldDef=getItemById(old);
    if(oldDef&&oldDef.mpBonus){
      player.maxMp=Math.max(20,player.maxMp-oldDef.mpBonus);
      player.mp=Math.min(player.mp,player.maxMp);
    }
    const r=addItem(player,old,1);
    if(!r.ok)return{ok:false,msg:"背包满，无法卸下旧装备"};
  }
  removeItem(player,itemId,1);
  player.equip[slot]=itemId;
  if(def.mpBonus){
    player.maxMp=(player.maxMp||60)+def.mpBonus;
    player.mp=Math.min(player.mp+def.mpBonus,player.maxMp);
  }
  return{ok:true,msg:"装备【"+def.name+"】"};
}
function unequipItem(player,slot){
  ensureBag(player);
  const id=player.equip[slot];
  if(!id)return{ok:false,msg:"该栏位空"};
  const def=getItemById(id);
  if(def&&def.mpBonus){
    player.maxMp=Math.max(20,player.maxMp-def.mpBonus);
    player.mp=Math.min(player.mp,player.maxMp);
  }
  const r=addItem(player,id,1);
  if(!r.ok)return r;
  player.equip[slot]=null;
  return{ok:true,msg:"卸下【"+(def?def.name:id)+"】"};
}
function useItem(player,itemId){
  ensureBag(player);
  const def=getItemById(itemId);
  if(!def)return{ok:false,msg:"无效物品"};
  if(def.type==="武器"||def.type==="防具"||def.type==="饰品")return equipItem(player,itemId);
  if(!hasItem(player,itemId,1))return{ok:false,msg:"没有此物"};
  if(def.quest){
    if(def.flag){
      player.flags=player.flags||{};
      player.flags[def.flag]=1;
      removeItem(player,itemId,1);
      return{ok:true,msg:"使用【"+def.name+"】，留下了线索。"};
    }
    return{ok:false,msg:"任务物品不可直接使用"};
  }
  if(def.type==="材料")return{ok:false,msg:"材料需在打造时使用"};
  if(def.gift)return{ok:false,msg:"礼物请在NPC处赠送"};
  let msg="使用【"+def.name+"】";
  if(def.bagExpand){
    player.bagCap=(player.bagCap||BAG_DEFAULT_CAP)+def.bagExpand;
    msg+="，背包容量+"+def.bagExpand+"（现"+player.bagCap+"格）";
  }
  if(def.heal){player.hp=Math.min(player.maxHp,player.hp+def.heal);msg+="，气血+"+def.heal;}
  if(def.mp){player.mp=Math.min(player.maxMp,player.mp+def.mp);msg+="，内力+"+def.mp;}
  if(def.exp&&player.skills&&player.skills.length){
    const s=player.skills[Math.floor(Math.random()*player.skills.length)];
    s.exp=(s.exp||0)+def.exp;msg+="，【"+s.name+"】经验+"+def.exp;
    while(s.exp>=s.maxExp&&s.realm<4){
      s.exp-=s.maxExp;s.realm+=1;s.maxExp=Math.floor(s.maxExp*1.6);
      s.power=Math.floor((s.power||0)*1.25);msg+=" → 武学突破！";
    }
  }
  if(def.temp){
    player.tempBuffs.push({temp:def.temp,left:def.duration||3,name:def.name});
    msg+="，获得临时增益";
  }
  removeItem(player,itemId,1);
  return{ok:true,msg:msg};
}
function discardItem(player,itemId,count){
  ensureBag(player);
  const def=getItemById(itemId);
  if(!def)return{ok:false,msg:"无效"};
  if(def.quest)return{ok:false,msg:"任务物品不可丢弃"};
  count=count||1;
  if(!removeItem(player,itemId,count))return{ok:false,msg:"数量不足"};
  return{ok:true,msg:"丢弃【"+def.name+"】×"+count};
}
function giftItemToNpc(player,npc,itemId){
  ensureBag(player);
  const def=getItemById(itemId);
  if(!def||!def.gift)return{ok:false,msg:"此物不宜作礼物"};
  if(!hasItem(player,itemId,1))return{ok:false,msg:"没有此物"};
  removeItem(player,itemId,1);
  const d=(typeof addFavor==="function"?addFavor(player,npc.id,def.gift):0);
  const msg="将【"+def.name+"】赠予"+npc.name+"（好感+"+(d||def.gift)+"）";
  player.logs.unshift(msg);
  return{ok:true,msg:msg};
}
function tickTempBuffs(player){
  ensureBag(player);
  if(!player.tempBuffs||!player.tempBuffs.length)return;
  player.tempBuffs=player.tempBuffs.filter(function(tb){
    tb.left-=1;
    return tb.left>0;
  });
}
function rollDrop(locId){
  const table=DROP_TABLE[locId]||DROP_TABLE.qinghe;
  if(!table||!table.length)return null;
  if(Math.random()>0.28)return null;
  let total=0;table.forEach(function(t){total+=t.w;});
  let r=Math.random()*total;
  for(let i=0;i<table.length;i++){r-=table[i].w;if(r<=0)return table[i].id;}
  return table[0].id;
}
function tryGiveDrop(player,locId){
  const id=rollDrop(locId);
  if(!id)return null;
  const r=addItem(player,id,1);
  if(!r.ok)return"（发现"+((getItemById(id)||{}).name||"物品")+"，但背包已满）";
  return "（获得【"+(getItemById(id).name)+"】）";
}

(function patchItemSystems(){
  if(typeof createPlayer==="function"){
    var _cp=createPlayer;
    createPlayer=function(opts){
      var p=_cp(opts);
      ensureBag(p);
      addItem(p,"jinchuang",2);
      addItem(p,"cloth_robe",1);
      addItem(p,"gift_tea",1);
      return p;
    };
  }
  if(typeof derived==="function"){
    var _der=derived;
    derived=function(player){
      var d=_der(player);
      var b=getEquipBonuses(player);
      d.attack+=b.atk+(b.arm||0);
      d.dodge+=Math.floor((b.agi||0)*2)+Math.floor((b.def||0)/2);
      d.def=b.def||0;
      return d;
    };
  }
  if(typeof calcCombatPower==="function"){
    var _pow=calcCombatPower;
    calcCombatPower=function(player){
      var base=_pow(player);
      var b=getEquipBonuses(player);
      return base+Math.floor((b.atk||0)*2+(b.def||0)*1.5+(b.luck||0)*3+(b.wit||0)+(b.arm||0)+(b.agi||0));
    };
  }
  if(typeof resolveThreat==="function"){
    var _rt=resolveThreat;
    resolveThreat=function(player,diff,baseDamage){
      var b=getEquipBonuses(player);
      var reduced=Math.max(0,Math.floor(baseDamage-Math.floor((b.def||0)*0.35)));
      var r=_rt(player,diff,reduced);
      if(r.outcome==="完胜"||r.outcome==="险胜"){
        var drop=tryGiveDrop(player,player.location);
        if(drop)r.dropMsg=drop;
      }
      return r;
    };
  }
  if(typeof exploreLocation==="function"){
    var _ex=exploreLocation;
    exploreLocation=function(player){
      var r=_ex(player);
      if(r&&r.ok){
        tickTempBuffs(player);
        if(Math.random()<0.22){
          var drop=tryGiveDrop(player,player.location);
          if(drop&&player.logs&&player.logs[0])player.logs[0]+=drop;
        }
      }
      return r;
    };
  }
  if(typeof movePlayer==="function"){
    var _mv=movePlayer;
    movePlayer=function(player,targetId){
      var r=_mv(player,targetId);
      if(r&&r.ok)tickTempBuffs(player);
      return r;
    };
  }
})();
