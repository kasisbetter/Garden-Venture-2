// ==========================================================================
// 1. GAME MASTER CATALOG & EXPONENTIAL WEIGHT/HEIGHT STATS
// ==========================================================================

const SEED_CATALOG = [
  {
    id: 'carrot',
    name: 'Carrot Seed',
    icon: '🥕',
    rarity: 'common',
    affinity: 'all',
    cost: 20,
    maxStock: 10,
    currentStock: 10,
    baseGrowTime: 5,
    baseSellPrice: 45,
    minKg: 1, maxKg: 15,
    minM: 0.5, maxM: 2,
    isVine: false
  },
  {
    id: 'potato',
    name: 'Potato Seed',
    icon: '🥔',
    rarity: 'common',
    affinity: 'all',
    cost: 50,
    maxStock: 8,
    currentStock: 8,
    baseGrowTime: 8,
    baseSellPrice: 120,
    minKg: 5, maxKg: 30,
    minM: 0.4, maxM: 1.5,
    isVine: false
  },
  {
    id: 'grape_vine',
    name: 'Grape Vine Seed',
    icon: '🍇',
    rarity: 'uncommon',
    affinity: 'all',
    cost: 600,
    maxStock: 5,
    currentStock: 5,
    baseGrowTime: 35,
    baseSellPrice: 65,
    minKg: 2, maxKg: 12,
    minM: 1.5, maxM: 4,
    isVine: true,
    produceIcon: '🍇',
    produceName: 'Grape Cluster',
    maxFruits: 3
  },
  {
    id: 'tomato',
    name: 'Tomato Seed',
    icon: '🍅',
    rarity: 'uncommon',
    affinity: 'day',
    cost: 150,
    maxStock: 6,
    currentStock: 6,
    baseGrowTime: 12,
    baseSellPrice: 380,
    minKg: 10, maxKg: 80,
    minM: 1, maxM: 5,
    isVine: false
  },
  {
    id: 'glowshroom',
    name: 'Glowshroom Seed',
    icon: '🍄',
    rarity: 'uncommon',
    affinity: 'night',
    cost: 350,
    maxStock: 5,
    currentStock: 5,
    baseGrowTime: 15,
    baseSellPrice: 950,
    minKg: 20, maxKg: 150,
    minM: 2, maxM: 10,
    isVine: false
  },
  {
    id: 'starfruit',
    name: 'Star Fruit Seed',
    icon: '⭐',
    rarity: 'rare',
    affinity: 'day',
    cost: 1200,
    maxStock: 4,
    currentStock: 4,
    baseGrowTime: 20,
    baseSellPrice: 3500,
    minKg: 100, maxKg: 1200,
    minM: 10, maxM: 45,
    isVine: false
  },
  {
    id: 'watermelon_vine',
    name: 'Watermelon Vine',
    icon: '🍉',
    rarity: 'rare',
    affinity: 'day',
    cost: 6500,
    maxStock: 3,
    currentStock: 3,
    baseGrowTime: 60,
    baseSellPrice: 350,
    minKg: 20, maxKg: 120,
    minM: 3, maxM: 12,
    isVine: true,
    produceIcon: '🍉',
    produceName: 'Giant Watermelon',
    maxFruits: 2
  },
  {
    id: 'nectarroot',
    name: 'Nectar Root Seed',
    icon: '🌸',
    rarity: 'legendary',
    affinity: 'all',
    cost: 5000,
    maxStock: 3,
    currentStock: 3,
    baseGrowTime: 30,
    baseSellPrice: 16000,
    minKg: 5000, maxKg: 150000,
    minM: 40, maxM: 200,
    isVine: false
  },
  {
    id: 'strawberry',
    name: 'Strawberry Seed',
    icon: '🍓',
    rarity: 'astral',
    affinity: 'night',
    cost: 25000,
    maxStock: 2,
    currentStock: 2,
    baseGrowTime: 45,
    baseSellPrice: 85000,
    minKg: 500000, maxKg: 15000000,
    minM: 200, maxM: 900,
    isVine: false
  },
  {
    id: 'singularity',
    name: 'Singularity Sprout',
    icon: '🌌',
    rarity: 'transcendent',
    affinity: 'all',
    cost: 1000000,
    maxStock: 1,
    currentStock: 1,
    baseGrowTime: 60,
    baseSellPrice: 4500000,
    minKg: 50000000, maxKg: 5000000000,
    minM: 1000, maxM: 10000,
    isVine: false
  }
];

let gameState = {
  cash: 25,
  currentField: 0,
  maxFields: 5,
  unlockedFields: 1,
  selectedTool: 'plant',
  selectedSeedId: 'carrot',
  selectedVinePlotIndex: null,
  
  isDay: true,
  cycleTimeLeft: 30,
  shopRefillTimeLeft: 180,
  
  seedInventory: {
    carrot: 5,
    potato: 0,
    grape_vine: 0,
    tomato: 0,
    glowshroom: 0,
    starfruit: 0,
    watermelon_vine: 0,
    nectarroot: 0,
    strawberry: 0,
    singularity: 0
  },
  
  codex: {
    carrot: { discovered: true, totalHarvested: 0 }
  },

  fields: []
};

