import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- CONFIGURAÇÃO E CONSTANTES ---
const ROOM_WIDTH = 24;
const ROOM_DEPTH = 24;
const WALL_HEIGHT = 4.8;
const WALL_THICKNESS = 0.6;
const PLAYER_RADIUS = 0.55;

// Limites seguros da sala (considerando espessura da parede e raio do jogador)
const BOUNDS = {
  minX: -(ROOM_WIDTH / 2) + (WALL_THICKNESS / 2) + PLAYER_RADIUS,
  maxX: (ROOM_WIDTH / 2) - (WALL_THICKNESS / 2) - PLAYER_RADIUS,
  minZ: -(ROOM_DEPTH / 2) + (WALL_THICKNESS / 2) + PLAYER_RADIUS,
  maxZ: (ROOM_DEPTH / 2) - (WALL_THICKNESS / 2) - PLAYER_RADIUS,
};

// --- INICIALIZAÇÃO DA CENA ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e17);
scene.fog = new THREE.FogExp2(0x0a0e17, 0.022);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// Controles Orbitais (modo alternativo)
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.06;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05; // Não passar pelo chão
orbitControls.minDistance = 3;
orbitControls.maxDistance = 22;
orbitControls.enabled = false; // Começa no modo 3ª pessoa

let isThirdPerson = true;

// --- ILUMINAÇÃO ---
let isLightOn = true;
const LIGHT_CONFIG = {
  ambientOn: 0.55,
  ambientOff: 0.04,
  hemiOn: 0.70,
  hemiOff: 0.05,
  dirOn: 1.80,
  dirOff: 0.0,
  ceilingOn: 1.20,
  ceilingOff: 0.0,
  playerOn: 0.8,
  playerOff: 1.6, // Lanterna pessoal intensificada no escuro
};

// Luz Ambiente Suave
const ambientLight = new THREE.AmbientLight(0xffffff, LIGHT_CONFIG.ambientOn);
scene.add(ambientLight);

// Luz Hemisférica (Céu azulado, chão quente)
const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, LIGHT_CONFIG.hemiOn);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Luz Direcional Principal (com sombras nítidas e suaves)
const dirLight = new THREE.DirectionalLight(0xfff5ea, LIGHT_CONFIG.dirOn);
dirLight.position.set(12, 18, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 45;
const d = 16;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0004;
scene.add(dirLight);

// Luz pontual decorativa de teto no centro
const centerCeilingLight = new THREE.PointLight(0x38bdf8, LIGHT_CONFIG.ceilingOn, 18);
centerCeilingLight.position.set(0, WALL_HEIGHT - 0.4, 0);
scene.add(centerCeilingLight);

// --- INTERRUPTOR NA PAREDE ---
const SWITCH_POS = new THREE.Vector3(-2.8, 1.65, -ROOM_DEPTH / 2 + WALL_THICKNESS / 2 + 0.04);
const INTERACTION_DISTANCE = 3.2;

const switchGroup = new THREE.Group();
switchGroup.position.copy(SWITCH_POS);

// 1. Placa traseira (espelho do interruptor)
const switchPlateMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.35,
  metalness: 0.7,
});
const switchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.58, 0.04), switchPlateMat);
switchPlate.castShadow = true;
switchPlate.receiveShadow = true;
switchGroup.add(switchPlate);

// 2. Borda metálica decorativa
const switchFrameMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.2,
  metalness: 0.9,
});
const switchFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.015), switchFrameMat);
switchFrame.position.z = -0.01;
switchGroup.add(switchFrame);

// 3. Tecla basculante (rocker)
const rockerMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  roughness: 0.3,
  metalness: 0.5,
});
const switchRocker = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.04), rockerMat);
switchRocker.position.set(0, 0, 0.025);
switchRocker.rotation.x = -0.22; // Inclinado para cima (Ligado)
switchRocker.castShadow = true;
switchGroup.add(switchRocker);

// 4. LED indicador de status
const ledGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16);
ledGeo.rotateX(Math.PI / 2);
const switchLedMat = new THREE.MeshStandardMaterial({
  color: 0x22c55e,
  emissive: 0x22c55e,
  emissiveIntensity: 2.0,
  roughness: 0.2,
});
const switchLed = new THREE.Mesh(ledGeo, switchLedMat);
switchLed.position.set(0, 0.2, 0.025);
switchGroup.add(switchLed);

// 5. Luz pontual do interruptor (permanece visível no escuro)
const switchLedLight = new THREE.PointLight(0x22c55e, 0.3, 2.5);
switchLedLight.position.set(0, 0.2, 0.06);
switchGroup.add(switchLedLight);

// 6. Holograma / Marcador flutuante acima do interruptor
const holoGroup = new THREE.Group();
holoGroup.position.set(0, 0.52, 0.1);
const holoMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.6,
});
const holoRing = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.13, 24), holoMat);
holoGroup.add(holoRing);

const bulbIconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const bulbIcon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), bulbIconMat);
holoGroup.add(bulbIcon);
switchGroup.add(holoGroup);

scene.add(switchGroup);

// Efeito sonoro sintetizado via Web Audio API (tactile click)
function playSwitchSound(state) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(state ? 620 : 420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
}

// --- CRIAÇÃO DO CENÁRIO (A SALA) ---

// --- CRIAÇÃO DO CENÁRIO (COMPLEXO HOTEL 3D • 4 QUARTOS & CORREDOR) ---

// 1. GERADORES DE TEXTURAS PROCEDIMENTAIS PARA OS QUARTOS E CORREDOR
function createGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 504);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1.5;
  for (let i = 64; i < 512; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
  for (let x = 64; x < 512; x += 128) {
    for (let y = 64; y < 512; y += 128) {
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 5);
  return texture;
}

function createWoodParquetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 128) {
      const isAlt = (y / 64) % 2 === 0;
      const posX = isAlt ? x : (x + 64) % 512;
      ctx.fillStyle = (x + y) % 128 === 0 ? '#44403c' : '#292524';
      ctx.fillRect(posX + 2, y + 2, 124, 60);
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(posX + 2, y + 2, 124, 60);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 5);
  return texture;
}

function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 120); ctx.bezierCurveTo(140, 200, 280, 50, 512, 380); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5);
  return texture;
}

function createWhiteLabTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'; ctx.lineWidth = 4;
  for (let i = 128; i < 512; i += 128) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5);
  return texture;
}

function createBathroomTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; ctx.lineWidth = 3;
  for (let i = 64; i < 512; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2);
  return texture;
}

function createCorridorCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.fillRect(236, 0, 40, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(12, 2);
  return texture;
}

// 2. CONSTRUÇÃO DOS PISOS DAS 6 SALAS DO HOTEL
const floorGroup = new THREE.Group();

// Corredor Central (X: -30 a 30, Z: -3.6 a 3.6)
const corridorMat = new THREE.MeshStandardMaterial({ map: createCorridorCarpetTexture(), roughness: 0.6 });
const corridorFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 7.2), corridorMat);
corridorFloor.position.set(0, -0.2, 0);
corridorFloor.receiveShadow = true;
floorGroup.add(corridorFloor);

// Quarto 101: Suíte Presidencial (Grande - Noroeste)
const q101Mat = new THREE.MeshStandardMaterial({ map: createMarbleTexture(), roughness: 0.3 });
const q101Floor = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.4, 20.4), q101Mat);
q101Floor.position.set(-19.0, -0.2, -13.8);
q101Floor.receiveShadow = true;
floorGroup.add(q101Floor);

// Quarto 102: Banheiro de Luxo (Pequeno - Norte Centro)
const q102Mat = new THREE.MeshStandardMaterial({ map: createBathroomTileTexture(), roughness: 0.2 });
const q102Floor = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.4, 10.4), q102Mat);
q102Floor.position.set(-6.0, -0.2, -8.8);
q102Floor.receiveShadow = true;
floorGroup.add(q102Floor);

// Quarto 103: Tech Lab / Cyberpunk (Médio - Nordeste)
const q103Mat = new THREE.MeshStandardMaterial({ map: createGridTexture(), roughness: 0.5 });
const q103Floor = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.4, 16.4), q103Mat);
q103Floor.position.set(9.0, -0.2, -11.8);
q103Floor.receiveShadow = true;
floorGroup.add(q103Floor);

