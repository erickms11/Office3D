import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { assetManager } from './AssetManager.js';

// --- CONFIGURAÇÃO E CONSTANTES DO HOTEL ---
const ROOM_WIDTH = 60;
const ROOM_DEPTH = 48;
const WALL_HEIGHT = 4.8;
const WALL_THICKNESS = 0.6;
const PLAYER_RADIUS = 0.55;

// Limits seguros da cena
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
scene.fog = new THREE.FogExp2(0x0a0e17, 0.002);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// --- AUDIO LISTENER ---
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
container.appendChild(renderer.domElement);

// Controles Orbitais
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.06;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.minDistance = 3;
orbitControls.maxDistance = 22;
orbitControls.enabled = false;

let isThirdPerson = true;

// --- EFEITOS SONOROS SINTETIZADOS VIA WEB AUDIO API ---
// Desativado temporariamente conforme feedback
const AUDIO_ENABLED = true; // Habilitando para testar se o travamento parou

let globalAudioCtx = null;
function getAudioContext() {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return globalAudioCtx;
}

// --- HELPER PARA TOCAR ARQUIVOS DE ÁUDIO (.mp3, .ogg) ---
function playBetterAudio(key) {
  const buffer = assetManager.getSoundBuffer(key);
  if (buffer && typeof audioListener !== 'undefined') {
    try {
      const sound = new THREE.Audio(audioListener);
      sound.setBuffer(buffer);
      sound.setVolume(0.5);
      sound.play();
      return true;
    } catch (e) {
      console.warn("Erro ao tocar áudio: ", e);
    }
  }
  return false;
}

function playSwitchSound(state) {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('switch')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playDoorSound(isOpen) {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('door')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playJumpSound() {
  if (selectedCharacter === 'jane') playPlayerAnim('jump', 0.1);
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('jump')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playKeySound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('key')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playLockedSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('locked')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playVictorySound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('victory')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playGunshotSound(weaponType) {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('gunshot')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playReloadSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('reload')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playDryFireSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('dryfire')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playAmmoPickupSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('ammo')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playHurtSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('hurt')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playHealSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('heal')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playZombieHitSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('zombie_hit')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playZombieGroanSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('zombie_groan')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playZombieDeathSound(isBoss = false) {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('zombie_death')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

function playBossRoarSound() {
  if (!AUDIO_ENABLED) return;
  if (playBetterAudio('boss_roar')) return;
  // Fallback sintetizado desativado para evitar travadas
  return;
}

// --- SISTEMA DE ILUMINAÇÃO GERAL E POR AMBIENTE ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.08);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff5ea, 0.18);
dirLight.position.set(15, 22, 12);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
const d = 25;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0004;
scene.add(dirLight);

// Luzes de Efeito de Combate (Pré-alocadas na cena com intensidade zero para evitar recompilação de shaders)
const combatFlashLight = new THREE.PointLight(0xfacc15, 0.0, 9.0);
scene.add(combatFlashLight);

const combatImpactLight = new THREE.PointLight(0xef4444, 0.0, 6.0);
scene.add(combatImpactLight);

// Dicionário de Ambientes e Iluminação por Sala
const roomEnvironments = {};
const switchClickables = [];

function registerRoomEnvironment(id, name, baseColor) {
  roomEnvironments[id] = {
    id,
    name,
    isLit: false,
    lights: [],
    lampMats: [],
    switchGroup: null,
    rocker: null,
    ledMat: null,
    ledLight: null,
    holoMat: null,
    baseColor,
  };
}

registerRoomEnvironment('corridor', 'Corredor Central', 0x38bdf8);
registerRoomEnvironment('q101', 'Q.101 (Suíte Presidencial)', 0xf59e0b);
registerRoomEnvironment('q102', 'Q.102 (Banheiro Luxo)', 0x06b6d4);
registerRoomEnvironment('q103', 'Q.103 (Tech Lab)', 0xa855f7);
registerRoomEnvironment('q104', 'Q.104 (Suíte Botânica)', 0x84cc16);
registerRoomEnvironment('q105', 'Q.105 (Lavabo Serviço)', 0xfef08a);
registerRoomEnvironment('q106', 'Q.106 (Câmara Testes)', 0xf8fafc);

function toggleRoomEnvironmentLight(envId, forceState) {
  const env = roomEnvironments[envId];
  if (!env) return;

  env.isLit = typeof forceState === 'boolean' ? forceState : !env.isLit;
  playSwitchSound(env.isLit);

  if (env.rocker) {
    env.rocker.rotation.x = env.isLit ? -0.22 : 0.22;
  }
  if (env.ledMat) {
    const col = env.isLit ? 0x22c55e : 0xef4444;
    env.ledMat.color.setHex(col);
    env.ledMat.emissive.setHex(col);
  }
  if (env.ledLight) {
    env.ledLight.color.setHex(env.isLit ? 0x22c55e : 0xef4444);
    env.ledLight.intensity = env.isLit ? 0.3 : 1.2;
  }
  if (env.holoMat) {
    env.holoMat.color.setHex(env.isLit ? env.baseColor : 0xf59e0b);
  }

  updateHUDLightStat();
}

function addLightToEnvironment(envId, lightObject, maxIntensity) {
  if (roomEnvironments[envId]) {
    lightObject.decay = 1.0;
    lightObject.userData.maxIntensity = maxIntensity;
    lightObject.intensity = 0.0;
    roomEnvironments[envId].lights.push(lightObject);
    scene.add(lightObject);
  }
}

function createCeilingLamp(envId, x, y, z, color) {
  const lampGroup = new THREE.Group();
  lampGroup.position.set(x, y, z);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.1, 24), baseMat);
  lampGroup.add(baseMesh);

  const lensMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.0,
    roughness: 0.1,
  });
  const lensMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), lensMat);
  lensMesh.position.y = -0.06;
  lampGroup.add(lensMesh);

  scene.add(lampGroup);

  if (roomEnvironments[envId]) {
    roomEnvironments[envId].lampMats.push(lensMat);
  }
}

// --- CONSTRUTOR DE INTERRUPTOR FIXADO NA PAREDE ---
function createWallSwitch(envId, x, y, z, rotationY, labelText) {
  const env = roomEnvironments[envId];
  const switchGroup = new THREE.Group();
  switchGroup.position.set(x, y, z);
  switchGroup.rotation.y = rotationY;

  const switchPlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.7 });
  const switchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.54, 0.04), switchPlateMat);
  switchPlate.castShadow = true; switchPlate.receiveShadow = true;
  switchGroup.add(switchPlate);
  switchClickables.push(switchPlate);

  const switchFrameMat = new THREE.MeshStandardMaterial({ color: env ? env.baseColor : 0x38bdf8, roughness: 0.2, metalness: 0.9 });
  const switchFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.58, 0.015), switchFrameMat);
  switchFrame.position.z = -0.01;
  switchGroup.add(switchFrame);
  switchClickables.push(switchFrame);

  const rockerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
  const switchRocker = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.04), rockerMat);
  switchRocker.position.set(0, 0, 0.025);
  switchRocker.rotation.x = 0.22;
  switchRocker.castShadow = true;
  switchGroup.add(switchRocker);
  switchClickables.push(switchRocker);

  const ledGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16);
  ledGeo.rotateX(Math.PI / 2);
  const switchLedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0, roughness: 0.2 });
  const switchLed = new THREE.Mesh(ledGeo, switchLedMat);
  switchLed.position.set(0, 0.18, 0.025);
  switchGroup.add(switchLed);
  switchClickables.push(switchLed);

  const switchLedLight = new THREE.PointLight(0xef4444, 1.1, 2.5);
  switchLedLight.position.set(0, 0.18, 0.06);
  switchGroup.add(switchLedLight);

  const holoGroup = new THREE.Group();
  holoGroup.position.set(0, 0.48, 0.08);
  const holoMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const holoRing = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 24), holoMat);
  holoGroup.add(holoRing);
  switchClickables.push(holoRing);

  const bulbIconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const bulbIcon = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), bulbIconMat);
  holoGroup.add(bulbIcon);
  switchGroup.add(holoGroup);

  switchGroup.userData = { envId, labelText };
  scene.add(switchGroup);

  if (env) {
    env.switchGroup = switchGroup;
    env.rocker = switchRocker;
    env.ledMat = switchLedMat;
    env.ledLight = switchLedLight;
    env.holoMat = holoMat;
  }

  return switchGroup;
}

// 1. Corredor Central (4 Luminárias de Teto)
for (let x = -22; x <= 22; x += 11) {
  createCeilingLamp('corridor', x, WALL_HEIGHT - 0.05, 0, 0x38bdf8);
  const pl = new THREE.PointLight(0x38bdf8, 12.0, 50);
  pl.position.set(x, WALL_HEIGHT - 0.4, 0);
  addLightToEnvironment('corridor', pl, 12.0);
}
createWallSwitch('corridor', -2.5, 1.65, -3.32, 0, 'Luz do Corredor');

// 2. Q.101 Suíte Presidencial
createCeilingLamp('q101', -23.0, WALL_HEIGHT - 0.05, -13.8, 0xf59e0b);
createCeilingLamp('q101', -14.0, WALL_HEIGHT - 0.05, -13.8, 0xf59e0b);
const q101Light1 = new THREE.PointLight(0xf59e0b, 16.0, 60);
q101Light1.position.set(-21.0, WALL_HEIGHT - 0.4, -13.8);
addLightToEnvironment('q101', q101Light1, 16.0);
const q101Light2 = new THREE.PointLight(0xf59e0b, 14.0, 55);
q101Light2.position.set(-14.0, WALL_HEIGHT - 0.4, -13.8);
addLightToEnvironment('q101', q101Light2, 14.0);
createWallSwitch('q101', -13.5, 1.65, -3.88, Math.PI, 'Luz Q.101');

// 3. Q.102 Banheiro Luxo
createCeilingLamp('q102', -6.0, WALL_HEIGHT - 0.05, -13.8, 0x06b6d4);
const q102Light = new THREE.PointLight(0x06b6d4, 15.0, 50);
q102Light.position.set(-6.0, WALL_HEIGHT - 0.4, -13.8);
addLightToEnvironment('q102', q102Light, 15.0);
createWallSwitch('q102', -1.5, 1.65, -3.88, Math.PI, 'Luz Q.102');

// 4. Q.103 Tech Lab
createCeilingLamp('q103', 7.0, WALL_HEIGHT - 0.05, -11.8, 0xa855f7);
const q103Light1 = new THREE.PointLight(0xa855f7, 16.0, 60);
q103Light1.position.set(7.0, WALL_HEIGHT - 0.4, -11.8);
addLightToEnvironment('q103', q103Light1, 16.0);
createCeilingLamp('q103', 21.0, WALL_HEIGHT - 0.05, -16.0, 0x38bdf8);
const q103Light2 = new THREE.PointLight(0x38bdf8, 15.0, 55);
q103Light2.position.set(21.0, WALL_HEIGHT - 0.4, -16.0);
addLightToEnvironment('q103', q103Light2, 15.0);
createWallSwitch('q103', 14.5, 1.65, -3.88, Math.PI, 'Luz Q.103');

// 5. Q.104 Suíte Botânica
createCeilingLamp('q104', -24.0, WALL_HEIGHT - 0.05, 11.8, 0x84cc16);
createCeilingLamp('q104', -16.0, WALL_HEIGHT - 0.05, 11.8, 0x84cc16);
const q104Light1 = new THREE.PointLight(0x84cc16, 16.0, 60);
q104Light1.position.set(-22.0, WALL_HEIGHT - 0.4, 11.8);
addLightToEnvironment('q104', q104Light1, 16.0);
const q104Light2 = new THREE.PointLight(0x84cc16, 14.0, 55);
q104Light2.position.set(-16.0, WALL_HEIGHT - 0.4, 11.8);
addLightToEnvironment('q104', q104Light2, 14.0);
createWallSwitch('q104', -16.5, 1.65, 3.88, 0, 'Luz Q.104');

// 6. Q.105 Lavabo
createCeilingLamp('q105', -11.0, WALL_HEIGHT - 0.05, 11.8, 0xfef08a);
const q105Light = new THREE.PointLight(0xfef08a, 14.0, 48);
q105Light.position.set(-11.0, WALL_HEIGHT - 0.4, 11.8);
addLightToEnvironment('q105', q105Light, 14.0);
createWallSwitch('q105', -6.5, 1.65, 3.88, 0, 'Luz Q.105');

// 7. Q.106 Câmara Testes
createCeilingLamp('q106', 9.0, WALL_HEIGHT - 0.05, 12.8, 0xf8fafc);
createCeilingLamp('q106', 22.0, WALL_HEIGHT - 0.05, 12.8, 0xf8fafc);
const q106Light1 = new THREE.PointLight(0xf8fafc, 18.0, 65);
q106Light1.position.set(9.0, WALL_HEIGHT - 0.4, 12.8);
addLightToEnvironment('q106', q106Light1, 18.0);
const q106Light2 = new THREE.PointLight(0xf8fafc, 16.0, 60);
q106Light2.position.set(22.0, WALL_HEIGHT - 0.4, 12.8);
addLightToEnvironment('q106', q106Light2, 16.0);
createWallSwitch('q106', 18.5, 1.65, 3.88, 0, 'Luz Q.106');

// --- TEXTURAS PROCEDIMENTAIS DE PISO ---
function createGridTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 504, 504);
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5); return texture;
}
function createWoodParquetTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#1c1917'; ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 128) {
      const isAlt = (y / 64) % 2 === 0; const posX = isAlt ? x : (x + 64) % 512;
      ctx.fillStyle = (x + y) % 128 === 0 ? '#44403c' : '#292524'; ctx.fillRect(posX + 2, y + 2, 124, 60);
    }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5); return texture;
}
function createMarbleTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 120); ctx.bezierCurveTo(140, 200, 280, 50, 512, 380); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5); return texture;
}
function createBathroomTileTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; ctx.lineWidth = 3;
  for (let i = 64; i < 512; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2); return texture;
}
function createCorridorCarpetTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.fillRect(236, 0, 40, 512);
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(12, 2); return texture;
}

// --- PISOS DOS QUARTOS E CORREDOR ---
const floorGroup = new THREE.Group();

const corridorFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 7.2), new THREE.MeshStandardMaterial({ map: createCorridorCarpetTexture(), roughness: 0.6 }));
corridorFloor.position.set(0, -0.2, 0); corridorFloor.receiveShadow = true; floorGroup.add(corridorFloor);

const q101Floor = new THREE.Mesh(new THREE.BoxGeometry(19.8, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createMarbleTexture(), roughness: 0.3 }));
q101Floor.position.set(-20.1, -0.2, -13.8); q101Floor.receiveShadow = true; floorGroup.add(q101Floor);

const q102Floor = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createBathroomTileTexture(), roughness: 0.2 }));
q102Floor.position.set(-4.1, -0.2, -13.8); q102Floor.receiveShadow = true; floorGroup.add(q102Floor);

const q103Floor = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createGridTexture(), roughness: 0.5 }));
q103Floor.position.set(16.0, -0.2, -13.8); q103Floor.receiveShadow = true; floorGroup.add(q103Floor);

const q104Floor = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createWoodParquetTexture(), roughness: 0.7 }));
q104Floor.position.set(-22.0, -0.2, 13.8); q104Floor.receiveShadow = true; floorGroup.add(q104Floor);

const q105Floor = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createBathroomTileTexture(), roughness: 0.3 }));
q105Floor.position.set(-6.0, -0.2, 13.8); q105Floor.receiveShadow = true; floorGroup.add(q105Floor);

const q106Floor = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.4, 20.4), new THREE.MeshStandardMaterial({ map: createGridTexture(), roughness: 0.3 }));
q106Floor.position.set(16.0, -0.2, 13.8); q106Floor.receiveShadow = true; floorGroup.add(q106Floor);

scene.add(floorGroup);

const gridHelper = new THREE.GridHelper(60, 30, 0x38bdf8, 0x1e293b);
gridHelper.position.set(0, 0.005, 0);
scene.add(gridHelper);

// --- ESTRUTURA DE PAREDES COM ABERTURA REAL PARA AS PORTAS ---
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1e2638, roughness: 0.85, metalness: 0.1 });
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });

const wallsGroup = new THREE.Group();
const wallColliders = [];

function createWallSegment(w, h, d, x, y, z, wallName) {
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
  wallMesh.position.set(x, y, z);
  wallMesh.castShadow = true; wallMesh.receiveShadow = true;
  wallsGroup.add(wallMesh);

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

// Parede Leste Hotel dividida para permitir o Portão de Saída Mestre
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 21.5, 30.0, WALL_HEIGHT / 2, -13.25, 'Parede Leste Norte Hotel');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 21.5, 30.0, WALL_HEIGHT / 2, 13.25, 'Parede Leste Sul Hotel');

// Divisórias Verticais Entre Quartos
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 20.4, -10.2, WALL_HEIGHT / 2, -13.8, 'Divisória Q101/Q102');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 20.4, 2.0, WALL_HEIGHT / 2, -13.8, 'Divisória Q102/Q103');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 20.4, -14.0, WALL_HEIGHT / 2, 13.8, 'Divisória Q104/Q105');
createWallSegment(WALL_THICKNESS, WALL_HEIGHT, 20.4, 2.0, WALL_HEIGHT / 2, 13.8, 'Divisória Q105/Q106');

// Paredes do Corredor Norte (Z = -3.6)
createWallSegment(9.6, WALL_HEIGHT, WALL_THICKNESS, -25.2, WALL_HEIGHT / 2, -3.6, 'Parede Q101 Esq');
createWallSegment(7.4, WALL_HEIGHT, WALL_THICKNESS, -13.9, WALL_HEIGHT / 2, -3.6, 'Parede Q101 Dir');
createWallSegment(2.8, WALL_HEIGHT, WALL_THICKNESS, -8.8, WALL_HEIGHT / 2, -3.6, 'Parede Q102 Esq');
createWallSegment(6.6, WALL_HEIGHT, WALL_THICKNESS, -1.3, WALL_HEIGHT / 2, -3.6, 'Parede Q102 Dir');
createWallSegment(5.6, WALL_HEIGHT, WALL_THICKNESS, 4.8, WALL_HEIGHT / 2, -3.6, 'Parede Q103 Esq');
createWallSegment(19.6, WALL_HEIGHT, WALL_THICKNESS, 20.2, WALL_HEIGHT / 2, -3.6, 'Parede Q103 Dir');

// Paredes do Corredor Sul (Z = 3.6)
createWallSegment(7.6, WALL_HEIGHT, WALL_THICKNESS, -26.2, WALL_HEIGHT / 2, 3.6, 'Parede Q104 Esq');
createWallSegment(5.6, WALL_HEIGHT, WALL_THICKNESS, -16.8, WALL_HEIGHT / 2, 3.6, 'Parede Q104 Dir');
createWallSegment(1.6, WALL_HEIGHT, WALL_THICKNESS, -13.2, WALL_HEIGHT / 2, 3.6, 'Parede Q105 Esq');
createWallSegment(11.6, WALL_HEIGHT, WALL_THICKNESS, -3.8, WALL_HEIGHT / 2, 3.6, 'Parede Q105 Dir');
createWallSegment(9.6, WALL_HEIGHT, WALL_THICKNESS, 6.8, WALL_HEIGHT / 2, 3.6, 'Parede Q106 Esq');
createWallSegment(15.6, WALL_HEIGHT, WALL_THICKNESS, 22.2, WALL_HEIGHT / 2, 3.6, 'Parede Q106 Dir');

