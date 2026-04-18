import {
  P1_PAL, P2_PAL, WIFI_PAL, BUG_PAL, PHONE_PAL, DRONE_PAL, BOSS_PAL, PROJECTILE_PAL,
  P1_STAND, P1_WALK1, P1_WALK2, P1_JUMP,
  P2_STAND, P2_WALK1, P2_WALK2, P2_JUMP,
  WIFI_WALK1, WIFI_WALK2, WIFI_DEAD,
  BUG_WALK1, BUG_WALK2, BUG_DEAD,
  PHONE_WALK1, PHONE_WALK2, PHONE_DEAD,
  DRONE_FLY1, DRONE_FLY2,
  BOSS_TOP, BOSS_BOTTOM,
  PROJECTILE,
} from '../data/sprites.js';

const SCALE = 3;
const SZ = 16;

function px(scene, key, rows, palette) {
  const w = rows[0].length;
  const h = rows.length;
  const tex = scene.textures.createCanvas(key, w * SCALE, h * SCALE);
  const ctx = tex.getContext('2d');
  ctx.clearRect(0, 0, w * SCALE, h * SCALE);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch !== '.' && palette[ch] !== undefined) {
        const c = palette[ch];
        ctx.fillStyle = `rgb(${(c >> 16) & 0xff},${(c >> 8) & 0xff},${c & 0xff})`;
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
      }
    }
  }
  tex.refresh();
}

