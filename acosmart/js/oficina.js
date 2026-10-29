// --- 1. MATERIAIS COM CORES METÁLICAS DISTINTAS ---
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

// --- 2. PRODUTOS E MOLDES INDUSTRIAIS ---
const OBJECTS = {
  GEAR: { id: 'GEAR', name: 'Engrenagem', width: 42, height: 42 },
  PERFORATED_SHEET: { id: 'PERFORATED_SHEET', name: 'Painel Perfurado', width: 46, height: 36 },
  CYLINDER_PIPE: { id: 'CYLINDER_PIPE', name: 'Cano / Tubo', width: 52, height: 24 },
  ANGULAR_BRACKET: { id: 'ANGULAR_BRACKET', name: 'Suporte Angular', width: 40, height: 40 }
};

// --- 3. PARQUE INDUSTRIAL ---
const MACHINES_INFO = {
  PRESS: { id: 'PRESS', name: 'Prensa Mecânica', color: '#a37b31' },
  GUILLOTINE: { id: 'GUILLOTINE', name: 'Guilhotina', color: '#505869' },
  LASER: { id: 'LASER', name: 'Cortador a Laser CO2', color: '#8a94a6' },
  PLASMA: { id: 'PLASMA', name: 'Cortador a Plasma', color: '#475569' },
  INDUSTRIAL_SAW: { id: 'INDUSTRIAL_SAW', name: 'Serra Industrial', color: '#64748b' },
  BAND_SAW: { id: 'BAND_SAW', name: 'Serra Fita', color: '#334155' },
  HYDRAULIC_PRESS: { id: 'HYDRAULIC_PRESS', name: 'Prensa Hidráulica', color: '#d97706' },
  BENDER: { id: 'BENDER', name: 'Dobradeira CNC', color: '#475569' }
};

function getCompatibleMachines(materialId, objectId) {
  if (objectId === 'CYLINDER_PIPE') return ['BAND_SAW', 'INDUSTRIAL_SAW'];
  if (objectId === 'PERFORATED_SHEET') return ['LASER', 'PLASMA'];
  if (objectId === 'ANGULAR_BRACKET') return ['BENDER', 'PRESS'];
  if (materialId === 'COPPER' || materialId === 'BRASS') return ['HYDRAULIC_PRESS', 'PRESS'];
  if (materialId === 'HSLA_STEEL') return ['INDUSTRIAL_SAW', 'PLASMA'];
  return ['LASER', 'PRESS', 'GUILLOTINE', 'BENDER'];
}

// --- 4. SINTETIZADOR DE ÁUDIO ---
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
    osc.type = type.includes('PRESS') ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const sound = new SoundEngine();