scene.add(wallsGroup);

// --- SISTEMA DE NÉVOA / OBSCURIDADE SOBRE QUARTOS TRANCADOS ---
const roomFogObjects = {};

function createRoomFogShroud(envId, x, y, z, w, h, d, doorX, doorZ, tintColor) {
  const fogGroup = new THREE.Group();

  const fogMat = new THREE.MeshBasicMaterial({
    color: tintColor || 0x060913,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const fogMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fogMat);
  fogMesh.position.set(x, y, z);
  fogGroup.add(fogMesh);

  const barrierMat = new THREE.MeshBasicMaterial({
    color: tintColor || 0x060913,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const barrierMesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.5), barrierMat);
  barrierMesh.position.set(doorX, 1.6, doorZ);
  fogGroup.add(barrierMesh);

  scene.add(fogGroup);

  const fogObj = {
    envId,
    group: fogGroup,
    fogMat,
    barrierMat,
    targetOpacity: 0.96,
    isCleared: false,
  };

  roomFogObjects[envId] = fogObj;
  return fogObj;
}

createRoomFogShroud('q102', -4.1, WALL_HEIGHT / 2, -13.8, 11.8, WALL_HEIGHT - 0.2, 19.8, -6.0, -3.6, 0x031824);
createRoomFogShroud('q103', 16.0, WALL_HEIGHT / 2, -13.8, 27.4, WALL_HEIGHT - 0.2, 19.8, 9.0, -3.6, 0x160424);
createRoomFogShroud('q104', -22.0, WALL_HEIGHT / 2, 13.8, 15.4, WALL_HEIGHT - 0.2, 19.8, -21.0, 3.6, 0x081c04);
createRoomFogShroud('q105', -6.0, WALL_HEIGHT / 2, 13.8, 15.4, WALL_HEIGHT - 0.2, 19.8, -11.0, 3.6, 0x1f1a04);
createRoomFogShroud('q106', 16.0, WALL_HEIGHT / 2, 13.8, 27.4, WALL_HEIGHT - 0.2, 19.8, 13.0, 3.6, 0x121624);

function clearRoomFog(envId) {
  const fogObj = roomFogObjects[envId];
  if (fogObj && !fogObj.isCleared) {
    fogObj.isCleared = true;
    fogObj.targetOpacity = 0.0;
  }
}

// --- SISTEMA DE INVENTÁRIO DE CHAVES ---
const acquiredKeys = new Set();

const KEY_DEFS = [
  { id: 'key_102', name: 'Chave do Escudo 🛡️', shortName: 'Escudo 🛡️', targetDoor: '102', badgeId: 'key-badge-102', color: 0x06b6d4, x: -14.5, y: 1.55, z: -17.5, roomName: 'Q.101 (Suíte Presidencial)' },
  { id: 'key_103', name: 'Chave da Espada ⚔️', shortName: 'Espada ⚔️', targetDoor: '103', badgeId: 'key-badge-103', color: 0xa855f7, x: -0.5, y: 1.05, z: -12.0, roomName: 'Q.102 (Banheiro Luxo)' },
  { id: 'key_104', name: 'Chave da Águia 🦅', shortName: 'Águia 🦅', targetDoor: '104', badgeId: 'key-badge-104', color: 0x84cc16, x: 8.5, y: 1.45, z: -18.0, roomName: 'Q.103 (Tech Lab)' },
  { id: 'key_105', name: 'Chave do Leão 🦁', shortName: 'Leão 🦁', targetDoor: '105', badgeId: 'key-badge-105', color: 0xfef08a, x: -27.0, y: 0.75, z: 10.0, roomName: 'Q.104 (Suíte Botânica)' },
  { id: 'key_106', name: 'Chave do Elmo 🪖', shortName: 'Elmo 🪖', targetDoor: '106', badgeId: 'key-badge-106', color: 0xf8fafc, x: -11.0, y: 1.05, z: 18.0, roomName: 'Q.105 (Lavabo)' },
  { id: 'key_master', name: 'Chave Mestre 👑', shortName: 'Mestre 👑', targetDoor: 'master', badgeId: 'key-badge-master', color: 0xfacc15, x: 16.0, y: 1.5, z: 12.0, roomName: 'Q.106 (Câmara Testes - Drop do Chefe)' },
];

const keyObjects = [];

function createCollectibleKey(def) {
  const keyGroup = new THREE.Group();
  keyGroup.position.set(def.x, def.y, def.z);

  const ringMat = new THREE.MeshStandardMaterial({
    color: def.color,
    metalness: 0.95,
    roughness: 0.15,
    emissive: def.color,
    emissiveIntensity: 0.5,
  });
  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 16, 32), ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  keyGroup.add(ringMesh);

  const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 16), ringMat);
  shaftMesh.position.y = -0.3;
  keyGroup.add(shaftMesh);

  const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.035), ringMat);
  tooth1.position.set(0.06, -0.45, 0);
  keyGroup.add(tooth1);
  const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.035), ringMat);
  tooth2.position.set(0.05, -0.35, 0);
  keyGroup.add(tooth2);

  const haloMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const haloMesh = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.42, 24), haloMat);
  haloMesh.rotation.x = Math.PI / 2;
  keyGroup.add(haloMesh);

  scene.add(keyGroup);

  const keyObj = {
    def,
    group: keyGroup,
    initialY: def.y,
    isCollected: false,
  };
  keyObjects.push(keyObj);
  return keyObj;
}

// Spawna as chaves 102 a 106; a Chave Mestre (key_master) é dropada com a morte do Boss no Q.106
KEY_DEFS.filter(def => def.id !== 'key_master').forEach(def => createCollectibleKey(def));

function updateInventoryUI() {
  KEY_DEFS.forEach(def => {
    const badge = document.getElementById(def.badgeId);
    if (badge) {
      if (acquiredKeys.has(def.id)) {
        badge.className = def.id === 'key_master' ? 'key-badge key-master key-acquired' : 'key-badge key-acquired';
        badge.innerHTML = `<span>🔑 ${def.shortName}</span>`;
      } else {
        badge.className = def.id === 'key_master' ? 'key-badge key-master badge-locked' : 'key-badge badge-locked';
        badge.innerHTML = `<span>🔒 ${def.shortName}</span>`;
      }
    }
  });
}

function updateGoalHUD() {
  const statGoal = document.getElementById('stat-goal');
  if (!statGoal) return;

  if (!acquiredKeys.has('key_102')) {
    statGoal.textContent = 'Encontre a Chave do Escudo 🛡️ no Q.101 (Cuidado com a criatura!)';
  } else if (!acquiredKeys.has('key_103')) {
    statGoal.textContent = 'Abra o Q.102, pegue o Revólver 🔫 e a Chave da Espada ⚔️';
  } else if (!acquiredKeys.has('key_104')) {
    statGoal.textContent = 'Abra o Q.103 e elimine os inimigos para pegar a Chave da Águia 🦅';
  } else if (!acquiredKeys.has('key_105')) {
    statGoal.textContent = 'Abra o Q.104, pegue a Shotgun 💥 e a Chave do Leão 🦁';
  } else if (!acquiredKeys.has('key_106')) {
    statGoal.textContent = 'Abra o Q.105 e encontre a Chave do Elmo 🪖';
  } else if (!acquiredKeys.has('key_master')) {
    const bossEnemy = activeEnemies.find(e => e.isBoss);
    if (bossEnemy && !bossEnemy.isDead) {
      statGoal.textContent = '⚔️ DERROTE O GUARDIÃO DA CÂMARA NO Q.106 PARA OBTER A CHAVE MESTRE 👑!';
    } else {
      statGoal.textContent = 'Pegue a Chave Mestre 👑 dropada pelo Guardião!';
    }
  } else {
    statGoal.textContent = 'Vá até o final do corredor e abra a Porta Mestre para Escapar! 🚪✨';
  }
}

// --- SISTEMA DE SAÚDE DO JOGADOR E CURA (MEDKITS) ---
let playerHealth = 100;
const MAX_PLAYER_HEALTH = 100;
let medkits = 0;
let isPlayerDead = false;
let invulnerableTimer = 0;

function updatePlayerHealthUI() {
  const hpFill = document.getElementById('perm-health-fill');
  const healthStatus = document.getElementById('perm-health-status');
  const healthNum = document.getElementById('perm-health-num');
  const ecgIcon = document.getElementById('perm-ecg-icon');
  const medkitCount = document.getElementById('perm-medkit-count');
  const medkitBtn = document.getElementById('perm-medkit-btn');

  const pct = Math.max(0, Math.min(100, (playerHealth / MAX_PLAYER_HEALTH) * 100));

  if (hpFill) {
    hpFill.style.width = `${pct}%`;
    hpFill.className = 'health-bar-fill';
    if (playerHealth > 60) hpFill.classList.add('fine-fill');
    else if (playerHealth > 25) hpFill.classList.add('caution-fill');
    else hpFill.classList.add('danger-fill');
  }

  if (healthStatus && healthNum) {
    healthNum.textContent = `${Math.ceil(playerHealth)} / ${MAX_PLAYER_HEALTH}`;
    if (playerHealth > 60) {
      healthStatus.textContent = 'FINE';
      healthStatus.className = 'health-status-badge fine';
      if (ecgIcon) ecgIcon.textContent = '💚';
    } else if (playerHealth > 25) {
      healthStatus.textContent = 'CAUTION';
      healthStatus.className = 'health-status-badge caution';
      if (ecgIcon) ecgIcon.textContent = '💛';
    } else if (playerHealth > 0) {
      healthStatus.textContent = 'DANGER';
      healthStatus.className = 'health-status-badge danger';
      if (ecgIcon) ecgIcon.textContent = '❤️';
    } else {
      healthStatus.textContent = 'DEAD';
      healthStatus.className = 'health-status-badge danger';
      if (ecgIcon) ecgIcon.textContent = '💀';
    }
  }

  if (medkitCount) {
    medkitCount.textContent = `${medkits}`;
  }

  if (medkitBtn) {
    medkitBtn.style.opacity = (medkits > 0 && playerHealth < 100) ? '1' : '0.55';
  }
}

function damagePlayer(amount, enemyName = 'Criatura') {
  if (isPlayerDead || invulnerableTimer > 0) return;

  playerHealth = Math.max(0, playerHealth - amount);
  invulnerableTimer = 1.0;

  playHurtSound();

  // Flash vermelho na tela
  const dmgOverlay = document.getElementById('screen-damage-overlay');
  if (dmgOverlay) {
    dmgOverlay.classList.remove('active');
    void dmgOverlay.offsetWidth;
    dmgOverlay.classList.add('active');
    setTimeout(() => dmgOverlay.classList.remove('active'), 350);
  }

  updatePlayerHealthUI();

  if (playerHealth <= 0) {
    isPlayerDead = true;
    playZombieDeathSound(false);
    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) gameOverModal.classList.remove('hidden');
  }
}

function useMedkit() {
  if (isPlayerDead) return;
  if (medkits <= 0) {
    playDryFireSound();
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = 'Sem Medicamentos no inventário! Procure nos quartos 💊';
    return;
  }
  if (playerHealth >= MAX_PLAYER_HEALTH) {
    playDryFireSound();
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = 'Saúde já está no MÁXIMO! (100%) ✨';
    return;
  }

  medkits--;
  playerHealth = Math.min(MAX_PLAYER_HEALTH, playerHealth + 50);
  playHealSound();

  // Flash verde de cura na tela
  const healOverlay = document.getElementById('screen-heal-overlay');
  if (healOverlay) {
    healOverlay.classList.remove('active');
    void healOverlay.offsetWidth;
    healOverlay.classList.add('active');
    setTimeout(() => healOverlay.classList.remove('active'), 450);
  }

  updatePlayerHealthUI();
  if (interactionPrompt) interactionPrompt.classList.remove('hidden');
  if (promptText) promptText.textContent = `Medicamento Usado! Saúde Restaurada (+50 HP) 💖`;
}

// --- SISTEMA DE MEDKITS 3D COLETÁVEIS ---
const collectibleMedkits = [];

function createCollectibleMedkit(id, x, y, z, roomName) {
  const medGroup = new THREE.Group();
  medGroup.position.set(x, y, z);

  // Caixa Branca
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.2), boxMat);
  box.castShadow = true;
  medGroup.add(box);

  // Cruz Vermelha Frontal e Traseira
  const crossMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, emissive: 0xef4444, emissiveIntensity: 0.6 });
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.21), crossMat);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.21), crossMat);
  medGroup.add(crossV);
  medGroup.add(crossH);

  const haloMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.45, 24), haloMat);
  halo.rotation.x = Math.PI / 2;
  medGroup.add(halo);

  scene.add(medGroup);

  const medObj = { id, name: 'Medicamento 💊', group: medGroup, initialY: y, isCollected: false, roomName, x, y, z };
  collectibleMedkits.push(medObj);
  return medObj;
}

// Spawns dos Medkits nos quartos
createCollectibleMedkit('med_102', -7.5, 1.15, -15.5, 'Q.102 (Banheiro Luxo)');
createCollectibleMedkit('med_104', -27.0, 0.75, 18.0, 'Q.104 (Suíte Botânica)');
createCollectibleMedkit('med_105', -11.0, 1.05, 12.0, 'Q.105 (Lavabo)');

// --- SISTEMA DE ARMAS E MUNIÇÕES (RESIDENT EVIL INSPIRED) ---
const weaponInventory = {
  revolver: {
    id: 'revolver',
    name: 'Revólver 🔫',
    badgeId: 'badge-weapon-revolver',
    isAcquired: true,
    maxMag: 6,
    loadedAmmo: 6,
    reserveAmmo: 999,
    color: 0x94a3b8,
    mesh: null,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun 💥',
    badgeId: 'badge-weapon-shotgun',
    isAcquired: true,
    maxMag: 4,
    loadedAmmo: 4,
    reserveAmmo: 999,
    color: 0xf97316,
    mesh: null,
  },
};

let equippedWeaponId = null;

const collectibleWeapons = [];
const collectibleAmmoBoxes = [];

// Criar Armas 3D Coletáveis no Cenário
function createCollectibleWeapon(id, name, x, y, z, color, roomName) {
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(x, y, z);

  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.2, emissive: color, emissiveIntensity: 0.4 });

  if (id === 'revolver') {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 16), mat);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(0.15, 0, 0); weaponGroup.add(barrel);
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 16), mat);
    cylinder.position.set(-0.02, 0, 0); weaponGroup.add(cylinder);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
    grip.position.set(-0.1, -0.1, 0); grip.rotation.z = -0.3; weaponGroup.add(grip);
  } else {
    const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16), mat);
    barrel1.rotation.z = Math.PI / 2; barrel1.position.set(0.2, 0.03, 0); weaponGroup.add(barrel1);
    const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16), mat);
    barrel2.rotation.z = Math.PI / 2; barrel2.position.set(0.2, -0.03, 0); weaponGroup.add(barrel2);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
    stock.position.set(-0.3, -0.05, 0); weaponGroup.add(stock);
  }

  const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 24), haloMat);
  halo.rotation.x = Math.PI / 2; weaponGroup.add(halo);

  scene.add(weaponGroup);

  const wObj = { id, name, group: weaponGroup, initialY: y, isCollected: false, roomName, x, y, z };
  collectibleWeapons.push(wObj);
  return wObj;
}

// Criar Caixas de Munição 3D Coletáveis
function createCollectibleAmmoBox(id, type, amount, x, y, z, roomName) {
  const boxGroup = new THREE.Group();
  boxGroup.position.set(x, y, z);

  const color = type === 'revolver' ? 0x38bdf8 : 0xef4444;
  const boxMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6, emissive: color, emissiveIntensity: 0.3 });
  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.22), boxMat);
  boxMesh.castShadow = true; boxGroup.add(boxMesh);

  scene.add(boxGroup);

  const aObj = { id, type, amount, group: boxGroup, initialY: y, isCollected: false, roomName, x, y, z };
  collectibleAmmoBoxes.push(aObj);
  return aObj;
}

// Spawns das Armas (Revólver no Banheiro Luxo Q102 / Shotgun na Suíte Botânica Q104)
createCollectibleWeapon('revolver', 'Revólver 🔫', -4.0, 1.15, -18.0, 0x38bdf8, 'Q.102 (Banheiro Luxo)');
createCollectibleWeapon('shotgun', 'Shotgun 💥', -14.5, 1.75, 14.5, 0xf97316, 'Q.104 (Suíte Botânica)');

// Spawns das Caixas de Munição espalhadas (Distribuídas em cantos e móveis distintos)
createCollectibleAmmoBox('ammo_rev_1', 'revolver', 6, -23.0, 0.75, -18.0, 'Q.101 (Suíte Presidencial - Sofá)');
createCollectibleAmmoBox('ammo_rev_2', 'revolver', 6, 14.0, 0.65, -18.0, 'Q.103 (Tech Lab - Lounge)');
createCollectibleAmmoBox('ammo_rev_3', 'revolver', 6, -4.5, 0.65, 12.0, 'Q.105 (Lavabo - Nicho)');

createCollectibleAmmoBox('ammo_sht_1', 'shotgun', 4, 23.0, 0.85, -12.0, 'Q.103 (Tech Lab - Terminal)');
createCollectibleAmmoBox('ammo_sht_2', 'shotgun', 4, -7.0, 0.55, 19.5, 'Q.105 (Lavabo - Bancada)');
createCollectibleAmmoBox('ammo_sht_3', 'shotgun', 4, 8.5, 1.65, 18.0, 'Q.106 (Câmara Testes - Caixa)');

// Modelos 3D de Armas empunhadas no Personagem
const playerWeaponGroup = new THREE.Group();
playerWeaponGroup.position.set(0.35, 0.25, 0.45);

const playerRevolverMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
const playerRevolverMesh = new THREE.Group();
const revBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12), playerRevolverMat);
revBarrel.rotation.x = Math.PI / 2; revBarrel.position.set(0, 0, 0.15); playerRevolverMesh.add(revBarrel);
const revCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), playerRevolverMat);
revCyl.rotation.x = Math.PI / 2; revCyl.position.set(0, -0.02, 0); playerRevolverMesh.add(revCyl);
const revGrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
revGrip.position.set(0, -0.08, -0.05); revGrip.rotation.x = -0.3; playerRevolverMesh.add(revGrip);
playerRevolverMesh.visible = false;
playerWeaponGroup.add(playerRevolverMesh);
weaponInventory.revolver.mesh = playerRevolverMesh;

const playerShotgunMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
const playerShotgunMesh = new THREE.Group();
const shtBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 12), playerShotgunMat);
shtBarrel.rotation.x = Math.PI / 2; shtBarrel.position.set(0, 0, 0.3); playerShotgunMesh.add(shtBarrel);
const shtStock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
shtStock.position.set(0, -0.04, -0.12); playerShotgunMesh.add(shtStock);
playerShotgunMesh.visible = false;
playerWeaponGroup.add(playerShotgunMesh);
weaponInventory.shotgun.mesh = playerShotgunMesh;

function updateWeaponsUI() {
  const badgeRev = document.getElementById('badge-weapon-revolver');
  const badgeSht = document.getElementById('badge-weapon-shotgun');
  const equippedName = document.getElementById('weapon-equipped-name');
  const ammoDisplay = document.getElementById('weapon-ammo-display');
  const ammoCountRev = document.getElementById('ammo-count-revolver');
  const ammoCountSht = document.getElementById('ammo-count-shotgun');

  // Elementos do Mostrador Permanente (Sempre Visível)
  const permHud = document.getElementById('permanent-weapon-hud');
  const permIcon = document.getElementById('perm-weapon-icon');
  const permStatus = document.getElementById('perm-weapon-status');
  const permName = document.getElementById('perm-weapon-name');
  const permAmmoMag = document.getElementById('perm-ammo-mag');
  const permAmmoRes = document.getElementById('perm-ammo-res');
  const permAmmoLabel = document.getElementById('perm-ammo-label');

  const wRev = weaponInventory.revolver;
  const wSht = weaponInventory.shotgun;

  if (ammoCountRev) ammoCountRev.textContent = `${wRev.loadedAmmo} + ${wRev.reserveAmmo}`;
  if (ammoCountSht) ammoCountSht.textContent = `${wSht.loadedAmmo} + ${wSht.reserveAmmo}`;

  if (badgeRev) {
    if (wRev.isAcquired) {
      badgeRev.className = equippedWeaponId === 'revolver' ? 'weapon-badge active-equipped' : 'weapon-badge acquired';
      badgeRev.innerHTML = `<span>🔫 Revólver</span>`;
    } else {
      badgeRev.className = 'weapon-badge';
      badgeRev.innerHTML = `<span>🔒 Revólver</span>`;
    }
  }

  if (badgeSht) {
    if (wSht.isAcquired) {
      badgeSht.className = equippedWeaponId === 'shotgun' ? 'weapon-badge active-equipped' : 'weapon-badge acquired';
      badgeSht.innerHTML = `<span>💥 Shotgun</span>`;
    } else {
      badgeSht.className = 'weapon-badge';
      badgeSht.innerHTML = `<span>🔒 Shotgun</span>`;
    }
  }

  // Atualização do Painel Interno da HUD
  if (equippedName && ammoDisplay) {
    if (equippedWeaponId === 'revolver') {
      equippedName.className = 'weapon-equipped-badge';
      equippedName.textContent = 'Revólver 🔫';
      ammoDisplay.textContent = `${wRev.loadedAmmo} / ${wRev.reserveAmmo}`;
    } else if (equippedWeaponId === 'shotgun') {
      equippedName.className = 'weapon-equipped-badge shotgun-active';
      equippedName.textContent = 'Shotgun 💥';
      ammoDisplay.textContent = `${wSht.loadedAmmo} / ${wSht.reserveAmmo}`;
    } else {
      equippedName.className = 'weapon-equipped-badge unequipped';
      equippedName.textContent = 'Desarmado 🖐️';
      ammoDisplay.textContent = '-- / --';
    }
  }

  // Atualização do Mostrador Permanente Externo
  if (permHud) {
    if (equippedWeaponId === 'revolver') {
      const isEmpty = wRev.loadedAmmo === 0;
      permHud.className = `permanent-weapon-hud glass-panel weapon-revolver-active ${isEmpty ? 'ammo-empty' : ''}`;
      if (permIcon) permIcon.textContent = '🔫';
      if (permStatus) permStatus.textContent = isEmpty ? 'Pente Vazio (R / [RB])' : 'Arma Pronta (G / [RT])';
      if (permName) permName.textContent = 'Magnum .357';
      if (permAmmoMag) permAmmoMag.textContent = `${wRev.loadedAmmo}`;
      if (permAmmoRes) permAmmoRes.textContent = `${wRev.reserveAmmo}`;
      if (permAmmoLabel) permAmmoLabel.textContent = isEmpty ? 'Pressione R / [RB] p/ Recarregar' : 'G / [RT]: Atirar • R: Recarregar';
    } else if (equippedWeaponId === 'shotgun') {
      const isEmpty = wSht.loadedAmmo === 0;
      permHud.className = `permanent-weapon-hud glass-panel weapon-shotgun-active ${isEmpty ? 'ammo-empty' : ''}`;
      if (permIcon) permIcon.textContent = '💥';
      if (permStatus) permStatus.textContent = isEmpty ? 'Pente Vazio (R / [RB])' : 'Arma Pronta (G / [RT])';
      if (permName) permName.textContent = 'Shotgun 12G';
      if (permAmmoMag) permAmmoMag.textContent = `${wSht.loadedAmmo}`;
      if (permAmmoRes) permAmmoRes.textContent = `${wSht.reserveAmmo}`;
      if (permAmmoLabel) permAmmoLabel.textContent = isEmpty ? 'Pressione R / [RB] p/ Recarregar' : 'G / [RT]: Atirar • R: Recarregar';
    } else {
      permHud.className = 'permanent-weapon-hud glass-panel weapon-unarmed';
      if (permIcon) permIcon.textContent = '🖐️';
      if (permStatus) permStatus.textContent = 'Modo Desarmado';
      if (permName) permName.textContent = 'Mãos Livres';
      if (permAmmoMag) permAmmoMag.textContent = '--';
      if (permAmmoRes) permAmmoRes.textContent = '--';
      if (permAmmoLabel) {
        if (wRev.isAcquired || wSht.isAcquired) {
          permAmmoLabel.textContent = '1/2 / D-Pad: Equipar • G: Atirar';
        } else {
          permAmmoLabel.textContent = 'Encontre armas nos quartos';
        }
      }
    }
  }
}

function equipWeapon(weaponId) {
  if (weaponId && !weaponInventory[weaponId].isAcquired) {
    playLockedSound();
    const reqRoom = weaponId === 'revolver' ? 'Banheiro Luxo (Q.102)' : 'Suíte Botânica (Q.104)';
    if (promptText) promptText.textContent = `🔒 Arma não obtida! Encontre no ${reqRoom}`;
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    return;
  }

  equippedWeaponId = weaponId;
  weaponInventory.revolver.mesh.visible = (weaponId === 'revolver');
  weaponInventory.shotgun.mesh.visible = (weaponId === 'shotgun');

  if (weaponId === 'revolver') currentWeaponStance = 'pistol';
  else if (weaponId === 'shotgun') currentWeaponStance = 'shotgun';
  else currentWeaponStance = 'unarmed';

  // Força atualização da animação atual baseada no stance
  if (activePlayerAction) {
    playPlayerAnim(keys.shift ? 'run' : (velocity.lengthSq() > 0 ? 'walk' : 'idle'), 0.3);
  }

  updateWeaponsUI();
}

// --- SISTEMA DE INIMIGOS E BOSS 3D ---
const activeEnemies = [];

// --- SISTEMA DE DIFICULDADE CONFIGURÁVEL ---
const DIFFICULTY_PRESETS = {
  easy: { name: 'Fácil', emoji: '🟢', badgeClass: 'easy', speedMult: 0.70, hpMult: 0.70, damageMult: 0.75, desc: 'FÁCIL (0.7x)' },
  normal: { name: 'Normal', emoji: '🟡', badgeClass: 'normal', speedMult: 1.00, hpMult: 1.00, damageMult: 1.00, desc: 'NORMAL (1.0x)' },
  hard: { name: 'Difícil', emoji: '🔴', badgeClass: 'hard', speedMult: 1.30, hpMult: 1.40, damageMult: 1.25, desc: 'DIFÍCIL (1.3x)' },
  nightmare: { name: 'Pesadelo', emoji: '💀', badgeClass: 'nightmare', speedMult: 1.65, hpMult: 1.80, damageMult: 1.50, desc: 'PESADELO (1.7x)' },
  custom: { name: 'Personalizado', emoji: '⚙️', badgeClass: 'custom', speedMult: 1.0, hpMult: 1.0, damageMult: 1.0, desc: 'CUSTOMIZADO' }
};

const gameDifficulty = {
  preset: 'normal',
  speedMultiplier: 1.0,
  hpMultiplier: 1.0,
  damageMultiplier: 1.0,
};

function applyDifficultySettings(speedMult, hpMult, damageMult = 1.0, presetName = 'custom') {
  gameDifficulty.speedMultiplier = Math.max(0.4, Math.min(2.5, speedMult));
  gameDifficulty.hpMultiplier = Math.max(0.3, Math.min(3.0, hpMult));
  gameDifficulty.damageMultiplier = damageMult;
  gameDifficulty.preset = presetName;

  activeEnemies.forEach(e => {
    const hpRatio = e.maxHp > 0 ? (e.hp / e.maxHp) : 1.0;
    e.maxHp = Math.round(e.baseHp * gameDifficulty.hpMultiplier);
    e.hp = e.isDead ? 0 : Math.round(e.maxHp * hpRatio);
    e.speed = e.baseSpeed * gameDifficulty.speedMultiplier;
    e.damage = Math.round(e.baseDamage * gameDifficulty.damageMultiplier);
  });

  updateDifficultyUI();
}

function updateDifficultyUI() {
  const badge = document.getElementById('current-diff-badge');
  const mainTag = document.getElementById('main-diff-tag');
  const pauseTag = document.getElementById('pause-diff-tag');

  const sliderSpeed = document.getElementById('slider-enemy-speed');
  const sliderHp = document.getElementById('slider-enemy-hp');
  const valSpeed = document.getElementById('val-enemy-speed');
  const valHp = document.getElementById('val-enemy-hp');

  const pauseSliderSpeed = document.getElementById('pause-slider-enemy-speed');
  const pauseSliderHp = document.getElementById('pause-slider-enemy-hp');
  const pauseValSpeed = document.getElementById('pause-val-enemy-speed');
  const pauseValHp = document.getElementById('pause-val-enemy-hp');

  const presetInfo = DIFFICULTY_PRESETS[gameDifficulty.preset] || DIFFICULTY_PRESETS.custom;
  const tagText = `${presetInfo.emoji} ${presetInfo.name.toUpperCase()} (${gameDifficulty.speedMultiplier.toFixed(1)}x / ${gameDifficulty.hpMultiplier.toFixed(1)}x)`;

  if (mainTag) mainTag.textContent = tagText;
  if (pauseTag) pauseTag.textContent = tagText;

  if (badge) {
    badge.className = `difficulty-badge ${presetInfo.badgeClass}`;
    badge.textContent = `${presetInfo.emoji} ${presetInfo.name.toUpperCase()} (${gameDifficulty.speedMultiplier.toFixed(2)}x Vel / ${gameDifficulty.hpMultiplier.toFixed(2)}x Vida)`;
  }

  const speedPct = Math.round(gameDifficulty.speedMultiplier * 100);
  const hpPct = Math.round(gameDifficulty.hpMultiplier * 100);

  if (sliderSpeed) sliderSpeed.value = speedPct;
  if (sliderHp) sliderHp.value = hpPct;
  if (valSpeed) valSpeed.textContent = `${speedPct}% (${gameDifficulty.speedMultiplier.toFixed(2)}x)`;
  if (valHp) valHp.textContent = `${hpPct}% (${gameDifficulty.hpMultiplier.toFixed(2)}x)`;

  if (pauseSliderSpeed) pauseSliderSpeed.value = speedPct;
  if (pauseSliderHp) pauseSliderHp.value = hpPct;
  if (pauseValSpeed) pauseValSpeed.textContent = `${speedPct}%`;
  if (pauseValHp) pauseValHp.textContent = `${hpPct}%`;

  // Atualiza classe ativa dos botões de preset
  document.querySelectorAll('.btn-preset, .btn-preset-pause').forEach(btn => {
    if (btn.getAttribute('data-preset') === gameDifficulty.preset) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Spawns dos Inimigos
function createEnemy(id, name, type, x, y, z, baseHp, baseSpeed, baseDamage, isBoss, targetRoom) {
  const enemyGroup = new THREE.Group();
  enemyGroup.position.set(x, isBoss ? y + 0.3 : y, z);

  const skinColor = isBoss ? 0x7f1d1d : (type === 'stalker' ? 0x064e3b : (type === 'cyber' ? 0x312e81 : 0x14532d));
  const clothesColor = isBoss ? 0x1e1b4b : (type === 'stalker' ? 0x1c1917 : 0x0f172a);

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.7,
    metalness: isBoss ? 0.4 : 0.1,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
  });

  const clothesMat = new THREE.MeshStandardMaterial({
    color: clothesColor,
    roughness: 0.8,
  });

  const eyeMat = new THREE.MeshBasicMaterial({
    color: isBoss ? 0xff0044 : (type === 'stalker' ? 0xa3e635 : 0xef4444),
  });

  const hitMeshes = [];

  // Tronco
  const torsoGeo = new THREE.BoxGeometry(isBoss ? 1.0 : 0.65, isBoss ? 1.2 : 0.75, isBoss ? 0.55 : 0.38);
  const torso = new THREE.Mesh(torsoGeo, clothesMat);
  torso.position.y = 0.25;
  torso.castShadow = true;
  torso.receiveShadow = true;
  torso.userData = { enemyId: id };
  enemyGroup.add(torso);
  hitMeshes.push(torso);

  // Cabeça
  const headGeo = new THREE.BoxGeometry(isBoss ? 0.65 : 0.42, isBoss ? 0.65 : 0.42, isBoss ? 0.65 : 0.42);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = isBoss ? 1.15 : 0.82;
  head.castShadow = true;
  head.receiveShadow = true;
  head.userData = { enemyId: id };
  enemyGroup.add(head);
  hitMeshes.push(head);

  // Olhos Incandescentes
  const eyeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), eyeMat);
  eyeLeft.position.set(-0.11, 0.85, 0.23);
  enemyGroup.add(eyeLeft);

  const eyeRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), eyeMat);
  eyeRight.position.set(0.11, 0.85, 0.23);
  enemyGroup.add(eyeRight);

  // Braços
  const armGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);

  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.set(-0.38, 0.2, 0.28);
  leftArm.rotation.x = -Math.PI / 3;
  leftArm.castShadow = true;
  leftArm.userData = { enemyId: id };
  enemyGroup.add(leftArm);
  hitMeshes.push(leftArm);

  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.set(0.38, 0.2, 0.28);
  rightArm.rotation.x = -Math.PI / 3;
  rightArm.castShadow = true;
  rightArm.userData = { enemyId: id };
  enemyGroup.add(rightArm);
  hitMeshes.push(rightArm);

  // Pernas
  const legGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
  const leftLeg = new THREE.Mesh(legGeo, clothesMat);
  leftLeg.position.set(-0.16, -0.45, 0);
  leftLeg.castShadow = true;
  leftLeg.userData = { enemyId: id };
  enemyGroup.add(leftLeg);
  hitMeshes.push(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, clothesMat);
  rightLeg.position.set(0.16, -0.45, 0);
  rightLeg.castShadow = true;
  rightLeg.userData = { enemyId: id };
  enemyGroup.add(rightLeg);
  hitMeshes.push(rightLeg);

  // Hitbox de tiro generosa para precisão de combate
  const hitColMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
  const hitColGeo = new THREE.CylinderGeometry(isBoss ? 1.4 : 0.8, isBoss ? 1.4 : 0.8, isBoss ? 3.2 : 2.0, 12);
  const hitCollider = new THREE.Mesh(hitColGeo, hitColMat);
  hitCollider.position.set(0, isBoss ? 1.2 : 0.7, 0);
  hitCollider.userData = { enemyId: id };
  enemyGroup.add(hitCollider);
  hitMeshes.push(hitCollider);

  // Detalhes extras se for Chefe (Ombreiras / Espinhos / Aura)
  if (isBoss) {
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.8, roughness: 0.2, emissive: 0x7f1d1d, emissiveIntensity: 0.5 });
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 8), hornMat);
    hornL.position.set(-0.18, 1.15, 0.05); hornL.rotation.z = -0.3; enemyGroup.add(hornL);

    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 8), hornMat);
    hornR.position.set(0.18, 1.15, 0.05); hornR.rotation.z = 0.3; enemyGroup.add(hornR);

    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), shoulderMat);
    shoulderL.position.set(-0.45, 0.55, 0); enemyGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), shoulderMat);
    shoulderR.position.set(0.45, 0.55, 0); enemyGroup.add(shoulderR);
  }

  // Luz incandescente do monstro
  const enemyLight = new THREE.PointLight(isBoss ? 0xff0000 : 0xef4444, isBoss ? 3.5 : 1.2, isBoss ? 8.0 : 4.0);
  enemyLight.position.set(0, 0.8, 0.3);
  enemyGroup.add(enemyLight);

  scene.add(enemyGroup);

  const initialHp = Math.round(baseHp * gameDifficulty.hpMultiplier);
  const initialSpeed = baseSpeed * gameDifficulty.speedMultiplier;
  const initialDamage = Math.round(baseDamage * gameDifficulty.damageMultiplier);

  const enemyObj = {
    id,
    name,
    type,
    x, y, z,
    initialX: x,
    initialY: isBoss ? y + 0.3 : y,
    initialZ: z,
    baseHp,
    baseSpeed,
    baseDamage,
    maxHp: initialHp,
    hp: initialHp,
    speed: initialSpeed,
    damage: initialDamage,
    isBoss,
    targetRoom,
    group: enemyGroup,
    skinMat,
    clothesMat,
    hitMeshes,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    enemyLight,
    isDead: false,
    dyingTimer: 0,
    hitFlashTimer: 0,
    attackCooldown: 0,
    walkCycle: 0,
    isAggro: false,
    groanTimer: Math.random() * 5 + 3,
  };

  activeEnemies.push(enemyObj);
  return enemyObj;
}

// Spawns dos Inimigos nos Quartos
// Q.101: 1 Zumbi lento (Jogador inicia desarmado, precisa desviar e pegar a chave)
createEnemy('enemy_101', 'Zumbi Andarilho', 'walker', -23.0, 1.0, -8.0, 70, 2.1, 20, false, 'q101');

// Q.102: 1 Zumbi (Combate inicial com Revólver recém-obtido)
createEnemy('enemy_102', 'Lurker Mutante', 'walker', -6.0, 1.0, -10.0, 85, 2.4, 22, false, 'q102');

// Q.103: 2 Zumbis (Combate tático no Tech Lab)
createEnemy('enemy_103_1', 'Cyborg Infectado Alpha', 'cyber', 18.0, 1.0, -16.0, 95, 2.5, 25, false, 'q103');
createEnemy('enemy_103_2', 'Cyborg Infectado Beta', 'cyber', 24.0, 1.0, -8.0, 95, 2.6, 25, false, 'q103');

