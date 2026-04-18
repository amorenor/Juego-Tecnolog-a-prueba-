import { GameState } from '../GameState.js';
import { STAGE_INFO } from '../constants.js';

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(data) {
    this.stageIndex = data.stageIndex ?? 0;
    this.score = data.score ?? GameState.score;
    this.timeBonus = data.timeBonus ?? 0;
    this.isFinalBoss = this.stageIndex === 4;
  }

  create() {
    const { width: W, height: H } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000a20, 0x000a20, 0x001540, 0x001540, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 40; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.5, 2),
        0xaaddff, 0.4
      );
    }

    if (this.isFinalBoss) {
      this._showVictory(W, H);
    } else {
      this._showStageComplete(W, H);
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _showStageComplete(W, H) {
    const stageInfo = STAGE_INFO[this.stageIndex];
    const nextInfo  = STAGE_INFO[this.stageIndex + 1];
    const isLastRegular = this.stageIndex === 3;

    // Stage complete banner
    this.add.text(W * 0.5, H * 0.15, '¡ETAPA COMPLETADA!', {
      fontFamily: 'monospace', fontSize: '36px', fontStyle: 'bold',
      color: '#00ff88', stroke: '#003322', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.15 + 48, stageInfo.name, {
      fontFamily: 'monospace', fontSize: '18px', color: '#88ddff',
    }).setOrigin(0.5);

    // Character celebration
    const charKey = GameState.selectedCharacter === 0 ? 'p1_jump' : 'p2_jump';
    const charImg = this.add.image(W * 0.5, H * 0.4, charKey)
      .setScale(6)
      .setOrigin(0.5, 1);
    this.tweens.add({
      targets: charImg,
      y: charImg.y - 20,
      yoyo: true, repeat: -1, duration: 500,
    });

    // Score panel
    const panel = this.add.container(W * 0.5, H * 0.62);
    const bg2 = this.add.graphics();
    bg2.fillStyle(0x000820, 0.9);
    bg2.strokeStyle = 0x003366;
    bg2.lineWidth = 1;
    bg2.strokeRoundedRect(-200, -70, 400, 140, 8);
    bg2.fillRoundedRect(-200, -70, 400, 140, 8);
    panel.add(bg2);

    const lines = [
      ['PUNTAJE TOTAL',  `${this.score}`, '#ffcc00'],
      ['BONUS DE TIEMPO', `+${this.timeBonus}`, '#44ff88'],
      ['VIDAS RESTANTES', `× ${GameState.lives}`, '#ff4466'],
    ];

    lines.forEach(([label, value, color], i) => {
      panel.add(this.add.text(-180, -50 + i * 38, label, {
        fontFamily: 'monospace', fontSize: '13px', color: '#8899aa',
      }));
      panel.add(this.add.text(180, -50 + i * 38, value, {
        fontFamily: 'monospace', fontSize: '15px', fontStyle: 'bold', color,
      }).setOrigin(1, 0));
    });

    // Next stage unlock message
    if (!isLastRegular && nextInfo) {
      this.time.delayedCall(800, () => {
        const unlockMsg = this.add.text(W * 0.5, H * 0.82, `🔓 Desbloqueado: ${nextInfo.name}`, {
          fontFamily: 'monospace', fontSize: '16px', color: '#00ff88',
          backgroundColor: '#00330088',
          padding: { x: 14, y: 6 },
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: unlockMsg, alpha: 1, duration: 600 });
      });
    }

    // Continue prompt
    const prompt = this.add.text(W * 0.5, H - 45, 'Presiona ESPACIO para continuar', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: prompt, alpha: { from: 1, to: 0.2 },
      duration: 700, yoyo: true, repeat: -1,
    });

    this.input.keyboard.once('keydown-SPACE', () => this._goToMap());
    this.input.keyboard.once('keydown-ENTER', () => this._goToMap());
    this.time.delayedCall(6000, () => this._goToMap());
  }

  _showVictory(W, H) {
    // Full game clear!
    this.add.text(W * 0.5, H * 0.1, '⚠️  SISTEMA RESTAURADO  ⚠️', {
      fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold',
      color: '#ff8844', stroke: '#330000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.18, '¡VICTORIA TOTAL!', {
      fontFamily: 'monospace', fontSize: '48px', fontStyle: 'bold',
      color: '#ffdd00', stroke: '#554400', strokeThickness: 8,
    }).setOrigin(0.5);

    // Both characters celebrating
    const p1 = this.add.image(W * 0.38, H * 0.48, 'p1_jump').setScale(7).setOrigin(0.5, 1);
    const p2 = this.add.image(W * 0.62, H * 0.48, 'p2_jump').setScale(7).setOrigin(0.5, 1);
    p2.setFlipX(true);

    this.tweens.add({ targets: p1, y: p1.y - 18, yoyo: true, repeat: -1, duration: 500 });
    this.tweens.add({ targets: p2, y: p2.y - 18, yoyo: true, repeat: -1, duration: 500, delay: 150 });

    this.add.text(W * 0.5, H * 0.6, 'TecnoMax & DigiPro salvaron la Gerencia TI', {
      fontFamily: 'monospace', fontSize: '15px', color: '#aaddff',
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.68, `PUNTAJE FINAL: ${this.score}`, {
      fontFamily: 'monospace', fontSize: '26px', fontStyle: 'bold', color: '#ffdd00',
    }).setOrigin(0.5);

    // AquaChile credits
    this.add.text(W * 0.5, H * 0.8, '— AquaChile · Gerencia de Tecnología —', {
      fontFamily: 'monospace', fontSize: '14px', color: '#003399',
    }).setOrigin(0.5);

    this.add.text(W * 0.5, H * 0.88, 'Gracias por proteger nuestra infraestructura digital', {
      fontFamily: 'monospace', fontSize: '12px', color: '#225577',
    }).setOrigin(0.5);

    const prompt = this.add.text(W * 0.5, H - 35, 'ESPACIO — volver al menú', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, yoyo: true, repeat: -1, duration: 600 });

    // Fireworks
    this._startFireworks(W, H);

    this.input.keyboard.once('keydown-SPACE', () => {
      GameState.reset();
      this.scene.start('MenuScene');
    });
  }

  _startFireworks(W, H) {
    const colors = [0xff4400, 0xffcc00, 0x00ff88, 0x00ccff, 0xff44ff];
    this.time.addEvent({
      delay: 400,
      repeat: 20,
      callback: () => {
        const x = Phaser.Math.Between(100, W - 100);
        const y = Phaser.Math.Between(60, H * 0.6);
        const color = Phaser.Math.RND.pick(colors);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const spark = this.add.circle(x, y, 4, color);
          this.tweens.add({
            targets: spark,
            x: x + Math.cos(angle) * 60,
            y: y + Math.sin(angle) * 60,
            alpha: 0,
            duration: 700,
            onComplete: () => spark.destroy(),
          });
        }
      },
    });
  }

  _goToMap() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('WorldMapScene');
    });
  }
}