// Quarto 104: Suíte Botânica / Jardim (Médio - Sudoeste)
const q104Mat = new THREE.MeshStandardMaterial({ map: createWoodParquetTexture(), roughness: 0.7 });
const q104Floor = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.4, 16.4), q104Mat);
q104Floor.position.set(-21.0, -0.2, 11.8);
q104Floor.receiveShadow = true;
floorGroup.add(q104Floor);

// Quarto 105: Lavabo / Banheiro de Serviço (Muito Pequeno - Sul Centro)
const q105Mat = new THREE.MeshStandardMaterial({ map: createBathroomTileTexture(), roughness: 0.3 });
const q105Floor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 8.4), q105Mat);
q105Floor.position.set(-11.0, -0.2, 7.8);
q105Floor.receiveShadow = true;
floorGroup.add(q105Floor);

// Quarto 106: Câmara Quântica / Aperture Test Lab (Grande - Sudeste)
const q106Mat = new THREE.MeshStandardMaterial({ map: createWhiteLabTileTexture(), roughness: 0.3 });
const q106Floor = new THREE.Mesh(new THREE.BoxGeometry(21.6, 0.4, 18.4), q106Mat);
q106Floor.position.set(13.0, -0.2, 12.8);
q106Floor.receiveShadow = true;
floorGroup.add(q106Floor);

scene.add(floorGroup);

// GridHelper no corredor
const gridHelper = new THREE.GridHelper(60, 30, 0x38bdf8, 0x1e293b);
gridHelper.position.set(0, 0.005, 0);
scene.add(gridHelper);

// 3. PAREDES E COLISORES DO HOTEL COM 6 SALAS
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1e2638, roughness: 0.85, metalness: 0.1 });
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });

const wallsGroup = new THREE.Group();
const portalWallMeshes = [];
const wallColliders = [];

function createWallSegment(w, h, d, x, y, z, wallName) {
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
  wallMesh.position.set(x, y, z);
  wallMesh.castShadow = true; wallMesh.receiveShadow = true;
  wallMesh.userData = { isPortalWall: true, wallName: wallName || 'Parede' };
  wallsGroup.add(wallMesh);
  portalWallMeshes.push(wallMesh);

  const trimHeight = 0.15;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(w === WALL_THICKNESS ? w + 0.04 : w, trimHeight, d === WALL_THICKNESS ? d + 0.04 : d), trimMaterial);
  trim.position.set(x, trimHeight / 2, z);
  wallsGroup.add(trim);

  wallColliders.push({
    minX: x - w / 2 - PLAYER_RADIUS,
    maxX: x + w / 2 + PLAYER_RADIUS,
    minZ: z - d / 2 - PLAYER_RADIUS,
    maxZ: z + d / 2 + PLAYER_RADIUS,
    name: wallName || 'Parede',
  });
}

// Paredes Perimetrais Externas
createWallSegment(60.6, WALL_HEIGHT, WALL_THICKNESS, 0, WALL_HEIGHT / 2, -24.0, 'Parede Norte Hotel');
createWallSegment(60.6, WALL_HEIGHT, WALL_THICKNESS, 0, WALL_HEIGHT / 2, 24.0, 'Parede Sul Hotel');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 48.6, -30.0, WALL_HEIGHT / 2, 0, 'Parede Oeste Hotel');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 48.6, 30.0, WALL_HEIGHT / 2, 0, 'Parede Leste Hotel');

// Divisórias das 6 Salas & Corredor
// Parede Oeste do Corredor (Z = -3.6 / Z = 3.6)
createWallSegment(18.0, WALL_HEIGHT, WALL_THICKNESS, -19.0, WALL_HEIGHT / 2, -3.6, 'Parede Q101/Corredor');
createWallSegment(8.0, WALL_HEIGHT, WALL_THICKNESS, -6.0, WALL_HEIGHT / 2, -3.6, 'Parede Q102/Corredor');
createWallSegment(14.0, WALL_HEIGHT, WALL_THICKNESS, 9.0, WALL_HEIGHT / 2, -3.6, 'Parede Q103/Corredor');

createWallSegment(14.0, WALL_HEIGHT, WALL_THICKNESS, -21.0, WALL_HEIGHT / 2, 3.6, 'Parede Q104/Corredor');
createWallSegment(6.0, WALL_HEIGHT, WALL_THICKNESS, -11.0, WALL_HEIGHT / 2, 3.6, 'Parede Q105/Corredor');
createWallSegment(22.0, WALL_HEIGHT, WALL_THICKNESS, 13.0, WALL_HEIGHT / 2, 3.6, 'Parede Q106/Corredor');

// Divisórias Verticais entre Quartos
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 20.4, -10.2, WALL_HEIGHT / 2, -13.8, 'Divisória Q101/Q102');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 16.4, 2.0, WALL_HEIGHT / 2, -11.8, 'Divisória Q102/Q103');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 16.4, -14.0, WALL_HEIGHT / 2, 11.8, 'Divisória Q104/Q105');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 18.4, 2.0, WALL_HEIGHT / 2, 12.8, 'Divisória Q105/Q106');

scene.add(wallsGroup);

// 4. SISTEMA DE PORTAS 3D INTERATIVAS COM DOBRADIÇA
const interactiveDoors = [];

function playDoorSound(isOpen) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOpen ? 220 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(isOpen ? 440 : 180, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.23);
  } catch (e) {}
}

function createInteractiveDoor(x, z, roomNumber, roomTitle, isNorthSide) {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(x, 0, z);

  // Viga Lintel
  const lintelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.8), lintelMat);
  lintel.position.set(0, 4.2, 0);
  doorGroup.add(lintel);

  // Placa de Número do Quarto
  const signMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.8 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.86), signMat);
  sign.position.set(0, 3.4, 0);
  doorGroup.add(sign);

  // Pivô da Dobradiça da Porta 3D
  const pivotGroup = new THREE.Group();
  pivotGroup.position.set(-1.4, 0, 0);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.12), doorMat);
  doorPanel.position.set(1.35, 1.6, 0);
  doorPanel.castShadow = true; doorPanel.receiveShadow = true;
  pivotGroup.add(doorPanel);

  // Maçaneta Dourada
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), knobMat);
  knob.position.set(2.4, 1.5, 0.12);
  pivotGroup.add(knob);

  doorGroup.add(pivotGroup);
  scene.add(doorGroup);

  const doorData = {
    group: doorGroup,
    pivot: pivotGroup,
    isOpen: false,
    currentAngle: 0,
    targetAngle: 0,
    x, z,
    roomNumber,
    name: roomTitle,
    colliderIndex: -1,
  };

  // Registra colisor de porta fechada
  const collider = {
    minX: x - 1.4 - PLAYER_RADIUS,
    maxX: x + 1.4 + PLAYER_RADIUS,
    minZ: z - 0.4 - PLAYER_RADIUS,
    maxZ: z + 0.4 + PLAYER_RADIUS,
    name: `Porta ${roomNumber} (${roomTitle})`,
  };
  wallColliders.push(collider);
  doorData.colliderIndex = wallColliders.length - 1;

  interactiveDoors.push(doorData);
  return doorData;
}

function toggleDoor(door) {
  door.isOpen = !door.isOpen;
  door.targetAngle = door.isOpen ? -Math.PI / 2 : 0;
  if (door.colliderIndex >= 0 && wallColliders[door.colliderIndex]) {
    wallColliders[door.colliderIndex].disabled = door.isOpen;
  }
  playDoorSound(door.isOpen);
}

// Criação das Portas 3D das 6 Salas
createInteractiveDoor(-19.0, -3.6, '101', 'SUÍTE PRESIDENCIAL', true);
createInteractiveDoor(-6.0, -3.6, '102', 'BANHEIRO LUXO', true);
createInteractiveDoor(9.0, -3.6, '103', 'TECH LAB', true);
createInteractiveDoor(-21.0, 3.6, '104', 'SUÍTE BOTÂNICA', false);
createInteractiveDoor(-11.0, 3.6, '105', 'LAVABO', false);
createInteractiveDoor(13.0, 3.6, '106', 'CÂMARA TESTES', false);

// --- EFEITOS SONOROS SINTETIZADOS DA FASE 2 ---
function playEquipGunSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.22);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {}
}

function playJumpSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.14);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {}
}

function playTeleportSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  } catch (e) {}
}

