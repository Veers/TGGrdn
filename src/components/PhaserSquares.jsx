import { useEffect, useRef } from "react";
import Phaser from "phaser";

/** Цвета земли и культур */
const SOIL_COLOR = 0x5d4037;
const SOIL_LIGHT = 0x8d6e63;

/** Рисует культуру на Graphics. (0,0) — центр грядки, размер ~size */
function drawCrop(g, type, size) {
  const s = size * 0.45;
  g.clear();

  switch (type) {
    case 0: // Пшеница — стебель + колос
      g.fillStyle(0x7cb342, 1);
      g.fillRect(-s * 0.15, s * 0.2, s * 0.3, s * 0.8);
      g.fillStyle(0xf9a825, 1);
      for (let i = 0; i < 5; i++) g.fillCircle(-s * 0.35 + i * s * 0.18, -s * 0.1, s * 0.12);
      break;
    case 1: // Кукуруза — лист + початок
      g.fillStyle(0x558b2f, 1);
      g.fillEllipse(0, 0, s * 0.5, s * 0.9);
      g.fillStyle(0xf9a825, 1);
      g.fillEllipse(0, -s * 0.1, s * 0.25, s * 0.5);
      break;
    case 2: // Морковь — ботва + конус
      g.fillStyle(0x8bc34a, 1);
      g.fillTriangle(-s * 0.3, -s * 0.2, 0, -s * 0.6, s * 0.3, -s * 0.2);
      g.fillStyle(0xff9800, 1);
      g.fillTriangle(-s * 0.2, s * 0.3, 0, -s * 0.5, s * 0.2, s * 0.3);
      break;
    case 3: // Помидор — стебель + круг
      g.fillStyle(0x558b2f, 1);
      g.fillRect(-s * 0.08, s * 0.1, s * 0.16, s * 0.5);
      g.fillStyle(0xd32f2f, 1);
      g.fillCircle(0, -s * 0.2, s * 0.35);
      break;
    case 4: // Капуста — пучок листьев
      g.fillStyle(0x689f38, 1);
      g.fillCircle(0, 0, s * 0.5);
      g.fillStyle(0x8bc34a, 0.9);
      g.fillCircle(0, -s * 0.1, s * 0.35);
      break;
    case 5: // Тыква — оранжевый круг
      g.fillStyle(0xef6c00, 1);
      g.fillCircle(0, 0, s * 0.5);
      g.fillStyle(0xff9800, 0.8);
      g.fillCircle(0, -s * 0.1, s * 0.25);
      break;
    case 6: // Клубника — листья + красная форма
      g.fillStyle(0x388e3c, 1);
      g.fillEllipse(0, s * 0.2, s * 0.4, s * 0.25);
      g.fillStyle(0xe53935, 1);
      g.fillEllipse(0, -s * 0.1, s * 0.35, s * 0.4);
      g.fillStyle(0xffeb3b, 0.9);
      g.fillCircle(-s * 0.15, -s * 0.2, s * 0.06);
      g.fillCircle(s * 0.15, -s * 0.15, s * 0.06);
      break;
    case 7: // Подсолнух — центр + лепестки
      g.fillStyle(0x558b2f, 1);
      g.fillRect(-s * 0.06, s * 0.2, s * 0.12, s * 0.5);
      g.fillStyle(0xf9a825, 1);
      g.fillCircle(0, -s * 0.1, s * 0.2);
      g.fillStyle(0x795548, 1);
      g.fillCircle(0, -s * 0.1, s * 0.12);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.fillStyle(0xffeb3b, 1);
        g.fillEllipse(Math.cos(a) * s * 0.35, -s * 0.1 + Math.sin(a) * s * 0.35, s * 0.12, s * 0.2);
      }
      break;
    case 8: // Картофель — зелёный стебель + коричневые «клубни»
      g.fillStyle(0x7cb342, 1);
      g.fillRect(-s * 0.1, 0, s * 0.2, s * 0.5);
      g.fillStyle(0x8d6e63, 1);
      g.fillEllipse(-s * 0.2, s * 0.2, s * 0.2, s * 0.15);
      g.fillEllipse(s * 0.15, s * 0.25, s * 0.18, s * 0.14);
      break;
    case 9: // Свёкла — листья + тёмно-красный круг
      g.fillStyle(0x66bb6a, 1);
      g.fillEllipse(0, -s * 0.3, s * 0.35, s * 0.2);
      g.fillStyle(0xb71c1c, 1);
      g.fillCircle(0, s * 0.1, s * 0.35);
      break;
    case 10: // Перец — стебель + зелёный плод
      g.fillStyle(0x558b2f, 1);
      g.fillRect(-s * 0.06, s * 0.15, s * 0.12, s * 0.45);
      g.fillStyle(0x43a047, 1);
      g.fillEllipse(0, -s * 0.15, s * 0.15, s * 0.4);
      break;
    case 11: // Лук — бледный круг + макушка
      g.fillStyle(0xce93d8, 1);
      g.fillCircle(0, 0, s * 0.4);
      g.fillStyle(0x9e9e9e, 1);
      g.fillRect(-s * 0.08, -s * 0.5, s * 0.16, s * 0.35);
      break;
    default: // Пшеница по умолчанию
      g.fillStyle(0x7cb342, 1);
      g.fillRect(-s * 0.15, s * 0.2, s * 0.3, s * 0.8);
      g.fillStyle(0xf9a825, 1);
      g.fillCircle(0, -s * 0.2, s * 0.2);
  }
}

