const npcs=[
{id:"zhou",name:"老周",title:"客栈掌柜",loc:"qinghe",desc:"清河镇客栈老板，消息灵通。",talks:["江湖险恶，少侠且先吃饭。","缉武司最近在查盐道的人。","烟岚剑斋收徒严，先练身法。"],acts:[{id:"rest",name:"住店恢复",type:"rest",cost:8,hp:30,mp:20},{id:"rumor",name:"打听消息",type:"talk"}]},
{id:"su",name:"苏半仙",title:"医馆大夫",loc:"qinghe",desc:"医术尚可，脾气一般。",talks:["先把命保住，再谈武功。","回春谷的药最好，但贵。"],acts:[{id:"heal",name:"诊治回血",type:"heal",cost:15,value:40},{id:"buy_pill",name:"买金创药",type:"item",cost:20,effect:"heal",value:35}]},
{id:"aqing",name:"阿青",title:"采药人",loc:"bamboo",desc:"常在竹径采药的少女。",talks:["这雨里的竹叶能止血。","山门那边弟子有时会下来。"],acts:[{id:"herb",name:"买草药",type:"item",cost:12,effect:"heal",value:20},{id:"guide",name:"请教路径",type:"talk"}]},
{id:"yubo",name:"老余",title:"渡船船夫",loc:"ferry",desc:"走南闯北几十年。",talks:["南海商盟的船最阔气。","水贼专欺负弱的。"],acts:[{id:"ferry_tip",name:"打听水路",type:"talk"},{id:"train_swim",name:"学水性",type:"train_stat",stat:"qi",cost:25,value:1,once:true}]},
{id:"qianliu",name:"钱六",title:"黑市贩子",loc:"market",desc:"什么都卖，真假难辨。",talks:["残谱？有。贵。","别问货从哪来。"],acts:[{id:"sell_needle",name:"飞星针谱",type:"skill",skill:"throwing_needle",cost:25},{id:"sell_point",name:"点穴手残页",type:"skill",skill:"point_finger",cost:30},{id:"gamble",name:"赌一把",type:"gamble",cost:20}]},
{id:"luyun",name:"陆云",title:"外门弟子",loc:"mist_gate",desc:"烟岚剑斋外门，话不多。",talks:["斋主最看重悟性。","云雾中练剑，心不能乱。"],acts:[{id:"spar",name:"比剑切磋",type:"duel",diff:35,dmg:18,reward:15},{id:"tip",name:"请教剑意",type:"exp",cost:10,value:20}]},
{id:"tieba",name:"铁疤",title:"流浪刀客",loc:"salt_road",desc:"脸上有刀疤，眼神狠。",talks:["这道上死人比活人多。","想活，就别心软。"],acts:[{id:"duel_knife",name:"刀下见真章",type:"duel",diff:55,dmg:28,reward:30},{id:"buy_oil",name:"买刀油",type:"exp",cost:20,value:25}]},
{id:"helie_npc",name:"贺炉",title:"锻刀学徒",loc:"hearth",desc:"赤炉刀社的年轻学徒。",talks:["社主的刀，一刀断石。","搬矿也能长力气。"],acts:[{id:"help_ore",name:"帮忙搬矿",type:"silver",value:12},{id:"spar_blade",name:"试刀",type:"duel",diff:42,dmg:20,reward:18}]},
{id:"yaotong",name:"药童",title:"回春谷弟子",loc:"herb_valley",desc:"背着药篓，笑眯眯。",talks:["谷主说，救人比杀人难。","误食毒草会很惨。"],acts:[{id:"free_heal",name:"请施药",type:"heal",cost:8,value:45},{id:"learn_herb",name:"学辨药",type:"train_stat",stat:"wit",cost:30,value:1,once:true}]},
{id:"ao_sailor",name:"潮生",title:"玄鲸帮众",loc:"whale_port",desc:"皮肤晒得发黑的水手。",talks:["帮规重契约。","深海里有东西在动。"],acts:[{id:"guard_ship",name:"护船一程",type:"duel",diff:48,dmg:22,reward:25},{id:"pearl",name:"买潮珠",type:"item",cost:35,effect:"mp",value:40}]},
{id:"que_shadow",name:"影七",title:"白雀影卫",loc:"sparrow_den",desc:"看不清面容的黑衣人。",talks:["……","楼里不欢迎废话。"],acts:[{id:"msg",name:"传信赚钱",type:"silver",value:16},{id:"shadow_train",name:"学影步",type:"exp",cost:15,value:28}]},
{id:"monk_jing",name:"静尘",title:"无相寺僧",loc:"void_temple",desc:"年轻僧人，目不斜视。",talks:["无相无我。","心魔比外敌更难降。"],acts:[{id:"copy_sutra",name:"抄经感悟",type:"exp",cost:0,value:22},{id:"meditation",name:"打坐",type:"rest",cost:0,hp:10,mp:35}]},
{id:"hermit",name:"云叟",title:"隐士",loc:"cloud_peak",desc:"白发老者，坐在残碑旁。",talks:["天机不可尽说。","你的缘法未到。"],acts:[{id:"ask_dao",name:"请教天机",type:"talk"},{id:"gift_luck",name:"求福缘",type:"train_stat",stat:"luck",cost:50,value:1,once:true}]},
{id:"xie_ren",name:"血屠",title:"邪修",loc:"blood_ravine",desc:"衣衫染血，笑容诡异。",talks:["正道？呵。","刀下亡魂，我记得每一个。"],acts:[{id:"blood_duel",name:"血战",type:"duel",diff:65,dmg:35,reward:40},{id:"evil_tip",name:"邪功残页",type:"exp",cost:30,value:40}]},
{id:"reef_ghost",name:"沉沙",title:"遗迹看守",loc:"secret_reef",desc:"像是石头里长出来的人影。",talks:["潮汐会打开门。","不懂古法，勿近。"],acts:[{id:"ancient",name:"观摩古法",type:"exp",cost:20,value:45},{id:"dive",name:"潜海寻物",type:"duel",diff:70,dmg:32,reward:50}]},
{id:"cave_guard",name:"窟影",title:"密道机关人",loc:"secret_cave",desc:"不知是人是傀。",talks:["……咔。","禁止通行。"],acts:[{id:"disarm",name:"拆机关",type:"duel",diff:58,dmg:26,reward:35},{id:"sneak",name:"潜行练习",type:"exp",cost:10,value:30}]}
];
function getNpcsAt(loc){return npcs.filter(function(n){return n.loc===loc;});}
function findPerson(id){return npcs.find(function(n){return n.id===id;});}