function makeTile(scene, key, fn) {
  const tex = scene.textures.createCanvas(key, 48, 48);
  const ctx = tex.getContext('2d');
  fn(ctx);
  tex.refresh();
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this._createPlayerSprites();
    this._createEnemySprites();
    this._createBossSprites();
    this._createTiles();
    this._createUI();

    // Fade and go to menu
    this.cameras.main.setBackgroundColor('#000010');
    const logo = this.add.text(480, 250, 'AquaChile\nTech Quest', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#00ccff',
      align: 'center',
      stroke: '#003366',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.add.text(480, 340, 'Cargando...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#88aaff',
    }).setOrigin(0.5);

    this.time.delayedCall(1200, () => {
      this.scene.start('MenuScene');
    });
  }

  _createPlayerSprites() {
    px(this, 'p1_stand', P1_STAND, P1_PAL);
    px(this, 'p1_walk1', P1_WALK1, P1_PAL);
    px(this, 'p1_walk2', P1_WALK2, P1_PAL);
    px(this, 'p1_jump',  P1_JUMP,  P1_PAL);

    px(this, 'p2_stand', P2_STAND, P2_PAL);
    px(this, 'p2_walk1', P2_WALK1, P2_PAL);
    px(this, 'p2_walk2', P2_WALK2, P2_PAL);
    px(this, 'p2_jump',  P2_JUMP,  P2_PAL);
  }

  _createEnemySprites() {
    px(this, 'wifi_walk1', WIFI_WALK1, WIFI_PAL);
    px(this, 'wifi_walk2', WIFI_WALK2, WIFI_PAL);
    px(this, 'wifi_dead',  WIFI_DEAD,  WIFI_PAL);

    px(this, 'bug_walk1',  BUG_WALK1, BUG_PAL);
    px(this, 'bug_walk2',  BUG_WALK2, BUG_PAL);
    px(this, 'bug_dead',   BUG_DEAD,  BUG_PAL);

    px(this, 'phone_walk1', PHONE_WALK1, PHONE_PAL);
    px(this, 'phone_walk2', PHONE_WALK2, PHONE_PAL);
    px(this, 'phone_dead',  PHONE_DEAD,  PHONE_PAL);

    px(this, 'drone_fly1',  DRONE_FLY1, DRONE_PAL);
    px(this, 'drone_fly2',  DRONE_FLY2, DRONE_PAL);
    // Drone uses fly1 for dead (no dead anim)
    px(this, 'drone_dead',  DRONE_FLY2, DRONE_PAL);
  }

  _createBossSprites() {
    px(this, 'boss_top',    BOSS_TOP,    BOSS_PAL);
    px(this, 'boss_bottom', BOSS_BOTTOM, BOSS_PAL);
    px(this, 'projectile',  PROJECTILE,  PROJECTILE_PAL);
  }

  _createTiles() {
    // Ground (grass top + dirt body)
    makeTile(this, 'tile_ground', ctx => {
      // Dirt base
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(0, 0, 48, 48);
      // Dirt variation
      for (let y = 1; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const shade = ((x * 7 + y * 13) % 3);
          ctx.fillStyle = shade === 0 ? '#6b3410' : shade === 1 ? '#a0522d' : '#8b4513';
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      }
      // Grass top (3 rows)
      for (let x = 0; x < 16; x++) {
        const light = (x * 3 + 1) % 4 === 0;
        ctx.fillStyle = light ? '#44cc44' : '#228b22';
        ctx.fillRect(x * 3, 0, 3, 6);
      }
      // Dark border bottom of grass
      ctx.fillStyle = '#1a6b1a';
      ctx.fillRect(0, 6, 48, 3);
    });

    // Underground (solid brown, no grass)
    makeTile(this, 'tile_underground', ctx => {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const shade = ((x * 7 + y * 13) % 3);
          ctx.fillStyle = shade === 0 ? '#6b3410' : shade === 1 ? '#a0522d' : '#8b4513';
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      }
      // Border
      ctx.strokeStyle = '#5c2a08';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 46, 46);
    });

    // Dark ground for indoor stages
    makeTile(this, 'tile_dark_ground', ctx => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 48, 48);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if ((x + y) % 4 === 0) {
            ctx.fillStyle = '#222240';
            ctx.fillRect(x * 3, y * 3, 3, 3);
          }
        }
      }
      ctx.strokeStyle = '#0a0a1e';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 46, 46);
    });

    // Brick
    makeTile(this, 'tile_brick', ctx => {
      ctx.fillStyle = '#cc6633';
      ctx.fillRect(0, 0, 48, 48);
      ctx.fillStyle = '#994422';
      // Mortar horizontal
      ctx.fillRect(0, 21, 48, 3);
      ctx.fillRect(0, 45, 48, 3);
      // Mortar vertical row 1
      ctx.fillRect(24, 0, 3, 21);
      // Mortar vertical row 2
      ctx.fillRect(12, 24, 3, 21);
      ctx.fillRect(36, 24, 3, 21);
      // Highlights
      ctx.fillStyle = '#dd8855';
      ctx.fillRect(1, 1, 22, 3);
      ctx.fillRect(27, 1, 19, 3);
      ctx.fillRect(1, 25, 10, 3);
      ctx.fillRect(15, 25, 20, 3);
      ctx.fillRect(39, 25, 8, 3);
    });

    // Question block
    makeTile(this, 'tile_question', ctx => {
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 46, 46);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(3, 3, 42, 6);
      ctx.fillRect(3, 3, 6, 42);
      // Draw "?" in pixel art
      const qPix = [
        [1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,1],
        [1,0,0,1,1,0,0,1],
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,1,0],
        [0,0,1,0,0,0,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,1,1,0,0,0],
      ];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (qPix[y][x]) {
            ctx.fillStyle = '#000';
            ctx.fillRect(4 + x * 5, 10 + y * 4, 5, 4);
          }
        }
      }
    });

    // Question block (hit = empty)
    makeTile(this, 'tile_question_hit', ctx => {
      ctx.fillStyle = '#888844';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#555533';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 46, 46);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(3, 3, 42, 6);
      ctx.fillRect(3, 3, 6, 42);
    });

    // Hard block
    makeTile(this, 'tile_hard', ctx => {
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 46, 46);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillRect(35, 3, 10, 10);
      ctx.fillRect(3, 35, 10, 10);
      ctx.fillRect(35, 35, 10, 10);
    });

    // Server tower tile
    makeTile(this, 'tile_server', ctx => {
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#003366';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 46, 46);
      // Vents
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#222244';
        ctx.fillRect(6, 4 + i * 11, 36, 7);
        ctx.fillStyle = '#3a3a66';
        ctx.fillRect(8, 5 + i * 11, 32, 3);
      }
      // LEDs
      const ledColors = ['#00ff44', '#00ff44', '#ffaa00', '#ff2200'];
      ledColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(38, 8 + i * 11, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Coin (USB drive shape)
    makeTile(this, 'tile_coin', ctx => {
      ctx.fillStyle = '#ffdd00';
      ctx.fillRect(16, 6, 16, 28);
      ctx.fillRect(12, 12, 24, 20);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(18, 8, 12, 3);
      ctx.fillStyle = '#888888';
      ctx.fillRect(20, 34, 8, 8);
      // USB symbol
      ctx.fillStyle = '#cc8800';
      ctx.fillRect(22, 14, 4, 12);
      ctx.fillRect(16, 14, 6, 4);
      ctx.fillRect(16, 22, 6, 4);
    });

    // Power-up block (laptop)
    makeTile(this, 'tile_powerup', ctx => {
      ctx.fillStyle = '#00aa66';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#007744';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, 46, 46);
      ctx.fillStyle = '#00ff99';
      ctx.fillRect(3, 3, 42, 6);
      ctx.fillRect(3, 3, 6, 42);
      // Laptop icon
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 12, 28, 20);
      ctx.fillStyle = '#00ccff';
      ctx.fillRect(12, 14, 24, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 33, 32, 5);
    });

    // Exit flag (flagpole)
    makeTile(this, 'tile_exit_pole', ctx => {
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(22, 0, 4, 48);
      ctx.fillStyle = '#888888';
      ctx.fillRect(23, 0, 2, 48);
    });
    makeTile(this, 'tile_exit_flag', ctx => {
      // AquaChile-colored flag
      ctx.fillStyle = '#003366';
      ctx.fillRect(26, 2, 20, 14);
      ctx.fillStyle = '#0088dd';
      ctx.fillRect(26, 4, 18, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 6, 4, 6);
      ctx.fillRect(28, 6, 8, 2);
    });

    // Background decorations
    makeTile(this, 'bg_cloud', ctx => {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(16, 28, 14, 0, Math.PI * 2);
      ctx.arc(30, 28, 12, 0, Math.PI * 2);
      ctx.arc(22, 20, 16, 0, Math.PI * 2);
      ctx.fill();
    });
    makeTile(this, 'bg_antenna', ctx => {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(24, 48);
      ctx.lineTo(24, 10);
      ctx.stroke();
      // WiFi arcs
      for (let i = 1; i <= 3; i++) {
        ctx.strokeStyle = `rgba(100,180,255,${0.3 + i * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24, 12, i * 6, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      }
    });
  }

  _createUI() {
    // Heart icon
    makeTile(this, 'ui_heart', ctx => {
      ctx.fillStyle = '#ff2244';
      const heart = [
        '..XX..XX..',
        '.XXXXXX...',
        '.XXXXXXX..',
        '..XXXXXX..',
        '...XXXXX..',
        '....XXX...',
        '.....X....',
      ];
      heart.forEach((row, y) => {
        [...row].forEach((c, x) => {
          if (c === 'X') {
            ctx.fillRect(x * 4 + 4, y * 4 + 8, 4, 4);
          }
        });
      });
    });

    // Coin icon (small)
    makeTile(this, 'ui_coin', ctx => {
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(24, 24, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc9900';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 24, 26);
    });
  }
}