// 🎮 XBOX GAMEPAD CONTROLLER STATE
let gamepadState = {
  connected: false,
  selectedPlotIndex: 4, // Starts in center plot #5
  lastButtonTime: 0,
  buttonCooldown: 180 // ms debounce delay between inputs
};

const FIELD_EXPANSION_COSTS = [0, 250, 1500, 10000, 100000];

let plotDomNodes = [];

function initFields() {
  gameState.fields = [];
  for (let f = 0; f < gameState.maxFields; f++) {
    const plots = [];
    for (let p = 0; p < 9; p++) {
      plots.push({
        crop: null,
        progress: 0,
        isReady: false,
        rolledKg: 0,
        rolledMeters: 0,
        actualGrowTime: 5,
        vineFruits: []
      });
    }
    gameState.fields.push(plots);
  }
}

// Formatters
function formatKg(kg) {
  if (kg === undefined || kg === null || isNaN(kg)) return '0.0 kg';
  const val = Number(kg);
  if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B kg';
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M kg';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'k kg';
  return val.toFixed(1) + ' kg';
}

function formatMeters(m) {
  if (m === undefined || m === null || isNaN(m)) return '0.0m';
  const val = Number(m);
  if (val >= 1000) return (val / 1000).toFixed(1) + 'km';
  return val.toFixed(1) + 'm';
}

function calculateVineFruitEarnings(basePrice, rolledKg, minKg) {
  const safeKg = rolledKg || minKg || 1;
  const weightBonus = 1 + (safeKg / (minKg || 1)) * 0.5;
  return Math.round((basePrice || 10) * weightBonus);
}

// ==========================================================================
// 2. DOM REFERENCES
// ==========================================================================
const cashEl = document.getElementById('cash-amount');
const plotsGrid = document.getElementById('plots-grid');
const fieldTitle = document.getElementById('field-title');
const cycleIcon = document.getElementById('cycle-icon');
const cycleLabel = document.getElementById('cycle-label');
const cycleTimer = document.getElementById('cycle-timer');
const currentSeedNameEl = document.getElementById('current-seed-name');
const particlesLayer = document.getElementById('particles-layer');
const firefliesLayer = document.getElementById('fireflies-layer');

const shovelBtn = document.getElementById('shovel-btn');
const sellBtn = document.getElementById('sell-btn');
const shopBtn = document.getElementById('shop-btn');
const settingsBtn = document.getElementById('settings-btn');
const prevFieldBtn = document.getElementById('prev-field-btn');
const nextFieldBtn = document.getElementById('next-field-btn');
const seedBagBtn = document.getElementById('seed-bag-btn');
const seedBagDrawer = document.getElementById('seed-bag-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const seedInventoryList = document.getElementById('seed-inventory-list');

const shopModal = document.getElementById('shop-modal');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopItemsList = document.getElementById('shop-items-list');
const shopRefillTimerEl = document.getElementById('shop-refill-timer');
const openIndexBtn = document.getElementById('open-index-btn');

const vineModal = document.getElementById('vine-modal');
const vineModalTitle = document.getElementById('vine-modal-title');
const vineProduceList = document.getElementById('vine-produce-list');
const harvestAllVineBtn = document.getElementById('harvest-all-vine-btn');
const closeVineBtn = document.getElementById('close-vine-btn');

const indexModal = document.getElementById('index-modal');
const closeIndexBtn = document.getElementById('close-index-btn');
const indexItemsList = document.getElementById('index-items-list');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const shopQuickBtn = document.getElementById('shop-quick-btn');
const resetSaveBtn = document.getElementById('reset-save-btn');
const statsSummaryEl = document.getElementById('stats-summary');

// ==========================================================================
// 3. CLASSIC TITLE SCREEN ENGINE
// ==========================================================================

function initSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');
  const progressFill = document.getElementById('splash-progress-fill');
  const promptEl = document.getElementById('splash-prompt');
  
  if (!splashScreen || !progressFill || !promptEl) return;

  let progress = 0;
  let loaded = false;

  promptEl.textContent = "TIP: Tap to Play Cozy Audio!";

  const loadingInterval = setInterval(() => {
    progress += 1.6;
    if (progress > 100) progress = 100;
    progressFill.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(loadingInterval);
      loaded = true;
      promptEl.textContent = 'TAP TO START YOUR VENTURE';
      promptEl.classList.add('ready-start');
    }
  }, 45);

  splashScreen.addEventListener('click', () => {
    if (!loaded) {
      progress = 100;
      progressFill.style.width = '100%';
      promptEl.textContent = 'TAP TO START YOUR VENTURE';
      promptEl.classList.add('ready-start');
      loaded = true;
      return;
    }

    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 500);
  });
}

// ==========================================================================
// 4. ANIMATED MODAL & DRAWER CONTROLLERS
// ==========================================================================

function openModal(modalEl) {
  modalEl.classList.remove('hidden');
  void modalEl.offsetWidth;
  modalEl.classList.add('open');
}