// Q.104: 2 Stalkers Ágeis (Recompensa da Shotgun)
createEnemy('enemy_104_1', 'Parasita Botânico Alpha', 'stalker', -24.0, 1.0, 16.0, 110, 3.2, 28, false, 'q104');
createEnemy('enemy_104_2', 'Parasita Botânico Beta', 'stalker', -18.0, 1.0, 8.0, 110, 3.0, 28, false, 'q104');

// Q.105: 2 Stalkers Fortes (Desafio pré-chefe)
createEnemy('enemy_105_1', 'Sombra Abissal Alpha', 'stalker', -3.0, 1.0, 16.0, 115, 3.0, 30, false, 'q105');
createEnemy('enemy_105_2', 'Sombra Abissal Beta', 'stalker', -8.0, 1.0, 10.0, 115, 3.2, 30, false, 'q105');

// Q.106: 1 CHEFE ("Guardião da Câmara") - 450 HP, Drop da Chave Mestre 👑
createEnemy('boss_106', 'Guardião da Câmara 👹', 'boss', 16.0, 1.5, 12.0, 450, 2.8, 40, true, 'q106');

function updateBossHealthUI() {
  const bossContainer = document.getElementById('boss-health-container');
  const bossFill = document.getElementById('boss-hp-fill');
  const bossNum = document.getElementById('boss-hp-num');
  const boss = activeEnemies.find(e => e.isBoss);

  if (!bossContainer || !boss) return;

  if (boss.isDead) {
    bossContainer.classList.add('hidden');
    return;
  }

  const currentRoom = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);

  // SÓ EXIBE O CHEFE QUANDO O JOGADOR ESTIVER REALMENTE DENTRO DO Q.106
  if (currentRoom === 'q106') {
    bossContainer.classList.remove('hidden');
    const pct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
    if (bossFill) bossFill.style.width = `${pct}%`;
    if (bossNum) bossNum.textContent = `${Math.ceil(boss.hp)} / ${boss.maxHp} HP (${Math.round(pct)}%)`;
  } else {
    bossContainer.classList.add('hidden');
  }
}

function fireActiveWeapon() {
  if (isPlayerDead || !equippedWeaponId) return;

  const weapon = weaponInventory[equippedWeaponId];
  if (weapon.loadedAmmo > 0) {
    weapon.loadedAmmo--;
    playGunshotSound(equippedWeaponId);
    playPlayerAnim('shoot', 0.1);

    // Dano da arma
    const damage = equippedWeaponId === 'shotgun' ? 90 : 35;

    // Orientação correta do jogador para o tiro
    const shootDir = new THREE.Vector3(Math.sin(playerRotation), 0, Math.cos(playerRotation)).normalize();

    // Muzzle flash de disparo (sem adicionar/remover luzes dinamicamente)
    const flashPos = playerGroup.position.clone().add(new THREE.Vector3(
      shootDir.x * 0.8,
      0.25,
      shootDir.z * 0.8
    ));
    combatFlashLight.position.copy(flashPos);
    combatFlashLight.color.setHex(0xfacc15);
    combatFlashLight.intensity = 7.0;
    setTimeout(() => { combatFlashLight.intensity = 0.0; }, 80);

    // Recuo de câmera
    cameraPitch = Math.min(1.15, cameraPitch + 0.05);

    // Raycast do Disparo
    const shootOrigin = playerGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0));
    const ray = new THREE.Raycaster(shootOrigin, shootDir, 0.1, 45);

    // Checa colisão com paredes para delimitar alcance do tiro
    const wallHits = ray.intersectObjects(wallsGroup.children, true);
    const maxShootDist = wallHits.length > 0 ? wallHits[0].distance : 40.0;

    // Meshes de todos os inimigos vivos
    const aliveEnemies = activeEnemies.filter(e => !e.isDead);
    const enemyMeshes = [];
    aliveEnemies.forEach(e => {
      e.hitMeshes.forEach(m => enemyMeshes.push(m));
    });

    const enemyHits = ray.intersectObjects(enemyMeshes, true);

    let hitEnemy = null;
    let hitPoint = null;

    if (enemyHits.length > 0 && enemyHits[0].distance < maxShootDist) {
      const hitMesh = enemyHits[0].object;
      let checkObj = hitMesh;
      while (checkObj && !checkObj.userData.enemyId && checkObj.parent) {
        checkObj = checkObj.parent;
      }
      const enemyId = checkObj ? checkObj.userData.enemyId : null;
      hitEnemy = aliveEnemies.find(e => e.id === enemyId);
      hitPoint = enemyHits[0].point;
    }

    // Fallback de detecção por cone de mira (para garantir acerto perfeito em combate)
    if (!hitEnemy) {
      let closestDist = maxShootDist;
      for (const enemy of aliveEnemies) {
        const toEnemy = enemy.group.position.clone().sub(playerGroup.position);
        toEnemy.y = 0;
        const dist = toEnemy.length();
        if (dist > 0.4 && dist < closestDist) {
          const enemyDir = toEnemy.clone().normalize();
          const dot = enemyDir.dot(shootDir);
          const angleThreshold = enemy.isBoss ? 0.72 : 0.84; // ~35 a 45 graus
          if (dot > angleThreshold) {
            hitEnemy = enemy;
            closestDist = dist;
            hitPoint = enemy.group.position.clone().add(new THREE.Vector3(0, 0.8, 0));
          }
        }
      }
    }

    // Processa o acerto
    if (hitEnemy) {
      // Efeito de impacto de sangue
      combatImpactLight.position.copy(hitPoint || hitEnemy.group.position);
      combatImpactLight.color.setHex(0xef4444);
      combatImpactLight.intensity = 7.0;
      setTimeout(() => { combatImpactLight.intensity = 0.0; }, 120);

      playZombieHitSound();

      // Aplica Dano e Knockback
      hitEnemy.hp -= damage;
      hitEnemy.hitFlashTimer = 0.25;
      hitEnemy.isAggro = true;

      const knockback = shootDir.clone().multiplyScalar(equippedWeaponId === 'shotgun' ? 1.1 : 0.5);
      hitEnemy.group.position.x += knockback.x;
      hitEnemy.group.position.z += knockback.z;

      if (hitEnemy.isBoss) {
        updateBossHealthUI();
      }

      if (hitEnemy.hp <= 0) {
        hitEnemy.hp = 0;
        hitEnemy.isDead = true;
        hitEnemy.dyingTimer = 1.0;
        playZombieDeathSound(hitEnemy.isBoss);

        if (hitEnemy.isBoss) {
          playBossRoarSound();
          updateBossHealthUI();

          // DROP DA CHAVE MESTRE 👑
          const masterKeyDef = KEY_DEFS.find(k => k.id === 'key_master');
          if (masterKeyDef) {
            masterKeyDef.x = hitEnemy.group.position.x;
            masterKeyDef.y = 1.2;
            masterKeyDef.z = hitEnemy.group.position.z;
            createCollectibleKey(masterKeyDef);
            playVictorySound();
          }

          updateGoalHUD();
        }
      }
    } else if (wallHits.length > 0) {
      // Faísca na parede
      combatImpactLight.position.copy(wallHits[0].point);
      combatImpactLight.color.setHex(0xf97316);
      combatImpactLight.intensity = 4.0;
      setTimeout(() => { combatImpactLight.intensity = 0.0; }, 100);
    }

    updateWeaponsUI();
  } else if (weapon.reserveAmmo > 0) {
    playDryFireSound();
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = `Pente Vazio! Pressione R ou [RB] para Recarregar 🔄`;
  } else {
    playDryFireSound();
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = `Sem Munição para esta arma! 🚫`;
  }
}

function reloadActiveWeapon() {
  if (isPlayerDead || !equippedWeaponId) return;
  const weapon = weaponInventory[equippedWeaponId];
  const needed = weapon.maxMag - weapon.loadedAmmo;
  if (needed > 0 && weapon.reserveAmmo > 0) {
    const toReload = Math.min(needed, weapon.reserveAmmo);
    weapon.loadedAmmo += toReload;
    weapon.reserveAmmo -= toReload;
    playReloadSound();
    updateWeaponsUI();
  } else if (needed === 0) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = `Pente já está cheio!`;
  } else {
    playDryFireSound();
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (promptText) promptText.textContent = `Sem Munição na Reserva! 🚫`;
  }
}

// --- SISTEMA DE PORTAS 3D INTERATIVAS ---
const interactiveDoors = [];

function createInteractiveDoor(x, z, roomNumber, roomTitle, isNorthSide, requiredKey = null) {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(x, 0, z);

  const lintelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.8), lintelMat);
  lintel.position.set(0, 4.2, 0);
  doorGroup.add(lintel);

  const signMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.8 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.86), signMat);
  sign.position.set(0, 3.4, 0);
  doorGroup.add(sign);

  const pivotGroup = new THREE.Group();
  pivotGroup.position.set(-1.35, 0, 0);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.12), doorMat);
  doorPanel.position.set(1.35, 1.6, 0);
  doorPanel.castShadow = true; doorPanel.receiveShadow = true;
  pivotGroup.add(doorPanel);

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
    isUnlocked: !requiredKey,
    requiredKey,
    currentAngle: 0,
    targetAngle: 0,
    isNorthSide,
    x, z,
    roomNumber,
    name: roomTitle,
    colliderIndex: -1,
  };

  const collider = {
    minX: x - 1.4 - PLAYER_RADIUS,
    maxX: x + 1.4 + PLAYER_RADIUS,
    minZ: z - 0.4 - PLAYER_RADIUS,
    maxZ: z + 0.4 + PLAYER_RADIUS,
    name: `Porta ${roomNumber} (${roomTitle})`,
    disabled: false,
  };
  wallColliders.push(collider);
  doorData.colliderIndex = wallColliders.length - 1;

  interactiveDoors.push(doorData);
  return doorData;
}

function toggleDoor(door) {
  if (door.requiredKey && !acquiredKeys.has(door.requiredKey) && !door.isUnlocked) {
    playLockedSound();
    if (interactionPrompt) {
      interactionPrompt.classList.remove('hidden');
      const reqKey = KEY_DEFS.find(k => k.id === door.requiredKey);
      const kName = reqKey ? reqKey.name : `Chave Q.${door.roomNumber}`;
      if (promptText) promptText.textContent = `🔒 Trancada! Requer ${kName}`;
    }
    return;
  }

  door.isUnlocked = true;
  door.isOpen = !door.isOpen;

  if (door.isOpen) {
    clearRoomFog('q' + door.roomNumber);
  }

  door.targetAngle = door.isOpen ? (door.isNorthSide ? Math.PI / 2 : -Math.PI / 2) : 0;
  if (door.colliderIndex >= 0 && wallColliders[door.colliderIndex]) {
    wallColliders[door.colliderIndex].disabled = door.isOpen;
  }
  playDoorSound(door.isOpen);
}

// Criar Portas
createInteractiveDoor(-19.0, -3.6, '101', 'SUÍTE PRESIDENCIAL', true, null);
createInteractiveDoor(-6.0, -3.6, '102', 'BANHEIRO LUXO', true, 'key_102');
createInteractiveDoor(9.0, -3.6, '103', 'TECH LAB', true, 'key_103');
createInteractiveDoor(-21.0, 3.6, '104', 'SUÍTE BOTÂNICA', false, 'key_104');
createInteractiveDoor(-11.0, 3.6, '105', 'LAVABO', false, 'key_105');
createInteractiveDoor(13.0, 3.6, '106', 'CÂMARA TESTES', false, 'key_106');

// --- CONSTRUTOR DA PORTA MESTRE DE SAÍDA ---
function createGrandExitGate() {
  const gateGroup = new THREE.Group();
  gateGroup.position.set(30.0, 0, 0);

  const lintelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 5.2), lintelMat);
  lintel.position.set(0, 4.2, 0);
  gateGroup.add(lintel);

  const signMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 2.5 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.5, 3.4), signMat);
  sign.position.set(0, 3.4, 0);
  gateGroup.add(sign);

  const pivotLeft = new THREE.Group();
  pivotLeft.position.set(0, 0, -2.2);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.7, roughness: 0.3 });
  const leafLeft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 2.2), doorMat);
  leafLeft.position.set(0, 1.7, 1.1);
  leafLeft.castShadow = true; leafLeft.receiveShadow = true;
  pivotLeft.add(leafLeft);

  const goldHandleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 });
  const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), goldHandleMat);
  handleLeft.position.set(-0.12, 1.6, 2.0);
  pivotLeft.add(handleLeft);
  gateGroup.add(pivotLeft);

  const pivotRight = new THREE.Group();
  pivotRight.position.set(0, 0, 2.2);
  const leafRight = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 2.2), doorMat);
  leafRight.position.set(0, 1.7, -1.1);
  leafRight.castShadow = true; leafRight.receiveShadow = true;
  pivotRight.add(leafRight);

  const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), goldHandleMat);
  handleRight.position.set(-0.12, 1.6, -2.0);
  pivotRight.add(handleRight);
  gateGroup.add(pivotRight);

  scene.add(gateGroup);

  const collider = {
    minX: 30.0 - 0.4 - PLAYER_RADIUS,
    maxX: 30.0 + 0.4 + PLAYER_RADIUS,
    minZ: -2.5 - PLAYER_RADIUS,
    maxZ: 2.5 + PLAYER_RADIUS,
    name: 'Porta Mestre de Saída',
    disabled: false,
  };
  wallColliders.push(collider);
  const colliderIndex = wallColliders.length - 1;

  return {
    group: gateGroup,
    pivotLeft,
    pivotRight,
    isOpen: false,
    currentAngle: 0,
    targetAngle: 0,
    requiredKey: 'key_master',
    x: 30.0, z: 0.0,
    name: 'PORTA MESTRE DE SAÍDA',
    colliderIndex,
  };
}

const grandExitGate = createGrandExitGate();

function toggleGrandExitGate(gate) {
  if (!acquiredKeys.has('key_master')) {
    playLockedSound();
    if (interactionPrompt) {
      interactionPrompt.classList.remove('hidden');
      if (promptText) promptText.textContent = '🔒 PORTA MESTRE TRANCADA! (Requer Chave Mestre)';
    }
    return;
  }

  gate.isOpen = !gate.isOpen;
  gate.targetAngle = gate.isOpen ? Math.PI / 2.2 : 0;
  if (gate.colliderIndex >= 0 && wallColliders[gate.colliderIndex]) {
    wallColliders[gate.colliderIndex].disabled = gate.isOpen;
  }
  playDoorSound(gate.isOpen);

  if (gate.isOpen) {
    playVictorySound();
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('hidden');
  }
}

// --- MÓVEIS DO CENÁRIO ---
const steppableBoxes = [];

function createBench(x, z, rotationY = 0, benchName = 'Banco do Hotel') {
  const benchGroup = new THREE.Group();
  benchGroup.position.set(x, 0, z);
  benchGroup.rotation.y = rotationY;

  const width = 2.6; const depth = 0.9; const height = 0.95;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), seatMat);
  seat.position.y = 0.48; seat.castShadow = true; seat.receiveShadow = true; benchGroup.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(width, 0.45, 0.1), seatMat);
  back.position.set(0, 0.78, -depth / 2 + 0.05); back.castShadow = true; benchGroup.add(back);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, depth + 0.05), frameMat);
  leg1.position.set(-width / 2 + 0.2, 0.24, 0); leg1.castShadow = true; benchGroup.add(leg1);
  const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, depth + 0.05), frameMat);
  leg2.position.set(width / 2 - 0.2, 0.24, 0); leg2.castShadow = true; benchGroup.add(leg2);

  scene.add(benchGroup);

  const radX = (width / 2) * Math.abs(Math.cos(rotationY)) + (depth / 2) * Math.abs(Math.sin(rotationY));
  const radZ = (width / 2) * Math.abs(Math.sin(rotationY)) + (depth / 2) * Math.abs(Math.cos(rotationY));

  const bounds = { minX: x - radX, maxX: x + radX, minZ: z - radZ, maxZ: z + radZ, height, topY: 0.55, name: benchName };
  steppableBoxes.push(bounds);
  return bounds;
}

function createCrate(x, z, width, height, depth, color = 0x3b82f6, crateName = 'Caixa') {
  const crateGroup = new THREE.Group();
  crateGroup.position.set(x, height / 2, z);
  const boxMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 });
  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), boxMat);
  boxMesh.castShadow = true; boxMesh.receiveShadow = true; crateGroup.add(boxMesh);
  scene.add(crateGroup);

  const bounds = { minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2, height, topY: height, name: crateName };
  steppableBoxes.push(bounds);
  return bounds;
}

function createSofa(x, z, rotationY = 0, sofaName = 'Sofá Luxo') {
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(x, 0, z);
  sofaGroup.rotation.y = rotationY;
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.4 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 1.4), leatherMat);
  seat.position.y = 0.4; seat.castShadow = true; sofaGroup.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.3), leatherMat);
  back.position.set(0, 0.9, -0.55); back.castShadow = true; sofaGroup.add(back);
  scene.add(sofaGroup);

  const bounds = { minX: x - 1.6, maxX: x + 1.6, minZ: z - 0.7, maxZ: z + 0.7, height: 1.2, topY: 0.65, name: sofaName };
  steppableBoxes.push(bounds);
  return bounds;
}

createSofa(-23.0, -18.0, 0, 'Sofá Presidencial Q101');
createBench(-15.0, -10.0, Math.PI / 2, 'Banco Suíte Q101');
createCrate(-14.5, -17.5, 2.2, 1.4, 2.2, 0x0284c7, 'Mesa Executiva Q101');
createCrate(-4.0, -18.0, 2.0, 0.9, 1.4, 0x0284c7, 'Bancada Mármore Q102');
createBench(14.0, -18.0, 0, 'Sofá Tech Lounge Q103');
createCrate(8.5, -18.0, 2.4, 1.3, 2.4, 0xb45309, 'Degrau Servidores Q103');
createBench(-27.0, 10.0, Math.PI / 2, 'Banco do Jardim 1 Q104');
createBench(-16.0, 18.0, Math.PI, 'Banco do Jardim 2 Q104');
createCrate(-14.5, 14.5, 2.8, 1.5, 2.8, 0x15803d, 'Plataforma Botânica Q104');
createCrate(-11.0, 18.0, 1.6, 0.9, 1.2, 0x0284c7, 'Bancada Lavabo Q105');
createCrate(8.5, 18.0, 2.2, 1.5, 2.2, 0xec4899, 'Caixa Aperture Q106');
createCrate(15.0, 18.0, 2.6, 2.2, 2.6, 0x6366f1, 'Caixa Teste Q106');
createBench(24.0, 18.0, -Math.PI / 2, 'Banco Observação Q106');

// --- O PERSONAGEM (JOGADOR) ---
const playerGroup = new THREE.Group();
playerGroup.position.set(25, 1.0, 0); // Altura do colisor original, próximo da Porta Mestre