// --- CONSTRUTOR DA MESH 3D DA ARMA DE PORTAIS ---
function createPortalGunMesh(isSmall = false) {
  const gunGroup = new THREE.Group();
  const scale = isSmall ? 0.45 : 0.85;

  // Corpo Principal Branco
  const bodyGeo = new THREE.CylinderGeometry(0.18 * scale, 0.15 * scale, 0.65 * scale, 16);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.6,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  gunGroup.add(bodyMesh);

  // Empunhadura
  const handleGeo = new THREE.BoxGeometry(0.12 * scale, 0.32 * scale, 0.14 * scale);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.position.set(0, -0.18 * scale, -0.08 * scale);
  gunGroup.add(handleMesh);

  // Núcleo de Energia Brilhante
  const coreGeo = new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.3 * scale, 16);
  coreGeo.rotateX(Math.PI / 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.85,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, 0.04 * scale, 0.05 * scale);
  gunGroup.add(coreMesh);

  // 3 Garras na Ponta do Cano
  const prongGeo = new THREE.BoxGeometry(0.02 * scale, 0.02 * scale, 0.22 * scale);
  const prongMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const prong = new THREE.Mesh(prongGeo, prongMat);
    prong.position.set(Math.cos(angle) * 0.14 * scale, Math.sin(angle) * 0.14 * scale, 0.4 * scale);
    gunGroup.add(prong);
  }

  // Luz própria da arma
  const gunLight = new THREE.PointLight(0x38bdf8, 0.8, 3.5);
  gunLight.position.set(0, 0, 0.35 * scale);
  gunGroup.add(gunLight);

  return { gunGroup, coreMat, gunLight };
}

// --- PEDESTAL E ITEM COLETÁVEL DA PORTAL GUN (NO QUARTO 101 - TECH LAB) ---
const PEDESTAL_POS = new THREE.Vector3(-11.8, 0, -13.8);
const pedestalGroup = new THREE.Group();
pedestalGroup.position.copy(PEDESTAL_POS);

const pedBaseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.9, 32);
const pedBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
const pedBase = new THREE.Mesh(pedBaseGeo, pedBaseMat);
pedBase.position.y = 0.45;
pedBase.castShadow = true;
pedBase.receiveShadow = true;
pedestalGroup.add(pedBase);

const pedRingGeo = new THREE.TorusGeometry(0.72, 0.04, 16, 32);
pedRingGeo.rotateX(Math.PI / 2);
const pedRingMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });
const pedRing = new THREE.Mesh(pedRingGeo, pedRingMat);
pedRing.position.y = 0.91;
pedestalGroup.add(pedRing);

const pedLight = new THREE.PointLight(0x38bdf8, 1.4, 5);
pedLight.position.y = 1.3;
pedestalGroup.add(pedLight);

const pedestalGunObj = createPortalGunMesh(false);
pedestalGunObj.gunGroup.position.set(0, 1.4, 0);
pedestalGroup.add(pedestalGunObj.gunGroup);

scene.add(pedestalGroup);

// --- OBJETOS ESCALÁVEIS E MOBILIÁRIO DOS 4 QUARTOS (AABB 3D) ---
const steppableBoxes = [];

function createCrate(x, z, width, height, depth, color = 0x3b82f6, crateName = 'Caixa') {
  const crateGroup = new THREE.Group();
  crateGroup.position.set(x, height / 2, z);

  // Corpo da caixa
  const boxMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.3,
  });
  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), boxMat);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  crateGroup.add(boxMesh);

  // Moldura reforçada estilo Companion Cube / Tech Crate
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.8,
  });
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.06, 0.1, depth + 0.06), frameMat);
  topFrame.position.y = height / 2 - 0.05;
  crateGroup.add(topFrame);

  const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.06, 0.1, depth + 0.06), frameMat);
  bottomFrame.position.y = -height / 2 + 0.05;
  crateGroup.add(bottomFrame);

  // Anel luminoso indicador no topo
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
  });
  const ring = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.02, depth - 0.4), ringMat);
  ring.position.y = height / 2 + 0.005;
  crateGroup.add(ring);

  scene.add(crateGroup);

  const bounds = {
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
    height: height,
    topY: height,
    name: crateName,
  };
  steppableBoxes.push(bounds);
  return bounds;
}

// 1. PROPS DO QUARTO 101 (TECH LAB / CYBERPUNK)
createCrate(-14.5, -17.5, 2.2, 1.4, 2.2, 0x0284c7, 'Caixa Tech Q101');
function createServerRack(x, z) {
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.8, 1.2), rackMat);
  rack.position.set(x, 1.9, z);
  rack.castShadow = true;
  scene.add(rack);
  const ledLight = new THREE.PointLight(0x38bdf8, 0.6, 3);
  ledLight.position.set(x, 2.5, z + 0.65);
  scene.add(ledLight);
}
createServerRack(-17.2, -19.0);
createServerRack(-17.2, -8.5);

// 2. PROPS DO QUARTO 102 (BIOMA BOTÂNICO / NATUREZA)
createCrate(-14.5, 14.5, 2.8, 1.5, 2.8, 0x15803d, 'Plataforma Verde Q102');
function createPottedPlant(x, z) {
  const plantGroup = new THREE.Group();
  plantGroup.position.set(x, 0, z);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x78350f }));
  pot.position.y = 0.4;
  plantGroup.add(pot);
  const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 }));
  leaves.position.y = 1.15;
  plantGroup.add(leaves);
  scene.add(plantGroup);
}
createPottedPlant(-17.0, 18.0);
createPottedPlant(-17.0, 9.0);
createPottedPlant(-7.0, 18.0);

// 3. PROPS DO QUARTO 103 (LOUNGE VIP EXECUTIVO)
createCrate(8.5, -18.0, 2.4, 1.3, 2.4, 0xb45309, 'Degrau Mármore Q103');
function createSofa(x, z) {
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(x, 0, z);
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.4 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 1.4), leatherMat);
  seat.position.y = 0.4;
  sofaGroup.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.3), leatherMat);
  back.position.set(0, 0.9, -0.55);
  sofaGroup.add(back);
  scene.add(sofaGroup);
}
createSofa(14.0, -18.0);

// 4. PROPS DO QUARTO 104 (CÂMARA QUÂNTICA APERTURE TEST)
createCrate(8.5, 18.0, 2.2, 1.5, 2.2, 0xec4899, 'Companion Cube Q104');
createCrate(15.0, 18.0, 2.6, 2.2, 2.6, 0x6366f1, 'Caixa Teste Q104');
// Alvo de Portal na Parede Leste do Q104
const targetRingGeo = new THREE.RingGeometry(0.4, 1.2, 32);
const targetRingMat = new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide });
const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
targetRing.position.set(19.65, 2.4, 13.8);
targetRing.rotation.y = -Math.PI / 2;
scene.add(targetRing);

// --- O PERSONAGEM (JOGADOR) ---
const playerGroup = new THREE.Group();
playerGroup.position.set(0, 1.0, 0);

// Corpo Cápsula estilizada
const capsuleRadius = 0.45;
const capsuleLength = 0.8;
const playerBodyGeo = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 16, 32);
const playerBodyMat = new THREE.MeshStandardMaterial({
  color: 0x0ea5e9, // Azul turquesa vibrante
  roughness: 0.25,
  metalness: 0.3,
});
const playerBody = new THREE.Mesh(playerBodyGeo, playerBodyMat);
playerBody.castShadow = true;
playerBody.receiveShadow = true;
playerGroup.add(playerBody);

// Visor
const visorGeo = new THREE.BoxGeometry(0.5, 0.22, 0.35);
const visorMat = new THREE.MeshStandardMaterial({
  color: 0x030712,
  emissive: 0x38bdf8,
  emissiveIntensity: 0.7,
  roughness: 0.1,
  metalness: 0.9,
});
const visor = new THREE.Mesh(visorGeo, visorMat);
visor.position.set(0, 0.35, 0.36);
visor.castShadow = true;
playerGroup.add(visor);

// Mochila tecnológica
const backpackGeo = new THREE.BoxGeometry(0.48, 0.6, 0.22);
const backpackMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  metalness: 0.5,
  roughness: 0.4,
});
const backpack = new THREE.Mesh(backpackGeo, backpackMat);
backpack.position.set(0, 0.1, -0.42);
backpack.castShadow = true;
playerGroup.add(backpack);

