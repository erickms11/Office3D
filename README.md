# 🏨 Outbreak Hotel: Key to Survival ☣️

Um jogo completo de **Survival Horror 3D** desenvolvido inteiramente com **Three.js**, **JavaScript ES Modules**, **HTML5** e **CSS3 Glassmorphism**.

🎮 **[Jogar Online no GitHub Pages](https://erickms11.github.io/outbreak-hotel/)**

---

## 📖 Sinopse da Missão

Você está preso nos corredores isolados do **Outbreak Hotel**, onde um experimento biológico transformou os hóspedes em criaturas hostis. As portas das suítes estão lacradas por um sistema de segurança sequencial de chaves.

Seu objetivo é explorar as 6 salas, desvendar os segredos de cada ambiente, adquirir armamento pesado (Revólver Magnum .357 e Shotgun 12G), estocar medicamentos, derrotar o temível **Guardião da Câmara no Quarto 106** para recuperar a **Chave Mestre 👑** e destrancar o Portão Principal de Saída.

---

## 🌟 Principais Funcionalidades

- **Cenário 3D Detalhado do Hotel:**
  - Corredor central com iluminação suave, névoa volumétrica e colisão precisa anti-clipping.
  - 6 Suítes Temáticas:
    - 🛏️ **Q.101:** Suíte Presidencial (Chave do Escudo 🛡️)
    - 🛁 **Q.102:** Banheiro Luxo (Revólver Magnum 🔫 + Chave da Espada ⚔️)
    - 💻 **Q.103:** Tech Lab (Tech Lounge + Chave da Águia 🦅)
    - 🌿 **Q.104:** Suíte Botânica (Shotgun 12G 💥 + Chave do Leão 🦁)
    - 🧼 **Q.105:** Lavabo de Serviço (Chave do Elmo 🪖)
    - 👹 **Q.106:** Câmara de Testes (Arena do Chefe Guardião + Drop da Chave Mestre 👑)

- **Arsenal & Sistema de Combate:**
  - **Revólver Magnum .357:** Alta precisão e impacto à distância.
  - **Shotgun 12G:** Dano massivo em área de curto alcance.
  - Caixas de munição coletáveis com recarga tática (`R` / `[RB]`).
  - Efeitos de *Muzzle Flash*, recuo de câmera (*recoil*) e faíscas de impacto via Raycasting 3D.

- **Sistema de Saúde & Medicamentos (Medkits 💊):**
  - Monitor cardíaco ECG em tempo real com estados **FINE**, **CAUTION**, **DANGER** e **DEAD**.
  - Medicamentos coletáveis nos quartos com cura instantânea de +50 HP (`Q` ou `D-Pad Cima`).
  - Vinhetas visuais de dano e cura na tela.

- **IA Dinâmica dos Inimigos & Chefe:**
  - Sistema de perseguição inteligente com navegação suave por portas abertas.
  - 4 Tipos de Inimigos: *Zumbi Andarilho*, *Lurker Mutante*, *Cyborg Infectado* e *Parasita Botânico*.
  - **Chefe "Guardião da Câmara":** Grande barra de vida dedicada no topo da tela, dano elevado e drop de vitória.

- **Menu de Dificuldade & Sistema de Pausa:**
  - Presets de Dificuldade: **Fácil**, **Normal**, **Difícil** e **Pesadelo**.
  - Sliders em tempo real para ajustar velocidade e vida dos inimigos.
  - Pausa instantânea a qualquer momento com `Start`, `Esc` ou `P`.

- **Suporte Nativo a Controles (Xbox / Gamepad):**
  - Analógicos precisos para movimentação e rotação livre de câmera.
  - Gatilhos e botões para atirar, recarregar, pular, curar, interagir e controlar o zoom.

---

## 🕹️ Tabela de Controles

| Ação | Teclado & Mouse | Controle Xbox / Gamepad |
| :--- | :--- | :--- |
| **Mover Personagem** | `W`, `A`, `S`, `D` | **Analógico Esquerdo** |
| **Girar Câmera** | Mover Mouse / Arrastar | **Analógico Direito** |
| **Pular** | `Espaço` | **Botão A** (0) |
| **Armar / Mirar (Aim)** | `Botão Direito` / `F` | **Gatilho Esquerdo [LT]** (6) |
| **Atirar (Disparo)** | `G` (enquanto mira) | **Gatilho Direito [RT]** (7) (enquanto mira) |
| **Recarregar** | `R` | **Botão [RB]** (5) |
| **Zoom In (Aproximar)** | Scroll Cima | **Botão B** (1) *(em jogo)* |
| **Zoom Out (Afastar)** | Scroll Baixo | **Botão Y** (3) *(em jogo)* |
| **Usar Remédio 💊** | `Q` | **D-Pad Cima** (12) |
| **Interagir / Coletar / Luz** | `E` (ou clique) | **Botão X** (2) |
| **Equipar Armas** | `1`, `2`, `3` | **D-Pad Esquerda / Direita / Baixo** |
| **Pausar / Despausar** | `Esc` ou `P` | **Botão Start / Menu** (9) |
| **Voltar (Menus / Modais)** | `Esc` | **Botão B** (1) *(nos menus)* |
| **Mostrar/Ocultar HUD** | `H` | **Botão Back / Select** (8) |

---

## 🛠️ Tecnologias Utilizadas

- [Three.js](https://threejs.org/) (Motor WebGL 3D)
- HTML5 Semântico & CSS3 Glassmorphism
- JavaScript Moderno (ES Modules Nativos)
- Web Audio API (Síntese procedural de áudio em tempo real)

---

Desenvolvido por **[Erick Santos](https://github.com/erickms11)**