function closeModal(modalEl) {
  modalEl.classList.remove('open');
  setTimeout(() => {
    if (!modalEl.classList.contains('open')) {
      modalEl.classList.add('hidden');
    }
  }, 220);
}

function toggleDrawer(drawerEl) {
  if (drawerEl.classList.contains('open')) {
    closeDrawer(drawerEl);
  } else {
    openDrawer(drawerEl);
  }
}

function openDrawer(drawerEl) {
  drawerEl.classList.remove('hidden');
  void drawerEl.offsetWidth;
  drawerEl.classList.add('open');
}

function closeDrawer(drawerEl) {
  drawerEl.classList.remove('open');
  setTimeout(() => {
    if (!drawerEl.classList.contains('open')) {
      drawerEl.classList.add('hidden');
    }
  }, 250);
}

// ==========================================================================
// 5. PLOTS & FIREFLIES SETUP
// ==========================================================================

function spawnNightFireflies() {
  if (!firefliesLayer) return;
  firefliesLayer.innerHTML = '';
  const numFireflies = 14;

  for (let i = 0; i < numFireflies; i++) {
    const ff = document.createElement('div');
    ff.className = 'firefly';
    ff.style.left = `${Math.random() * 92 + 4}%`;
    ff.style.top = `${Math.random() * 90 + 5}%`;
    ff.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
    ff.style.animationDuration = `${(3 + Math.random() * 3).toFixed(2)}s`;
    firefliesLayer.appendChild(ff);
  }
}

function buildPlotDOMStructure() {
  plotsGrid.innerHTML = '';
  plotDomNodes = [];

  for (let i = 0; i < 9; i++) {
    const plotEl = document.createElement('div');
    plotEl.className = 'plot';

    const cropTimerBadge = document.createElement('div');
    cropTimerBadge.className = 'crop-timer-badge';
    cropTimerBadge.style.display = 'none';

    const growthBar = document.createElement('div');
    growthBar.className = 'growth-bar';
    growthBar.style.display = 'none';
    const progress = document.createElement('div');
    progress.className = 'growth-progress';
    growthBar.appendChild(progress);

    const cropContainer = document.createElement('div');
    cropContainer.className = 'crop-container';
    cropContainer.style.display = 'none';
    const cropIcon = document.createElement('div');
    cropIcon.className = 'crop-icon';
    cropContainer.appendChild(cropIcon);

    const dirtBed = document.createElement('div');
    dirtBed.className = 'dirt-bed';

    plotEl.appendChild(cropTimerBadge);
    plotEl.appendChild(growthBar);
    plotEl.appendChild(cropContainer);
    plotEl.appendChild(dirtBed);

    plotEl.addEventListener('click', (e) => handlePlotClick(i, e));

    plotsGrid.appendChild(plotEl);

    plotDomNodes.push({
      plotEl,
      cropTimerBadge,
      growthBar,
      progress,
      cropContainer,
      cropIcon
    });
  }
}

function renderPlots() {
  const currentPlots = gameState.fields[gameState.currentField];

  currentPlots.forEach((plot, i) => {
    const nodes = plotDomNodes[i];
    if (!nodes) return;

    nodes.plotEl.classList.toggle('ready', plot.isReady);
    nodes.plotEl.classList.toggle('vine-plot', !!(plot.crop && plot.crop.isVine));
    nodes.plotEl.classList.toggle('cloud-piercer', (plot.rolledMeters || 0) > 100);
    nodes.plotEl.classList.toggle('nocturnal-active', !!(plot.crop && plot.crop.affinity === 'night' && !gameState.isDay));
    
    // 🎮 Highlight Xbox Controller Focus Ring!
    nodes.plotEl.classList.toggle('gamepad-focused', gamepadState.connected && gamepadState.selectedPlotIndex === i);

    if (plot.crop) {
      nodes.cropContainer.style.display = 'flex';
      
      const safeMeters = plot.rolledMeters || 1;
      const safeKg = plot.rolledKg || 1;
      const scaleFactor = 1 + (plot.progress / 100) * Math.min(2.5, safeMeters / 50);
      nodes.cropIcon.style.transform = `scale(${scaleFactor})`;

      nodes.cropIcon.textContent = plot.progress < 35 ? '🌱' : plot.crop.icon;
      nodes.cropIcon.classList.toggle('mature', plot.isReady);

      nodes.cropTimerBadge.style.display = 'flex';

      if (plot.crop.isVine) {
        const fruits = plot.vineFruits || [];
        const readyFruits = fruits.filter(f => f.isReady).length;
        nodes.cropTimerBadge.textContent = `${plot.crop.produceIcon || '🍇'} ${readyFruits}/${fruits.length} Ready`;
        nodes.cropTimerBadge.classList.toggle('ready-badge', readyFruits > 0);
        nodes.growthBar.style.display = 'none';
      } else if (!plot.isReady) {
        let speedMultiplier = 1;
        if (plot.crop.affinity === 'day' && gameState.isDay) speedMultiplier = 1.5;
        else if (plot.crop.affinity === 'night' && !gameState.isDay) speedMultiplier = 1.5;

        const safeGrowTime = plot.actualGrowTime || 5;
        const baseSpeed = 100 / safeGrowTime;
        const actualSpeed = baseSpeed * speedMultiplier;
        const remainingSecs = Math.max(1, Math.ceil((100 - plot.progress) / actualSpeed));

        nodes.cropTimerBadge.textContent = `${formatKg(safeKg)} | ${remainingSecs}s`;
        nodes.cropTimerBadge.classList.remove('ready-badge');

        nodes.growthBar.style.display = 'block';
        nodes.progress.style.width = `${Math.min(100, plot.progress)}%`;
      } else {
        nodes.cropTimerBadge.textContent = `READY! ${formatKg(safeKg)} ✨`;
        nodes.cropTimerBadge.classList.add('ready-badge');
        nodes.growthBar.style.display = 'none';
      }
    } else {
      nodes.cropContainer.style.display = 'none';
      nodes.growthBar.style.display = 'none';
      nodes.cropTimerBadge.style.display = 'none';
    }
  });
}