let selectedMaterialKey = 'STAINLESS_STEEL';
let selectedObjectKey = 'GEAR';
let items = []; // Contém chapas e produtos livres para arrastar e posicionar
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
  getBedCenter() { return { x: this.x + this.width / 2, y: this.y + 75 }; }
  startOperation(onComplete) {
    this.isWorking = true;
    this.animProgress = 0;
    const animate = () => {
      this.animProgress += 0.07;
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
    ctx.fillStyle = '#141820'; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#2d3748'; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = '#1e2533'; ctx.fillRect(x, y, width, 32);
    ctx.fillStyle = info.color; ctx.fillRect(x, y, width, 4);
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText(info.name.toUpperCase(), x + width / 2, y + 20);
    
    const bedX = x + 10, bedY = y + 38, bedW = width - 20, bedH = height - 48;
    ctx.fillStyle = '#090a0f'; ctx.fillRect(bedX, bedY, bedW, bedH);
    ctx.strokeStyle = '#1e2430'; ctx.strokeRect(bedX, bedY, bedW, bedH);

    if (this.isWorking) {
      const center = this.getBedCenter();
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
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
    targetCtx.roundRect(-w/2, -h/2, w, h, h/2);
    targetCtx.moveTo(w/3, -h/4);
    targetCtx.roundRect(-w/3, -h/4, (w/3)*2, h/2, h/4);
  } else if (shapeType === 'ANGULAR_BRACKET') {
    targetCtx.moveTo(-w/2, -h/2); targetCtx.lineTo(w/2, h/2); targetCtx.lineTo(-w/2, h/2); targetCtx.closePath();
  }
}

function drawItem(mainCtx, item) {
  const mat = item.material;
  if (item.type === 'SHEET') {
    const w = item.width, h = item.height;
    offscreenCanvas.width = w + 20; 
    offscreenCanvas.height = h + 20;
    offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    offCtx.save();
    offCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
    
    offCtx.beginPath(); 
    offCtx.roundRect(-w / 2, -h / 2, w, h, 6);
    const grad = offCtx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, mat.palette.light); 
    grad.addColorStop(1, mat.palette.dark);
    offCtx.fillStyle = grad; 
    offCtx.fill();
    
    if (currentSheetItem && currentSheetItem.id === item.id) {
      offCtx.strokeStyle = '#38bdf8';
      offCtx.lineWidth = 3.5;
    } else {
      offCtx.strokeStyle = mat.palette.dark;
      offCtx.lineWidth = 2;
    }
    offCtx.stroke();

    if (item.holes && item.holes.length > 0) {
      item.holes.forEach((hole, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const cellW = w / 3;
        const cellH = h / 2;
        const hx = -w / 2 + cellW * col + cellW / 2;
        const hy = -h / 2 + cellH * row + cellH / 2;

        offCtx.save();
        offCtx.translate(hx, hy);
        
        offCtx.fillStyle = '#05070a';
        offCtx.strokeStyle = '#111318';
        offCtx.lineWidth = 1.5;
        
        drawShapePath(offCtx, hole.objectType, hole.w * 0.75, hole.h * 0.75);
        offCtx.fill();
        offCtx.stroke();
        
        offCtx.restore();
      });
    }

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
    mainCtx.fillStyle = mat.palette.main; 
    mainCtx.fill();
    mainCtx.strokeStyle = mat.palette.light;
    mainCtx.lineWidth = 1;
    mainCtx.stroke();
    mainCtx.restore();
  }
}