// Modelo fallback (garante visibilidade mesmo durante o carregamento)
const fallbackGeo = new THREE.CapsuleGeometry(0.35, 1.1, 4, 8);
const fallbackMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.2 });
const fallbackPlayerMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
fallbackPlayerMesh.position.set(0, -0.1, 0);
fallbackPlayerMesh.castShadow = true;
fallbackPlayerMesh.receiveShadow = true;
playerGroup.add(fallbackPlayerMesh);
let playerBody = fallbackPlayerMesh;

const playerLight = new THREE.PointLight(0x38bdf8, 0.8, 4);
playerLight.position.set(0, -0.4, 0);
playerGroup.add(playerLight);

playerGroup.add(playerWeaponGroup);
scene.add(playerGroup);

// --- SISTEMA DE ANIMAÇÃO E MODELOS DO JOGADOR ---
let selectedCharacter = 'jake'; // 'jake' ou 'jane'
let playerMixer = null;
let playerActions = {};
let activePlayerAction = null;
let jakeModelInstance = null;
let janeModelInstance = null;
let jakeHasSkeleton = false;
let janeHasSkeleton = false;
let jakeRightHand = null;
let janeRightHand = null;
let jakeMixer = null;
let janeMixer = null;
let jakeActions = {};
let janeActions = {};
let currentWeaponStance = 'unarmed'; // 'unarmed', 'pistol', 'shotgun'

function updateActiveCharacterModel() {
  const activeChar = selectedCharacter || 'jake';

  if (jakeModelInstance) jakeModelInstance.visible = (activeChar === 'jake');
  if (janeModelInstance) janeModelInstance.visible = (activeChar === 'jane');

  if (activeChar === 'jane' && janeModelInstance) {
    playerBody = janeModelInstance;
    playerMixer = janeMixer;
    playerActions = janeActions;
    if (janeRightHand) janeRightHand.add(playerWeaponGroup);
    if (fallbackPlayerMesh) fallbackPlayerMesh.visible = false;
  } else if (activeChar === 'jake' && jakeModelInstance) {
    playerBody = jakeModelInstance;
    playerMixer = jakeMixer;
    playerActions = jakeActions;
    if (jakeRightHand) jakeRightHand.add(playerWeaponGroup);
    if (fallbackPlayerMesh) fallbackPlayerMesh.visible = false;
  } else {
    if (fallbackPlayerMesh) {
      fallbackPlayerMesh.visible = true;
      playerBody = fallbackPlayerMesh;
    }
  }

  // Tocar idle animation caso haja mixer válido
  if (playerMixer && playerActions['idle']) {
    playPlayerAnim('idle', 0.1);
  }
}

function playPlayerAnim(actionName, duration = 0.2) {
  let mappedAction = actionName;

  if (currentWeaponStance === 'pistol') {
    if (actionName === 'idle') mappedAction = 'pistol_idle';
    if (actionName === 'walk') mappedAction = 'pistol_walk';
    if (actionName === 'run') mappedAction = 'pistol_run';
  } else if (currentWeaponStance === 'shotgun') {
    if (actionName === 'idle') mappedAction = 'rifle_idle';
    if (actionName === 'walk') mappedAction = 'rifle_run'; // Usando run como walk pra rifle
    if (actionName === 'run') mappedAction = 'rifle_run';
    if (actionName === 'shoot') mappedAction = 'rifle_shoot';
  }

  if (!playerMixer || !playerActions[mappedAction]) {
    mappedAction = actionName; // fallback
  }

  if (!playerMixer || !playerActions[mappedAction]) return;
  const nextAction = playerActions[mappedAction];
  if (nextAction === activePlayerAction) return;

  nextAction.reset().fadeIn(duration).play();
  if (activePlayerAction) {
    activePlayerAction.fadeOut(duration);
  }
  activePlayerAction = nextAction;
}

// Carregar o modelo glb do Jake (antigo) e FBX da Jane
assetManager.loadFBX('jake', 'assets/models/jake/jake.fbx');
assetManager.loadFBX('jane', 'assets/models/jane/jane.fbx');

// Carregar Animações FBX
assetManager.loadFBXAnimation('idle', 'assets/animacoes/Idle.fbx');
assetManager.loadFBXAnimation('walk', 'assets/animacoes/Walking.fbx');
assetManager.loadFBXAnimation('run', 'assets/animacoes/run.fbx');
assetManager.loadFBXAnimation('jump', 'assets/animacoes/jump.fbx');
assetManager.loadFBXAnimation('shoot', 'assets/animacoes/Pistol_Shooting.fbx');
assetManager.loadFBXAnimation('reload', 'assets/animacoes/Reloading.fbx');
assetManager.loadFBXAnimation('pistol_idle', 'assets/animacoes/Pistol Idle.fbx');
assetManager.loadFBXAnimation('pistol_walk', 'assets/animacoes/Pistol Walk.fbx');
assetManager.loadFBXAnimation('pistol_run', 'assets/animacoes/Pistol Run.fbx');
assetManager.loadFBXAnimation('rifle_idle', 'assets/animacoes/Rifle Idle.fbx');
assetManager.loadFBXAnimation('rifle_run', 'assets/animacoes/Rifle Run.fbx');
assetManager.loadFBXAnimation('rifle_shoot', 'assets/animacoes/Firing Rifle.fbx');
assetManager.loadModel('pistol', 'assets/models/pistol.glb');
assetManager.loadModel('shotgun', 'assets/models/shotgun.glb');

assetManager.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const loadingProgress = document.getElementById('loading-progress');
  const loadingBar = document.getElementById('loading-bar');
  if (loadingProgress && loadingBar) {
    const percent = Math.floor((itemsLoaded / itemsTotal) * 100);
    loadingProgress.textContent = `${percent}%`;
    loadingBar.style.width = `${percent}%`;
  }
};

assetManager.manager.onLoad = () => {
  // Esconder tela de carregamento e mostrar o menu
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
  const startModal = document.getElementById('start-menu-modal');
  if (startModal) startModal.classList.remove('hidden');

  // Habilitar a câmera rodando em volta do jogador no menu
  orbitControls.enabled = true;
  orbitControls.autoRotate = true;
  orbitControls.autoRotateSpeed = 1.0;

  playerWeaponGroup.position.set(0, 0, 0);
  playerWeaponGroup.rotation.set(Math.PI / 2, Math.PI / 2, 0); // Ajuste Mixamo

  const PISTOL_ROT_X = THREE.MathUtils.degToRad(-70);
  const PISTOL_ROT_Y = THREE.MathUtils.degToRad(90);
  const PISTOL_ROT_Z = THREE.MathUtils.degToRad(180);
  const PISTOL_POS_X = 15;
  const PISTOL_POS_Y = -2;
  const PISTOL_POS_Z = 8;

  if (assetManager.models['pistol']) {
    const pModel = assetManager.models['pistol'].clone();
    weaponInventory.revolver.mesh.children.forEach(ch => ch.visible = false);
    pModel.scale.set(1.25, 1.25, 1.25);
    pModel.rotation.set(PISTOL_ROT_X, PISTOL_ROT_Y, PISTOL_ROT_Z);
    pModel.position.set(PISTOL_POS_X, PISTOL_POS_Y, PISTOL_POS_Z);
    weaponInventory.revolver.mesh.add(pModel);
  }

  if (assetManager.models['shotgun']) {
    const sModel = assetManager.models['shotgun'].clone();
    weaponInventory.shotgun.mesh.children.forEach(ch => ch.visible = false);
    sModel.scale.set(0.85, 0.85, 0.85);
    sModel.rotation.set(PISTOL_ROT_X, PISTOL_ROT_Y, PISTOL_ROT_Z);
    sModel.position.set(PISTOL_POS_X, PISTOL_POS_Y, PISTOL_POS_Z);
    weaponInventory.shotgun.mesh.add(sModel);
  }

  // --- ATUALIZAÇÃO DE ARMAS COLETÁVEIS NO CHÃO ---
  collectibleWeapons.forEach(wObj => {
    if (wObj.id === 'revolver' && assetManager.models['pistol']) {
      wObj.group.children.forEach(ch => { if (ch.isMesh && (!ch.geometry || ch.geometry.type !== 'RingGeometry')) ch.visible = false; });
      const pModel = assetManager.models['pistol'].clone();
      pModel.scale.set(0.04, 0.04, 0.04);
      pModel.position.set(0, 0.15, 0);
      wObj.group.add(pModel);
    } else if (wObj.id === 'shotgun' && assetManager.models['shotgun']) {
      wObj.group.children.forEach(ch => { if (ch.isMesh && (!ch.geometry || ch.geometry.type !== 'RingGeometry')) ch.visible = false; });
      const sModel = assetManager.models['shotgun'].clone();
      sModel.scale.set(0.04, 0.04, 0.04);
      sModel.position.set(0, 0.15, 0);
      wObj.group.add(sModel);
    }
  });

  // --- FUNÇÃO DE SETUP DE PERSONAGEM (JAKE E JANE) ---
  const setupCharacter = (modelKey) => {
    const charModel = assetManager.models[modelKey];
    if (!charModel) return null;

    let hasSkeleton = false;
    let rightHand = null;
    const toRemove = [];

    charModel.scale.set(0.018, 0.018, 0.018);
    charModel.position.set(0, -1.0, 0);

    charModel.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;

        // Esconder armas embutidas nos modelos originais (como rifles/pistolas que vêm colados no FBX)
        const name = c.name.toLowerCase();
        if (name.includes('weapon') || name.includes('gun') || name.includes('rifle') || name.includes('pistol') || name.includes('shotgun') || name.includes('sword') || name.includes('assault')) {
          c.visible = false;
        }
      }
      if (c.isSkinnedMesh) hasSkeleton = true;
      if (c.isCamera || c.isLight) toRemove.push(c);
      if (c.isBone && c.name) {
        c.name = c.name.replace(/.*mixamorig/g, 'mixamorig');
        // Se a personagem (como a Jane) tiver ossos sem o prefixo padrão do Mixamo, nós adicionamos
        if (!c.name.startsWith('mixamorig')) {
          // A primeira letra do osso deve ser maiúscula para casar com mixamorigHips, mixamorigSpine, etc
          c.name = 'mixamorig' + c.name.charAt(0).toUpperCase() + c.name.slice(1);
        }
        if (c.name === 'mixamorigRightHand') rightHand = c;
      }
    });

    toRemove.forEach(c => { if (c.parent) c.parent.remove(c); });

    if (hasSkeleton) {
      charModel.rotation.set(0, 0, 0);
    } else {
      charModel.rotation.set(-Math.PI / 2, 0, Math.PI);
    }

    playerGroup.add(charModel);

    // Inicializar Mixer
    let mixer = null;
    let actions = {};
    if (hasSkeleton) {
      mixer = new THREE.AnimationMixer(charModel);
      const anims = ['idle', 'walk', 'run', 'jump', 'shoot', 'reload', 'pistol_idle', 'pistol_walk', 'pistol_run', 'rifle_idle', 'rifle_run', 'rifle_shoot'];
      anims.forEach(animName => {
        const clip = assetManager.getAnimation(animName);
        if (clip && clip.tracks) {
          // Clona o clip para evitar conflitos entre as instâncias dos personagens
          const clipClone = clip.clone();
          clipClone.tracks.forEach(track => {
            if (track && track.name) track.name = track.name.replace(/.*mixamorig/g, 'mixamorig');
          });
          const action = mixer.clipAction(clipClone);
          if (['jump', 'shoot', 'reload', 'rifle_shoot'].includes(animName)) {
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
          }
          actions[animName] = action;
        }
      });
      // Deixa o idle rodando no background
      if (actions['idle']) {
        actions['idle'].play();
      }
    }

    return { instance: charModel, hasSkeleton, rightHand, mixer, actions };
  };

  // Configura ambos os personagens
  const jakeData = setupCharacter('jake');
  if (jakeData) {
    jakeModelInstance = jakeData.instance;
    jakeHasSkeleton = jakeData.hasSkeleton;
    jakeRightHand = jakeData.rightHand;
    jakeMixer = jakeData.mixer;
    jakeActions = jakeData.actions;
  }

  const janeData = setupCharacter('jane');
  if (janeData) {
    janeModelInstance = janeData.instance;
    janeHasSkeleton = janeData.hasSkeleton;
    janeRightHand = janeData.rightHand;
    janeMixer = janeData.mixer;
    janeActions = janeData.actions;
  }

  // Atualiza visibilidade conforme seleção atual
  updateActiveCharacterModel();

  // Garante que os personagens comecem desarmados
  equipWeapon(null);

  console.log("Modelos e animações configurados com sucesso!");
};

// --- SISTEMA DE MOVIMENTAÇÃO, CONTROLES E ATALHOS ---
const keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
const velocity = new THREE.Vector3();
let velocityY = 0;
const GRAVITY = -24.0;
const JUMP_FORCE = 9.2;
let isGrounded = true;

const MOVE_SPEED = 3.5;
const RUN_SPEED = 6.5;
const ACCELERATION = 24.0;
const FRICTION = 10.0;
let playerRotation = Math.PI / 2;
let walkBobTimer = 0;
let idleAnimTimer = 0;

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  // Tecla de Pausa (Escape ou P)
  if (e.code === 'Escape' || key === 'p') {
    if (isGameStarted && !isPlayerDead) {
      togglePauseGame();
      e.preventDefault();
      return;
    }
  }

  if (!isGameStarted && (e.code === 'Space' || e.code === 'Enter' || key === ' ')) {
    startGame();
    e.preventDefault();
    return;
  }

  if (isGamePaused) return;

  if (key === 'w' || key === 'arrowup') updateKeyState('w', true);
  if (key === 'a' || key === 'arrowleft') updateKeyState('a', true);
  if (key === 's' || key === 'arrowdown') updateKeyState('s', true);
  if (key === 'd' || key === 'arrowright') updateKeyState('d', true);
  if (e.code === 'Space' || key === ' ') { updateKeyState('space', true); e.preventDefault(); }
  if (e.key === 'Shift') updateKeyState('shift', true);
  if (key === 'e') handleInteraction();
  if (key === 'g') fireActiveWeapon();
  if (key === 'q') useMedkit();
  if (key === 'h') toggleHUD();
  if (key === '1') equipWeapon('revolver');
  if (key === '2') equipWeapon('shotgun');
  if (key === '3') equipWeapon(null);
  if (key === 'r') reloadActiveWeapon();
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') updateKeyState('w', false);
  if (key === 'a' || key === 'arrowleft') updateKeyState('a', false);
  if (key === 's' || key === 'arrowdown') updateKeyState('s', false);
  if (key === 'd' || key === 'arrowright') updateKeyState('d', false);
  if (e.code === 'Space' || key === ' ') { updateKeyState('space', false); e.preventDefault(); }
  if (e.key === 'Shift') updateKeyState('shift', false);
});

function updateKeyState(key, isPressed) {
  keys[key] = isPressed;
  const keyElem = document.getElementById(`key-${key}`);
  if (keyElem) {
    if (isPressed) keyElem.classList.add('active');
    else keyElem.classList.remove('active');
  }
}

// --- SUPORTE A CONTROLE (XBOX GAMEPAD DEFAULT) ---
let activeGamepadIndex = null;
const prevGamepadButtons = {};
let isGamepadConnected = false;

window.addEventListener('gamepadconnected', (e) => {
  activeGamepadIndex = e.gamepad.index;
  isGamepadConnected = true;
  console.log('🎮 Controle Xbox/Gamepad Conectado:', e.gamepad.id);
  if (interactionPrompt) interactionPrompt.classList.remove('hidden');
  const gpName = e.gamepad.id.split('(')[0] || 'Controle Xbox';
  if (promptText) promptText.textContent = `🎮 Controle Conectado: ${gpName}`;
  setTimeout(() => {
    if (promptText && promptText.textContent.includes('Controle Conectado')) {
      if (interactionPrompt) interactionPrompt.classList.add('hidden');
    }
  }, 3500);
});

window.addEventListener('gamepaddisconnected', (e) => {
  if (activeGamepadIndex === e.gamepad.index) {
    activeGamepadIndex = null;
    isGamepadConnected = false;
    console.log('🎮 Controle desconectado:', e.gamepad.id);
  }
});

function applyAxisDeadzone(val, deadzone = 0.16) {
  if (Math.abs(val) < deadzone) return 0;
  const sign = Math.sign(val);
  return sign * ((Math.abs(val) - deadzone) / (1.0 - deadzone));
}

function isButtonJustPressed(gp, index, threshold = 0.5) {
  const btn = gp.buttons[index];
  const isPressed = btn ? (btn.pressed || btn.value > threshold) : false;
  const wasPressed = prevGamepadButtons[index] || false;
  prevGamepadButtons[index] = isPressed;
  return isPressed && !wasPressed;
}

// Alternar HUD (Inicia Oculta por padrão)
let isHUDVisible = false;
function toggleHUD() {
  isHUDVisible = !isHUDVisible;
  const hudOverlay = document.getElementById('hud-overlay');
  const hudToggleLabel = document.getElementById('hud-toggle-label');
  const btnToggleHud = document.getElementById('btn-toggle-hud');

  if (hudOverlay) {
    if (isHUDVisible) hudOverlay.classList.remove('hud-hidden');
    else hudOverlay.classList.add('hud-hidden');
  }

  const text = isHUDVisible ? 'Ocultar HUD (H)' : 'Mostrar HUD (H)';
  if (hudToggleLabel) hudToggleLabel.textContent = text;
  if (btnToggleHud) btnToggleHud.innerHTML = isHUDVisible ?
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ocultar HUD (H)` :
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Mostrar HUD (H)`;
}

// --- SISTEMA DE NAVEGAÇÃO DE TELAS DO MENU & DIFICULDADE ---
let isGameStarted = false;
let isGamePaused = false;