function updateHUD() {
  cashEl.textContent = `$${gameState.cash.toLocaleString()}`;
  fieldTitle.textContent = `Field ${gameState.currentField + 1} / ${gameState.maxFields}`;

  if (gameState.selectedTool === 'shovel') {
    shovelBtn.classList.add('tool-active');
    currentSeedNameEl.textContent = "Tool Active: ⛏️ Shovel";
  } else {
    shovelBtn.classList.remove('tool-active');
    const activeSeed = SEED_CATALOG.find(s => s.id === gameState.selectedSeedId);
    const qty = gameState.seedInventory[gameState.selectedSeedId] || 0;
    currentSeedNameEl.textContent = activeSeed ? `Plant ${activeSeed.name} (x${qty})` : "Select Seed";
  }

  cycleIcon.textContent = gameState.isDay ? '☀️' : '🌙';
  cycleLabel.textContent = gameState.isDay ? 'Day Time' : 'Night Time';
  cycleTimer.textContent = formatTime(gameState.cycleTimeLeft);

  if (gameState.isDay) {
    document.body.classList.add('day-theme');
    document.body.classList.remove('night-theme');
  } else {
    document.body.classList.add('night-theme');
    document.body.classList.remove('day-theme');
  }

  shopRefillTimerEl.textContent = formatTime(gameState.shopRefillTimeLeft);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==========================================================================
// 6. INTERACTION LOGIC
// ==========================================================================

function handlePlotClick(plotIndex, event) {
  const plot = gameState.fields[gameState.currentField][plotIndex];
  const posX = event ? event.clientX : window.innerWidth / 2;
  const posY = event ? event.clientY : window.innerHeight / 2;

  if (gameState.selectedTool === 'shovel') {
    if (plot.crop) {
      plot.crop = null;
      plot.progress = 0;
      plot.isReady = false;
      plot.vineFruits = [];
      createFloatingText(posX, posY, "Removed ⛏️", "#ff8a80");
      renderPlots();
    }
    return;
  }

  if (plot.crop && plot.crop.isVine) {
    gameState.selectedVinePlotIndex = plotIndex;
    openVineModal();
    return;
  }

  if (plot.crop && plot.isReady) {
    const harvestedCrop = plot.crop;
    const safeKg = plot.rolledKg || harvestedCrop.minKg || 1;
    const weightBonus = 1 + (safeKg / (harvestedCrop.minKg || 1));
    const earnings = Math.round((harvestedCrop.baseSellPrice || 10) * weightBonus);
    
    gameState.cash += earnings;

    if (!gameState.codex[harvestedCrop.id]) {
      gameState.codex[harvestedCrop.id] = { discovered: true, totalHarvested: 0 };
    }
    gameState.codex[harvestedCrop.id].totalHarvested += 1;

    plot.crop = null;
    plot.progress = 0;
    plot.isReady = false;

    createFloatingText(posX, posY, `+$${earnings.toLocaleString()}! (${formatKg(safeKg)})`, "#ffd54f");
    updateHUD();
    renderPlots();
    return;
  }

  if (!plot.crop) {
    const seedToPlant = SEED_CATALOG.find(s => s.id === gameState.selectedSeedId);
    if (!seedToPlant) return;

    const currentQty = gameState.seedInventory[seedToPlant.id] || 0;

    if (currentQty <= 0) {
      createFloatingText(posX, posY, "Out of Seeds! Buy in Shop 🛒", "#ef5350");
      return;
    }

    gameState.seedInventory[seedToPlant.id]--;

    const rolledKg = seedToPlant.minKg + Math.random() * (seedToPlant.maxKg - seedToPlant.minKg);
    const rolledMeters = seedToPlant.minM + Math.random() * (seedToPlant.maxM - seedToPlant.minM);

    const weightTimeMultiplier = 1 + Math.log10(rolledKg + 1) * 0.35;
    const actualGrowTime = Math.round(seedToPlant.baseGrowTime * weightTimeMultiplier);

    plot.crop = { ...seedToPlant };
    plot.progress = 0;
    plot.isReady = false;
    plot.rolledKg = rolledKg;
    plot.rolledMeters = rolledMeters;
    plot.actualGrowTime = actualGrowTime;

    if (seedToPlant.isVine) {
      plot.vineFruits = [];
      for (let f = 0; f < seedToPlant.maxFruits; f++) {
        plot.vineFruits.push({
          fruitId: `${seedToPlant.id}_${f}`,
          name: seedToPlant.produceName,
          icon: seedToPlant.produceIcon,
          progress: 0,
          isReady: false,
          rolledKg: seedToPlant.minKg + Math.random() * (seedToPlant.maxKg - seedToPlant.minKg),
          growTime: seedToPlant.baseGrowTime + (f * 12)
        });
      }
    }

    if (!gameState.codex[seedToPlant.id]) {
      gameState.codex[seedToPlant.id] = { discovered: true, totalHarvested: 0 };
    }

    createFloatingText(posX, posY, `Planted ${seedToPlant.icon}`, "#81c784");
    updateHUD();
    renderPlots();
  }
}

function createFloatingText(x, y, text, color) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.left = `${x - 20}px`;
  el.style.top = `${y - 20}px`;
  if (color) el.style.color = color;

  particlesLayer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ==========================================================================
// 7. XBOX CONTROLLER GAMEPAD ENGINE
// ==========================================================================

function pollGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

  if (!gp) {
    if (gamepadState.connected) {
      gamepadState.connected = false;
      renderPlots();
    }
    return;
  }

  if (!gamepadState.connected) {
    gamepadState.connected = true;
    createFloatingText(window.innerWidth / 2, window.innerHeight / 2, "🎮 Xbox Controller Connected!", "#29b6f6");
    renderPlots();
  }

  const now = Date.now();
  if (now - gamepadState.lastButtonTime < gamepadState.buttonCooldown) return;

  // 1. Splash Title Screen Start (A or Start)
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen && splashScreen.style.display !== 'none' && !splashScreen.classList.contains('fade-out')) {
    if (gp.buttons[0].pressed || gp.buttons[9].pressed) {
      splashScreen.click();
      gamepadState.lastButtonTime = now;
    }
    return;
  }

  // 2. Open Modal Closing (B Button = Close Modal)
  const openModalEl = document.querySelector('.modal.open');
  if (openModalEl) {
    if (gp.buttons[1].pressed) { // B Button
      closeModal(openModalEl);
      gamepadState.lastButtonTime = now;
    }
    return;
  }

  // 3. Open Seed Drawer Closing (B Button = Close Drawer)
  if (seedBagDrawer.classList.contains('open')) {
    if (gp.buttons[1].pressed) {
      closeDrawer(seedBagDrawer);
      gamepadState.lastButtonTime = now;
    }
    return;
  }

  // 4. D-Pad & Left Thumbstick Navigation Across 3x3 Plot Grid
  const axisX = gp.axes[0];
  const axisY = gp.axes[1];
  const dUp = (gp.buttons[12] && gp.buttons[12].pressed) || axisY < -0.5;
  const dDown = (gp.buttons[13] && gp.buttons[13].pressed) || axisY > 0.5;
  const dLeft = (gp.buttons[14] && gp.buttons[14].pressed) || axisX < -0.5;
  const dRight = (gp.buttons[15] && gp.buttons[15].pressed) || axisX > 0.5;

  let row = Math.floor(gamepadState.selectedPlotIndex / 3);
  let col = gamepadState.selectedPlotIndex % 3;

  if (dUp && row > 0) { row--; gamepadState.lastButtonTime = now; }
  else if (dDown && row < 2) { row++; gamepadState.lastButtonTime = now; }
  else if (dLeft && col > 0) { col--; gamepadState.lastButtonTime = now; }
  else if (dRight && col < 2) { col++; gamepadState.lastButtonTime = now; }

  gamepadState.selectedPlotIndex = row * 3 + col;

  // 5. Xbox Button Actions:
  // A Button (Index 0): Select / Plant / Harvest / Vine Menu
  if (gp.buttons[0].pressed) {
    const nodes = plotDomNodes[gamepadState.selectedPlotIndex];
    if (nodes && nodes.plotEl) {
      handlePlotClick(gamepadState.selectedPlotIndex, null);
    }
    gamepadState.lastButtonTime = now;
  }

  // X Button (Index 2): Quick-Toggle Shovel ⛏️
  if (gp.buttons[2].pressed) {
    shovelBtn.click();
    gamepadState.lastButtonTime = now;
  }

  // Y Button (Index 3): Quick-Sell All Crops 🤠
  if (gp.buttons[3].pressed) {
    sellBtn.click();
    gamepadState.lastButtonTime = now;
  }

  // Left Bumper LB (Index 4): Prev Field ◀
  if (gp.buttons[4].pressed) {
    prevFieldBtn.click();
    gamepadState.lastButtonTime = now;
  }

  // Right Bumper RB (Index 5): Next Field ▶
  if (gp.buttons[5].pressed) {
    nextFieldBtn.click();
    gamepadState.lastButtonTime = now;
  }

  // View Button (Index 8): Open Seed Bag 🎒
  if (gp.buttons[8].pressed) {
    seedBagBtn.click();
    gamepadState.lastButtonTime = now;
  }

  // Menu Button (Index 9): Open Settings ⚙️
  if (gp.buttons[9].pressed) {
    settingsBtn.click();
    gamepadState.lastButtonTime = now;
  }

  renderPlots();
}

