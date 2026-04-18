import { GameState } from '../GameState.js';
import { AQUACHILE } from '../constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.selected = 0; // 0 = TecnoMax, 1 = DigiPro
    this.phase = 'title'; // title | charselect
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000820, 0x000820, 0x001a40, 0x001a40, 1);
    bg.fillRect(0, 0, W, H);

    // Animated background elements
    this._createBackgroundDeco(W, H);

    // AquaChile Logo Area
    this._drawAquaChileLogo(W * 0.5, 60);

    // Title
    this.add.text(W * 0.5, 150, 'TECH QUEST', {
      fontFamily: 'monospace',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#00ccff',
      stroke: '#003366',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W * 0.5, 215, '─── Gerencia de Tecnología ───', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#5588cc',
    }).setOrigin(0.5);

    // Pulsing start text
    this.startText = this.add.text(W * 0.5, H - 80, 'Presiona ESPACIO para comenzar', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      alpha: { from: 1, to: 0.2 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(W * 0.5, H - 40, '© AquaChile S.A. — Gerencia de Tecnología', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#334466',
    }).setOrigin(0.5);

    // Character preview sprites (scaled up for display)
    this._showCharPreviews(W, H);

    this.input.keyboard.once('keydown-SPACE', () => {
      this._showCharSelect(W, H);
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this._showCharSelect(W, H);
    });
  }

  _drawAquaChileLogo(x, y) {
    const g = this.add.graphics();
    // Fish shape (AquaChile is a salmon company)
    g.fillStyle(0x0088dd, 1);
    g.fillEllipse(x - 30, y, 60, 28);
    g.fillTriangle(x + 4, y - 14, x + 4, y + 14, x + 30, y);
    g.fillStyle(0x00aaff, 1);
    g.fillCircle(x - 18, y - 4, 5);
    // Eye
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x - 14, y - 4, 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(x - 13, y - 3, 2);

    this.add.text(x + 40, y, 'AquaChile', {
      fontFamily: 'monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0088dd',
    }).setOrigin(0, 0.5);

    this.add.text(x + 40, y + 18, 'Gerencia TI', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#5599cc',
    }).setOrigin(0, 0.5);
  }

  _createBackgroundDeco(W, H) {
    // Scrolling tech symbols background
    const symbols = ['{ }', '</>', '010', '▓▒░', 'SQL', 'SSH', 'API', 'USB', 'RAM', 'TCP'];
    for (let i = 0; i < 15; i++) {
      const sym = this.add.text(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(260, H - 100),
        Phaser.Math.RND.pick(symbols),
        {
          fontFamily: 'monospace',
          fontSize: Phaser.Math.Between(10, 18) + 'px',
          color: '#0a2040',
          alpha: 0.5,
        }
      );
      this.tweens.add({
        targets: sym,
        y: sym.y - Phaser.Math.Between(60, 160),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 8000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => {
          sym.y = Phaser.Math.Between(H * 0.6, H - 50);
          sym.x = Phaser.Math.Between(0, W);
          sym.alpha = 0.5;
        },
      });
    }
  }

  _showCharPreviews(W, H) {
    // Show both characters in the center
    const char1 = this.add.image(W * 0.35, 350, 'p1_stand')
      .setScale(4)
      .setOrigin(0.5, 1);
    const char2 = this.add.image(W * 0.65, 350, 'p2_stand')
      .setScale(4)
      .setOrigin(0.5, 1);

    this.add.text(W * 0.35, 365, 'TecnoMax', {
      fontFamily: 'monospace', fontSize: '14px', color: '#5aaed6',
    }).setOrigin(0.5);

    this.add.text(W * 0.65, 365, 'DigiPro', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff7722',
    }).setOrigin(0.5);

    // Idle bounce
    this.tweens.add({ targets: char1, y: '-=6', yoyo: true, repeat: -1, duration: 600 });
    this.tweens.add({ targets: char2, y: '-=6', yoyo: true, repeat: -1, duration: 700, delay: 200 });
  }

  _showCharSelect(W, H) {
    // Clean up and show character selection
    this.scene.start('CharSelectScene');
  }
}

