import { GameState } from '../GameState.js';
import { STAGE_INFO } from '../constants.js';

const MAP_NODES = [
  { x: 120,  y: 380, label: '1-1' },
  { x: 290,  y: 280, label: '1-2' },
  { x: 460,  y: 360, label: '1-3' },
  { x: 640,  y: 250, label: '1-4' },
  { x: 820,  y: 340, label: '⚠️',  boss: true },
];

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
    this.selectedNode = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Determine first unlocked & unfinished stage
    this.selectedNode = this._getDefaultSelection();

    // Background: ocean/tech themed
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x003366, 0x001a33, 0x001040, 0x000820, 1);
    bg.fillRect(0, 0, W, H);

    // Stars / data particles background
    this._createStars(W, H);

    // Header
    this.add.text(W * 0.5, 30, 'AquaChile — TECH QUEST', {
      fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold',
      color: '#00ccff', stroke: '#003366', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W * 0.5, 60, 'MUNDO 1 · Intranet Corporativa', {
      fontFamily: 'monospace', fontSize: '14px', color: '#5588cc',
    }).setOrigin(0.5);

    // Path lines between nodes
    this._drawPaths();

    // Stage nodes
    this.nodeObjects = MAP_NODES.map((node, i) => this._createNode(node, i));

    // Player icon on current node
    this.playerIcon = this.add.image(
      MAP_NODES[this.selectedNode].x,
      MAP_NODES[this.selectedNode].y - 38,
      GameState.selectedCharacter === 0 ? 'p1_stand' : 'p2_stand'
    ).setScale(2.5).setOrigin(0.5, 1);

    this.tweens.add({
      targets: this.playerIcon,
      y: this.playerIcon.y - 6,
      yoyo: true, repeat: -1, duration: 500,
    });

    // HUD - lives and score
    this._createHUD(W);

    // Stage info panel
    this.infoPanel = this._createInfoPanel(W, H);
    this._updateInfoPanel(this.selectedNode);

    // Controls hint
    this.add.text(W * 0.5, H - 20, '← → Navegar  ·  ESPACIO / ENTER Jugar  ·  ESC Menú', {
      fontFamily: 'monospace', fontSize: '12px', color: '#334466',
    }).setOrigin(0.5);

    this._setupInput();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _getDefaultSelection() {
    for (let i = 0; i < MAP_NODES.length; i++) {
      if (!GameState.isCompleted(i) && GameState.isUnlocked(i)) return i;
    }
    return Math.min(GameState.completedStages.size, MAP_NODES.length - 1);
  }

  _createStars(W, H) {
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(80, H - 40);
      const r = Phaser.Math.FloatBetween(0.5, 2);
      const star = this.add.circle(x, y, r, 0xaaddff, 0.4);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.6 },
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true, repeat: -1,
      });
    }
  }

  _drawPaths() {
    const unlocked = GameState.completedStages.size;
    const graphics = this.add.graphics();

    for (let i = 0; i < MAP_NODES.length - 1; i++) {
      const a = MAP_NODES[i];
      const b = MAP_NODES[i + 1];
      const isOpen = i < unlocked;

      graphics.lineStyle(6, isOpen ? 0x00aaff : 0x223355, isOpen ? 0.9 : 0.4);
      graphics.beginPath();
      graphics.moveTo(a.x, a.y);

      // Curved path
      const midX = (a.x + b.x) * 0.5;
      const midY = Math.min(a.y, b.y) - 30;
      graphics.lineTo(midX, midY);
      graphics.lineTo(b.x, b.y);
      graphics.strokePath();

      // Path dots
      if (isOpen) {
        for (let t = 0; t <= 1; t += 0.2) {
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 30;
          graphics.fillStyle(0x00ccff, 0.5);
          graphics.fillCircle(px, py, 3);
        }
      }
    }
  }

  _createNode(node, idx) {
    const unlocked  = GameState.isUnlocked(idx);
    const completed = GameState.isCompleted(idx);
    const isBoss    = node.boss;

    const container = this.add.container(node.x, node.y);

    // Outer glow for unlocked
    if (unlocked) {
      const glow = this.add.circle(0, 0, 36, isBoss ? 0xff4400 : 0x00aaff, 0.15);
      container.add(glow);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.05, to: 0.3 },
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 1200,
        yoyo: true, repeat: -1,
      });
    }

    // Node circle
    const nodeColor = completed ? 0x004400 :
                      unlocked  ? (isBoss ? 0x330000 : 0x001a40) :
                                  0x0a0a0a;
    const borderColor = completed ? 0x00ff44 :
                        unlocked  ? (isBoss ? 0xff4400 : 0x00aaff) :
                                    0x334455;

    const circle = this.add.circle(0, 0, 28, nodeColor);
    const border = this.add.graphics();
    border.lineStyle(3, borderColor, unlocked ? 1 : 0.3);
    border.strokeCircle(0, 0, 28);
    container.add([circle, border]);

    // Label
    const labelText = completed ? '✓' : unlocked ? node.label : '🔒';
    const label = this.add.text(0, 0, labelText, {
      fontFamily: 'monospace',
      fontSize: completed ? '20px' : '16px',
      fontStyle: 'bold',
      color: completed ? '#00ff44' : unlocked ? (isBoss ? '#ff8844' : '#88ddff') : '#334455',
    }).setOrigin(0.5);
    container.add(label);

    // Stage number label
    const numLabel = this.add.text(0, 38, `Etapa ${idx + 1}`, {
      fontFamily: 'monospace', fontSize: '11px',
      color: unlocked ? '#8899bb' : '#334455',
    }).setOrigin(0.5);
    container.add(numLabel);

    // Interactive
    if (unlocked) {
      circle.setInteractive(new Phaser.Geom.Circle(0, 0, 28), Phaser.Geom.Circle.Contains);
      circle.on('pointerdown', () => this._selectNode(idx));
    }

    return container;
  }

  _createHUD(W) {
    // Lives
    this.add.image(20, 90, 'ui_heart').setScale(0.8).setOrigin(0, 0.5);
    this.livesText = this.add.text(48, 90, `× ${GameState.lives}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ff4466',
    }).setOrigin(0, 0.5);

    // Score
    this.add.text(W - 20, 90, `PUNTOS: ${GameState.score}`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffcc00',
    }).setOrigin(1, 0.5);

    // Coins
    this.add.image(20, 116, 'ui_coin').setScale(0.6).setOrigin(0, 0.5);
    this.add.text(46, 116, `× ${GameState.coins}`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffdd00',
    }).setOrigin(0, 0.5);
  }

  _createInfoPanel(W, H) {
    const panel = this.add.container(W * 0.5, H - 90);

    const bg = this.add.graphics();
    bg.fillStyle(0x000820, 0.85);
    bg.strokeStyle = 0x003366;
    bg.lineWidth = 1;
    bg.strokeRoundedRect(-300, -38, 600, 76, 8);
    bg.fillRoundedRect(-300, -38, 600, 76, 8);
    panel.add(bg);

    this.panelTitle = this.add.text(0, -20, '', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#00ccff',
    }).setOrigin(0.5);

    this.panelSub = this.add.text(0, 6, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#7799bb',
    }).setOrigin(0.5);

    this.panelStatus = this.add.text(0, 26, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#aaaaaa',
    }).setOrigin(0.5);

    panel.add([this.panelTitle, this.panelSub, this.panelStatus]);
    return panel;
  }

  _updateInfoPanel(idx) {
    const info = STAGE_INFO[idx];
    const unlocked  = GameState.isUnlocked(idx);
    const completed = GameState.isCompleted(idx);

    this.panelTitle.setText(info.name);
    this.panelSub.setText(info.subtitle);

    if (!unlocked) {
      this.panelStatus.setText('🔒 Completa la etapa anterior para desbloquear');
      this.panelStatus.setColor('#554444');
    } else if (completed) {
      this.panelStatus.setText('✓ ¡Completado! — Puedes rejugar para mejorar tu puntaje');
      this.panelStatus.setColor('#44ff88');
    } else {
      this.panelStatus.setText('▶ ¡Disponible! — Presiona ESPACIO o ENTER para jugar');
      this.panelStatus.setColor('#88ccff');
    }
  }

  _selectNode(idx) {
    this.selectedNode = idx;
    this._movePlayerIcon(idx);
    this._updateInfoPanel(idx);
    this._highlightNodes();
  }

  _movePlayerIcon(idx) {
    const node = MAP_NODES[idx];
    this.tweens.add({
      targets: this.playerIcon,
      x: node.x,
      y: node.y - 38,
      duration: 300,
      ease: 'Power2',
    });
  }

  _highlightNodes() {
    // Refresh node visuals (simpler: just update glow)
  }

  _setupInput() {
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.selectedNode > 0) this._selectNode(this.selectedNode - 1);
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.selectedNode < MAP_NODES.length - 1 && GameState.isUnlocked(this.selectedNode + 1)) {
        this._selectNode(this.selectedNode + 1);
      }
    });
    this.input.keyboard.on('keydown-A', () => {
      if (this.selectedNode > 0) this._selectNode(this.selectedNode - 1);
    });
    this.input.keyboard.on('keydown-D', () => {
      if (this.selectedNode < MAP_NODES.length - 1 && GameState.isUnlocked(this.selectedNode + 1)) {
        this._selectNode(this.selectedNode + 1);
      }
    });
    this.input.keyboard.on('keydown-SPACE', () => this._playSelected());
    this.input.keyboard.on('keydown-ENTER', () => this._playSelected());
    this.input.keyboard.on('keydown-ESC',   () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });
  }

  _playSelected() {
    if (!GameState.isUnlocked(this.selectedNode)) return;
    GameState.currentStageIndex = this.selectedNode;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('StageScene', { stageIndex: this.selectedNode });
    });
  }
}
