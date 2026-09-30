# 🏢 Office 3D - Protótipo Interativo Three.js

Protótipo 3D interativo com foco em renderização em tempo real, movimentação em terceira pessoa, sistema de colisão e iluminação dinâmica com interruptor interativo.

🎮 **[Acesse a Demonstração Online](https://erickms11.github.io/Office3D/)**

---

## ✨ Funcionalidades

- **Cenário Completo (A Sala):** Piso estilizado com textura de grade e auxílio espacial (`GridHelper`), quatro paredes sólidas delimitadoras e pilares decorativos.
- **Personagem Estilizado:** Cápsula com visor brilhante de alta visibilidade, mochila propulsora e iluminação própria de solo.
- **Movimentação Fluida:**
  - Controles via **W, A, S, D** ou **Setas do Teclado**.
  - Aceleração, atrito, rotação automática para a direção da passada e efeito de caminhada (*bobbing*).
- **Câmera Dinâmica em 3ª Pessoa:** Segue suavemente o jogador via interpolação linear (`lerp`), com opção de alternar para Câmera Orbital Livre (*OrbitControls*).
- **Colisão:** O jogador é impedido de atravessar paredes ou cair no limbo espacial.
- **Interruptor de Luz na Parede:**
  - Fixado na parede norte com tecla basculante móvel e LED indicador (verde/vermelho).
  - Pressione **E** ao se aproximar, ou clique diretamente no interruptor com o mouse (Raycasting).
  - Transição de luz natural e clique sonoro sintetizado via Web Audio API.
- **Arma de Portais (Fase 1 - Mira e Marcações Visuais):**
  - **Mira Central (Crosshair) Estilo Portal Gun:** Retículo futurista com anéis indicadores de estado dos portais (A e B) e animação de recoil ao atirar.
  - **Disparo via `THREE.Raycaster`:** O raio é projetado do centro exato da tela na direção de visada da câmera.
  - **Portal A (Azul):** Criado com **Clique Esquerdo do Mouse** na parede alvejada.
  - **Portal B (Laranja):** Criado com **Clique Direito do Mouse** na parede alvejada.
  - **Alinhamento e Rotação Exatos:** O portal fica perfeitamente colado e alinhado à face da parede usando quaternions de orientação normal, com proteção anti *z-fighting*.
  - **Regra de Unicidade:** Só pode existir no máximo um portal de cada cor simultaneamente na cena (ao disparar um novo portal de mesma cor, o anterior é reciclado e descartado da memória).
  - **Efeitos Visuais e Sonoros Ricos:** Núcleo com textura de vórtice quântico procedural, borda neon emissiva, aura difusa, arcos de energia giratórios, iluminação pontual própria (`PointLight`), feixe de plasma (*tracer beam*), faíscas de impacto e áudio sci-fi sintetizado via Web Audio API.
- **HUD Glassmorphism:** Teclado virtual reativo, telemetria em tempo real (coordenadas X, Z e velocidade), status dos portais A e B, alertas de colisão e botão para limpar portais.

---

## 🕹️ Controles

| Ação | Tecla / Comando |
| :--- | :--- |
| **Andar para Frente** | `W` ou `Seta Cima` (relativo à câmera) |
| **Andar para Trás** | `S` ou `Seta Baixo` (relativo à câmera) |
| **Andar para Esquerda** | `A` ou `Seta Esquerda` (relativo à câmera) |
| **Andar para Direita** | `D` ou `Seta Direita` (relativo à câmera) |
| **Girar Câmera (Mirar)** | Clicar e arrastar com o mouse |
| **Disparar Portal Azul (A)** | **Clique Esquerdo do Mouse** (sem arrastar) |
| **Disparar Portal Laranja (B)** | **Clique Direito do Mouse** (sem arrastar) |
| **Interagir com Interruptor** | `E` (ou clique do mouse no interruptor) |
| **Limpar Portais** | Botão *Limpar Portais* no HUD |
| **Alternar Câmera Livre** | Botão *Alternar Ângulo* |
| **Resetar Posição** | Botão *Resetar Posição* no painel |

---

## 🛠️ Tecnologias Utilizadas

- [Three.js](https://threejs.org/) (WebGL 3D Engine)
- HTML5 / CSS3 / JavaScript (ES Modules nativos)
- Web Audio API (Efeitos sonoros procedurais para tiros, impacto e interruptor)
- Vite / Node.js Dev Server

---

## 🚀 Roteiro de Desenvolvimento & Planejamento (Fase 2)

Abaixo está o plano detalhado para a implementação das novas mecânicas de gameplay:

### 1. 🔫 Coleta da Arma de Portais (*Portal Gun Item & Equip*)
- **Item no Cenário**: Um objeto 3D estilizado da Arma de Portais posicionado sobre um pedestal flutuante/base tecnológica na sala.
- **Mecânica de Coleta**:
  - O jogador inicia desarmado (sem retículo de mira ativo e sem capacidade de disparar portais).
  - Ao se aproximar da arma (`Distância < 2.5m`), surge uma indicação visual no HUD (*"Pressione E ou caminhe para equipar a Portal Gun"*).
  - Ao equipar, a arma é acoplada ao personagem/HUD, libera a mira central e ativa os disparos de clique esquerdo e direito.

### 2. 🌀 Teletransporte Bidirecional entre Portais (*Portal Teleportation Engine*)
- **Detecção de Passagem**:
  - Quando os portais Azul (A) e Laranja (B) estiverem ambos ativos na cena, o sistema monitora a caixa de colisão/raio de entrada de cada portal.
- **Cálculo de Transição**:
  - **Entrada no Portal A → Saída no Portal B**: O jogador é transportado para a posição do Portal B com offset em relação ao vetor normal da parede de saída.
  - **Reorientação de Velocidade**: A velocidade do jogador é reorientada do vetor da parede de entrada para a normal da parede de saída, preservando momento.
  - **Cooldown Antiloop**: Aplicação de um pequeno tempo de tolerância (~0.3s) pós-teletransporte para evitar que o jogador fique preso em um loop infinito de transição.

### 3. 🦘 Física Vertical e Mecânica de Pulo (*Jump & Gravity Physics*)
- **Controle por Teclado**: Tecla `Espaço` ativa o pulo quando o jogador estiver no chão (`isGrounded = true`).
- **Simulação Gravitacional**:
  - Implementação de `velocityY` e constante de gravidade (`gravity = -22.0 m/s²`).
  - Velocidade inicial de pulo (`jumpForce = 8.0 m/s`).
- **Integração de Estado**: Animação sutil e inclinação da cápsula durante a ascensão e queda.

### 4. 📦 Objetos Escaláveis e Plafotormas (*Steppable Objects & Platforms*)
- **Caixas/Plataformas Interativas**: Criação de caixas tecnológicas no ambiente (estilo *Companion Cube* ou caixas de carga) com diferentes alturas (ex: 1.0m e 2.0m).
- **Sistema de Colisão 3D (AABB 3D)**:
  - Suporte a detecção de topo de superfícies (*stepping*).
  - O jogador pode pular e pousar em cima das caixas, andar sobre o topo delas e cair naturalmente ao caminhar além das bordas superiores.