// Arma de Portais Acoplada ao Jogador (Inicialmente Invisível)
let hasPortalGun = false;
const playerGunObj = createPortalGunMesh(true);
playerGunObj.gunGroup.position.set(0.42, 0.12, 0.38);
playerGunObj.gunGroup.rotation.set(0.1, Math.PI - 0.25, 0);
playerGunObj.gunGroup.visible = false;
playerGroup.add(playerGunObj.gunGroup);

function pickUpPortalGun() {
  if (hasPortalGun) return;
  hasPortalGun = true;

  // Atualiza pedestal
  pedestalGunObj.gunGroup.visible = false;
  pedRingMat.emissive.setHex(0x22c55e);
  pedRingMat.color.setHex(0x22c55e);
  pedLight.color.setHex(0x22c55e);
  pedLight.intensity = 0.4;

  // Mostra arma no jogador
  playerGunObj.gunGroup.visible = true;

  // Atualiza HUD
  const statGun = document.getElementById('stat-gun');
  if (statGun) {
    statGun.textContent = 'Equipada ⚡';
    statGun.className = 'stat-value badge-gun-equipped';
  }
  const crosshairContainer = document.getElementById('crosshair-container');
  if (crosshairContainer) {
    crosshairContainer.classList.remove('unarmed');
  }

  playEquipGunSound();
}

// Luz suave sob o jogador
const playerLight = new THREE.PointLight(0x38bdf8, 0.8, 4);
playerLight.position.set(0, -0.4, 0);
playerGroup.add(playerLight);

scene.add(playerGroup);

// --- SISTEMA DE MOVIMENTAÇÃO, FÍSICA E PULO ---
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
};

const velocity = new THREE.Vector3();
let velocityY = 0;
const GRAVITY = -24.0;
const JUMP_FORCE = 9.2;
let isGrounded = true;
let teleportCooldownTimer = 0;

const MOVE_SPEED = 7.5;
const ACCELERATION = 42.0;
const FRICTION = 10.0;
let playerRotation = 0;
let walkBobTimer = 0;

// Listeners de teclado
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') updateKeyState('w', true);
  if (key === 'a' || key === 'arrowleft') updateKeyState('a', true);
  if (key === 's' || key === 'arrowdown') updateKeyState('s', true);
  if (key === 'd' || key === 'arrowright') updateKeyState('d', true);
  if (e.code === 'Space' || key === ' ') {
    updateKeyState('space', true);
    e.preventDefault();
  }
  if (key === 'e') {
    for (const door of interactiveDoors) {
      const dist = playerGroup.position.distanceTo(new THREE.Vector3(door.x, 1.0, door.z));
      if (dist < 2.5) {
        toggleDoor(door);
        return;
      }
    }
    const distPedestal = playerGroup.position.distanceTo(PEDESTAL_POS);
    if (!hasPortalGun && distPedestal < 2.5) {
      pickUpPortalGun();
      return;
    }
    const distSwitch = playerGroup.position.distanceTo(SWITCH_POS);
    if (distSwitch < INTERACTION_DISTANCE) {
      toggleLight();
    }
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') updateKeyState('w', false);
  if (key === 'a' || key === 'arrowleft') updateKeyState('a', false);
  if (key === 's' || key === 'arrowdown') updateKeyState('s', false);
  if (key === 'd' || key === 'arrowright') updateKeyState('d', false);
  if (e.code === 'Space' || key === ' ') {
    updateKeyState('space', false);
    e.preventDefault();
  }
});

function updateKeyState(key, isPressed) {
  keys[key] = isPressed;
  const keyElem = document.getElementById(`key-${key}`);
  if (keyElem) {
    if (isPressed) {
      keyElem.classList.add('active');
    } else {
      keyElem.classList.remove('active');
    }
  }
}

// Botões e Elementos da interface
const statX = document.getElementById('stat-x');
const statZ = document.getElementById('stat-z');
const statSpeed = document.getElementById('stat-speed');
const statCollision = document.getElementById('stat-collision');
const statLight = document.getElementById('stat-light');
const btnReset = document.getElementById('btn-reset');
const btnCamera = document.getElementById('btn-camera');
const btnToggleLight = document.getElementById('btn-toggle-light');
const interactionPrompt = document.getElementById('interaction-prompt');
const promptText = document.getElementById('prompt-text');

function updatePromptText() {
  if (promptText) {
    promptText.textContent = isLightOn
      ? 'Apagar Luz do Ambiente (E)'
      : 'Acender Luz do Ambiente (E)';
  }
}

function toggleLight(forceState) {
  if (typeof forceState === 'boolean') {
    isLightOn = forceState;
  } else {
    isLightOn = !isLightOn;
  }

  playSwitchSound(isLightOn);

  // Inclinação física realista da tecla basculante
  switchRocker.rotation.x = isLightOn ? -0.22 : 0.22;

  // Atualização visual do LED e holograma
  if (isLightOn) {
    switchLedMat.color.setHex(0x22c55e);
    switchLedMat.emissive.setHex(0x22c55e);
    switchLedLight.color.setHex(0x22c55e);
    switchLedLight.intensity = 0.25;
    holoMat.color.setHex(0x38bdf8);
    bulbIconMat.color.setHex(0x38bdf8);
    if (statLight) {
      statLight.textContent = 'Acesa 💡';
      statLight.className = 'stat-value badge-light-on';
    }
  } else {
    switchLedMat.color.setHex(0xef4444);
    switchLedMat.emissive.setHex(0xef4444);
    switchLedLight.color.setHex(0xef4444);
    switchLedLight.intensity = 1.1; // LED vermelho guia no escuro
    holoMat.color.setHex(0xf59e0b);
    bulbIconMat.color.setHex(0xf59e0b);
    if (statLight) {
      statLight.textContent = 'Apagada 🌙';
      statLight.className = 'stat-value badge-light-off';
    }
  }

  updatePromptText();
}

if (btnToggleLight) {
  btnToggleLight.addEventListener('click', () => toggleLight());
}

if (interactionPrompt) {
  interactionPrompt.addEventListener('click', () => toggleLight());
}

// Interação com mouse e Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const switchClickables = [switchPlate, switchFrame, switchRocker, switchLed, holoRing, bulbIcon];

// --- SISTEMA DA ARMA DE PORTAIS (FASE 1) ---
const PORTAL_CONFIG = {
  radius: 0.85,
  blue: {
    name: 'Portal A (Azul)',
    primaryColor: 0x00d2ff,
    secondaryColor: 0x0284c7,
    lightColor: 0x38bdf8,
    hexCode: '#00d2ff',
  },
  orange: {
    name: 'Portal B (Laranja)',
    primaryColor: 0xff7b00,
    secondaryColor: 0xea580c,
    lightColor: 0xf97316,
    hexCode: '#ff7b00',
  },
};

const activePortals = {
  blue: null,   // Portal A
  orange: null, // Portal B
};

