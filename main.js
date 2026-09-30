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

// 1. Chão com textura de grade procedimental gerada dinamicamente
function createGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base escura
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  // Azulejos com borda sutil
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 504);

  // Grade interna fina
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let i = 64; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Pontos de junção tecnológicos
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  for (let x = 64; x < 512; x += 128) {
    for (let y = 64; y < 512; y += 128) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

const floorTexture = createGridTexture();
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.65,
  metalness: 0.15,
});

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(ROOM_WIDTH, 0.4, ROOM_DEPTH),
  floorMaterial
);
floor.position.y = -0.2;
floor.receiveShadow = true;
scene.add(floor);

// GridHelper decorativo sobre o piso para reforçar a noção espacial
const gridHelper = new THREE.GridHelper(ROOM_WIDTH, 24, 0x38bdf8, 0x1e293b);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// 2. Paredes
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e2638,
  roughness: 0.85,
  metalness: 0.1,
});

const trimMaterial = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  emissive: 0x0284c7,
  emissiveIntensity: 0.4,
  roughness: 0.3,
  metalness: 0.5,
});

const wallsGroup = new THREE.Group();

function createWall(w, h, d, x, y, z) {
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
  wallMesh.position.set(x, y, z);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  wallsGroup.add(wallMesh);

  // Rodapé decorativo com leve emissão (baseboard neon sutil)
  const trimHeight = 0.15;
  const trimDepth = d === WALL_THICKNESS ? WALL_THICKNESS + 0.04 : d;
  const trimWidth = w === WALL_THICKNESS ? WALL_THICKNESS + 0.04 : w;
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(trimWidth, trimHeight, trimDepth),
    trimMaterial
  );
  trim.position.set(x, trimHeight / 2, z);
  wallsGroup.add(trim);
}

// Parede Norte (Z negativo)
createWall(ROOM_WIDTH, WALL_HEIGHT, WALL_THICKNESS, 0, WALL_HEIGHT / 2, -ROOM_DEPTH / 2);
// Parede Sul (Z positivo)
createWall(ROOM_WIDTH, WALL_HEIGHT, WALL_THICKNESS, 0, WALL_HEIGHT / 2, ROOM_DEPTH / 2);
// Parede Oeste (X negativo)
createWall(WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH, -ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);
// Parede Leste (X positivo)
createWall(WALL_THICKNESS, WALL_HEIGHT, ROOM_DEPTH, ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0);

scene.add(wallsGroup);

// Adicionar 2 pilares/obstáculos internos para enriquecer o cenário e testes de colisão
const obstacles = [];
function createObstacle(x, z, sizeX = 1.4, sizeZ = 1.4) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sizeX, 3.2, sizeZ),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.2,
    })
  );
  mesh.position.set(x, 1.6, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Anel luminoso no pilar
  const ring = new THREE.Mesh(
    new THREE.BoxGeometry(sizeX + 0.05, 0.1, sizeZ + 0.05),
    trimMaterial
  );
  ring.position.set(x, 2.6, z);
  scene.add(ring);

  obstacles.push({
    minX: x - sizeX / 2 - PLAYER_RADIUS,
    maxX: x + sizeX / 2 + PLAYER_RADIUS,
    minZ: z - sizeZ / 2 - PLAYER_RADIUS,
    maxZ: z + sizeZ / 2 + PLAYER_RADIUS,
  });
}

createObstacle(-5.5, -4.5);
createObstacle(5.5, 4.5);

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

// Visor (para indicar a direção para onde o personagem está olhando)
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

// Mochila tecnológica / Mochila propulsora nas costas
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

// Luz suave sob o jogador (cria contraste agradável no chão)
const playerLight = new THREE.PointLight(0x38bdf8, 0.8, 4);
playerLight.position.set(0, -0.4, 0);
playerGroup.add(playerLight);

scene.add(playerGroup);

// --- SISTEMA DE MOVIMENTAÇÃO E FÍSICA ---
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

