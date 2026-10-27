// --- 1. MATERIAIS COM TEXTURAS METÁLICAS SÓBRIAS[cite: 6] ---
const MATERIALS = {
  CARBON_STEEL: {
    id: 'CARBON_STEEL',
    name: 'Aço Carbono',
    palette: { main: '#3a3f4d', light: '#585e70', dark: '#21252e' }
  },
  STAINLESS_STEEL: {
    id: 'STAINLESS_STEEL',
    name: 'Aço Inox',
    palette: { main: '#8a94a6', light: '#b8c2d1', dark: '#5e6775' }
  },
  ALUMINUM: {
    id: 'ALUMINUM',
    name: 'Alumínio',
    palette: { main: '#737b8c', light: '#a3abbc', dark: '#4a505e' }
  },
  HSLA_STEEL: {
    id: 'HSLA_STEEL',
    name: 'Aço ARBL',
    palette: { main: '#2a2e38', light: '#454b59', dark: '#16181f' }
  },
  COPPER: {
    id: 'COPPER',
    name: 'Cobre',
    palette: { main: '#a85b32', light: '#cf7c51', dark: '#733b1e' }
  },
  BRASS: {
    id: 'BRASS',
    name: 'Latão',
    palette: { main: '#a37b31', light: '#cca04e', dark: '#70521c' }
  },
  GALVANIZED_STEEL: {
    id: 'GALVANIZED_STEEL',
    name: 'Aço Galvanizado',
    palette: { main: '#505869', light: '#788296', dark: '#333845' }
  }
};

// --- 2. PRODUTOS E MOLDES INDUSTRIAIS[cite: 6] ---
const OBJECTS = {
  GEAR: { id: 'GEAR', name: 'Engrenagem', icon: 'settings', width: 44, height: 44 },
  PERFORATED_SHEET: { id: 'PERFORATED_SHEET', name: 'Painel Perfurado', icon: 'grid', width: 50, height: 38 },
  CYLINDER_PIPE: { id: 'CYLINDER_PIPE', name: 'Cano / Tubo', icon: 'cylinder', width: 56, height: 28 },
  ANGULAR_BRACKET: { id: 'ANGULAR_BRACKET', name: 'Suporte Angular', icon: 'square-code', width: 42, height: 42 }
};

// --- 3. MÁQUINAS E REGRAS TÉCNICAS[cite: 6] ---
const MACHINES_INFO = {
  PRESS: { id: 'PRESS', name: 'Prensa Mecânica', color: '#a37b31' },
  GUILLOTINE: { id: 'GUILLOTINE', name: 'Guilhotina', color: '#505869' },
  LASER: { id: 'LASER', name: 'Cortador a Laser CO2', color: '#8a94a6' },
  PLASMA: { id: 'PLASMA', name: 'Cortador a Plasma', color: '#475569' }
};

function analyzeEngineering(materialId, objectId) {
  let machine = 'LASER';
  let reason = '';

  if (materialId === 'COPPER' || materialId === 'BRASS') {
    machine = 'PRESS';
    reason = 'A Prensa Mecânica de alta tonelagem é ideal para estampagem fria em ligas dúcteis (Cobre/Latão)[cite: 6].';
  } else if (materialId === 'HSLA_STEEL') {
    machine = 'PLASMA';
    reason = 'O Cortador a Plasma com feixe térmico é necessário para atravessar o Aço ARBL de alta resistência[cite: 6].';
  } else if (objectId === 'CYLINDER_PIPE' || materialId === 'ALUMINUM' || materialId === 'GALVANIZED_STEEL') {
    if (objectId === 'CYLINDER_PIPE') {
      machine = 'GUILLOTINE';
      reason = 'A Guilhotina executa o seccionamento reto e preciso do perfil de cano/tubo[cite: 6].';
    } else {
      machine = 'LASER';
      reason = 'O Cortador a Laser CO2 oferece máxima precisão dimensional para o perfil selecionado[cite: 6].';
    }
  } else {
    machine = 'LASER';
    reason = 'O Cortador a Laser CO2 garante tolerâncias micrométricas na liga metálica selecionada[cite: 6].';
  }

  return { machine, reason };
}