// ==========================================================================
// 8. GAME TICK LOOPS
// ==========================================================================

let lastTickTime = Date.now();

function gameLoop() {
  const now = Date.now();
  const delta = (now - lastTickTime) / 1000;
  lastTickTime = now;

  // Poll Xbox Controller Input
  pollGamepad();

  gameState.fields.forEach(fieldPlots => {
    fieldPlots.forEach(plot => {
      if (plot.crop) {
        let speedMultiplier = 1;
        if (plot.crop.affinity === 'day' && gameState.isDay) speedMultiplier = 1.5;
        else if (plot.crop.affinity === 'night' && !gameState.isDay) speedMultiplier = 1.5;

        if (plot.crop.isVine && plot.vineFruits) {
          plot.vineFruits.forEach(fruit => {
            if (!fruit.isReady) {
              const speed = (100 / (fruit.growTime || 10)) * speedMultiplier;
              fruit.progress += speed * delta;
              if (fruit.progress >= 100) {
                fruit.progress = 100;
                fruit.isReady = true;
              }
            }
          });
        } else if (!plot.isReady) {
          const speed = (100 / (plot.actualGrowTime || 5)) * speedMultiplier;
          plot.progress += speed * delta;
          if (plot.progress >= 100) {
            plot.progress = 100;
            plot.isReady = true;
          }
        }
      }
    });
  });

  renderPlots();
  if (!vineModal.classList.contains('hidden')) renderVineModalContent();
}