/** Сцена с грядками и тем, что на них растёт */
class CropsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CropsScene" });
  }

  create() {
    const size = Math.min(this.scale.width, this.scale.height) * 0.12;
    const cols = 5;
    const rows = 4;
    const gap = size * 0.3;
    const startX = (this.scale.width - (cols - 1) * (size + gap)) / 2 + size / 2;
    const startY = (this.scale.height - (rows - 1) * (size + gap)) / 2 + size / 2;

    const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture("crop_particle", 8, 8);
    particleGraphics.destroy();

    this.plots = [];
    const cropTypes = 12;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (size + gap);
        const y = startY + row * (size + gap);
        const cropType = (row * cols + col) % cropTypes;

        // Подсветка под грядкой
        const glow = this.add.rectangle(x, y, size * 1.25, size * 1.25, 0x558b2f, 0.2);
        glow.setStrokeStyle(0, 0xffffff, 0);

        // Контейнер: земля + культура
        const container = this.add.container(x, y);

        // Земля (грядка)
        const soil = this.add.graphics();
        soil.fillStyle(SOIL_COLOR, 1);
        soil.fillRoundedRect(-size / 2, -size / 2, size, size, 4);
        soil.fillStyle(SOIL_LIGHT, 0.5);
        soil.fillRoundedRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4, 2);
        container.add(soil);

        // То, что растёт — рисуем Graphics в контейнере (координаты относительно контейнера, центр 0,0)
        const cropG = this.add.graphics();
        drawCrop(cropG, cropType, size);
        container.add(cropG);

        container.setSize(size, size);
        container.setInteractive(new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size), Phaser.Geom.Rectangle.Contains);

        container.on("pointerover", () => {
          this.tweens.add({
            targets: [container, glow],
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 120,
            ease: "Back.easeOut",
          });
        });
        container.on("pointerout", () => {
          this.tweens.add({
            targets: [container, glow],
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: "Back.easeIn",
          });
        });
        container.on("pointerdown", () => {
          const hue = (cropType / cropTypes) * 360;
          const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.6, 1);
          this.emitParticles(x, y, color.color);
          this.tweens.add({
            targets: [container, glow],
            scaleX: 0.92,
            scaleY: 0.92,
            duration: 60,
            yoyo: true,
            ease: "Power2",
          });
        });

        this.plots.push({ container, glow, baseY: y, cropG });
      }
    }

    this.t = 0;
  }

  emitParticles(x, y, color) {
    if (!this.textures.exists("crop_particle")) return;
    const particles = this.add.particles(x, y, "crop_particle", {
      speed: { min: 30, max: 100 },
      scale: { start: 0.7, end: 0 },
      lifespan: 400,
      quantity: 10,
      tint: color,
      blendMode: "ADD",
    });
    this.time.delayedCall(450, () => particles.destroy());
  }

  update(_, delta) {
    this.t += delta * 0.001;
    this.plots.forEach(({ container, glow, baseY, cropG }, i) => {
      const wave = Math.sin(this.t + i * 0.5) * 3;
      container.y = baseY + wave;
      glow.y = container.y;
      glow.setAlpha(0.15 + 0.06 * Math.sin(this.t * 2 + i * 0.3));
      // Лёгкое покачивание культуры
      cropG.y = Math.sin(this.t * 1.5 + i * 0.4) * 2;
    });
  }
}

export function PhaserSquares() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const width = el.clientWidth > 0 ? el.clientWidth : 400;
    const height = el.clientHeight > 0 ? el.clientHeight : 280;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width,
      height,
      backgroundColor: "#1a1a2e",
      scene: CropsScene,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="phaser-squares" aria-hidden="true" />;
}
