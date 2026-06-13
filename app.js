const fields=["engineVersion","connectionStatus","lastSignal","engineNotes","debtRemaining","carFund","houseFund","tradingAccount","weeklyProfit","winRate","longPL","shortPL","weeklyReview"];
let trades=JSON.parse(localStorage.getItem("trades")||"[]");
let missed=JSON.parse(localStorage.getItem("missed")||"[]");
let upgrades=JSON.parse(localStorage.getItem("upgrades")||"[]");

function loadAll(){fields.forEach(id=>{let v=localStorage.getItem(id); if(v!==null) document.getElementById(id).value=v});renderTrades();renderMissed();renderUpgrades();}
function saveAll(){fields.forEach(id=>localStorage.setItem(id,document.getElementById(id).value));localStorage.setItem("trades",JSON.stringify(trades));localStorage.setItem("missed",JSON.stringify(missed));localStorage.setItem("upgrades",JSON.stringify(upgrades));alert("Saved locally on this device.");}
function resetAll(){if(confirm("Reset all local data?")){localStorage.clear();location.reload();}}
function addTrade(){trades.push({time:tradeTime.value,side:tradeSide.value,result:tradeResult.value,reason:tradeReason.value});tradeTime.value="";tradeResult.value="";tradeReason.value="";saveAll();renderTrades();}
function renderTrades(){tradeTable.innerHTML="";trades.forEach(t=>{tradeTable.innerHTML+=`<tr><td>${t.time}</td><td>${t.side}</td><td>${t.result}</td><td>${t.reason}</td></tr>`})}
function addMissed(){missed.push({title:missedTitle.value,reason:missedReason.value});missedTitle.value="";missedReason.value="";saveAll();renderMissed();}
function renderMissed(){missedList.innerHTML="";missed.forEach(m=>{missedList.innerHTML+=`<li><b>${m.title}</b> — ${m.reason}</li>`})}
function addUpgrade(){upgrades.push({item:upgradeItem.value,priority:upgradePriority.value});upgradeItem.value="";saveAll();renderUpgrades();}
function renderUpgrades(){upgradeList.innerHTML="";upgrades.forEach(u=>{upgradeList.innerHTML+=`<li><b>${u.priority}</b> — ${u.item}</li>`})}
loadAll();