function secondTick() {
  gameState.cycleTimeLeft--;
  if (gameState.cycleTimeLeft <= 0) {
    gameState.isDay = !gameState.isDay;
    gameState.cycleTimeLeft = 30;
  }

  gameState.shopRefillTimeLeft--;
  if (gameState.shopRefillTimeLeft <= 0) {
    SEED_CATALOG.forEach(s => s.currentStock = s.maxStock);
    gameState.shopRefillTimeLeft = 180;
    if (!shopModal.classList.contains('hidden')) renderShopItems();
  }

  updateHUD();
}

// ==========================================================================
// 9. MODALS & VINE HARVEST MENU RENDERERS
// ==========================================================================

function openVineModal() {
  renderVineModalContent();
  openModal(vineModal);
}

function renderVineModalContent() {
  if (gameState.selectedVinePlotIndex === null) return;
  const plot = gameState.fields[gameState.currentField][gameState.selectedVinePlotIndex];
  if (!plot || !plot.crop || !plot.crop.isVine) return;

  vineModalTitle.textContent = `${plot.crop.icon} ${plot.crop.name}`;
  vineProduceList.innerHTML = '';

  const fruits = plot.vineFruits || [];
  fruits.forEach((fruit, idx) => {
    const safeKg = fruit.rolledKg || plot.crop.minKg || 1;
    const earnings = calculateVineFruitEarnings(plot.crop.baseSellPrice, safeKg, plot.crop.minKg);
    const card = document.createElement('div');
    card.className = 'vine-produce-card';

    card.innerHTML = `
      <div class="item-info">
        <div class="item-title">${fruit.icon} ${fruit.name} #${idx + 1}</div>
        <div class="item-price-stock">
          ${fruit.isReady ? `Weight: ${formatKg(safeKg)} | Value: $${earnings.toLocaleString()}` : `Growing... (${Math.round(fruit.progress)}%)`}
        </div>
      </div>
      <button class="btn-vine-harvest" ${fruit.isReady ? '' : 'disabled'}>
        ${fruit.isReady ? `Harvest (+$${earnings})` : 'Growing'}
      </button>
    `;

    const harvestBtn = card.querySelector('.btn-vine-harvest');
    if (fruit.isReady) {
      harvestBtn.addEventListener('click', () => {
        gameState.cash += earnings;
        fruit.progress = 0;
        fruit.isReady = false;
        fruit.rolledKg = plot.crop.minKg + Math.random() * (plot.crop.maxKg - plot.crop.minKg);
        updateHUD();
        renderVineModalContent();
      });
    }

    vineProduceList.appendChild(card);
  });
}

harvestAllVineBtn.addEventListener('click', () => {
  if (gameState.selectedVinePlotIndex === null) return;
  const plot = gameState.fields[gameState.currentField][gameState.selectedVinePlotIndex];
  if (!plot || !plot.crop || !plot.crop.isVine) return;

  let totalEarned = 0;
  (plot.vineFruits || []).forEach(fruit => {
    if (fruit.isReady) {
      const safeKg = fruit.rolledKg || plot.crop.minKg || 1;
      const earnings = calculateVineFruitEarnings(plot.crop.baseSellPrice, safeKg, plot.crop.minKg);
      totalEarned += earnings;
      fruit.progress = 0;
      fruit.isReady = false;
      fruit.rolledKg = plot.crop.minKg + Math.random() * (plot.crop.maxKg - plot.crop.minKg);
    }
  });

  if (totalEarned > 0) {
    gameState.cash += totalEarned;
    updateHUD();
    renderVineModalContent();
  }
});