// ─── Character Select Scene ────────────────────────────────────────────────
export class CharSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharSelectScene' });
    this.selected = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000820, 0x000820, 0x001a40, 0x001a40, 1);
    bg.fillRect(0, 0, W, H);

    this.add.text(W * 0.5, 60, '¡Elige tu personaje!', {
      fontFamily: 'monospace', fontSize: '32px', fontStyle: 'bold',
      color: '#00ccff', stroke: '#003366', strokeThickness: 5,
    }).setOrigin(0.5);

    this._createCharCard(W * 0.28, H * 0.5, 0, 'p1_stand', 'TecnoMax',
      'Ing. Tecnología', '#5aaed6', [
        '🔧 Experto en redes',
        '📡 WiFi champion',
        '💻 Dev Full Stack',
      ]);

    this._createCharCard(W * 0.72, H * 0.5, 1, 'p2_stand', 'DigiPro',
      'Ing. Infraestructura', '#ff7722', [
        '🖥️ Cloud Architect',
        '🔌 Server whisperer',
        '📊 Data guru',
      ]);

    this.add.text(W * 0.5, H * 0.5, 'VS', {
      fontFamily: 'monospace', fontSize: '28px', fontStyle: 'bold',
      color: '#ffcc00',
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H - 70, '← → para elegir  ·  ESPACIO / ENTER para confirmar', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aabbcc',
    }).setOrigin(0.5);

    this._updateSelection();

    this.input.keyboard.on('keydown-LEFT',  () => { this.selected = 0; this._updateSelection(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this.selected = 1; this._updateSelection(); });
    this.input.keyboard.on('keydown-A',     () => { this.selected = 0; this._updateSelection(); });
    this.input.keyboard.on('keydown-D',     () => { this.selected = 1; this._updateSelection(); });

    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
  }

  _createCharCard(x, y, idx, spriteKey, name, role, color, traits) {
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x0a1a30, 0.9);
    cardBg.strokeStyle = idx === 0 ? 0x1a6bd1 : 0xdd5500;
    cardBg.lineWidth = 2;
    cardBg.strokeRoundedRect(x - 130, y - 170, 260, 340, 12);
    cardBg.fillRoundedRect(x - 130, y - 170, 260, 340, 12);

    this['card' + idx] = cardBg;

    const sprite = this.add.image(x, y - 60, spriteKey).setScale(5).setOrigin(0.5, 1);
    // Bounce
    this.tweens.add({ targets: sprite, y: '-=8', yoyo: true, repeat: -1, duration: 700, delay: idx * 200 });

    this.add.text(x, y + 10, name, {
      fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold', color,
    }).setOrigin(0.5);

    this.add.text(x, y + 38, role, {
      fontFamily: 'monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5);

    traits.forEach((t, i) => {
      this.add.text(x - 110, y + 68 + i * 26, t, {
        fontFamily: 'monospace', fontSize: '12px', color: '#aabbcc',
      });
    });
  }

  _updateSelection() {
    [0, 1].forEach(i => {
      const card = this['card' + i];
      card.clear();
      const selected = i === this.selected;
      card.fillStyle(selected ? 0x0a2040 : 0x0a1a30, 0.9);
      card.strokeStyle = selected
        ? (i === 0 ? 0x5aaed6 : 0xff7722)
        : (i === 0 ? 0x1a3a60 : 0x553300);
      card.lineWidth = selected ? 3 : 1;
      const x = i === 0 ? this.scale.width * 0.28 : this.scale.width * 0.72;
      card.strokeRoundedRect(x - 130, this.scale.height * 0.5 - 170, 260, 340, 12);
      card.fillRoundedRect(x - 130, this.scale.height * 0.5 - 170, 260, 340, 12);
    });
  }

  _confirm() {
    GameState.selectedCharacter = this.selected;
    GameState.reset();
    GameState.selectedCharacter = this.selected; // reset clears it, restore
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('WorldMapScene');
    });
  }
}
