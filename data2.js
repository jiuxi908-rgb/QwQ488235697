const origins=[{id:"farmer",name:"田舍少年",desc:"耐苦，根骨较高。",stats:{arm:1,agi:0,bone:3,qi:0,wit:0,luck:1}},{id:"merchant",name:"行商子弟",desc:"见多识广，福缘较高。",stats:{arm:0,agi:1,bone:0,qi:0,wit:1,luck:3}},{id:"orphan",name:"市井孤儿",desc:"机敏善逃，身法较高。",stats:{arm:0,agi:3,bone:0,qi:0,wit:1,luck:1}},{id:"scholar",name:"寒窗书生",desc:"悟性出众，体魄稍弱。",stats:{arm:0,agi:0,bone:0,qi:1,wit:4,luck:0}}];
const talents=[{id:"quick_learner",name:"过目不忘",desc:"悟性+2。",stats:{wit:2}},{id:"iron_body",name:"铁骨",desc:"根骨+2。",stats:{bone:2}},{id:"wind_step",name:"踏风",desc:"身法+2。",stats:{agi:2}},{id:"lucky_star",name:"天眷",desc:"福缘+2。",stats:{luck:2}}];
// RESTORED_MARKER - full content continues via push_files
const SAVE_KEY="yijian_yisuo_save_v2";
function saveGame(state){localStorage.setItem(SAVE_KEY,JSON.stringify({...state,savedAt:new Date().toISOString()}));}
function loadGame(){const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null;}
function hasSave(){return Boolean(localStorage.getItem(SAVE_KEY));}
function deleteSave(){localStorage.removeItem(SAVE_KEY);localStorage.removeItem("yijian_yisuo_save_v1");}