// --- 4. SINTETIZADOR DE ÁUDIO[cite: 6] ---
class SoundEngine {
  constructor() { this.ctx = null; this.enabled = true; }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  playMachine(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type === 'PRESS' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  playDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

const sound = new SoundEngine();

let selectedMaterialKey = 'STAINLESS_STEEL';
let selectedObjectKey = 'GEAR';
let items = [];
let machines = [];
let zones = {};
let draggedItem = null;
let dragOffset = { x: 0, y: 0 };
const MAX_SLOTS = 6;
let currentSheetItem = null;

const canvas = document.getElementById('factoryCanvas');
const ctx = canvas.getContext('2d');
const offscreenCanvas = document.createElement('canvas');
const offCtx = offscreenCanvas.getContext('2d');

class MachineStation {
  constructor(id, x, y, width, height, type) {
    this.id = id; this.x = x; this.y = y; this.width = width; this.height = height;
    this.type = type; this.isWorking = false; this.animProgress = 0;
  }
  getBedCenter() { return { x: this.x + this.width / 2, y: this.y + 70 }; }
  startOperation(material, object, onComplete) {
    this.isWorking = true;
    this.animProgress = 0;
    const animate = () => {
      this.animProgress += 0.08;
      if (this.animProgress >= 0.5 && !this.soundTriggered) {
        this.soundTriggered = true;
        sound.playMachine(this.type);
      }
      if (this.animProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isWorking = false;
        this.animProgress = 0;
        this.soundTriggered = false;
        onComplete();
      }
    };
    requestAnimationFrame(animate);
  }
  draw(ctx) {
    const { x, y, width, height, type } = this;
    const info = MACHINES_INFO[type];
    ctx.save();
    ctx.fillStyle = '#161920'; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#282d3a'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = '#1c202a'; ctx.fillRect(x, y, width, 24);
    ctx.fillStyle = info.color; ctx.fillRect(x, y, width, 3);
    ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText(info.name.toUpperCase(), x + width / 2, y + 16);
    
    const bedX = x + 8, bedY = y + 32, bedW = width - 16, bedH = 80;
    ctx.fillStyle = '#0a0b0e'; ctx.fillRect(bedX, bedY, bedW, bedH);
    ctx.strokeStyle = '#1d212b'; ctx.strokeRect(bedX, bedY, bedW, bedH);

    if (this.isWorking) {
      const center = this.getBedCenter();
      ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(center.x, bedY + 4); ctx.lineTo(center.x, center.y); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawShapePath(targetCtx, shapeType, w, h) {
  targetCtx.beginPath();
  if (shapeType === 'GEAR') {
    const outerR = w / 2, innerR = outerR * 0.7, holeR = outerR * 0.3, teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i * 2 * Math.PI) / teeth;
      const a2 = a1 + Math.PI / teeth * 0.5;
      const a3 = a1 + Math.PI / teeth;
      const a4 = a3 + Math.PI / teeth * 0.5;
      if (i === 0) targetCtx.moveTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      else targetCtx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      targetCtx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
      targetCtx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
      targetCtx.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
    }
    targetCtx.closePath();
    targetCtx.moveTo(holeR, 0); targetCtx.arc(0, 0, holeR, 0, Math.PI * 2, true);
  } else if (shapeType === 'PERFORATED_SHEET') {
    targetCtx.rect(-w/2, -h/2, w, h);
  } else if (shapeType === 'CYLINDER_PIPE') {
    targetCtx.roundRect(-w/2, -h/2, w, h, 4);
  } else if (shapeType === 'ANGULAR_BRACKET') {
    targetCtx.moveTo(-w/2, -h/2); targetCtx.lineTo(w/2, h/2); targetCtx.lineTo(-w/2, h/2); targetCtx.closePath();
  }
}

function drawItem(mainCtx, item) {
  const mat = item.material;
  if (item.type === 'SHEET') {
    const w = item.width, h = item.height;
    offscreenCanvas.width = w + 20; offscreenCanvas.height = h + 20;
    offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offCtx.save();
    offCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
    offCtx.beginPath(); offCtx.roundRect(-w / 2, -h / 2, w, h, 4);
    
    const grad = offCtx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, mat.palette.light); grad.addColorStop(1, mat.palette.dark);
    offCtx.fillStyle = grad; offCtx.fill();
    offCtx.restore();

    mainCtx.save();
    mainCtx.translate(item.x, item.y);
    mainCtx.drawImage(offscreenCanvas, -offscreenCanvas.width / 2, -offscreenCanvas.height / 2);
    mainCtx.restore();
  } else if (item.type === 'PRODUCT') {
    const w = item.width, h = item.height;
    mainCtx.save();
    mainCtx.translate(item.x, item.y);
    drawShapePath(mainCtx, item.objectType, w, h);
    mainCtx.fillStyle = mat.palette.main; mainCtx.fill();
    mainCtx.restore();
  }
}

function setupLayout() {
  const container = document.querySelector('main');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const margin = 12, topH = 75;

  zones.finished = { title: 'ESTOQUE DE PRODUTOS ACABADOS', x: margin, y: margin, w: container.clientWidth * 0.65 - margin, h: topH };
  zones.trash = { title: 'ÁREA DE DESCARTE / RECICLAGEM', x: zones.finished.x + zones.finished.w + margin, y: margin, w: container.clientWidth - (zones.finished.x + zones.finished.w + margin * 2), h: topH };

  machines = [];
  const mY = topH + margin * 2;
  const mWidth = Math.min(160, (container.clientWidth - margin * 5) / 4);
  const startX = (container.clientWidth - (mWidth * 4 + margin * 3)) / 2;
  const types = ['PRESS', 'GUILLOTINE', 'LASER', 'PLASMA'];
  for (let i = 0; i < 4; i++) {
    machines.push(new MachineStation(i, startX + i * (mWidth + margin), mY, mWidth, 135, types[i]));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.keys(zones).forEach(k => {
    const z = zones[k];
    ctx.save();
    ctx.fillStyle = '#12151b'; ctx.strokeStyle = '#222631'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(z.x, z.y, z.w, z.h, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b7280'; ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(z.title, z.x + 10, z.y + 16);
    ctx.restore();
  });
  machines.forEach(m => m.draw(ctx));
  items.forEach(item => drawItem(ctx, item));
  requestAnimationFrame(render);
}

function updateNestingUI() {
  const slotsUsed = currentSheetItem ? currentSheetItem.holes.length : 0;
  document.getElementById('sheet-slot-counter').innerText = `Slot ${slotsUsed + 1} de ${MAX_SLOTS}`;
  document.getElementById('sheet-usage-bar').style.width = `${(slotsUsed / MAX_SLOTS) * 100}%`;
}

function processManufacturing() {
  sound.init();
  const mat = MATERIALS[selectedMaterialKey];
  const obj = OBJECTS[selectedObjectKey];
  const analysis = analyzeEngineering(selectedMaterialKey, selectedObjectKey);
  const targetMachine = machines.find(m => m.type === analysis.machine) || machines[2];

  targetMachine.startOperation(mat, obj, () => {
    const sheetW = 210, sheetH = 120;
    if (!currentSheetItem || currentSheetItem.holes.length >= MAX_SLOTS) {
      const bedCenter = targetMachine.getBedCenter();
      currentSheetItem = {
        id: 'sheet_' + Date.now(), type: 'SHEET', x: bedCenter.x, y: bedCenter.y - 10,
        width: sheetW, height: sheetH, material: mat, holes: []
      };
      items.push(currentSheetItem);
    }
    const slotIdx = currentSheetItem.holes.length;
    currentSheetItem.holes.push({ relX: 0, relY: 0, objectType: obj.id, w: obj.width, h: obj.height });
    
    items.push({
      id: 'prod_' + Date.now(), type: 'PRODUCT', x: currentSheetItem.x, y: currentSheetItem.y + 65,
      width: obj.width, height: obj.height, material: mat, objectType: obj.id
    });
    updateNestingUI();
  });
}

function initUIControls() {
  const matContainer = document.getElementById('material-selector');
  matContainer.innerHTML = '';
  Object.keys(MATERIALS).forEach(key => {
    const mat = MATERIALS[key];
    const btn = document.createElement('button');
    btn.className = `p-2 rounded border text-left flex items-center gap-2 text-xs font-mono-tech transition-all ${selectedMaterialKey === key ? 'bg-[#222733] border-slate-400 text-white font-bold' : 'bg-[#14171d] border-[#222631] text-slate-400'}`;
    btn.innerHTML = `<span class="w-3 h-3 rounded-full" style="background:${mat.palette.main}"></span><span>${mat.name}</span>`;
    btn.addEventListener('click', () => { selectedMaterialKey = key; initUIControls(); });
    matContainer.appendChild(btn);
  });

  const objContainer = document.getElementById('object-selector');
  objContainer.innerHTML = '';
  Object.keys(OBJECTS).forEach(key => {
    const obj = OBJECTS[key];
    const btn = document.createElement('button');
    btn.className = `p-2 rounded border text-left flex items-center gap-2 text-xs font-mono-tech transition-all ${selectedObjectKey === key ? 'bg-[#222733] border-slate-400 text-white font-bold' : 'bg-[#14171d] border-[#222631] text-slate-400'}`;
    btn.innerHTML = `<span>${obj.name}</span>`;
    btn.addEventListener('click', () => { selectedObjectKey = key; initUIControls(); });
    objContainer.appendChild(btn);
  });
}

window.addEventListener('resize', setupLayout);
document.getElementById('btn-fabricate').addEventListener('click', processManufacturing);

window.onload = () => {
  initUIControls();
  setupLayout();
  updateNestingUI();
  requestAnimationFrame(render);
};