closeVineBtn.addEventListener('click', () => closeModal(vineModal));

function renderShopItems() {
  shopItemsList.innerHTML = '';

  if (gameState.unlockedFields < gameState.maxFields) {
    const nextFieldCost = FIELD_EXPANSION_COSTS[gameState.unlockedFields];
    const canAffordField = gameState.cash >= nextFieldCost;

    const fieldCard = document.createElement('div');
    fieldCard.className = 'shop-item-card';
    fieldCard.innerHTML = `
      <div class="item-info">
        <div class="item-title">🏞️ Unlock Field ${gameState.unlockedFields + 1}</div>
        <div><span class="rarity-tag rarity-field">FIELD</span></div>
        <div class="item-price-stock">Expand farm capacity (+9 Plots)</div>
      </div>
      <button class="btn-buy ${canAffordField ? '' : 'unaffordable'}" id="buy-field-btn">
        $${nextFieldCost.toLocaleString()}
      </button>
    `;
    shopItemsList.appendChild(fieldCard);

    document.getElementById('buy-field-btn').addEventListener('click', () => {
      if (gameState.cash >= nextFieldCost) {
        gameState.cash -= nextFieldCost;
        gameState.unlockedFields++;
        updateHUD();
        renderShopItems();
      }
    });
  }

  SEED_CATALOG.forEach(seed => {
    const canAfford = gameState.cash >= seed.cost;
    const hasStock = seed.currentStock > 0;
    const ownedQty = gameState.seedInventory[seed.id] || 0;

    let buttonText = 'Buy';
    let buttonClass = 'btn-buy';

    if (!hasStock) {
      buttonText = 'Out of Stock';
      buttonClass = 'btn-buy stocked';
    } else if (!canAfford) {
      buttonClass = 'btn-buy unaffordable';
    }

    const card = document.createElement('div');
    card.className = 'shop-item-card';

    card.innerHTML = `
      <div class="item-info">
        <div class="item-title">${seed.icon} ${seed.name} ${seed.isVine ? '🌿 (Permanent Vine)' : ''}</div>
        <div><span class="rarity-tag rarity-${seed.rarity}">${seed.rarity}</span></div>
        <div class="item-price-stock">$${seed.cost.toLocaleString()} | Stock: ${seed.currentStock} (Owned: ${ownedQty})</div>
      </div>
      <button class="${buttonClass}" ${!canAfford || !hasStock ? 'disabled' : ''}>
        ${buttonText}
      </button>
    `;

    const buyBtn = card.querySelector('button');
    if (canAfford && hasStock) {
      buyBtn.addEventListener('click', () => {
        gameState.cash -= seed.cost;
        gameState.seedInventory[seed.id] = (gameState.seedInventory[seed.id] || 0) + 1;
        seed.currentStock--;
        
        gameState.selectedSeedId = seed.id;
        gameState.selectedTool = 'plant';
        
        updateHUD();
        renderShopItems();
      });
    }

    shopItemsList.appendChild(card);
  });
}

function renderIndexCodex() {
  indexItemsList.innerHTML = '';

  SEED_CATALOG.forEach(seed => {
    const codexEntry = gameState.codex[seed.id];
    const isDiscovered = codexEntry && codexEntry.discovered;

    const card = document.createElement('div');
    card.className = `codex-card-item ${isDiscovered ? '' : 'locked'}`;

    card.innerHTML = `
      <div style="font-size: 28px;">${isDiscovered ? seed.icon : '❓'}</div>
      <div style="font-size: 12px; font-weight: 800;">${isDiscovered ? seed.name : 'Unknown Plant'}</div>
      <span class="rarity-tag rarity-${seed.rarity}">${seed.rarity}</span>
      <div style="font-size: 10px; color: #5d4037; margin-top: 2px;">
        ${isDiscovered ? `Discovered` : 'Not Discovered'}
      </div>
    `;

    indexItemsList.appendChild(card);
  });
}

