// app.js
// Logic for Stacks Aegis Command Center

const scoreText = document.getElementById("scoreText");
const scoreCircle = document.getElementById("scoreCircle");
const circularChart = document.querySelector(".circular-chart");
const overallStatusBadge = document.getElementById("overallStatusBadge");
const freshnessDisplay = document.getElementById("freshnessDisplay");
const systemLogs = document.getElementById("systemLogs");

// UI State Management
function addLog(message, level = "info") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${level}`;
  const time = new Date().toLocaleTimeString();
  entry.innerText = `[${time}] ${message}`;
  systemLogs.insertBefore(entry, systemLogs.firstChild);
}

function updateVisuals(score, statusStr, colorClass) {
  // Update Score Text
  scoreText.innerText = score.toFixed(2);
  
  // Calculate SVG stroke-dasharray (percentage of circumference)
  // Max is ~100
  const percentage = (score / 1.0) * 100;
  scoreCircle.setAttribute("stroke-dasharray", `${percentage}, 100`);
  
  // Update Classes
  circularChart.className = `circular-chart ${colorClass}`;
  overallStatusBadge.className = `status-badge ${colorClass}`;
  overallStatusBadge.innerText = statusStr;
}

function simulatePanic() {
  addLog("WARNING: Oracle detected high volatility. sBTC threshold drops to 0.95...", "warn");
  
  // Drop score
  updateVisuals(0.95, "PANIC", "panic");
  
  setTimeout(() => {
    addLog("CRITICAL: Stability Score < 0.98. Circuit Breaker triggered!", "crit");
    document.getElementById("stateMonitor").classList.remove("active");
    document.getElementById("stateCircuit").classList.add("active");
    
    // Simulate UI Freeze
    document.body.style.borderTop = "4px solid var(--panic)";
    freshnessDisplay.innerText = "Stale (6 Blocks)";
    freshnessDisplay.className = "value panic-text";
    
    setTimeout(() => {
      addLog("ACTION: Automated Safe-Withdraw executed successfully.", "info");
      addLog("INFO: Vault capital routed to Safe Reserve Component.", "info");
      document.getElementById("stateCircuit").classList.remove("active");
      document.getElementById("stateSafe").classList.add("active");
    }, 2000);
    
  }, 1000);
}

function simulateRecovery() {
  addLog("INFO: Oracles stabilized. Manual reset initiated.", "info");
  
  // Restore score
  updateVisuals(1.00, "Secure", "safe");
  document.getElementById("stateSafe").classList.remove("active");
  document.getElementById("stateMonitor").classList.add("active");
  document.body.style.borderTop = "none";
  freshnessDisplay.innerText = "2 Blocks";
  freshnessDisplay.className = "value safe-text";
  
  addLog("System fully recovered.", "safe-text");
}

// Initial Log
setTimeout(() => {
  addLog("Connected to Stacks Mainnet (simulated) 🚀");
}, 500);