function setupLayout() {
  const container = document.querySelector('main');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const margin = 16, topH = 85; // Aumentada ligeiramente a altura da zona de estoque para acomodar as divisões

  zones.finished = { title: 'ESTOQUE DE PRODUTOS ACABADOS (SEPARADO POR TIPO E FORMATO)', x: margin, y: margin, w: container.clientWidth * 0.65 - margin, h: topH };
  zones.trash = { title: 'ÁREA DE DESCARTE / RECICLAGEM', x: zones.finished.x + zones.finished.w + margin, y: margin, w: container.clientWidth - (zones.finished.x + zones.finished.w + margin * 2), h: topH };

  machines = [];
  const mWidth = Math.min(220, (container.clientWidth - margin * 5) / 4);
  const mHeight = 130;
  const startX = (container.clientWidth - (mWidth * 4 + margin * 3)) / 2;
  
  const types = [
    'PRESS', 'GUILLOTINE', 'LASER', 'PLASMA',
    'INDUSTRIAL_SAW', 'BAND_SAW', 'HYDRAULIC_PRESS', 'BENDER'
  ];

  const row1Y = topH + margin * 1.5;
  const row2Y = row1Y + mHeight + margin;

  for (let i = 0; i < types.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const mx = startX + col * (mWidth + margin);
    const my = row === 0 ? row1Y : row2Y;
    machines.push(new MachineStation(i, mx, my, mWidth, mHeight, types[i]));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  Object.keys(zones).forEach(k => {
    const z = zones[k];
    ctx.save();
    ctx.fillStyle = '#12151b'; ctx.strokeStyle = '#222631'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(z.x, z.y, z.w, z.h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b7280'; ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(z.title, z.x + 12, z.y + 18);
    ctx.restore();
  });

  // Linhas divisórias internas discretas na zona de estoque para separar visualmente por tipo/formato
  ctx.save();
  ctx.strokeStyle = '#1a1f2c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(zones.finished.x + zones.finished.w * 0.35, zones.finished.y + 24);
  ctx.lineTo(zones.finished.x + zones.finished.w * 0.35, zones.finished.y + zones.finished.h - 8);
  ctx.moveTo(zones.finished.x + zones.finished.w * 0.70, zones.finished.y + 24);
  ctx.lineTo(zones.finished.x + zones.finished.w * 0.70, zones.finished.y + zones.finished.h - 8);
  ctx.stroke();
  ctx.restore();

  machines.forEach(m => m.draw(ctx));
  items.forEach(item => drawItem(ctx, item));

  requestAnimationFrame(render);
}

function updateNestingUI() {
  const slotsUsed = currentSheetItem ? currentSheetItem.holes.length : 0;
  const counterEl = document.getElementById('sheet-slot-counter');
  const barEl = document.getElementById('sheet-usage-bar');
  const btnFabricate = document.getElementById('btn-fabricate');

  if (counterEl) counterEl.innerText = `Slot ${slotsUsed} de ${MAX_SLOTS}`;
  if (barEl) barEl.style.width = `${(slotsUsed / MAX_SLOTS) * 100}%`;

  if (slotsUsed >= MAX_SLOTS) {
    if (btnFabricate) {
      btnFabricate.disabled = true;
      btnFabricate.classList.add('opacity-50', 'cursor-not-allowed');
      btnFabricate.innerText = '⚠️ CHAPA ESGOTADA (CRIE NOVA OU DESCARTE)';
    }
  } else {
    if (btnFabricate) {
      btnFabricate.disabled = false;
      btnFabricate.classList.remove('opacity-50', 'cursor-not-allowed');
      btnFabricate.innerText = '🛠️ EXECUTAR USINAGEM E CORTE';
    }
  }
}

function processManufacturing(forceNewSheet = false) {
  sound.init();
  const mat = MATERIALS[selectedMaterialKey];
  const obj = OBJECTS[selectedObjectKey];

  const compatibleTypes = getCompatibleMachines(selectedMaterialKey, selectedObjectKey);
  const randomType = compatibleTypes[Math.floor(Math.random() * compatibleTypes.length)];
  const targetMachine = machines.find(m => m.type === randomType) || machines[0];

  const sheetW = 160, sheetH = 95;

  if (forceNewSheet) {
    currentSheetItem = null;
  }

  if (currentSheetItem && (currentSheetItem.holes.length >= MAX_SLOTS || currentSheetItem.material.id !== mat.id)) {
    currentSheetItem = null;
  }

  if (!currentSheetItem && !forceNewSheet) {
    const existingSheets = items.filter(i => i.type === 'SHEET' && i.material.id === mat.id && i.holes.length < MAX_SLOTS);
    if (existingSheets.length > 0) {
      const useOld = confirm(`Existe uma chapa de ${mat.name} disponível com ${existingSheets[0].holes.length} slot(s) preenchido(s). Deseja reutilizá-la?`);
      if (useOld) {
        currentSheetItem = existingSheets[0];
      }
    }
  }

  if (!currentSheetItem) {
    const bedCenter = targetMachine.getBedCenter();
    currentSheetItem = {
      id: 'sheet_' + Date.now(), 
      type: 'SHEET', 
      x: bedCenter.x, 
      y: bedCenter.y,
      width: sheetW, 
      height: sheetH, 
      material: mat, 
      holes: []
    };
    items.push(currentSheetItem);
  } else {
    const bedCenter = targetMachine.getBedCenter();
    currentSheetItem.x = bedCenter.x;
    currentSheetItem.y = bedCenter.y;
  }

  if (currentSheetItem.holes.length >= MAX_SLOTS) {
    alert('Esta chapa atingiu o limite de 6 slots. Clique em "+ Criar Nova Chapa" ou descarte esta na lixeira.');
    return;
  }

  targetMachine.startOperation(() => {
    currentSheetItem.holes.push({ objectType: obj.id, w: obj.width, h: obj.height });
    
    // ORGANIZAÇÃO INTELIGENTE NO ESTOQUE:
    // Agrupa e separa automaticamente os produtos gerados por tipo de material e formato em colunas organizadas dentro da zona de estoque
    const materialKeys = Object.keys(MATERIALS);
    const matIndex = materialKeys.indexOf(selectedMaterialKey);
    const objectKeys = Object.keys(OBJECTS);
    const objIndex = objectKeys.indexOf(selectedObjectKey);

    const baseStockX = zones.finished.x + 25 + (matIndex * 50);
    const baseStockY = zones.finished.y + 35 + (objIndex * 18);
    const offsetCluster = items.filter(i => i.type === 'PRODUCT' && i.material.id === mat.id && i.objectType === obj.id).length * 12;

    items.push({
      id: 'prod_' + Date.now(),
      type: 'PRODUCT',
      x: baseStockX + (offsetCluster % 60),
      y: baseStockY + Math.floor(offsetCluster / 60) * 15,
      width: obj.width * 0.55,
      height: obj.height * 0.55,
      material: mat,
      objectType: obj.id
    });

    updateNestingUI();
  });
}

// Configuração de Arraste (Drag & Drop), Seleção e Exclusão na Lixeira
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let clickedOnItem = false;
  
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const halfW = (item.width || 50) / 2;
    const halfH = (item.height || 50) / 2;
    if (mx >= item.x - halfW && mx <= item.x + halfW && my >= item.y - halfH && my <= item.y + halfH) {
      clickedOnItem = true;
      
      if (item.type === 'SHEET') {
        currentSheetItem = item;
        selectedMaterialKey = Object.keys(MATERIALS).find(k => MATERIALS[k].id === item.material.id) || selectedMaterialKey;
        initUIControls();
        updateNestingUI();
      }

      draggedItem = item;
      dragOffset.x = item.x - mx;
      dragOffset.y = item.y - my;
      items.splice(i, 1);
      items.push(draggedItem);
      break;
    }
  }

  if (!clickedOnItem) {
    currentSheetItem = null;
    updateNestingUI();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!draggedItem) return;
  const rect = canvas.getBoundingClientRect();
  draggedItem.x = (e.clientX - rect.left) + dragOffset.x;
  draggedItem.y = (e.clientY - rect.top) + dragOffset.y;
});