function showMenuScreen(screenId) {
  const screens = ['menu-screen-main', 'menu-screen-difficulty', 'menu-screen-instructions'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

function showPauseScreen(screenId) {
  const screens = ['pause-screen-main', 'pause-screen-diff'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

function togglePauseGame(forceState) {
  if (!isGameStarted || isPlayerDead) return;

  isGamePaused = typeof forceState === 'boolean' ? forceState : !isGamePaused;
  const pauseModal = document.getElementById('pause-modal');
  if (pauseModal) {
    if (isGamePaused) {
      pauseModal.classList.remove('hidden');
      showPauseScreen('pause-screen-main');
    } else {
      pauseModal.classList.add('hidden');
      clock.getDelta(); // Limpa o delta acumulado durante a pausa
    }
  }
}

function initMenuNavigation() {
  // Navegação no Menu Inicial
  const btnOpenDiff = document.getElementById('btn-open-difficulty');
  const btnOpenInst = document.getElementById('btn-open-instructions');
  const btnBackDiff = document.getElementById('btn-back-from-diff');
  const btnBackInst = document.getElementById('btn-back-from-inst');

  if (btnOpenDiff) btnOpenDiff.addEventListener('click', () => showMenuScreen('menu-screen-difficulty'));
  if (btnOpenInst) btnOpenInst.addEventListener('click', () => showMenuScreen('menu-screen-instructions'));
  if (btnBackDiff) btnBackDiff.addEventListener('click', () => showMenuScreen('menu-screen-main'));
  if (btnBackInst) btnBackInst.addEventListener('click', () => showMenuScreen('menu-screen-main'));

  // Navegação no Menu de Pausa
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnPauseDiff = document.getElementById('btn-pause-difficulty');
  const btnPauseRestart = document.getElementById('btn-pause-restart');
  const btnBackPauseDiff = document.getElementById('btn-back-from-pause-diff');

  if (btnResumeGame) {
    btnResumeGame.addEventListener('click', () => togglePauseGame(false));
    btnResumeGame.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      togglePauseGame(false);
    });
  }
  if (btnPauseDiff) btnPauseDiff.addEventListener('click', () => showPauseScreen('pause-screen-diff'));
  if (btnBackPauseDiff) btnBackPauseDiff.addEventListener('click', () => showPauseScreen('pause-screen-main'));
  if (btnPauseRestart) {
    btnPauseRestart.addEventListener('click', () => {
      togglePauseGame(false);
      resetGameState();
    });
  }

  // Presets no Menu Inicial e na Pausa
  const presetButtons = document.querySelectorAll('.btn-preset, .btn-preset-pause');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const preset = DIFFICULTY_PRESETS[presetKey];
      if (preset) {
        applyDifficultySettings(preset.speedMult, preset.hpMult, preset.damageMult, presetKey);
      }
    });
  });

  // Sliders no Menu Inicial
  const sliderSpeed = document.getElementById('slider-enemy-speed');
  const sliderHp = document.getElementById('slider-enemy-hp');

  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      applyDifficultySettings(val, gameDifficulty.hpMultiplier, gameDifficulty.damageMultiplier, 'custom');
    });
  }

  if (sliderHp) {
    sliderHp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      applyDifficultySettings(gameDifficulty.speedMultiplier, val, gameDifficulty.damageMultiplier, 'custom');
    });
  }

  // Sliders no Menu de Pausa
  const pauseSliderSpeed = document.getElementById('pause-slider-enemy-speed');
  const pauseSliderHp = document.getElementById('pause-slider-enemy-hp');

  if (pauseSliderSpeed) {
    pauseSliderSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      applyDifficultySettings(val, gameDifficulty.hpMultiplier, gameDifficulty.damageMultiplier, 'custom');
    });
  }

  if (pauseSliderHp) {
    pauseSliderHp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      applyDifficultySettings(gameDifficulty.speedMultiplier, val, gameDifficulty.damageMultiplier, 'custom');
    });
  }

  updateDifficultyUI();
}

initMenuNavigation();

function startGame() {
  if (isGameStarted) return;
  isGameStarted = true;
  toggleRoomEnvironmentLight('corridor', false);

  orbitControls.autoRotate = false;
  orbitControls.enabled = !isThirdPerson;

  // Iniciar e destravar o AudioContext durante o clique do usuario
  if (AUDIO_ENABLED) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  const startModal = document.getElementById('start-menu-modal');
  if (startModal) startModal.classList.add('hidden');
  playVictorySound();

  // Define o modelo ativo
  updateActiveCharacterModel();

  // Força o navegador a voltar para o topo e recalcular o tamanho do canvas
  // Isso evita o bug da tela cortada pela metade ao ocultar o menu modal.
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    window.dispatchEvent(new Event('resize'));
  }, 50);
}

const btnStartGame = document.getElementById('btn-start-game');
if (btnStartGame) btnStartGame.addEventListener('click', startGame);

// --- SELEÇÃO DE PERSONAGEM ---
const btnSelectJake = document.getElementById('btn-select-jake');
const btnSelectJane = document.getElementById('btn-select-jane');

function updateCharSelectionUI() {
  if (selectedCharacter === 'jake') {
    if (btnSelectJake) {
      btnSelectJake.style.borderColor = '#38bdf8';
      btnSelectJake.style.background = 'rgba(56, 189, 248, 0.2)';
      btnSelectJake.style.color = '#fff';
    }
    if (btnSelectJane) {
      btnSelectJane.style.borderColor = 'transparent';
      btnSelectJane.style.background = 'rgba(255, 255, 255, 0.05)';
      btnSelectJane.style.color = '#94a3b8';
    }
  } else {
    if (btnSelectJane) {
      btnSelectJane.style.borderColor = '#38bdf8';
      btnSelectJane.style.background = 'rgba(56, 189, 248, 0.2)';
      btnSelectJane.style.color = '#fff';
    }
    if (btnSelectJake) {
      btnSelectJake.style.borderColor = 'transparent';
      btnSelectJake.style.background = 'rgba(255, 255, 255, 0.05)';
      btnSelectJake.style.color = '#94a3b8';
    }
  }
}

if (btnSelectJake) {
  btnSelectJake.addEventListener('click', () => {
    selectedCharacter = 'jake';
    updateCharSelectionUI();
    updateActiveCharacterModel();
  });
}
if (btnSelectJane) {
  btnSelectJane.addEventListener('click', () => {
    selectedCharacter = 'jane';
    updateCharSelectionUI();
    updateActiveCharacterModel();
  });
}

const btnToggleHud = document.getElementById('btn-toggle-hud');
const floatingHudToggle = document.getElementById('floating-hud-toggle');
if (btnToggleHud) btnToggleHud.addEventListener('click', toggleHUD);
if (floatingHudToggle) floatingHudToggle.addEventListener('click', toggleHUD);

// Clique na tela para Disparo / Seleção de Armas
const badgeRev = document.getElementById('badge-weapon-revolver');
const badgeSht = document.getElementById('badge-weapon-shotgun');
const permanentWeaponHud = document.getElementById('permanent-weapon-hud');

if (badgeRev) badgeRev.addEventListener('click', () => equipWeapon('revolver'));
if (badgeSht) badgeSht.addEventListener('click', () => equipWeapon('shotgun'));

const permMedkitBtn = document.getElementById('perm-medkit-btn');
if (permMedkitBtn) {
  permMedkitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    useMedkit();
  });
}

const btnGameOverRestart = document.getElementById('btn-game-over-restart');
if (btnGameOverRestart) {
  btnGameOverRestart.addEventListener('click', () => {
    resetGameState();
    isGameStarted = false;
    const startModal = document.getElementById('start-menu-modal');
    if (startModal) {
      startModal.classList.remove('hidden');
      showMenuScreen('menu-screen-main');
    }
  });
}

if (permanentWeaponHud) {
  permanentWeaponHud.addEventListener('click', (e) => {
    if (e.target && e.target.closest('#perm-medkit-btn')) return;
    e.stopPropagation();
    const wRev = weaponInventory.revolver;
    const wSht = weaponInventory.shotgun;

    // Se a arma atual estiver vazia com reserva, recarrega
    if (equippedWeaponId && weaponInventory[equippedWeaponId].loadedAmmo === 0 && weaponInventory[equippedWeaponId].reserveAmmo > 0) {
      reloadActiveWeapon();
      return;
    }

    // Alterna armas adquiridas
    if (equippedWeaponId === null) {
      if (wRev.isAcquired) equipWeapon('revolver');
      else if (wSht.isAcquired) equipWeapon('shotgun');
    } else if (equippedWeaponId === 'revolver') {
      if (wSht.isAcquired) equipWeapon('shotgun');
      else equipWeapon(null);
    } else if (equippedWeaponId === 'shotgun') {
      if (wRev.isAcquired) equipWeapon('revolver');
      else equipWeapon(null);
    }
  });
}

// Lógica de Interação ('E' ou Coleta)
function handleInteraction() {
  if (isPlayerDead) return;
  const playerPos = playerGroup.position;

  // 1. Coletar Medicamentos 3D (até 2.5m)
  for (const medObj of collectibleMedkits) {
    if (!medObj.isCollected) {
      const dist = playerPos.distanceTo(medObj.group.position);
      if (dist < 2.5) {
        medObj.isCollected = true;
        medObj.group.visible = false;
        medkits++;
        playHealSound();
        updatePlayerHealthUI();
        if (interactionPrompt) interactionPrompt.classList.remove('hidden');
        if (promptText) promptText.textContent = `Coletou Medicamento! 💊 (+1 Medkit no inventário)`;
        return;
      }
    }
  }

  // 2. Coletar Armas 3D (até 2.5m)
  for (const wObj of collectibleWeapons) {
    if (!wObj.isCollected) {
      const dist = playerPos.distanceTo(wObj.group.position);
      if (dist < 2.5) {
        wObj.isCollected = true;
        wObj.group.visible = false;
        weaponInventory[wObj.id].isAcquired = true;
        weaponInventory[wObj.id].loadedAmmo = weaponInventory[wObj.id].maxMag;
        weaponInventory[wObj.id].reserveAmmo += weaponInventory[wObj.id].maxMag;
        equipWeapon(wObj.id);
        playKeySound();
        updateWeaponsUI();
        return;
      }
    }
  }

  // 3. Coletar Caixas de Munição 3D (até 2.5m)
  for (const aObj of collectibleAmmoBoxes) {
    if (!aObj.isCollected) {
      const dist = playerPos.distanceTo(aObj.group.position);
      if (dist < 2.5) {
        aObj.isCollected = true;
        aObj.group.visible = false;
        weaponInventory[aObj.type].reserveAmmo += aObj.amount;
        playAmmoPickupSound();
        updateWeaponsUI();
        if (interactionPrompt) interactionPrompt.classList.remove('hidden');
        if (promptText) promptText.textContent = `Coletou Munição de ${aObj.type === 'revolver' ? 'Revólver' : 'Shotgun'} (+${aObj.amount}) 📦`;
        return;
      }
    }
  }

  // 4. Coletar Chaves 3D (até 2.5m)
  for (const keyObj of keyObjects) {
    if (!keyObj.isCollected) {
      const dist = playerPos.distanceTo(keyObj.group.position);
      if (dist < 2.5) {
        keyObj.isCollected = true;
        keyObj.group.visible = false;
        acquiredKeys.add(keyObj.def.id);
        playKeySound();
        updateInventoryUI();
        updateGoalHUD();
        return;
      }
    }
  }

  // 5. Checa Porta Mestre (até 3.2m)
  if (grandExitGate) {
    const distToExit = playerPos.distanceTo(new THREE.Vector3(grandExitGate.x, 1.0, grandExitGate.z));
    if (distToExit < 3.2) {
      toggleGrandExitGate(grandExitGate);
      return;
    }
  }

  // 6. Portas de Quartos (até 2.6m)
  for (const door of interactiveDoors) {
    const dist = playerPos.distanceTo(new THREE.Vector3(door.x, 1.0, door.z));
    if (dist < 2.6) {
      toggleDoor(door);
      return;
    }
  }

  // 7. Interruptores de Luz na Parede (Apenas quando próximo, até 2.8m)
  let closestEnvId = null;
  let minDist = 2.8;

  for (const envId in roomEnvironments) {
    const env = roomEnvironments[envId];
    if (env.switchGroup) {
      const dist = playerPos.distanceTo(env.switchGroup.position);
      if (dist < minDist) {
        minDist = dist;
        closestEnvId = envId;
      }
    }
  }

  if (closestEnvId) {
    toggleRoomEnvironmentLight(closestEnvId);
    return;
  }
}

// Elementos HUD
const statRoom = document.getElementById('stat-room');
const statLight = document.getElementById('stat-light');
const statXZ = document.getElementById('stat-xz');
const statYSpeed = document.getElementById('stat-y-speed');
const statCollision = document.getElementById('stat-collision');
const btnReset = document.getElementById('btn-reset');
const btnReplay = document.getElementById('btn-replay');
const btnCamera = document.getElementById('btn-camera');
const btnToggleLight = document.getElementById('btn-toggle-light');
const interactionPrompt = document.getElementById('interaction-prompt');
const promptText = document.getElementById('prompt-text');

function updateHUDLightStat() {
  if (!statLight) return;
  const currentEnvId = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);
  const env = roomEnvironments[currentEnvId];
  if (env) {
    statLight.textContent = env.isLit ? `${env.name}: Acesa 💡` : `${env.name}: Apagada 🌙`;
    statLight.className = env.isLit ? 'stat-value badge-light-on' : 'stat-value badge-light-off';
  }
}

if (btnToggleLight) {
  btnToggleLight.addEventListener('click', () => {
    const currentEnvId = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);
    toggleRoomEnvironmentLight(currentEnvId);
  });
}

if (interactionPrompt) {
  interactionPrompt.addEventListener('click', () => handleInteraction());
}

// Raycaster para Interruptores e Interações no clique do mouse (Disparo de arma agora exclusivo na tecla G / [RT])
const raycaster = new THREE.Raycaster();

window.addEventListener('pointerdown', (e) => {
  if (e.target && e.target.closest && e.target.closest('#hud-overlay button, .btn-action, #interaction-prompt, a, #victory-modal, #floating-hud-toggle, #permanent-weapon-hud, #game-over-modal, #start-menu-modal')) {
    return;
  }
  if (e.button === 0) {
    const clickMouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(clickMouse, camera);
    const hits = raycaster.intersectObjects(switchClickables, true);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj && !obj.userData.envId && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData.envId) {
        const env = roomEnvironments[obj.userData.envId];
        if (env && env.switchGroup) {
          const dist = playerGroup.position.distanceTo(env.switchGroup.position);
          if (dist <= 3.5) {
            toggleRoomEnvironmentLight(obj.userData.envId);
          } else {
            if (interactionPrompt) interactionPrompt.classList.remove('hidden');
            if (promptText) promptText.textContent = 'Aproxime-se do interruptor na parede 💡';
            setTimeout(() => {
              if (promptText && promptText.textContent.includes('Aproxime-se')) {
                interactionPrompt.classList.add('hidden');
              }
            }, 1500);
          }
        }
      }
    }
  }
});

let isPointerDown = false;
let pointerLastX = 0, pointerLastY = 0;
let cameraYaw = -Math.PI / 2, cameraPitch = 0.20, cameraDistance = 3.8;

function updateZoom(deltaZoom) {
  cameraDistance = THREE.MathUtils.clamp(cameraDistance + deltaZoom, 2.5, 22.0);
  const statZoom = document.getElementById('stat-zoom');
  if (statZoom) statZoom.textContent = `${cameraDistance.toFixed(1)}m`;
}

window.addEventListener('wheel', (e) => {
  if (e.target && e.target.closest && e.target.closest('#hud-overlay, #victory-modal, #floating-hud-toggle, #permanent-weapon-hud, #start-menu-modal, #game-over-modal, #pause-modal')) return;
  e.preventDefault();
  updateZoom(e.deltaY > 0 ? 0.9 : -0.9);
}, { passive: false });

const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
if (btnZoomIn) btnZoomIn.addEventListener('click', () => updateZoom(-1.8));
if (btnZoomOut) btnZoomOut.addEventListener('click', () => updateZoom(1.8));

window.addEventListener('pointerdown', (e) => {
  if (e.target && e.target.closest && e.target.closest('#hud-overlay button, .btn-action, #interaction-prompt, a, #victory-modal, #floating-hud-toggle, #permanent-weapon-hud, #start-menu-modal, #game-over-modal, #pause-modal')) return;
  isPointerDown = true;
  pointerLastX = e.clientX; pointerLastY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isPointerDown) return;
  const dx = e.clientX - pointerLastX;
  const dy = e.clientY - pointerLastY;
  pointerLastX = e.clientX; pointerLastY = e.clientY;

  if (isThirdPerson) {
    cameraYaw -= dx * 0.005;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.004, -0.15, 1.15);
  }
});

window.addEventListener('pointerup', () => { isPointerDown = false; });

function resetGameState() {
  acquiredKeys.clear();
  keyObjects.forEach(k => { k.isCollected = false; k.group.visible = true; });
  collectibleWeapons.forEach(w => { w.isCollected = false; w.group.visible = true; });
  collectibleAmmoBoxes.forEach(a => { a.isCollected = false; a.group.visible = true; });
  collectibleMedkits.forEach(m => { m.isCollected = false; m.group.visible = true; });

  // Remove a chave mestre se tiver sido criada por drop de sessão anterior
  const masterKeyIndex = keyObjects.findIndex(k => k.def.id === 'key_master');
  if (masterKeyIndex >= 0) {
    scene.remove(keyObjects[masterKeyIndex].group);
    keyObjects.splice(masterKeyIndex, 1);
  }

  // Reseta Inimigos
  activeEnemies.forEach(e => {
    e.isDead = false;
    e.maxHp = Math.round(e.baseHp * gameDifficulty.hpMultiplier);
    e.hp = e.maxHp;
    e.speed = e.baseSpeed * gameDifficulty.speedMultiplier;
    e.damage = Math.round(e.baseDamage * gameDifficulty.damageMultiplier);
    e.dyingTimer = 0;
    e.hitFlashTimer = 0;
    e.attackCooldown = 0;
    e.isAggro = false;
    e.group.position.set(e.initialX, e.initialY, e.initialZ);
    e.group.rotation.set(0, 0, 0);
    e.group.visible = true;
    e.skinMat.emissive.setHex(0x000000);
    e.skinMat.emissiveIntensity = 0.0;
  });

  // Reseta Saúde e Inventário do Jogador
  playerHealth = 100;
  medkits = 0;
  isPlayerDead = false;
  invulnerableTimer = 0;

  weaponInventory.revolver.isAcquired = false; weaponInventory.revolver.loadedAmmo = 0; weaponInventory.revolver.reserveAmmo = 0;
  weaponInventory.shotgun.isAcquired = false; weaponInventory.shotgun.loadedAmmo = 0; weaponInventory.shotgun.reserveAmmo = 0;
  equipWeapon(null);

  interactiveDoors.forEach(d => {
    d.isOpen = false; d.isUnlocked = !d.requiredKey; d.targetAngle = 0;
    if (d.colliderIndex >= 0 && wallColliders[d.colliderIndex]) wallColliders[d.colliderIndex].disabled = false;
  });
  if (grandExitGate) {
    grandExitGate.isOpen = false; grandExitGate.targetAngle = 0;
    if (grandExitGate.colliderIndex >= 0 && wallColliders[grandExitGate.colliderIndex]) wallColliders[grandExitGate.colliderIndex].disabled = false;
  }

  for (const envId in roomFogObjects) {
    const fogObj = roomFogObjects[envId];
    fogObj.isCleared = false; fogObj.targetOpacity = 0.96;
    fogObj.fogMat.opacity = 0.96; fogObj.barrierMat.opacity = 0.95; fogObj.group.visible = true;
  }

  playerGroup.position.set(25, 1.0, 0);
  velocity.set(0, 0, 0); velocityY = 0;
  isGrounded = true; playerRotation = Math.PI / 2;
  playerGroup.rotation.y = playerRotation; cameraYaw = -Math.PI / 2; cameraPitch = 0.20; cameraDistance = 3.8;

  const victoryModal = document.getElementById('victory-modal');
  if (victoryModal) victoryModal.classList.add('hidden');

  const gameOverModal = document.getElementById('game-over-modal');
  if (gameOverModal) gameOverModal.classList.add('hidden');

  const pauseModal = document.getElementById('pause-modal');
  if (pauseModal) pauseModal.classList.add('hidden');
  isGamePaused = false;

  const bossContainer = document.getElementById('boss-health-container');
  if (bossContainer) bossContainer.classList.add('hidden');

  updateInventoryUI();
  updateWeaponsUI();
  updatePlayerHealthUI();
  updateGoalHUD();
}

