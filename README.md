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
- **HUD Glassmorphism:** Teclado virtual reativo, telemetria em tempo real (coordenadas X, Z e velocidade) e alertas de colisão.

---

## 🕹️ Controles

| Ação | Tecla / Comando |
| :--- | :--- |
| **Andar para Frente** | `W` ou `Seta Cima` |
| **Andar para Trás** | `S` ou `Seta Baixo` |
| **Andar para Esquerda** | `A` ou `Seta Esquerda` |
| **Andar para Direita** | `D` ou `Seta Direita` |
| **Interagir com Interruptor** | `E` (ou clique do mouse no interruptor) |
| **Girar Câmera Livre** | Arrastar com o botão esquerdo do mouse |
| **Resetar Posição** | Botão *Resetar Posição* no painel |

---

## 🛠️ Tecnologias Utilizadas

- [Three.js](https://threejs.org/) (WebGL 3D Engine)
- HTML5 / CSS3 / JavaScript (ES Modules nativos)
- Web Audio API (Efeitos sonoros procedurais)
- Vite / Node.js Dev Server