window.addEventListener('mouseup', () => {
  if (draggedItem) {
    if (zones.trash && draggedItem.x >= zones.trash.x && draggedItem.x <= zones.trash.x + zones.trash.w &&
        draggedItem.y >= zones.trash.y && draggedItem.y <= zones.trash.y + zones.trash.h) {
      items = items.filter(i => i.id !== draggedItem.id);
      if (currentSheetItem && currentSheetItem.id === draggedItem.id) {
        currentSheetItem = null;
      }
      updateNestingUI();
    }
    draggedItem = null;
  }
});

function initUIControls() {
  const matContainer = document.getElementById('material-selector');
  matContainer.innerHTML = '';
  Object.keys(MATERIALS).forEach(key => {
    const mat = MATERIALS[key];
    const btn = document.createElement('button');
    btn.className = `p-2 rounded border text-left flex items-center gap-2 text-xs font-mono-tech transition-all ${selectedMaterialKey === key ? 'bg-[#222733] border-slate-400 text-white font-bold' : 'bg-[#14171d] border-[#222631] text-slate-400'}`;
    btn.innerHTML = `<span class="w-3 h-3 rounded-full inline-block" style="background:${mat.palette.main}"></span><span>${mat.name}</span>`;
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

  const sidebar = document.querySelector('aside');
  let newSheetBtn = document.getElementById('btn-new-sheet');
  if (!newSheetBtn && sidebar) {
    newSheetBtn = document.createElement('button');
    newSheetBtn.id = 'btn-new-sheet';
    newSheetBtn.className = 'w-full py-2 bg-[#1e2430] hover:bg-[#283040] text-slate-200 font-mono-tech text-xs rounded border border-[#343e52] mt-2';
    newSheetBtn.innerText = '➕ CRIAR NOVA CHAPA';
    newSheetBtn.addEventListener('click', () => processManufacturing(true));
    
    const fabBtn = document.getElementById('btn-fabricate');
    if (fabBtn) {
      fabBtn.parentNode.insertBefore(newSheetBtn, fabBtn);
    }
  }
}

window.addEventListener('resize', setupLayout);
document.getElementById('btn-fabricate').addEventListener('click', () => processManufacturing(false));

window.onload = () => {
  initUIControls();
  setupLayout();
  updateNestingUI();
  requestAnimationFrame(render);
};