if (btnReset) btnReset.addEventListener('click', () => resetGameState());
if (btnReplay) btnReplay.addEventListener('click', () => resetGameState());

btnCamera.addEventListener('click', () => {
  isThirdPerson = !isThirdPerson;
  orbitControls.enabled = !isThirdPerson;
  if (!isThirdPerson) {
    orbitControls.target.copy(playerGroup.position);
    btnCamera.innerHTML = `Câmera Livre Ativa`;
  } else {
    btnCamera.innerHTML = `Alternar Ângulo`;
  }
});

function getRoomIdAtPosition(px, pz) {
  if (pz < -3.6) {
    if (px < -10.2) return 'q101';
    if (px < 2.0) return 'q102';
    return 'q103';
  } else if (pz > 3.6) {
    if (px < -14.0) return 'q104';
    if (px < 2.0) return 'q105';
    return 'q106';
  }
  return 'corridor';
}

// --- SISTEMA DE COLISÃO 3D ---
function checkAndResolveCollisions3D(newPos) {
  let collided = false;
  let collisionMsg = '';

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
      if (minOverlap === overlapLeft) { newPos.x = wall.minX; velocity.x = 0; }
      else if (minOverlap === overlapRight) { newPos.x = wall.maxX; velocity.x = 0; }
      else if (minOverlap === overlapTop) { newPos.z = wall.minZ; velocity.z = 0; }
      else { newPos.z = wall.maxZ; velocity.z = 0; }
    }
  }

  const playerFeetY = newPos.y - 1.0;
  let maxGroundUnderPlayer = 1.0;

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
        if (minOverlap === overlapLeft) { newPos.x = box.minX - PLAYER_RADIUS; velocity.x = 0; }
        else if (minOverlap === overlapRight) { newPos.x = box.maxX + PLAYER_RADIUS; velocity.x = 0; }
        else if (minOverlap === overlapTop) { newPos.z = box.minZ - PLAYER_RADIUS; velocity.z = 0; }
        else { newPos.z = box.maxZ + PLAYER_RADIUS; velocity.z = 0; }
      }
    }
  }

  return { collided, collisionMsg, targetGroundY: maxGroundUnderPlayer };
}

// --- CÂMERA EM TERCEIRA PESSOA ---
const currentCameraPos = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

camera.position.set(28.8, 2.1, 0.0);
currentCameraPos.copy(camera.position);
currentLookAt.copy(playerGroup.position);
camera.lookAt(playerGroup.position);
playerRotation = Math.PI / 2;
playerGroup.rotation.y = playerRotation;

