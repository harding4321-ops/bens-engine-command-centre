window.addEventListener("load", function () {
  const ids = ["engineVersion","connectionStatus","lastSignal","engineNotes","missionName","missionWeeks","startDate","targetType","targetAmount","currentAmount","debtRemaining","carFund","houseFund","tradingAccount","weeklyProfit","winRate","longPL","shortPL","weeklyReview"];
  let trades = JSON.parse(localStorage.getItem("trades") || "[]");
  let missed = JSON.parse(localStorage.getItem("missed") || "[]");
  let upgrades = JSON.parse(localStorage.getItem("upgrades") || "[]");

  function el(id){ return document.getElementById(id); }
  function money(n){ return "£" + Number(n || 0).toLocaleString("en-GB", {minimumFractionDigits:2, maximumFractionDigits:2}); }

  function parseDate(input){
    if(!input) return null;
    input = input.trim();

    // Accept DD/MM/YYYY
    if(input.includes("/")){
      const parts = input.split("/");
      if(parts.length === 3){
        const d = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const y = Number(parts[2]);
        return new Date(y, m, d);
      }
    }

    // Accept YYYY-MM-DD
    if(input.includes("-")){
      const parts = input.split("-");
      if(parts.length === 3){
        const y = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const d = Number(parts[2]);
        return new Date(y, m, d);
      }
    }

    return null;
  }

  function saveAll(showAlert){
    ids.forEach(id => { if(el(id)) localStorage.setItem(id, el(id).value); });
    localStorage.setItem("trades", JSON.stringify(trades));
    localStorage.setItem("missed", JSON.stringify(missed));
    localStorage.setItem("upgrades", JSON.stringify(upgrades));
    if(showAlert) alert("Saved locally on this device.");
  }

  function calculateMission(){
    const weeks = Number(el("missionWeeks").value || 0);
    const target = Number(el("targetAmount").value || 0);
    const current = Number(el("currentAmount").value || 0);
    const start = parseDate(el("startDate").value);

    if(!weeks || !target || !start || isNaN(start.getTime())){
      el("targetOut").textContent = "Check weeks, date and target amount";
      el("weeksLeftOut").textContent = "-";
      el("daysLeftOut").textContent = "-";
      el("remainingOut").textContent = "-";
      el("weeklyNeedOut").textContent = "-";
      el("dailyNeedOut").textContent = "-";
      el("progressOut").textContent = "-";
      el("missionProgress").style.width = "0%";
      el("autoWeeklyGoal").textContent = "£0.00/week";
      el("autoGoalText").textContent = "Use date format 13/06/2026 or 2026-06-13.";
      saveAll(false);
      return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + weeks * 7);

    const today = new Date();
    today.setHours(0,0,0,0);

    const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));
    const weeksLeft = Math.max(0, Math.ceil(daysLeft / 7));
    const remaining = Math.max(0, target - current);
    const weeklyNeed = weeksLeft > 0 ? remaining / weeksLeft : remaining;
    const dailyNeed = daysLeft > 0 ? remaining / daysLeft : remaining;
    const progress = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

    el("targetOut").textContent = (el("missionName").value || "Mission") + " - " + el("targetType").value;
    el("weeksLeftOut").textContent = weeksLeft;
    el("daysLeftOut").textContent = daysLeft;
    el("remainingOut").textContent = money(remaining);
    el("weeklyNeedOut").textContent = money(weeklyNeed);
    el("dailyNeedOut").textContent = money(dailyNeed);
    el("progressOut").textContent = progress.toFixed(1) + "%";
    el("missionProgress").style.width = progress + "%";
    el("autoWeeklyGoal").textContent = money(weeklyNeed) + "/week";
    el("autoGoalText").textContent = "To hit " + money(target) + " in " + weeks + " weeks, with " + money(current) + " already logged.";
    saveAll(false);
  }

  function renderTrades(){ el("tradeTable").innerHTML = trades.map(t => `<tr><td>${t.time}</td><td>${t.side}</td><td>${t.result}</td><td>${t.reason}</td></tr>`).join(""); }
  function renderMissed(){ el("missedList").innerHTML = missed.map(m => `<li><b>${m.title}</b> — ${m.reason}</li>`).join(""); }
  function renderUpgrades(){ el("upgradeList").innerHTML = upgrades.map(u => `<li><b>${u.priority}</b> — ${u.item}</li>`).join(""); }

  function addTrade(){ trades.push({time:el("tradeTime").value, side:el("tradeSide").value, result:el("tradeResult").value, reason:el("tradeReason").value}); el("tradeTime").value=""; el("tradeResult").value=""; el("tradeReason").value=""; saveAll(false); renderTrades(); }
  function addMissed(){ missed.push({title:el("missedTitle").value, reason:el("missedReason").value}); el("missedTitle").value=""; el("missedReason").value=""; saveAll(false); renderMissed(); }
  function addUpgrade(){ upgrades.push({item:el("upgradeItem").value, priority:el("upgradePriority").value}); el("upgradeItem").value=""; saveAll(false); renderUpgrades(); }
  function resetAll(){ if(confirm("Reset all local dashboard data?")){ localStorage.clear(); location.reload(); } }

  ids.forEach(id => { const saved = localStorage.getItem(id); if(el(id) && saved !== null) el(id).value = saved; });
  if(!el("startDate").value) el("startDate").value = "13/06/2026";

  el("calculateBtn").onclick = calculateMission;
  el("saveBtn").onclick = () => saveAll(true);
  el("resetBtn").onclick = resetAll;
  el("addTradeBtn").onclick = addTrade;
  el("addMissedBtn").onclick = addMissed;
  el("addUpgradeBtn").onclick = addUpgrade;

  ["missionName","missionWeeks","startDate","targetType","targetAmount","currentAmount"].forEach(id => {
    if(el(id)){
      el(id).addEventListener("input", calculateMission);
      el(id).addEventListener("change", calculateMission);
    }
  });

  renderTrades();
  renderMissed();
  renderUpgrades();
  calculateMission();
});