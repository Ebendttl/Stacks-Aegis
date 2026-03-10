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
  
  // Format time clearly for fintech logging
  const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
  entry.innerText = `[${timeStr}] ${message}`;
  
  systemLogs.insertBefore(entry, systemLogs.firstChild);
}

function updateVisuals(score, statusStr, colorClass) {
  // Update Score Text
  scoreText.innerText = score.toFixed(2);
  
  // Since we removed the circle SVG visually for a more brutalist look, 
  // we update the stroke for the DOM tree but it stays hidden.
  const percentage = (score / 1.0) * 100;
  scoreCircle.setAttribute("stroke-dasharray", `${percentage}, 100`);
  
  // Update Classes
  circularChart.className = `circular-chart ${colorClass}`;
  overallStatusBadge.className = `status-badge ${colorClass}`;
  overallStatusBadge.innerText = statusStr;
}

function simulatePanic() {
  addLog("WARNING: High volatility detected. Peg instability confirmed.", "warn");
  
  // Drop score
  updateVisuals(0.95, "PANIC", "panic");
  
  setTimeout(() => {
    addLog("CRITICAL: SCORE < 0.98. CIRCUIT BREAKER ACTIVE.", "crit");
    document.getElementById("stateMonitor").classList.remove("active");
    document.getElementById("stateCircuit").classList.add("active");
    
    // Simulate UI Freeze using thick red border
    document.body.style.borderTop = "8px solid var(--panic)";
    freshnessDisplay.innerText = "STALE (6 BLOCKS)";
    freshnessDisplay.className = "data-value panic-text data-mono";
    
    setTimeout(() => {
      addLog("ACTION: Automated Safe-Withdraw executed. Protocol frozen.", "info");
      document.getElementById("stateCircuit").classList.remove("active");
      document.getElementById("stateSafe").classList.add("active");
    }, 2000);
    
  }, 1000);
}

function simulateRecovery() {
  addLog("INFO: Oracles stabilized. Protocol manual reset authorized.", "info");
  
  // Restore score
  updateVisuals(1.00, "SECURE", "safe");
  document.getElementById("stateSafe").classList.remove("active");
  document.getElementById("stateMonitor").classList.add("active");
  document.body.style.borderTop = "none";
  freshnessDisplay.innerText = "2 BLOCKS";
  freshnessDisplay.className = "data-value safe-text data-mono";
  
  addLog("System fully recovered. Monitoring resumed.", "info");
}

// Initial Log
setTimeout(() => {
  addLog("Connected to Stacks Mainnet node. 🚀");
}, 500);