// --- LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // --- SISTEMA DE NAVEGAÇÃO DE MENU COM GAMEPAD ---
  let gpUI = null;
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    gpUI = activeGamepadIndex !== null ? gamepads[activeGamepadIndex] : (gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]);
  }

  if (gpUI && gpUI.connected) {
    // Se o jogo NÃO começou OU está pausado, os menus estão ativos
    if (!isGameStarted || isGamePaused) {
      handleGamepadMenuNavigation(gpUI);
    }
  }

  // Leitura do controle durante a pausa (para despausar com Start / A / B / Back)
  if (isGamePaused) {
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      const gp = activeGamepadIndex !== null ? gamepads[activeGamepadIndex] : (gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]);
      if (gpUI && gpUI.connected) {
        // Start (9) sempre despausa e volta ao jogo, independentemente do menu em que estiver
        if (isButtonJustPressed(gpUI, 9)) {
          togglePauseGame(false);
        }
      }
    }
    renderer.render(scene, camera);
    return;
  }

  const delta = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  // Animação das névoas
  for (const envId in roomFogObjects) {
    const fogObj = roomFogObjects[envId];
    if (fogObj.group.visible) {
      fogObj.fogMat.opacity = THREE.MathUtils.lerp(fogObj.fogMat.opacity, fogObj.targetOpacity, delta * 3.5);
      fogObj.barrierMat.opacity = THREE.MathUtils.lerp(fogObj.barrierMat.opacity, fogObj.targetOpacity, delta * 3.5);
      if (fogObj.fogMat.opacity <= 0.02) fogObj.group.visible = false;
    }
  }

  // Animação das chaves 3D
  for (const keyObj of keyObjects) {
    if (!keyObj.isCollected) {
      keyObj.group.rotation.y = time * 2.5;
      keyObj.group.position.y = keyObj.initialY + Math.sin(time * 3.8) * 0.08;
    }
  }

  // Animação das armas coletáveis 3D
  for (const wObj of collectibleWeapons) {
    if (!wObj.isCollected) {
      wObj.group.rotation.y = time * 2.0;
      wObj.group.position.y = wObj.initialY + Math.sin(time * 3.2) * 0.06;
    }
  }

  // Animação das caixas de munição 3D
  for (const aObj of collectibleAmmoBoxes) {
    if (!aObj.isCollected) {
      aObj.group.rotation.y = time * 1.5;
      aObj.group.position.y = aObj.initialY + Math.sin(time * 2.8) * 0.04;
    }
  }

  // Animação dos medicamentos (Medkits) 3D
  for (const medObj of collectibleMedkits) {
    if (!medObj.isCollected) {
      medObj.group.rotation.y = time * 2.2;
      medObj.group.position.y = medObj.initialY + Math.sin(time * 3.5) * 0.05;
    }
  }

  // --- IA E ATUALIZAÇÃO DOS INIMIGOS E BOSS ---
  const currentRoomId = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);

  for (const enemy of activeEnemies) {
    // Decréscimo de cooldowns e flashes
    if (enemy.hitFlashTimer > 0) {
      enemy.hitFlashTimer -= delta;
      enemy.skinMat.emissive.setHex(0xff0000);
      enemy.skinMat.emissiveIntensity = 2.5;
    } else {
      enemy.skinMat.emissive.setHex(0x000000);
      enemy.skinMat.emissiveIntensity = 0.0;
    }

    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= delta;
    }

    // Comportamento se o inimigo morreu
    if (enemy.isDead) {
      if (enemy.dyingTimer > 0) {
        enemy.dyingTimer -= delta * 2.0;
        enemy.group.rotation.x = (1.0 - Math.max(0, enemy.dyingTimer)) * (Math.PI / 2.2);
        enemy.group.position.y = THREE.MathUtils.lerp(enemy.initialY, 0.25, 1.0 - Math.max(0, enemy.dyingTimer));
      }
      continue;
    }

    const distToPlayer = enemy.group.position.distanceTo(playerGroup.position);

    // Sons aleatórios de gemido do zumbi
    if (distToPlayer < 14.0) {
      enemy.groanTimer -= delta;
      if (enemy.groanTimer <= 0) {
        playZombieGroanSound();
        enemy.groanTimer = Math.random() * 6.0 + 4.0;
      }
    }

    // Checa se o inimigo foi ativado (Aggro estrito por quarto / porta aberta)
    const doorNumber = enemy.targetRoom ? enemy.targetRoom.replace('q', '') : null;
    const roomDoor = doorNumber ? interactiveDoors.find(d => d.roomNumber === doorNumber) : null;
    const isDoorOpen = roomDoor ? roomDoor.isOpen : false;
    const enemyCurrentRoom = getRoomIdAtPosition(enemy.group.position.x, enemy.group.position.z);
    const isInSameRoom = (currentRoomId === enemy.targetRoom || (enemyCurrentRoom !== 'corridor' && currentRoomId === enemyCurrentRoom));

    if (isInSameRoom || (isDoorOpen && distToPlayer < 14.0)) {
      enemy.isAggro = true;
    }

    // Perseguição inteligente ao jogador (Entra e sai das salas pelas portas sem travar)
    if (enemy.isAggro && !isPlayerDead && (isInSameRoom || isDoorOpen)) {
      let targetMovePos = playerGroup.position.clone();

      // 1. Inimigo dentro de uma sala e o jogador está no corredor ou em outro quarto:
      if (enemyCurrentRoom !== 'corridor' && currentRoomId !== enemyCurrentRoom) {
        const enemyDoor = interactiveDoors.find(d => 'q' + d.roomNumber === enemyCurrentRoom);
        if (enemyDoor && enemyDoor.isOpen) {
          const isAlignedX = Math.abs(enemy.group.position.x - enemyDoor.x) < 0.65;
          if (!isAlignedX) {
            // Estágio 1A: Alinha o eixo X com o vão da porta
            targetMovePos = new THREE.Vector3(enemyDoor.x, enemy.group.position.y, enemy.group.position.z);
          } else {
            // Estágio 1B: Atravessa a porta diretamente para o centro do corredor central (z = 0.0)
            targetMovePos = new THREE.Vector3(enemyDoor.x, enemy.group.position.y, 0.0);
          }
        }
      }
      // 2. Inimigo no corredor e o jogador está dentro de um quarto com porta aberta:
      else if (enemyCurrentRoom === 'corridor' && currentRoomId !== 'corridor') {
        const targetDoor = interactiveDoors.find(d => 'q' + d.roomNumber === currentRoomId);
        if (targetDoor && targetDoor.isOpen) {
          const isAlignedX = Math.abs(enemy.group.position.x - targetDoor.x) < 0.65;
          if (!isAlignedX) {
            // Estágio 2A: Desloca-se pelo corredor central livre até ficar alinhado com a porta
            targetMovePos = new THREE.Vector3(targetDoor.x, enemy.group.position.y, 0.0);
          } else {
            // Estágio 2B: Entra diretamente pelo vão da porta para dentro do quarto
            const targetZ = targetDoor.isNorthSide ? -8.0 : 8.0;
            targetMovePos = new THREE.Vector3(targetDoor.x, enemy.group.position.y, targetZ);
          }
        }
      }

      const toTarget = targetMovePos.clone().sub(enemy.group.position);
      toTarget.y = 0;
      const distTarget = toTarget.length();

      const toPlayer = playerGroup.position.clone().sub(enemy.group.position);
      toPlayer.y = 0;
      const realDistToPlayer = toPlayer.length();

      if (distTarget > 0.05) {
        // Rotação em direção ao alvo de navegação ou ao jogador
        const lookDir = distTarget < 1.2 ? toPlayer : toTarget;
        const targetAngle = Math.atan2(lookDir.x, lookDir.z);
        let angleDiff = targetAngle - enemy.group.rotation.y;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        enemy.group.rotation.y += angleDiff * Math.min(1.0, 9.0 * delta);

        const stopDist = enemy.isBoss ? 1.8 : 1.15;
        if (realDistToPlayer > stopDist) {
          toTarget.normalize();

          // Calcula próxima posição
          const nextEnemyX = enemy.group.position.x + toTarget.x * enemy.speed * delta;
          const nextEnemyZ = enemy.group.position.z + toTarget.z * enemy.speed * delta;
          const enemyRadius = enemy.isBoss ? 0.45 : 0.18;

          let allowedX = nextEnemyX;
          let allowedZ = nextEnemyZ;

          // Colisão com as Paredes do Hotel (Com passagem fluida por portas abertas)
          for (const wall of wallColliders) {
            if (wall.disabled) continue;

            // Se o inimigo estiver próximo a qualquer porta aberta (< 3.4m), ignora batentes e paredes no vão
            let ignoreWallForDoor = false;
            for (const d of interactiveDoors) {
              if (d.isOpen) {
                const distToDoor = Math.hypot(enemy.group.position.x - d.x, enemy.group.position.z - d.z);
                if (distToDoor < 3.4) {
                  const wallMidX = (wall.minX + wall.maxX) / 2;
                  const wallMidZ = (wall.minZ + wall.maxZ) / 2;
                  if (Math.abs(wallMidX - d.x) < 3.2 && Math.abs(wallMidZ - d.z) < 3.2) {
                    ignoreWallForDoor = true;
                    break;
                  }
                }
              }
            }
            if (ignoreWallForDoor) continue;

            const trueMinX = wall.minX + PLAYER_RADIUS;
            const trueMaxX = wall.maxX - PLAYER_RADIUS;
            const trueMinZ = wall.minZ + PLAYER_RADIUS;
            const trueMaxZ = wall.maxZ - PLAYER_RADIUS;

            const collidesWithNext = (
              allowedX + enemyRadius > trueMinX &&
              allowedX - enemyRadius < trueMaxX &&
              allowedZ + enemyRadius > trueMinZ &&
              allowedZ - enemyRadius < trueMaxZ
            );

            if (collidesWithNext) {
              const collidesXOnly = (
                allowedX + enemyRadius > trueMinX &&
                allowedX - enemyRadius < trueMaxX &&
                enemy.group.position.z + enemyRadius > trueMinZ &&
                enemy.group.position.z - enemyRadius < trueMaxZ
              );
              const collidesZOnly = (
                enemy.group.position.x + enemyRadius > trueMinX &&
                enemy.group.position.x - enemyRadius < trueMaxX &&
                allowedZ + enemyRadius > trueMinZ &&
                allowedZ - enemyRadius < trueMaxZ
              );

              if (collidesXOnly && !collidesZOnly) {
                allowedX = enemy.group.position.x;
              } else if (collidesZOnly && !collidesXOnly) {
                allowedZ = enemy.group.position.z;
              } else {
                if (Math.abs(toTarget.x) > Math.abs(toTarget.z)) {
                  allowedZ = enemy.group.position.z;
                } else {
                  allowedX = enemy.group.position.x;
                }
              }
            }
          }

          enemy.group.position.x = allowedX;
          enemy.group.position.z = allowedZ;

          // Animação de caminhada
          enemy.walkCycle += delta * (enemy.speed * 3.2);
          enemy.leftLeg.rotation.x = Math.sin(enemy.walkCycle) * 0.45;
          enemy.rightLeg.rotation.x = -Math.sin(enemy.walkCycle) * 0.45;
          enemy.leftArm.rotation.x = -Math.PI / 3 + Math.sin(enemy.walkCycle) * 0.25;
          enemy.rightArm.rotation.x = -Math.PI / 3 - Math.sin(enemy.walkCycle) * 0.25;
        } else {
          // Inimigo no alcance de ataque do jogador
          if (enemy.attackCooldown <= 0) {
            damagePlayer(enemy.damage, enemy.name);
            enemy.attackCooldown = enemy.isBoss ? 1.6 : 1.2;

            // Pose de ataque
            enemy.leftArm.rotation.x = -Math.PI / 1.6;
            enemy.rightArm.rotation.x = -Math.PI / 1.6;
          }
        }
      }
    }
  }

  // Atualização da barra de vida do Chefe
  updateBossHealthUI();

  // Temporizador de invulnerabilidade do jogador (Piscar)
  if (invulnerableTimer > 0) {
    invulnerableTimer -= delta;
    if (playerBody) playerBody.visible = (Math.floor(time * 24) % 2 === 0);
  } else {
    if (playerBody) playerBody.visible = true;
  }

  // Movimento
  const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

  const inputVector = new THREE.Vector3();

  // Bloqueia controles se o jogo ainda não começou ou está pausado
  if (isGameStarted && !isGamePaused) {
    if (keys.w) inputVector.add(forward);
    if (keys.s) inputVector.sub(forward);
    if (keys.a) inputVector.sub(right);
    if (keys.d) inputVector.add(right);
  }

  // --- LEITURA DO CONTROLE XBOX / GAMEPAD ---
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    const gp = activeGamepadIndex !== null ? gamepads[activeGamepadIndex] : (gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]);
    if (gp && gp.connected) {
      // Iniciar Jogo via Controle (Start) - O 'A' agora é lidado pelo menu navigator
      if (!isGameStarted) {
        if (isButtonJustPressed(gp, 9)) {
          startGame();
        }
      }

      if (isGameStarted && !isGamePaused) {
        // Analógico Esquerdo: Movimento
        const rawLX = gp.axes[0] || 0;
        const rawLY = gp.axes[1] || 0;
        const stickLX = applyAxisDeadzone(rawLX, 0.16);
        const stickLY = applyAxisDeadzone(rawLY, 0.16);

        if (Math.abs(stickLX) > 0 || Math.abs(stickLY) > 0) {
          inputVector.addScaledVector(forward, -stickLY);
          inputVector.addScaledVector(right, stickLX);
        }

        // Analógico Direito: Câmera / Rotação
        const rawRX = gp.axes[2] || 0;
        const rawRY = gp.axes[3] || 0;
        const stickRX = applyAxisDeadzone(rawRX, 0.16);
        const stickRY = applyAxisDeadzone(rawRY, 0.16);

        if (Math.abs(stickRX) > 0 || Math.abs(stickRY) > 0) {
          if (isThirdPerson) {
            cameraYaw -= stickRX * delta * 3.4;
            cameraPitch = THREE.MathUtils.clamp(cameraPitch + stickRY * delta * 2.6, -0.15, 1.15);
          }
        }

        // Botão A (0): Pulo
        if (gp.buttons[0] && (gp.buttons[0].pressed || gp.buttons[0].value > 0.5)) {
          if (isGrounded) {
            velocityY = JUMP_FORCE;
            isGrounded = false;
            playJumpSound();
            const keySpaceElem = document.getElementById('key-space');
            if (keySpaceElem) keySpaceElem.classList.add('active');
          }
        }

        // Gatilho Direito RT (7): Atirar
        if (isButtonJustPressed(gp, 7)) {
          fireActiveWeapon();
        }

        // Botão RB (5): Recarregar
        if (isButtonJustPressed(gp, 5)) {
          reloadActiveWeapon();
        }

        // Gatilho Esquerdo LT (6): Aproximar Câmera / Mira (Zoom In)
        const ltValue = gp.buttons[6] ? (gp.buttons[6].value || (gp.buttons[6].pressed ? 1 : 0)) : 0;
        if (ltValue > 0.25 || (gp.axes[4] && gp.axes[4] > 0.3)) {
          updateZoom(-delta * 4.5);
        }

        // Botão Superior Esquerdo LB (4): Afastar Câmera (Zoom Out)
        const lbPressed = gp.buttons[4] && (gp.buttons[4].pressed || gp.buttons[4].value > 0.3);
        if (lbPressed) {
          updateZoom(delta * 4.5);
        }

        // Botão X (2): Interagir / Coletar
        if (isButtonJustPressed(gp, 2)) {
          handleInteraction();
        }

        // Botão B (1): Alternar Luz do Quarto (Apenas próximo ao interruptor)
        if (isButtonJustPressed(gp, 1)) {
          let closestEnv = null;
          let minD = 2.8;
          for (const envId in roomEnvironments) {
            const env = roomEnvironments[envId];
            if (env.switchGroup) {
              const d = playerGroup.position.distanceTo(env.switchGroup.position);
              if (d < minD) { minD = d; closestEnv = envId; }
            }
          }
          if (closestEnv) {
            toggleRoomEnvironmentLight(closestEnv);
          } else {
            if (interactionPrompt) interactionPrompt.classList.remove('hidden');
            if (promptText) promptText.textContent = 'Aproxime-se do interruptor na parede 💡';
            setTimeout(() => {
              if (promptText && promptText.textContent.includes('Aproxime-se')) {
                interactionPrompt.classList.add('hidden');
              }
            }, 1500);
          }
        }

        // Botão Y (3): Ciclar Armas
        if (isButtonJustPressed(gp, 3)) {
          const wRev = weaponInventory.revolver;
          const wSht = weaponInventory.shotgun;
          if (equippedWeaponId === null) {
            if (wRev.isAcquired) equipWeapon('revolver');
            else if (wSht.isAcquired) equipWeapon('shotgun');
          } else if (equippedWeaponId === 'revolver') {
            if (wSht.isAcquired) equipWeapon('shotgun');
            else equipWeapon(null);
          } else if (equippedWeaponId === 'shotgun') {
            if (wRev.isAcquired) equipWeapon('revolver');
            else equipWeapon(null);
          }
        }

        // D-Pad Cima (12): Curar com Medicamento 💊
        if (isButtonJustPressed(gp, 12)) {
          useMedkit();
        }

        // Select / View / Back (8): Alternar HUD
        if (isButtonJustPressed(gp, 8)) {
          toggleHUD();
        }

        // D-Pad Esquerdo (14): Revólver
        if (isButtonJustPressed(gp, 14)) {
          equipWeapon('revolver');
        }

        // D-Pad Direito (15): Shotgun
        if (isButtonJustPressed(gp, 15)) {
          equipWeapon('shotgun');
        }

        // D-Pad Baixo (13): Desarmar
        if (isButtonJustPressed(gp, 13)) {
          equipWeapon(null);
        }
      } // Fim do if (isGameStarted && !isGamePaused)

      // Start/Menu (9): Pausar / Despausar Jogo
      if (isButtonJustPressed(gp, 9)) {
        if (isGameStarted) {
          togglePauseGame();
        } else {
          startGame();
        }
      }
    }
  }

  if (isGameStarted && !isGamePaused) {
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
  }

  const isMoving = inputVector.lengthSq() > 0;

  if (isMoving) {
    inputVector.normalize();
    velocity.x += inputVector.x * ACCELERATION * delta;
    velocity.z += inputVector.z * ACCELERATION * delta;

    let isRunning = keys.shift;
    if (isGamepadConnected && navigator.getGamepads) {
      const gp = navigator.getGamepads()[activeGamepadIndex];
      // Analógico esquerdo totalmente empurrado ou botão L3
      if (gp && ((gp.buttons[10] && gp.buttons[10].pressed) || inputVector.length() > 0.85)) {
        isRunning = true;
      }
    }

    const currentMaxSpeed = isRunning ? RUN_SPEED : MOVE_SPEED;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (speed > currentMaxSpeed) {
      velocity.x = (velocity.x / speed) * currentMaxSpeed;
      velocity.z = (velocity.z / speed) * currentMaxSpeed;
    }

    const targetAngle = Math.atan2(inputVector.x, inputVector.z);
    let angleDiff = targetAngle - playerRotation;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    playerRotation += angleDiff * Math.min(1.0, 14.0 * delta);
    playerGroup.rotation.y = playerRotation;

    if (isGrounded) {
      walkBobTimer += delta * (isRunning ? 20 : 14);
      if (playerMixer) playPlayerAnim(isRunning ? 'run' : 'walk');

      const useProcedural = !(selectedCharacter === 'jane' && janeHasSkeleton);

      if (playerBody && useProcedural) {
        // Elevação de cada passo (bounce)
        playerBody.position.y = -1.0 + Math.abs(Math.sin(walkBobTimer)) * 0.12;
        // Ginga de ombros lateral (sway)
        playerBody.rotation.z = Math.sin(walkBobTimer * 0.5) * 0.08;
        // Inclinação corporal ao caminhar/correr (forward tilt)
        const baseRotX = (selectedCharacter === 'jane' ? -Math.PI / 2 : 0);
        playerBody.rotation.x = baseRotX + Math.sin(walkBobTimer) * 0.04 + 0.06;
      } else if (playerBody) {
        // Personagem animado via FBX Mixer (não precisa de bobbing procedimental)
        playerBody.position.y = -1.0;
        // Não forçamos rotação X ou Z para 0 aqui, pois a rotação inicial já foi configurada no onLoad.
      }
    }
  } else {
    idleAnimTimer += delta * 3;
    if (playerMixer) playPlayerAnim('idle');
    velocity.x -= velocity.x * FRICTION * delta;
    velocity.z -= velocity.z * FRICTION * delta;
    if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
    if (Math.abs(velocity.z) < 0.01) velocity.z = 0;
    if (isGrounded) {
      const useProcedural = !(selectedCharacter === 'jane' && janeHasSkeleton);

      if (playerBody && useProcedural) {
        // Respiração idle realista (subida e descida suave do peito)
        playerBody.position.y = -1.0 + Math.sin(idleAnimTimer) * 0.025;
        playerBody.rotation.z = Math.sin(idleAnimTimer * 0.5) * 0.02;
        const baseRotX = (selectedCharacter === 'jane' ? -Math.PI / 2 : 0);
        playerBody.rotation.x = baseRotX;
      } else if (playerBody) {
        playerBody.position.y = -1.0;
      }
    }
  }

  if (!isGrounded && playerBody) {
    const useProcedural = !(selectedCharacter === 'jane' && janeHasSkeleton);
    if (useProcedural) {
      // Inclinação no ar durante o pulo
      const baseRotX = (selectedCharacter === 'jane' ? -Math.PI / 2 : 0);
      playerBody.rotation.x = baseRotX - 0.12;
    }
  }

  // Atualiza o mixer FBX (se o modelo tiver rig/ossos)
  if (playerMixer) {
    playerMixer.update(delta);
  }

  velocityY += GRAVITY * delta;

  const newPos = playerGroup.position.clone();
  newPos.x += velocity.x * delta;
  newPos.z += velocity.z * delta;
  newPos.y += velocityY * delta;

  const collisionResult = checkAndResolveCollisions3D(newPos);

  if (newPos.y <= collisionResult.targetGroundY) {
    newPos.y = collisionResult.targetGroundY;
    velocityY = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }

  playerGroup.position.copy(newPos);

  if (isThirdPerson && isGameStarted) {
    const offsetX = cameraDistance * Math.sin(cameraYaw) * Math.cos(cameraPitch);
    const offsetY = cameraDistance * Math.sin(cameraPitch);
    const offsetZ = cameraDistance * Math.cos(cameraYaw) * Math.cos(cameraPitch);

    const targetCameraPos = new THREE.Vector3(
      playerGroup.position.x + offsetX,
      playerGroup.position.y + offsetY + 1.2,
      playerGroup.position.z + offsetZ
    );

    // No corredor central, impede a câmera de penetrar as paredes laterais (z = ±3.6)
    const curRoomId = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);
    if (curRoomId === 'corridor') {
      targetCameraPos.z = THREE.MathUtils.clamp(targetCameraPos.z, -2.8, 2.8);
      targetCameraPos.x = THREE.MathUtils.clamp(targetCameraPos.x, -28.5, 28.5);
    }

    currentCameraPos.lerp(targetCameraPos, Math.min(1.0, 10.0 * delta));
    camera.position.copy(currentCameraPos);

    const lookTarget = playerGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    currentLookAt.lerp(lookTarget, Math.min(1.0, 12.0 * delta));
    camera.lookAt(currentLookAt);
  } else {
    orbitControls.target.copy(playerGroup.position);
    orbitControls.update();
  }

  // Animação de portas
  for (const door of interactiveDoors) {
    door.currentAngle = THREE.MathUtils.lerp(door.currentAngle, door.targetAngle, delta * 7.0);
    door.pivot.rotation.y = door.currentAngle;
  }

  if (grandExitGate) {
    grandExitGate.currentAngle = THREE.MathUtils.lerp(grandExitGate.currentAngle, grandExitGate.targetAngle, delta * 5.0);
    grandExitGate.pivotLeft.rotation.y = grandExitGate.currentAngle;
    grandExitGate.pivotRight.rotation.y = -grandExitGate.currentAngle;
  }

  // Luzes dos ambientes
  for (const envId in roomEnvironments) {
    const env = roomEnvironments[envId];
    const targetMultiplier = env.isLit ? 1.0 : 0.0;
    for (const lightObj of env.lights) {
      const maxI = lightObj.userData.maxIntensity || 1.0;
      lightObj.intensity = THREE.MathUtils.lerp(lightObj.intensity, maxI * targetMultiplier, delta * 8.0);
    }
    if (env.lampMats) {
      const targetEmissive = env.isLit ? 2.5 : 0.0;
      for (const m of env.lampMats) {
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, targetEmissive, delta * 8.0);
      }
    }
  }

  // Prompts HUD
  const currentEnvId = getRoomIdAtPosition(playerGroup.position.x, playerGroup.position.z);
  if (statRoom) {
    const env = roomEnvironments[currentEnvId];
    statRoom.textContent = env ? `${env.name} 🏨` : 'Corredor Central 🏨';
  }
  updateHUDLightStat();

  let nearInteractive = null;

  // 1. Checa Medicamentos Próximos
  for (const medObj of collectibleMedkits) {
    if (!medObj.isCollected) {
      const dist = playerGroup.position.distanceTo(medObj.group.position);
      if (dist < 2.5) { nearInteractive = { type: 'medkit', medObj }; break; }
    }
  }

  // 2. Checa Armas Próximas
  if (!nearInteractive) {
    for (const wObj of collectibleWeapons) {
      if (!wObj.isCollected) {
        const dist = playerGroup.position.distanceTo(wObj.group.position);
        if (dist < 2.5) { nearInteractive = { type: 'weapon', wObj }; break; }
      }
    }
  }

  // 3. Checa Munições Próximas
  if (!nearInteractive) {
    for (const aObj of collectibleAmmoBoxes) {
      if (!aObj.isCollected) {
        const dist = playerGroup.position.distanceTo(aObj.group.position);
        if (dist < 2.5) { nearInteractive = { type: 'ammo', aObj }; break; }
      }
    }
  }

  // 4. Checa Chaves 3D Próximas
  if (!nearInteractive) {
    for (const keyObj of keyObjects) {
      if (!keyObj.isCollected) {
        const dist = playerGroup.position.distanceTo(keyObj.group.position);
        if (dist < 2.5) { nearInteractive = { type: 'key', keyObj }; break; }
      }
    }
  }

  // 5. Checa Porta Mestre
  if (!nearInteractive && grandExitGate) {
    const dist = playerGroup.position.distanceTo(new THREE.Vector3(grandExitGate.x, 1.0, grandExitGate.z));
    if (dist < 3.2) { nearInteractive = { type: 'exitGate', gate: grandExitGate }; }
  }

  // 6. Checa Portas de Quartos
  if (!nearInteractive) {
    for (const door of interactiveDoors) {
      const dist = playerGroup.position.distanceTo(new THREE.Vector3(door.x, 1.0, door.z));
      if (dist < 2.6) { nearInteractive = { type: 'door', door }; break; }
    }
  }

  // 7. Checa Interruptores
  if (!nearInteractive) {
    for (const envId in roomEnvironments) {
      const env = roomEnvironments[envId];
      if (env.switchGroup) {
        const dist = playerGroup.position.distanceTo(env.switchGroup.position);
        if (dist < 3.0) { nearInteractive = { type: 'switch', env }; break; }
      }
    }
  }

  if (nearInteractive) {
    if (interactionPrompt) interactionPrompt.classList.remove('hidden');
    if (nearInteractive.type === 'medkit') {
      const m = nearInteractive.medObj;
      if (promptText) promptText.textContent = `Pegar Medicamento 💊 em ${m.roomName} (E)`;
    } else if (nearInteractive.type === 'weapon') {
      const w = nearInteractive.wObj;
      if (promptText) promptText.textContent = `Coletar ${w.name} em ${w.roomName} (E)`;
    } else if (nearInteractive.type === 'ammo') {
      const a = nearInteractive.aObj;
      if (promptText) promptText.textContent = `Pegar Munição de ${a.type === 'revolver' ? 'Revólver' : 'Shotgun'} (+${a.amount}) (E)`;
    } else if (nearInteractive.type === 'key') {
      const k = nearInteractive.keyObj.def;
      if (promptText) promptText.textContent = `Pegar ${k.name} em ${k.roomName} (E)`;
    } else if (nearInteractive.type === 'exitGate') {
      const g = nearInteractive.gate;
      if (!acquiredKeys.has('key_master')) {
        if (promptText) promptText.textContent = `🔒 PORTA MESTRE TRANCADA (Requer Chave Mestre)`;
      } else {
        if (promptText) promptText.textContent = g.isOpen ? `Fechar Porta Mestre (E)` : `Abrir PORTA MESTRE e Escapar! (E)`;
      }
    } else if (nearInteractive.type === 'door') {
      const d = nearInteractive.door;
      if (d.requiredKey && !acquiredKeys.has(d.requiredKey) && !d.isUnlocked) {
        const reqKey = KEY_DEFS.find(k => k.id === d.requiredKey);
        const kName = reqKey ? reqKey.name : `Chave Q.${d.roomNumber}`;
        if (promptText) promptText.textContent = `🔒 Porta ${d.roomNumber} Trancada (Requer ${kName})`;
      } else {
        if (promptText) promptText.textContent = d.isOpen ? `Fechar Porta ${d.roomNumber} (${d.name}) (E)` : `Abrir Porta ${d.roomNumber} (${d.name}) (E)`;
      }
    } else if (nearInteractive.type === 'switch') {
      const env = nearInteractive.env;
      if (promptText) promptText.textContent = env.isLit ? `Apagar Luz do ${env.name} (E)` : `Acender Luz do ${env.name} (E)`;
    }
  } else {
    if (interactionPrompt) interactionPrompt.classList.add('hidden');
  }

  // Telemetria
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  if (statXZ) statXZ.textContent = `${playerGroup.position.x.toFixed(2)} / ${playerGroup.position.z.toFixed(2)}`;
  if (statYSpeed) statYSpeed.textContent = `${playerGroup.position.y.toFixed(2)}m • ${currentSpeed.toFixed(1)}m/s`;

  if (collisionResult.collided) {
    if (statCollision) {
      statCollision.textContent = `Contato: ${collisionResult.collisionMsg}`;
      statCollision.className = 'stat-value badge-warning';
    }
  } else {
    if (statCollision) {
      statCollision.textContent = isGrounded ? 'Espaço Livre (Chão)' : 'No Ar (Pulo)';
      statCollision.className = 'stat-value badge-safe';
    }
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateInventoryUI();
updateWeaponsUI();
updatePlayerHealthUI();
updateGoalHUD();

// --- SISTEMA DE FOCO DO GAMEPAD ---
let gamepadUIRefreshTimer = 0;
let currentFocusedElement = null;

function handleGamepadMenuNavigation(gp) {
  const now = performance.now();
  if (now - gamepadUIRefreshTimer < 150) return; // Cooldown de navegação (evita pular rápido demais)

  // Encontrar todos os botões e sliders visíveis nas modais
  const focusableElements = Array.from(document.querySelectorAll('button:not([disabled]), input[type="range"]')).filter(el => {
    return el.offsetParent !== null; // Só pega os que estão visíveis na tela
  });

  if (focusableElements.length === 0) return;

  let currentIndex = focusableElements.indexOf(currentFocusedElement);
  if (currentIndex === -1) {
    currentIndex = 0;
    currentFocusedElement = focusableElements[0];
    currentFocusedElement.focus({ preventScroll: true });
  }

  let moved = false;

  // D-Pad Baixo / Analógico Baixo
  if (isButtonJustPressed(gp, 13) || gp.axes[1] > 0.5) {
    currentIndex = (currentIndex + 1) % focusableElements.length;
    moved = true;
  }
  // D-Pad Cima / Analógico Cima
  else if (isButtonJustPressed(gp, 12) || gp.axes[1] < -0.5) {
    currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    moved = true;
  }
  // Se estiver focado em um range (slider de dificuldade), usar Esquerda/Direita para mexer
  else if (currentFocusedElement.tagName.toLowerCase() === 'input' && currentFocusedElement.type === 'range') {
    if (isButtonJustPressed(gp, 14) || gp.axes[0] < -0.5) { // Esquerda
      currentFocusedElement.value = Math.max(parseFloat(currentFocusedElement.min), parseFloat(currentFocusedElement.value) - parseFloat(currentFocusedElement.step));
      currentFocusedElement.dispatchEvent(new Event('input')); // Força a atualização visual
      moved = true;
    } else if (isButtonJustPressed(gp, 15) || gp.axes[0] > 0.5) { // Direita
      currentFocusedElement.value = Math.min(parseFloat(currentFocusedElement.max), parseFloat(currentFocusedElement.value) + parseFloat(currentFocusedElement.step));
      currentFocusedElement.dispatchEvent(new Event('input'));
      moved = true;
    }
  }
  // Navegação horizontal em botões normais (ex: Jane / Jake)
  else {
    if (isButtonJustPressed(gp, 14) || gp.axes[0] < -0.5) { // Esquerda
      currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      moved = true;
    } else if (isButtonJustPressed(gp, 15) || gp.axes[0] > 0.5) { // Direita
      currentIndex = (currentIndex + 1) % focusableElements.length;
      moved = true;
    }
  }

  if (moved) {
    currentFocusedElement = focusableElements[currentIndex];
    currentFocusedElement.focus({ preventScroll: true });
    gamepadUIRefreshTimer = now;
  }

  // Botão A (Confirmar/Clicar)
  if (isButtonJustPressed(gp, 0)) {
    if (currentFocusedElement) {
      currentFocusedElement.click();
      gamepadUIRefreshTimer = now + 300; // Maior cooldown após clique
    }
  }

  // Botão B (Voltar)
  if (isButtonJustPressed(gp, 1)) {
    // Procura por um botão com a classe 'btn-menu-back' que esteja visível
    const backBtn = Array.from(document.querySelectorAll('.btn-menu-back')).find(el => el.offsetParent !== null);
    if (backBtn) {
      backBtn.click();
      gamepadUIRefreshTimer = now + 300;
    }
  }
}

// Acende a luz do corredor para o menu inicial
toggleRoomEnvironmentLight('corridor', true);
animate();

window.__HOTEL_3D__ = {
  scene, camera, playerGroup, velocity, roomEnvironments, toggleRoomEnvironmentLight, acquiredKeys, keyObjects, weaponInventory, equipWeapon, fireActiveWeapon, reloadActiveWeapon, useMedkit, damagePlayer, activeEnemies, collectibleMedkits, resetGameState, toggleHUD, clearRoomFog, gameDifficulty, applyDifficultySettings
};