function renderSeedDrawer() {
  seedInventoryList.innerHTML = '';

  SEED_CATALOG.forEach(seed => {
    const qty = gameState.seedInventory[seed.id] || 0;

    const card = document.createElement('div');
    card.className = `seed-select-card ${gameState.selectedSeedId === seed.id && gameState.selectedTool === 'plant' ? 'active' : ''}`;

    card.innerHTML = `
      <div style="font-size: 22px;">${seed.icon}</div>
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 12px; font-weight: 800;">${seed.name}</span>
        <span style="font-size: 10px; color: #5d4037;">Qty: ${qty}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      gameState.selectedSeedId = seed.id;
      gameState.selectedTool = 'plant';
      closeDrawer(seedBagDrawer);
      updateHUD();
    });

    seedInventoryList.appendChild(card);
  });
}

// ==========================================================================
// 10. EVENT LISTENERS
// ==========================================================================

shovelBtn.addEventListener('click', () => {
  gameState.selectedTool = gameState.selectedTool === 'shovel' ? 'plant' : 'shovel';
  updateHUD();
});

sellBtn.addEventListener('click', (e) => {
  let totalEarned = 0;

  gameState.fields.forEach(fieldPlots => {
    fieldPlots.forEach(plot => {
      if (plot.crop && !plot.crop.isVine && plot.isReady) {
        const safeKg = plot.rolledKg || plot.crop.minKg || 1;
        const weightBonus = 1 + (safeKg / (plot.crop.minKg || 1));
        totalEarned += Math.round((plot.crop.baseSellPrice || 10) * weightBonus);

        if (!gameState.codex[plot.crop.id]) {
          gameState.codex[plot.crop.id] = { discovered: true, totalHarvested: 0 };
        }
        gameState.codex[plot.crop.id].totalHarvested += 1;

        plot.crop = null;
        plot.progress = 0;
        plot.isReady = false;
      }
    });
  });

  if (totalEarned > 0) {
    gameState.cash += totalEarned;
    const posX = e ? e.clientX : window.innerWidth / 2;
    const posY = e ? e.clientY : window.innerHeight / 2;
    createFloatingText(posX, posY, `Sold All Standard Crops: +$${totalEarned.toLocaleString()}! 🤠`, "#ffd54f");
    updateHUD();
    renderPlots();
  } else {
    const posX = e ? e.clientX : window.innerWidth / 2;
    const posY = e ? e.clientY : window.innerHeight / 2;
    createFloatingText(posX, posY, "No ripe standard crops to sell! (Tap Vines to harvest vine fruits)", "#ef5350");
  }
});

prevFieldBtn.addEventListener('click', () => {
  if (gameState.currentField > 0) {
    plotsGrid.classList.add('slide-out-right');
    setTimeout(() => {
      gameState.currentField--;
      updateHUD();
      renderPlots();
      plotsGrid.classList.remove('slide-out-right');
    }, 150);
  }
});

nextFieldBtn.addEventListener('click', () => {
  if (gameState.currentField + 1 < gameState.unlockedFields) {
    plotsGrid.classList.add('slide-out-left');
    setTimeout(() => {
      gameState.currentField++;
      updateHUD();
      renderPlots();
      plotsGrid.classList.remove('slide-out-left');
    }, 150);
  } else {
    createFloatingText(window.innerWidth / 2, window.innerHeight / 2, `Field Locked! Buy in Shop`, "#ef5350");
  }
});

seedBagBtn.addEventListener('click', () => {
  renderSeedDrawer();
  toggleDrawer(seedBagDrawer);
});

closeDrawerBtn.addEventListener('click', () => {
  closeDrawer(seedBagDrawer);
});

shopBtn.addEventListener('click', () => {
  renderShopItems();
  openModal(shopModal);
});

shopQuickBtn.addEventListener('click', () => {
  renderShopItems();
  openModal(shopModal);
});

closeShopBtn.addEventListener('click', () => closeModal(shopModal));

openIndexBtn.addEventListener('click', () => {
  renderIndexCodex();
  openModal(indexModal);
});

closeIndexBtn.addEventListener('click', () => closeModal(indexModal));

settingsBtn.addEventListener('click', () => {
  statsSummaryEl.innerHTML = `
    <p style="font-size: 13px; color: #4e342e; margin-bottom: 10px;">
      <strong>Unlocked Fields:</strong> ${gameState.unlockedFields} / ${gameState.maxFields}<br>
      <strong>Carrot Seeds Owned:</strong> ${gameState.seedInventory.carrot || 0}
    </p>
  `;
  openModal(settingsModal);
});

closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));

resetSaveBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all garden progress?")) {
    localStorage.removeItem('gardenVenture2Save');
    location.reload();
  }
});

// ==========================================================================
// 11. SAVE ENGINE & INITIALIZATION
// ==========================================================================

function saveGame() {
  localStorage.setItem('gardenVenture2Save', JSON.stringify({
    cash: gameState.cash,
    currentField: gameState.currentField,
    unlockedFields: gameState.unlockedFields,
    selectedSeedId: gameState.selectedSeedId,
    seedInventory: gameState.seedInventory,
    codex: gameState.codex,
    fields: gameState.fields
  }));
}

function loadGame() {
  const savedData = localStorage.getItem('gardenVenture2Save');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      gameState.cash = data.cash || 25;
      gameState.currentField = data.currentField || 0;
      gameState.unlockedFields = data.unlockedFields || 1;
      gameState.selectedSeedId = data.selectedSeedId || 'carrot';
      gameState.seedInventory = data.seedInventory || { carrot: 5 };
      gameState.codex = data.codex || { carrot: { discovered: true, totalHarvested: 0 } };
      if (data.fields) gameState.fields = data.fields;
    } catch (e) {
      console.error("Save load error", e);
    }
  }
}

function initGame() {
  initFields();
  buildPlotDOMStructure();
  spawnNightFireflies();
  initSplashScreen();
  loadGame();
  updateHUD();
  renderPlots();

  setInterval(gameLoop, 100);
  setInterval(secondTick, 1000);
  setInterval(saveGame, 5000);
}

window.addEventListener('DOMContentLoaded', initGame);