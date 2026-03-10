// app.js
// Logic for Stacks Aegis Mission Control

// --- DOM elements ---
const protectPanel = document.getElementById('protectPanel');
const monitorPanel = document.getElementById('monitorPanel');
const emergencyPanel = document.getElementById('emergencyPanel');
const recoveryContainer = document.getElementById('recoveryContainer');
const eventTimeline = document.getElementById('eventTimeline');

const riskSlider = document.getElementById('riskSlider');
const sliderValueDisplay = document.getElementById('sliderValueDisplay');
const tradeoffDesc = document.getElementById('tradeoffDesc');
const activeThresholdDisplay = document.getElementById('activeThresholdDisplay');

const scoreText = document.getElementById('scoreText');
const overallStatusBadge = document.getElementById('overallStatusBadge');
const freshnessDisplay = document.getElementById('freshnessDisplay');
const circuitBadge = document.getElementById('circuitBadge');

const btnConnect = document.getElementById('btnConnect');

let walletConnected = false;
let currentThreshold = 0.98;

// --- Phase 1: Protect (Setup) ---
function connectWallet() {
  walletConnected = true;
  btnConnect.innerText = "0xSP3...A8F";
  btnConnect.style.background = "var(--safe)";
  btnConnect.style.color = "#FFFFFF";
  addTimelineEvent("Wallet Connected: 0xSP3...A8F", "safe");
}

function updateSlider() {
  const val = riskSlider.value;
  currentThreshold = val / 100;
  
  sliderValueDisplay.innerText = `< ${currentThreshold}`;
  activeThresholdDisplay.innerText = currentThreshold;

  if (val == 99) {
    tradeoffDesc.innerText = "Safe Profile: Highly sensitive exit. High yield interruption risk.";
  } else if (val == 98) {
    tradeoffDesc.innerText = "Balanced Profile: Faster exits, moderate yield interruption risk.";
  } else if (val <= 97) {
    tradeoffDesc.innerText = "Aggressive Profile: Lower threshold execution. Maximum yield continuation.";
  }
  
  // Update slider bar fill visually
  const percentage = (val - 95) / (99 - 95) * 100;
  riskSlider.style.background = `linear-gradient(to right, var(--primary-accent) ${percentage}%, var(--bg-panel) ${percentage}%)`;
}

// Strategy selection toggle
document.querySelectorAll('.strategy-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const stratName = card.querySelector('.strat-title').innerText;
    document.getElementById('activeStrategyName').innerText = stratName;
  });
});

function activateAegis() {
  if (!walletConnected) {
    alert("Please connect your wallet first.");
    return;
  }
  
  // Transition logic: Protect -> Monitor
  protectPanel.style.display = 'none';
  monitorPanel.style.display = 'flex';
  
  addTimelineEvent(`Aegis Shield Activated. Threshold: < ${currentThreshold}`, "safe");
}

// --- Phase 2: Monitor & Tooling ---
function addTimelineEvent(message, status="critical") {
  const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
  
  const li = document.createElement("li");
  li.className = `tl-event ${status}`;
  
  li.innerHTML = `
    <span class="tl-time">${timeStr}</span>
    <span class="tl-desc">${message}</span>
  `;
  
  // Prepend to show latest on top
  eventTimeline.insertBefore(li, eventTimeline.firstChild);
}

function updateVisuals(score, statusStr, colorClass) {
  scoreText.innerText = score.toFixed(2);
  overallStatusBadge.className = `status-badge ${colorClass}`;
  overallStatusBadge.innerText = statusStr;
}

// --- Phase 3 & 4: React & Recover (Simulation) ---
function simulatePanic() {
  // Phase logic: Monitor -> React
  emergencyPanel.style.display = 'flex';
  recoveryContainer.style.display = 'none'; // Ensure recovery is hidden initially
  
  // Mutate DOM to Red
  document.body.style.borderTop = "8px solid var(--panic)";
  circuitBadge.innerText = "CIRCUIT BREAKER ACTIVE";
  circuitBadge.className = "status-badge panic";
  
  updateVisuals(0.95, "PANIC", "panic");
  freshnessDisplay.innerText = "STALE (6 BLOCKS)";
  freshnessDisplay.className = "data-value panic-text data-mono";

  // Simulate Event Timeline population
  addTimelineEvent(`Depeg detected. sBTC/BTC dropped below ${currentThreshold}`, "critical");
  
  setTimeout(() => {
    addTimelineEvent("Circuit breaker triggered automatically.", "critical");
    document.getElementById("stateMonitor").classList.remove("active");
    document.getElementById("stateCircuit").classList.add("active");
    
    setTimeout(() => {
      addTimelineEvent("Funds withdrawn from active pool.", "critical");
      
      setTimeout(() => {
        addTimelineEvent("Funds secured in Safe Vault.", "safe");
        
        // Phase logic: React -> Recover
        document.getElementById("stateCircuit").classList.remove("active");
        document.getElementById("stateSafe").classList.add("active");
        
        // Show recovery action panel
        recoveryContainer.style.display = 'flex';
        circuitBadge.innerText = "AWAITING USER ACTION";
        circuitBadge.className = "status-badge warning";
        
      }, 1500);
      
    }, 1500);
    
  }, 1000);
}

function resetWorkflow() {
  // Reset sequence completely back to Protect Setup
  emergencyPanel.style.display = 'none';
  monitorPanel.style.display = 'none';
  protectPanel.style.display = 'flex';
  
  updateVisuals(1.00, "SAFE", "safe");
  
  document.body.style.borderTop = "none";
  freshnessDisplay.innerText = "2 BLOCKS";
  freshnessDisplay.className = "data-value safe-text data-mono";
  
  document.getElementById("stateSafe").classList.remove("active");
  document.getElementById("stateMonitor").classList.add("active");
  
  // Clear timeline
  eventTimeline.innerHTML = '';
}

// Init slider UI
updateSlider();
