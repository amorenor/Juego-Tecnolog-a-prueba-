import { GameState } from '../GameState.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width: W, height: H } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x100010, 0x100010, 0x000010, 0x000010, 1);
    bg.fillRect(0, 0, W, H);

    // Scanlines effect
    for (let y = 0; y < H; y += 4) {
      this.add.rectangle(W * 0.5, y, W, 2, 0x000000, 0.15);
    }

    // Game over text
    this.add.text(W * 0.5, H * 0.22, 'SISTEMA CAÍDO', {
      fontFamily: 'monospace', fontSize: '42px', fontStyle: 'bold',
      color: '#ff2244', stroke: '#550011', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.35, 'GAME OVER', {
      fontFamily: 'monospace', fontSize: '56px', fontStyle: 'bold',
      color: '#ff4444', stroke: '#330000', strokeThickness: 10,
    }).setOrigin(0.5);

    // Character fallen
    const charKey = GameState.selectedCharacter === 0 ? 'p1_stand' : 'p2_stand';
    const charImg = this.add.image(W * 0.5, H * 0.56, charKey)
      .setScale(5)
      .setOrigin(0.5, 1)
      .setFlipY(true)
      .setTint(0x880000);

    // Blinking error
    const errText = this.add.text(W * 0.5, H * 0.65, '> CRITICAL ERROR: Player.exe has stopped responding', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ff4444',
    }).setOrigin(0.5);
    this.tweens.add({ targets: errText, alpha: 0.3, yoyo: true, repeat: -1, duration: 400 });

    // Score
    this.add.text(W * 0.5, H * 0.73, `Puntaje final: ${GameState.score}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#cc8844',
    }).setOrigin(0.5);

    // Options
    this.add.text(W * 0.5, H * 0.82, '[R] Reintentar etapa', {
      fontFamily: 'monospace', fontSize: '16px', color: '#88aaff',
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.88, '[M] Volver al mapa  ·  [Q] Menú principal', {
      fontFamily: 'monospace', fontSize: '14px', color: '#556688',
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H - 22, '— AquaChile · Gerencia de Tecnología —', {
      fontFamily: 'monospace', fontSize: '11px', color: '#222244',
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.once('keydown-R', () => this._retry());
    this.input.keyboard.once('keydown-M', () => this._goMap());
    this.input.keyboard.once('keydown-Q', () => this._goMenu());
    this.input.keyboard.once('keydown-SPACE', () => this._retry());
    this.input.keyboard.once('keydown-ENTER', () => this._retry());

    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Auto-advance after 8 seconds
    this.time.delayedCall(8000, () => this._goMap());
  }

  _retry() {
    // Restore lives if ran out
    if (GameState.lives <= 0) {
      GameState.lives = 3;
    }
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('StageScene', { stageIndex: GameState.currentStageIndex });
    });
  }

  _goMap() {
    GameState.lives = Math.max(GameState.lives, 3);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('WorldMapScene');
    });
  }

  _goMenu() {
    GameState.reset();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('MenuScene');
    });
  }
}