// Gerador procedural de textura de vórtice quântico para o interior dos portais
function createVortexTexture(type) {
  const isBlue = type === 'blue';
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  // Fundo cósmico escuro profundo
  ctx.fillStyle = isBlue ? '#030712' : '#0a0400';
  ctx.fillRect(0, 0, 512, 512);

  // Gradiente radial do horizonte de eventos
  const grad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 240);
  if (isBlue) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.18, '#38bdf8');
    grad.addColorStop(0.45, '#0284c7');
    grad.addColorStop(0.75, '#0369a1');
    grad.addColorStop(0.92, '#0c223a');
    grad.addColorStop(1, '#020617');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.18, '#fef08a');
    grad.addColorStop(0.42, '#fb923c');
    grad.addColorStop(0.72, '#ea580c');
    grad.addColorStop(0.92, '#451a03');
    grad.addColorStop(1, '#1a0500');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.fill();

  // Anéis concêntricos de distorção de plasma
  ctx.lineWidth = 2.5;
  for (let r = 45; r < 235; r += 26) {
    ctx.strokeStyle = isBlue
      ? `rgba(56, 189, 248, ${0.45 - (r / 250) * 0.25})`
      : `rgba(251, 146, 60, ${0.45 - (r / 250) * 0.25})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Filamentos em espiral estilizados
  ctx.save();
  ctx.translate(cx, cy);
  for (let a = 0; a < 6; a++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.bezierCurveTo(80, 45, 150, -35, 230, 40);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Gerador procedural de textura de halo / glow suave
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const cx = 128;
  const cy = 128;

  const grad = ctx.createRadialGradient(cx, cy, 70, cx, cy, 126);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.18)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 126, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const vortexTextures = {
  blue: createVortexTexture('blue'),
  orange: createVortexTexture('orange'),
};
const glowTexture = createGlowTexture();

// Constrói o grupo do portal com geometrias ricas, materiais emissivos e luz pontual
function buildPortalMesh(type, hitPoint, worldNormal, wallName) {
  const isBlue = type === 'blue';
  const cfg = isBlue ? PORTAL_CONFIG.blue : PORTAL_CONFIG.orange;
  const portalGroup = new THREE.Group();

  // 1. Núcleo Vórtice Interno (Superfície do Portal)
  const vortexGeo = new THREE.CircleGeometry(PORTAL_CONFIG.radius * 0.92, 48);
  const vortexMat = new THREE.MeshBasicMaterial({
    map: vortexTextures[type],
    side: THREE.DoubleSide,
  });
  const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
  portalGroup.add(vortexMesh);

  // 2. Anel de Energia Principal (Borda Neon Brilhante)
  const ringGeo = new THREE.RingGeometry(PORTAL_CONFIG.radius * 0.88, PORTAL_CONFIG.radius * 1.02, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: cfg.primaryColor,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.z = 0.002;
  portalGroup.add(ringMesh);

  // 3. Halo Externo Difuso (Soft Outer Glow)
  const glowGeo = new THREE.RingGeometry(PORTAL_CONFIG.radius * 0.98, PORTAL_CONFIG.radius * 1.35, 64);
  const glowMat = new THREE.MeshBasicMaterial({
    color: cfg.primaryColor,
    map: glowTexture,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.z = 0.004;
  portalGroup.add(glowMesh);

  // 4. Arcos Tecnológicos Segmentados Orbitantes
  const energyArcs = new THREE.Group();
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const arc1 = new THREE.Mesh(new THREE.RingGeometry(PORTAL_CONFIG.radius * 0.94, PORTAL_CONFIG.radius * 0.98, 32, 1, 0, Math.PI * 0.65), arcMat);
  const arc2 = new THREE.Mesh(new THREE.RingGeometry(PORTAL_CONFIG.radius * 0.94, PORTAL_CONFIG.radius * 0.98, 32, 1, Math.PI, Math.PI * 0.65), arcMat);
  energyArcs.add(arc1);
  energyArcs.add(arc2);
  energyArcs.position.z = 0.006;
  portalGroup.add(energyArcs);

  // 5. Luz Pontual Projetada no Ambiente
  const portalLight = new THREE.PointLight(cfg.lightColor, 1.8, 6.5);
  portalLight.position.set(0, 0, 0.25);
  portalGroup.add(portalLight);

  // Limite seguro na geometria da parede para não vazar pelas bordas/quina
  const safePos = hitPoint.clone();
  safePos.y = THREE.MathUtils.clamp(safePos.y, PORTAL_CONFIG.radius + 0.15, WALL_HEIGHT - PORTAL_CONFIG.radius - 0.15);
  if (Math.abs(worldNormal.z) > 0.5) {
    safePos.x = THREE.MathUtils.clamp(safePos.x, -(ROOM_WIDTH / 2) + PORTAL_CONFIG.radius + 0.5, (ROOM_WIDTH / 2) - PORTAL_CONFIG.radius - 0.5);
  } else if (Math.abs(worldNormal.x) > 0.5) {
    safePos.z = THREE.MathUtils.clamp(safePos.z, -(ROOM_DEPTH / 2) + PORTAL_CONFIG.radius + 0.5, (ROOM_DEPTH / 2) - PORTAL_CONFIG.radius - 0.5);
  }

  // Posição colada na face da parede com offset de 1.8cm para evitar z-fighting
  portalGroup.position.copy(safePos).addScaledVector(worldNormal, 0.018);

  // Rotação: alinha o vetor normal (0, 0, 1) da geometria plana exatamente com a face da parede
  portalGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), worldNormal);

  // Escala inicial para a animação elástica de abertura
  portalGroup.scale.set(0.01, 0.01, 0.01);

  return {
    group: portalGroup,
    light: portalLight,
    vortexMesh,
    energyArcs,
    type,
    wallName,
    worldNormal: worldNormal.clone(),
    position: portalGroup.position.clone(),
    spawnProgress: 0,
    createdAt: performance.now(),
  };
}

// Remove e descarta um portal existente de forma limpa
function removePortal(type) {
  const p = activePortals[type];
  if (!p) return;

  scene.remove(p.group);
  p.group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });

  activePortals[type] = null;
  updatePortalUI();
}

function clearAllPortals() {
  removePortal('blue');
  removePortal('orange');
}

// Efeitos Visuais Efêmeros (Feixe de Plasma e Faíscas de Impacto)
const activeEffects = [];

function createTracerBeam(startPoint, endPoint, colorHex) {
  const points = [startPoint.clone(), endPoint.clone()];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.95,
  });
  const line = new THREE.Line(geo, mat);
  scene.add(line);

  activeEffects.push({
    mesh: line,
    duration: 0.12,
    elapsed: 0,
    update: (dt) => {
      mat.opacity = Math.max(0, 1 - dt / 0.12);
    },
    dispose: () => {
      scene.remove(line);
      geo.dispose();
      mat.dispose();
    },
  });
}

function createImpactSparks(hitPoint, normal, colorHex) {
  const count = 12;
  const group = new THREE.Group();
  const sparks = [];

  for (let i = 0; i < count; i++) {
    const sparkGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sparkMesh.position.copy(hitPoint);
    group.add(sparkMesh);

    const vel = normal.clone().multiplyScalar(1.2 + Math.random() * 2.2);
    vel.x += (Math.random() - 0.5) * 3.0;
    vel.y += (Math.random() - 0.5) * 3.0;
    vel.z += (Math.random() - 0.5) * 3.0;

    sparks.push({ mesh: sparkMesh, vel, mat: sparkMat });
  }

  scene.add(group);

  activeEffects.push({
    mesh: group,
    duration: 0.32,
    elapsed: 0,
    update: (dt) => {
      const alpha = Math.max(0, 1 - dt / 0.32);
      for (const sp of sparks) {
        sp.mesh.position.addScaledVector(sp.vel, 0.016);
        sp.mat.opacity = alpha;
      }
    },
    dispose: () => {
      scene.remove(group);
      group.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    },
  });
}

// Efeito sonoro procedural sintetizado via Web Audio API (Portal Gun Shoot & Wall Lock)
function playPortalGunSound(isBlue, isHit) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Disparo sci-fi característico
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    const baseFreq = isBlue ? 880 : 620;
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.14);

    osc2.frequency.setValueAtTime(baseFreq * 1.4, now);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.14);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);

    // Efeito de impacto e abertura do portal na parede
    if (isHit) {
      const hitOsc = ctx.createOscillator();
      const hitGain = ctx.createGain();
      hitOsc.type = 'sine';
      hitOsc.frequency.setValueAtTime(isBlue ? 320 : 230, now + 0.03);
      hitOsc.frequency.exponentialRampToValueAtTime(65, now + 0.26);

      hitGain.gain.setValueAtTime(0.0, now);
      hitGain.gain.setValueAtTime(0.32, now + 0.03);
      hitGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      hitOsc.connect(hitGain);
      hitGain.connect(ctx.destination);
      hitOsc.start(now + 0.03);
      hitOsc.stop(now + 0.29);
    }
  } catch (e) {}
}

// Disparo da Arma de Portais pelo centro exato da tela via THREE.Raycaster
function shootPortal(type) {
  if (!hasPortalGun) {
    const statGun = document.getElementById('stat-gun');
    if (statGun) {
      statGun.textContent = 'Pegue a Arma no Pedestal! ⚠️';
      statGun.className = 'stat-value badge-warning';
      setTimeout(() => {
        if (!hasPortalGun && statGun) {
          statGun.textContent = 'No Pedestal 🔫';
          statGun.className = 'stat-value badge-gun-unarmed';
        }
      }, 1400);
    }
    return;
  }

  const isBlue = type === 'blue';

  // Raycasting no centro exato da tela (NDC 0, 0)
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(portalWallMeshes, false);

  if (hits.length === 0) {
    // Sem impacto em parede válida
    playPortalGunSound(isBlue, false);
    triggerCrosshairRecoil(type);
    return;
  }

  const hit = hits[0];
  const worldNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  const wallName = hit.object.userData.wallName || 'Parede';

  // Limitação: Só pode existir um portal de cada cor por vez (se atirar outro, o antigo some)
  if (activePortals[type]) {
    removePortal(type);
  }

  // Criação do novo portal perfeitamente colado e alinhado à face da parede
  const newPortal = buildPortalMesh(type, hit.point, worldNormal, wallName);
  scene.add(newPortal.group);
  activePortals[type] = newPortal;

  // Feixe de plasma saindo do jogador até o ponto de impacto
  const muzzlePos = playerGroup.position.clone().add(new THREE.Vector3(0, 0.6, 0));
  createTracerBeam(muzzlePos, hit.point, isBlue ? 0x00d2ff : 0xff7b00);
  createImpactSparks(hit.point, worldNormal, isBlue ? 0x00d2ff : 0xff7b00);

  // Efeito sonoro e animação na mira
  playPortalGunSound(isBlue, true);
  triggerCrosshairRecoil(type);
  updatePortalUI();
}

// Elementos da Mira Central e HUD
const crosshairContainer = document.getElementById('crosshair-container');
const crosshairBracketLeft = document.getElementById('crosshair-bracket-left');
const crosshairBracketRight = document.getElementById('crosshair-bracket-right');
const statPortalBlue = document.getElementById('stat-portal-blue');
const statPortalOrange = document.getElementById('stat-portal-orange');
const btnClearPortals = document.getElementById('btn-clear-portals');

function triggerCrosshairRecoil(type) {
  if (!crosshairContainer) return;
  const recoilClass = type === 'blue' ? 'recoil-blue' : 'recoil-orange';
  crosshairContainer.classList.remove('recoil-blue', 'recoil-orange');
  void crosshairContainer.offsetWidth; // Força reflow
  crosshairContainer.classList.add(recoilClass);
  setTimeout(() => {
    crosshairContainer.classList.remove(recoilClass);
  }, 140);
}

function updatePortalUI() {
  // Portal Azul (A)
  if (activePortals.blue) {
    if (crosshairBracketLeft) crosshairBracketLeft.classList.add('active-portal-blue');
    if (statPortalBlue) {
      statPortalBlue.textContent = `Ativo (${activePortals.blue.wallName})`;
      statPortalBlue.className = 'stat-value badge-portal-blue';
    }
  } else {
    if (crosshairBracketLeft) crosshairBracketLeft.classList.remove('active-portal-blue');
    if (statPortalBlue) {
      statPortalBlue.textContent = 'Não disparado';
      statPortalBlue.className = 'stat-value badge-portal-empty';
    }
  }

  // Portal Laranja (B)
  if (activePortals.orange) {
    if (crosshairBracketRight) crosshairBracketRight.classList.add('active-portal-orange');
    if (statPortalOrange) {
      statPortalOrange.textContent = `Ativo (${activePortals.orange.wallName})`;
      statPortalOrange.className = 'stat-value badge-portal-orange';
    }
  } else {
    if (crosshairBracketRight) crosshairBracketRight.classList.remove('active-portal-orange');
    if (statPortalOrange) {
      statPortalOrange.textContent = 'Não disparado';
      statPortalOrange.className = 'stat-value badge-portal-empty';
    }
  }
}

if (btnClearPortals) {
  btnClearPortals.addEventListener('click', () => clearAllPortals());
}

// Controles de Câmera e Mouse (Pointer Events)
let isPointerDown = false;
let pointerStartX = 0;
let pointerStartY = 0;
let pointerLastX = 0;
let pointerLastY = 0;
let pointerStartTime = 0;
let hasDragged = false;

let cameraYaw = 0;
let cameraPitch = 0.35;
let cameraDistance = 9.5;

function updateZoom(deltaZoom) {
  cameraDistance = THREE.MathUtils.clamp(cameraDistance + deltaZoom, 3.5, 22.0);
  const statZoom = document.getElementById('stat-zoom');
  if (statZoom) {
    statZoom.textContent = `${cameraDistance.toFixed(1)}m`;
  }
}

window.addEventListener('wheel', (e) => {
  if (e.target && e.target.closest && e.target.closest('#hud-overlay')) return;
  e.preventDefault();
  const zoomStep = e.deltaY > 0 ? 0.9 : -0.9;
  updateZoom(zoomStep);
}, { passive: false });

const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
if (btnZoomIn) btnZoomIn.addEventListener('click', () => updateZoom(-1.8));
if (btnZoomOut) btnZoomOut.addEventListener('click', () => updateZoom(1.8));

// Previne menu de contexto padrão no clique do botão direito
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

window.addEventListener('pointerdown', (e) => {
  // Não disparar se clicar em botões interativos do HUD
  if (e.target && e.target.closest && e.target.closest('#hud-overlay button, .btn-action, #interaction-prompt, a')) {
    return;
  }

  isPointerDown = true;
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;
  pointerLastX = e.clientX;
  pointerLastY = e.clientY;
  pointerStartTime = performance.now();
  hasDragged = false;
});

window.addEventListener('pointermove', (e) => {
  if (!isPointerDown) return;

  const dx = e.clientX - pointerLastX;
  const dy = e.clientY - pointerLastY;
  pointerLastX = e.clientX;
  pointerLastY = e.clientY;

  const totalDist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
  if (totalDist > 5) {
    hasDragged = true;
  }

  // Rotação suave da câmera em 3ª pessoa ao arrastar o mouse
  if (isThirdPerson && hasDragged) {
    cameraYaw -= dx * 0.005;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.004, -0.15, 1.15);
  }
});

window.addEventListener('pointerup', (e) => {
  if (!isPointerDown) return;
  isPointerDown = false;

  // Ignora se o clique foi em um botão interativo do HUD
  if (e.target && e.target.closest && e.target.closest('#hud-overlay button, .btn-action, #interaction-prompt, a')) {
    return;
  }

  const totalDist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
  const duration = performance.now() - pointerStartTime;

  // Se foi um clique (movimento menor que 8px e tempo menor que 450ms)
  if (totalDist < 8 && duration < 450) {
    // 1. Verifica se o clique do cursor foi no interruptor (botão esquerdo)
    if (e.button === 0) {
      const clickMouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      const switchRay = new THREE.Raycaster();
      switchRay.setFromCamera(clickMouse, camera);
      const switchHits = switchRay.intersectObjects(switchClickables, true);
      if (switchHits.length > 0) {
        toggleLight();
        return;
      }
    }

    // 2. Disparo da Arma de Portais pelo centro da tela
    if (e.button === 0) {
      // Clique Esquerdo -> Portal A (Azul)
      shootPortal('blue');
    } else if (e.button === 2) {
      // Clique Direito -> Portal B (Laranja)
      shootPortal('orange');
    }
  }
});

btnReset.addEventListener('click', () => {
  playerGroup.position.set(0, 1.0, 0);
  velocity.set(0, 0, 0);
  velocityY = 0;
  isGrounded = true;
  playerRotation = 0;
  playerGroup.rotation.y = 0;
  cameraYaw = 0;
  cameraPitch = 0.35;
});

btnCamera.addEventListener('click', () => {
  isThirdPerson = !isThirdPerson;
  orbitControls.enabled = !isThirdPerson;
  if (!isThirdPerson) {
    orbitControls.target.copy(playerGroup.position);
    btnCamera.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      Câmera Livre Ativa
    `;
  } else {
    btnCamera.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
      Alternar Ângulo
    `;
  }
});

// Suporte para clique direto nas teclas virtuais da tela
['w', 'a', 's', 'd'].forEach((k) => {
  const elem = document.getElementById(`key-${k}`);
  if (elem) {
    elem.addEventListener('mousedown', () => updateKeyState(k, true));
    window.addEventListener('mouseup', () => updateKeyState(k, false));
    elem.addEventListener('touchstart', (e) => {
      e.preventDefault();
      updateKeyState(k, true);
    });
    elem.addEventListener('touchend', (e) => {
      e.preventDefault();
      updateKeyState(k, false);
    });
  }
});

// Elementos de Telemetria e HUD da Fase 2
const statXZ = document.getElementById('stat-xz');
const statYSpeed = document.getElementById('stat-y-speed');
const promptKey = document.getElementById('prompt-key');

// --- SISTEMA DE COLISÃO 3D (AABB COM PAREDES DO COMPLEXO E PLATAFORMAS SUBÍVEIS) ---
function checkAndResolveCollisions3D(newPos) {
  let collided = false;
  let collisionMsg = '';

  // 1. Colisão com todas as paredes do complexo (Paredes Externas e Divisórias dos Quartos)
  for (const wall of wallColliders) {
    if (wall.disabled) continue;
    if (
      newPos.x > wall.minX &&
      newPos.x < wall.maxX &&
      newPos.z > wall.minZ &&
      newPos.z < wall.maxZ
    ) {
      collided = true;
      collisionMsg = wall.name;

      const overlapLeft = newPos.x - wall.minX;
      const overlapRight = wall.maxX - newPos.x;
      const overlapTop = newPos.z - wall.minZ;
      const overlapBottom = wall.maxZ - newPos.z;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (minOverlap === overlapLeft) {
        newPos.x = wall.minX;
        velocity.x = 0;
      } else if (minOverlap === overlapRight) {
        newPos.x = wall.maxX;
        velocity.x = 0;
      } else if (minOverlap === overlapTop) {
        newPos.z = wall.minZ;
        velocity.z = 0;
      } else {
        newPos.z = wall.maxZ;
        velocity.z = 0;
      }
    }
  }

  // 2. Colisão com Caixas e Plataformas Escaláveis (Stepping)
  const playerFeetY = newPos.y - 1.0;
  let maxGroundUnderPlayer = 1.0; // Piso padrão Y = 1.0

  for (const box of steppableBoxes) {
    const isOverBoxX = newPos.x > box.minX - PLAYER_RADIUS && newPos.x < box.maxX + PLAYER_RADIUS;
    const isOverBoxZ = newPos.z > box.minZ - PLAYER_RADIUS && newPos.z < box.maxZ + PLAYER_RADIUS;

    if (isOverBoxX && isOverBoxZ) {
      const boxTargetY = box.topY + 1.0;
      if (playerFeetY >= box.topY - 0.38 && velocityY <= 0) {
        if (boxTargetY > maxGroundUnderPlayer) {
          maxGroundUnderPlayer = boxTargetY;
        }
      } else if (playerFeetY < box.topY - 0.05) {
        collided = true;
        collisionMsg = box.name;

        const overlapLeft = newPos.x - (box.minX - PLAYER_RADIUS);
        const overlapRight = (box.maxX + PLAYER_RADIUS) - newPos.x;
        const overlapTop = newPos.z - (box.minZ - PLAYER_RADIUS);
        const overlapBottom = (box.maxZ + PLAYER_RADIUS) - newPos.z;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft) {
          newPos.x = box.minX - PLAYER_RADIUS;
          velocity.x = 0;
        } else if (minOverlap === overlapRight) {
          newPos.x = box.maxX + PLAYER_RADIUS;
          velocity.x = 0;
        } else if (minOverlap === overlapTop) {
          newPos.z = box.minZ - PLAYER_RADIUS;
          velocity.z = 0;
        } else {
          newPos.z = box.maxZ + PLAYER_RADIUS;
          velocity.z = 0;
        }
      }
    }
  }

  return { collided, collisionMsg, targetGroundY: maxGroundUnderPlayer };
}

// --- SISTEMA DE TELETRANSPORTE BIDIRECIONAL ENTRE PORTAIS ---
function checkPortalTeleportation(delta) {
  if (teleportCooldownTimer > 0) {
    teleportCooldownTimer -= delta;
    return;
  }

  if (!activePortals.blue || !activePortals.orange) return;

  const playerPos = playerGroup.position;

  for (const entryKey of ['blue', 'orange']) {
    const exitKey = entryKey === 'blue' ? 'orange' : 'blue';
    const entryPortal = activePortals[entryKey];
    const exitPortal = activePortals[exitKey];

    const distToEntry = playerPos.distanceTo(entryPortal.position);

    // Entrada no raio do portal (~1.15m)
    if (distToEntry < PORTAL_CONFIG.radius + 0.3) {
      // Vetor normal de saída da parede
      const exitNorm = exitPortal.worldNormal.clone();
      const exitPos = exitPortal.position.clone().addScaledVector(exitNorm, PLAYER_RADIUS + 0.55);
      exitPos.y = Math.max(1.0, exitPortal.position.y - 0.2); // Ajusta altura de saída

      playerGroup.position.copy(exitPos);

      // Reorientação da Velocidade: Impulso saindo da normal do portal de saída
      const currentSpeed = Math.hypot(velocity.x, velocity.z);
      const exitSpeed = Math.max(currentSpeed * 1.15, 7.5);
      velocity.x = exitNorm.x * exitSpeed;
      velocity.z = exitNorm.z * exitSpeed;

      // Reorientação da Câmera e do Personagem para encarar a saída do portal
      const exitYaw = Math.atan2(-exitNorm.x, -exitNorm.z);
      cameraYaw = exitYaw;
      playerRotation = exitYaw;
      playerGroup.rotation.y = playerRotation;

      teleportCooldownTimer = 0.5; // Cooldown antiloop

      playTeleportSound();
      createImpactSparks(exitPos, exitNorm, exitKey === 'blue' ? 0x00d2ff : 0xff7b00);

      // Feedback visual no HUD
      if (statCollision) {
        statCollision.textContent = `⚡ Teletransporte via ${entryPortal.wallName}!`;
        statCollision.className = 'stat-value badge-teleporting';
      }
      break;
    }
  }
}

// --- CÂMERA DE TERCEIRA PESSOA ---
const currentCameraPos = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

// Posição inicial da câmera
camera.position.set(0, 4.5, 7.0);
currentCameraPos.copy(camera.position);
currentLookAt.copy(playerGroup.position);
camera.lookAt(playerGroup.position);

// --- LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  // Animação de rotação e flutuação da arma no pedestal (se não coletada)
  if (!hasPortalGun && pedestalGunObj) {
    pedestalGunObj.gunGroup.rotation.y += delta * 1.6;
    pedestalGunObj.gunGroup.position.y = 1.35 + Math.sin(clock.getElapsedTime() * 3.0) * 0.08;
  }

  // Direção de entrada orientada pelo ângulo horizontal da câmera (Yaw)
  const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

  const inputVector = new THREE.Vector3();
  if (keys.w) inputVector.add(forward);
  if (keys.s) inputVector.sub(forward);
  if (keys.a) inputVector.sub(right);
  if (keys.d) inputVector.add(right);

  // Mecânica de Pulo
  if (keys.space && isGrounded) {
    velocityY = JUMP_FORCE;
    isGrounded = false;
    playJumpSound();
    const keySpaceElem = document.getElementById('key-space');
    if (keySpaceElem) keySpaceElem.classList.add('active');
  } else if (!keys.space) {
    const keySpaceElem = document.getElementById('key-space');
    if (keySpaceElem) keySpaceElem.classList.remove('active');
  }

  const isMoving = inputVector.lengthSq() > 0;

  if (isMoving) {
    inputVector.normalize();
    // Aceleração
    velocity.x += inputVector.x * ACCELERATION * delta;
    velocity.z += inputVector.z * ACCELERATION * delta;

    // Limitar velocidade máxima
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (speed > MOVE_SPEED) {
      velocity.x = (velocity.x / speed) * MOVE_SPEED;
      velocity.z = (velocity.z / speed) * MOVE_SPEED;
    }

    // Rotação suave do personagem no sentido da passada
    const targetAngle = Math.atan2(inputVector.x, inputVector.z);
    let angleDiff = targetAngle - playerRotation;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    playerRotation += angleDiff * Math.min(1.0, 14.0 * delta);
    playerGroup.rotation.y = playerRotation;

    // Efeito sutil de caminhada (bobbing) se estiver no chão
    if (isGrounded) {
      walkBobTimer += delta * 12;
      playerBody.position.y = Math.sin(walkBobTimer) * 0.05;
    }
  } else {
    // Atrito quando sem entrada
    velocity.x -= velocity.x * FRICTION * delta;
    velocity.z -= velocity.z * FRICTION * delta;
    if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
    if (Math.abs(velocity.z) < 0.01) velocity.z = 0;
    if (isGrounded) playerBody.position.y = 0;
  }

  // Aplicação da gravidade e velocidade vertical (Y)
  velocityY += GRAVITY * delta;

  // Nova posição pretendida em X, Y, Z
  const newPos = playerGroup.position.clone();
  newPos.x += velocity.x * delta;
  newPos.z += velocity.z * delta;
  newPos.y += velocityY * delta;

  // Verificação de colisão 3D e cálculo do piso
  const collisionResult = checkAndResolveCollisions3D(newPos);
  
  if (newPos.y <= collisionResult.targetGroundY) {
    newPos.y = collisionResult.targetGroundY;
    velocityY = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }

  playerGroup.position.copy(newPos);

  // Verificação de teletransporte entre os portais
  checkPortalTeleportation(delta);

  // Atualizar Câmera
  if (isThirdPerson) {
    const offsetX = cameraDistance * Math.sin(cameraYaw) * Math.cos(cameraPitch);
    const offsetY = cameraDistance * Math.sin(cameraPitch);
    const offsetZ = cameraDistance * Math.cos(cameraYaw) * Math.cos(cameraPitch);

    const targetCameraPos = new THREE.Vector3(
      playerGroup.position.x + offsetX,
      playerGroup.position.y + offsetY + 1.2,
      playerGroup.position.z + offsetZ
    );

    currentCameraPos.lerp(targetCameraPos, Math.min(1.0, 10.0 * delta));
    camera.position.copy(currentCameraPos);

    const lookTarget = playerGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    currentLookAt.lerp(lookTarget, Math.min(1.0, 12.0 * delta));
    camera.lookAt(currentLookAt);
  } else {
    orbitControls.target.copy(playerGroup.position);
    orbitControls.update();
  }

  // Atualização dos dados na interface (HUD da Fase 3)
  const statRoom = document.getElementById('stat-room');
  if (statRoom) {
    let roomName = 'Corredor Central 🏨';
    const px = playerGroup.position.x;
    const pz = playerGroup.position.z;
    if (pz < -3.6) {
      if (px < -10.2) roomName = 'Q.101 (Suíte Presidencial) 👑';
      else if (px < 2.0) roomName = 'Q.102 (Banheiro Luxo) 🛁';
      else roomName = 'Q.103 (Tech Lab) 💻';
    } else if (pz > 3.6) {
      if (px < -14.0) roomName = 'Q.104 (Suíte Botânica) 🌿';
      else if (px < 2.0) roomName = 'Q.105 (Lavabo Serviço) 🚿';
      else roomName = 'Q.106 (Câmara Testes) 🧪';
    }
    statRoom.textContent = roomName;
  }

  // Animação suave de abertura/fechamento das portas 3D
  for (const door of interactiveDoors) {
    door.currentAngle = THREE.MathUtils.lerp(door.currentAngle, door.targetAngle, delta * 7.0);
    door.pivot.rotation.y = door.currentAngle;
  }

  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  if (statXZ) statXZ.textContent = `${playerGroup.position.x.toFixed(2)} / ${playerGroup.position.z.toFixed(2)}`;
  if (statYSpeed) statYSpeed.textContent = `${playerGroup.position.y.toFixed(2)}m • ${currentSpeed.toFixed(1)}m/s`;

  if (collisionResult.collided && teleportCooldownTimer <= 0) {
    statCollision.textContent = `Contato: ${collisionResult.collisionMsg}`;
    statCollision.className = 'stat-value badge-warning';
  } else if (teleportCooldownTimer <= 0) {
    statCollision.textContent = isGrounded ? 'Espaço Livre (Chão)' : 'No Ar (Pulo)';
    statCollision.className = 'stat-value badge-safe';
  }

  // Interpolação suave das luzes
  const targetAmbient = isLightOn ? LIGHT_CONFIG.ambientOn : LIGHT_CONFIG.ambientOff;
  const targetHemi = isLightOn ? LIGHT_CONFIG.hemiOn : LIGHT_CONFIG.hemiOff;
  const targetDir = isLightOn ? LIGHT_CONFIG.dirOn : LIGHT_CONFIG.dirOff;
  const targetCeiling = isLightOn ? LIGHT_CONFIG.ceilingOn : LIGHT_CONFIG.ceilingOff;
  const targetPlayer = isLightOn ? LIGHT_CONFIG.playerOn : LIGHT_CONFIG.playerOff;

  ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbient, delta * 7.0);
  hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, targetHemi, delta * 7.0);
  dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, targetDir, delta * 7.0);
  centerCeilingLight.intensity = THREE.MathUtils.lerp(centerCeilingLight.intensity, targetCeiling, delta * 7.0);
  playerLight.intensity = THREE.MathUtils.lerp(playerLight.intensity, targetPlayer, delta * 7.0);

  const targetBgColor = isLightOn ? new THREE.Color(0x0a0e17) : new THREE.Color(0x020408);
  scene.background.lerp(targetBgColor, delta * 6.0);
  scene.fog.color.lerp(targetBgColor, delta * 6.0);

  // Rotação do anel holográfico do interruptor
  holoGroup.rotation.z += delta * 1.5;
  holoGroup.position.y = 0.52 + Math.sin(clock.getElapsedTime() * 3.0) * 0.03;

  // Verificação de proximidade do interruptor, pedestal e portas
  const distToSwitch = playerGroup.position.distanceTo(SWITCH_POS);
  const distToPedestal = playerGroup.position.distanceTo(PEDESTAL_POS);

  let nearDoor = null;
  for (const door of interactiveDoors) {
    const dist = playerGroup.position.distanceTo(new THREE.Vector3(door.x, 1.0, door.z));
    if (dist < 2.5) {
      nearDoor = door;
      break;
    }
  }

  if (nearDoor) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptKey) promptKey.textContent = 'E';
    if (promptText) promptText.textContent = nearDoor.isOpen ? `Fechar Porta ${nearDoor.roomNumber} (${nearDoor.name}) (E)` : `Abrir Porta ${nearDoor.roomNumber} (${nearDoor.name}) (E)`;
  } else if (!hasPortalGun && distToPedestal < 2.5) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptKey) promptKey.textContent = 'E';
    if (promptText) promptText.textContent = 'Coletar Arma de Portais (E)';
    if (distToPedestal < 1.35) {
      pickUpPortalGun();
    }
  } else if (distToSwitch < INTERACTION_DISTANCE) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptKey) promptKey.textContent = 'E';
    updatePromptText();
    holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, 1.0, delta * 8.0);
  } else {
    if (interactionPrompt) interactionPrompt.classList.add('hidden');
    holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, 0.4, delta * 4.0);
  }

  // --- ANIMAÇÃO DOS PORTAIS ATIVOS (FASE 1) ---
  for (const key of ['blue', 'orange']) {
    const portal = activePortals[key];
    if (portal) {
      // Efeito de abertura elástica suave (spawn ease-out back)
      if (portal.spawnProgress < 1.0) {
        portal.spawnProgress += delta * 4.5;
        if (portal.spawnProgress > 1.0) portal.spawnProgress = 1.0;
        const s = portal.spawnProgress;
        const scaleVal = 1 + 2.4 * Math.pow(s - 1, 3) + 1.4 * Math.pow(s - 1, 2);
        portal.group.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // Rotação dos arcos tecnológicos e do vórtice quântico
      if (portal.energyArcs) {
        portal.energyArcs.rotation.z += (key === 'blue' ? 1.4 : -1.4) * delta;
      }
      if (portal.vortexMesh) {
        portal.vortexMesh.rotation.z -= (key === 'blue' ? 0.7 : -0.7) * delta;
      }

      // Pulsação sutil da luz do portal
      const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 4.0 + (key === 'blue' ? 0 : Math.PI)) * 0.15;
      if (portal.light) {
        portal.light.intensity = 1.8 * pulse;
      }
    }
  }

  // Atualização dos efeitos visuais temporários (feixe de plasma e faíscas)
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    const eff = activeEffects[i];
    eff.elapsed += delta;
    eff.update(eff.elapsed);
    if (eff.elapsed >= eff.duration) {
      eff.dispose();
      activeEffects.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// Redimensionamento responsivo
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicia animação
animate();

// Exporta referências para testes ou automação no console
window.__OFFICE_3D__ = {
  scene,
  camera,
  playerGroup,
  velocity,
  BOUNDS,
  SWITCH_POS,
  toggleLight,
  isLightOn: () => isLightOn,
  setKey: (k, v) => updateKeyState(k, v),
  isThirdPerson: () => isThirdPerson,
  activePortals,
  shootPortal,
  removePortal,
  clearAllPortals,
  portalWallMeshes,
};