const velocity = new THREE.Vector3();
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
  if (key === 'e') {
    const dist = playerGroup.position.distanceTo(SWITCH_POS);
    if (dist < INTERACTION_DISTANCE) {
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

// Interação com mouse (Raycaster para clicar diretamente no interruptor)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const switchClickables = [switchPlate, switchFrame, switchRocker, switchLed, holoRing, bulbIcon];

window.addEventListener('pointerdown', (e) => {
  if (e.target && e.target.closest && e.target.closest('#hud-overlay')) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(switchClickables, true);
  if (hits.length > 0) {
    toggleLight();
  }
});

btnReset.addEventListener('click', () => {
  playerGroup.position.set(0, 1.0, 0);
  velocity.set(0, 0, 0);
  playerRotation = 0;
  playerGroup.rotation.y = 0;
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

// --- SISTEMA DE COLISÃO ---
function checkAndResolveCollisions(newPos) {
  let collided = false;
  let collisionMsg = '';

  // 1. Colisão com as 4 paredes da sala
  if (newPos.x < BOUNDS.minX) {
    newPos.x = BOUNDS.minX;
    velocity.x = 0;
    collided = true;
    collisionMsg = 'Parede Oeste';
  } else if (newPos.x > BOUNDS.maxX) {
    newPos.x = BOUNDS.maxX;
    velocity.x = 0;
    collided = true;
    collisionMsg = 'Parede Leste';
  }

  if (newPos.z < BOUNDS.minZ) {
    newPos.z = BOUNDS.minZ;
    velocity.z = 0;
    collided = true;
    collisionMsg = collisionMsg ? `${collisionMsg} e Norte` : 'Parede Norte';
  } else if (newPos.z > BOUNDS.maxZ) {
    newPos.z = BOUNDS.maxZ;
    velocity.z = 0;
    collided = true;
    collisionMsg = collisionMsg ? `${collisionMsg} e Sul` : 'Parede Sul';
  }

  // 2. Colisão com obstáculos internos
  for (const obs of obstacles) {
    if (
      newPos.x > obs.minX &&
      newPos.x < obs.maxX &&
      newPos.z > obs.minZ &&
      newPos.z < obs.maxZ
    ) {
      collided = true;
      collisionMsg = 'Obstáculo Central';

      // Encontrar a menor penetração para empurrar o jogador para fora
      const overlapLeft = newPos.x - obs.minX;
      const overlapRight = obs.maxX - newPos.x;
      const overlapTop = newPos.z - obs.minZ;
      const overlapBottom = obs.maxZ - newPos.z;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (minOverlap === overlapLeft) {
        newPos.x = obs.minX;
        velocity.x = 0;
      } else if (minOverlap === overlapRight) {
        newPos.x = obs.maxX;
        velocity.x = 0;
      } else if (minOverlap === overlapTop) {
        newPos.z = obs.minZ;
        velocity.z = 0;
      } else {
        newPos.z = obs.maxZ;
        velocity.z = 0;
      }
    }
  }

  return { collided, collisionMsg };
}

// --- CÂMERA DE TERCEIRA PESSOA ---
// Offset padrão: atrás (+Z) e acima (+Y)
const CAMERA_OFFSET = new THREE.Vector3(0, 4.2, 6.8);
const currentCameraPos = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

// Posição inicial da câmera
camera.position.copy(playerGroup.position).add(CAMERA_OFFSET);
currentCameraPos.copy(camera.position);
currentLookAt.copy(playerGroup.position);
camera.lookAt(playerGroup.position);

// --- LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  // Direção de entrada
  const inputVector = new THREE.Vector3();
  if (keys.w) inputVector.z -= 1;
  if (keys.s) inputVector.z += 1;
  if (keys.a) inputVector.x -= 1;
  if (keys.d) inputVector.x += 1;

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

    // Calcular rotação do personagem para encarar o sentido do movimento
    const targetAngle = Math.atan2(inputVector.x, inputVector.z);
    // Suavização angular (interpolação esférica simplificada)
    let angleDiff = targetAngle - playerRotation;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    playerRotation += angleDiff * Math.min(1.0, 14.0 * delta);
    playerGroup.rotation.y = playerRotation;

    // Efeito sutil de caminhada (bobbing)
    walkBobTimer += delta * 12;
    playerBody.position.y = Math.sin(walkBobTimer) * 0.05;
  } else {
    // Atrito quando sem entrada
    velocity.x -= velocity.x * FRICTION * delta;
    velocity.z -= velocity.z * FRICTION * delta;
    if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
    if (Math.abs(velocity.z) < 0.01) velocity.z = 0;
    playerBody.position.y = 0;
  }

  // Nova posição pretendida
  const newPos = playerGroup.position.clone();
  newPos.x += velocity.x * delta;
  newPos.z += velocity.z * delta;

  // Verificação de colisão
  const collisionResult = checkAndResolveCollisions(newPos);
  playerGroup.position.copy(newPos);

  // Manter Y fixo em 1.0 (evita cair no limbo)
  playerGroup.position.y = 1.0;

  // Atualizar Câmera
  if (isThirdPerson) {
    // Alvo desejado da câmera em terceira pessoa
    const targetCameraPos = playerGroup.position.clone().add(CAMERA_OFFSET);
    // Suavização suave (lerp) para sensação de jogo premium
    currentCameraPos.lerp(targetCameraPos, Math.min(1.0, 8.0 * delta));
    camera.position.copy(currentCameraPos);

    // Câmera olha suavemente para a altura do peito do personagem
    const lookTarget = playerGroup.position.clone().add(new THREE.Vector3(0, 0.8, 0));
    currentLookAt.lerp(lookTarget, Math.min(1.0, 10.0 * delta));
    camera.lookAt(currentLookAt);
  } else {
    orbitControls.target.copy(playerGroup.position);
    orbitControls.update();
  }

  // Atualização dos dados na interface (HUD)
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  statX.textContent = playerGroup.position.x.toFixed(2);
  statZ.textContent = playerGroup.position.z.toFixed(2);
  statSpeed.textContent = `${currentSpeed.toFixed(1)} m/s`;

  if (collisionResult.collided) {
    statCollision.textContent = `Contato: ${collisionResult.collisionMsg}`;
    statCollision.className = 'stat-value badge-warning';
  } else {
    statCollision.textContent = 'Espaço Livre';
    statCollision.className = 'stat-value badge-safe';
  }

  // Interpolação suave e contínua das luzes
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

  // Escurecimento suave do fundo e neblina da cena
  const targetBgColor = isLightOn ? new THREE.Color(0x0a0e17) : new THREE.Color(0x020408);
  scene.background.lerp(targetBgColor, delta * 6.0);
  scene.fog.color.lerp(targetBgColor, delta * 6.0);

  // Rotação suave do anel holográfico sobre o interruptor
  holoGroup.rotation.z += delta * 1.5;
  holoGroup.position.y = 0.52 + Math.sin(clock.getElapsedTime() * 3.0) * 0.03;

  // Verificação de proximidade do interruptor
  const distToSwitch = playerGroup.position.distanceTo(SWITCH_POS);
  const isNear = distToSwitch < INTERACTION_DISTANCE;
  if (isNear) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    updatePromptText();
    holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, 1.0, delta * 8.0);
  } else {
    if (interactionPrompt) interactionPrompt.classList.add('hidden');
    holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, 0.4, delta * 4.0);
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
};
