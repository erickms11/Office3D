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
  - O jogador pode pular e pousar em cima das caixas, andar sobre o topo delas e cair naturally ao caminhar além das bordas superiores.

---

## 🏨 Planejamento do Complexo de Quartos & Corredor (Fase 3)

Abaixo está o plano arquitetônico e visual para a expansão do cenário em estilo Hotel/Complexo Tecnológico com 4 quartos temáticos interconectados:

### 1. 🏬 Layout Arquitetônico (Corredor & 4 Quartos)
- **Corredor Central (Hotel Hallway)**: Um corredor principal (`Comprimento: 36m, Largura: 4.8m`) com iluminação contínua de teto, piso decorado com faixas guia, placas numéricas (`Quarto 101`, `102`, `103`, `104`) e portais de entrada em arco para cada cômodo.
- **Quarto 101 - Tech Lab / Cyberpunk (Canto Noroeste)**:
  - Estilo: Tecnológico e cibernético.
  - Elementos: Piso metálico escuro com linhas ciano, servidores em rack piscantes, painéis de LED e pedestal da arma de portais.
- **Quarto 102 - Bioma Botânico / Natureza (Canto Sudoeste)**:
  - Estilo: Orgânico e relaxante.
  - Elementos: Piso em tom de madeira e vegetação, iluminação solar dourada, plantas 3D ornamentais e rochas decorativas.
- **Quarto 103 - Lounge VIP Executivo (Canto Nordeste)**:
  - Estilo: Sofisticado e luxuoso.
  - Elementos: Piso estilizado em mármore escuro, sofá lounge 3D, quadros de arte moderna nas paredes e iluminação indireta quente.
- **Quarto 104 - Câmara Quântica / Testes Portal (Canto Sudeste)**:
  - Estilo: Laboratório de testes (*Aperture Science*).
  - Elementos: Paredes brancas e pretas contrastantes, painéis luminosos hexagonais, alvos de portal e caixas de teste avançadas.

### 2. 🚪 Passagens & Colisão Expandida (AABB 3D)
- Todas as portas possuem passagens abertas permitindo caminhar do corredor para dentro de qualquer quarto.
- Paredes completas delimitando cada quarto, com suporte total ao disparo de portais azul e laranja em qualquer cômodo.
- Atirar um portal no **Quarto 101** e outro no **Quarto 104** permite teletransportar instantaneamente de uma ponta do hotel para a outra!

---

## 🚪 Planejamento de Portas Interativas, 6 Salas e Zoom da Câmera (Fase 4)

### 1. 🚪 Portas 3D Interativas com Animação de Dobradiça
- **Painéis de Porta 3D**: Cada portal de quarto possui um painel de porta 3D interativo com dobradiça pivô e maçaneta metálica.
- **Abertura/Fechamento**:
  - Pressionar `E` ao lado da porta (ou aproximação) aciona a rotação suave da porta em 90°.
  - Efeito sonoro sintetizado de porta abrindo/fechando.

### 2. 🏨 Hotel Expandido com 6 Salas de Tamanhos Variados
- **Quarto 101 - Suíte Presidencial (Grande - 18m x 14m)**: Cama King 3D, painel de TV, mesa de trabalho e iluminação nobre.
- **Quarto 102 - Banheiro de Luxo (Pequeno - 8m x 6m)**: Espelho, pia de mármore, banheira 3D e azulejos claros.
- **Quarto 103 - Tech Lab / Cyberpunk (Médio - 14m x 10m)**: Servidores, pedestais e luzes neon ciano.
- **Quarto 104 - Suíte Botânica (Médio - 12m x 12m)**: Plantas ornamentais 3D e piso de madeira.
- **Quarto 105 - Lavabo de Serviço (Muito Pequeno - 6m x 6m)**: Banheiro compacto com espelho e piso cerâmico.
- **Quarto 106 - Câmara de Testes Aperture (Grande - 16m x 14m)**: Alvos de portal e caixas companion.

### 3. 🔍 Zoom Ajustável da Câmera (Mouse Scroll & HUD)
- **Scroll do Mouse**: Rolar a roda do mouse ajusta suavemente o zoom da câmera em 3ª pessoa (`cameraDistance` de `3.5m` a `18.0m`, padrão ajustado para `9.5m`).
- **Controle pelo HUD**: Botões `Zoom +` e `Zoom -` no painel lateral para ajustar a distância visual desejada sem ficar muito perto do personagem.


