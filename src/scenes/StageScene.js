import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, GROUND_ROW, GRAVITY } from '../constants.js';
import { LEVELS } from '../data/levels.js';
import { Player } from '../objects/Player.js';
import { Enemy, Boss } from '../objects/Enemy.js';
import { GameState } from '../GameState.js';

export class StageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageScene' });
  }

  init(data) {
    this.stageIndex = data.stageIndex ?? GameState.currentStageIndex;
    this.enemies = [];
    this.boss = null;
    this.coins = [];
    this.questionBlocks = [];
    this.exitFlag = null;
    this.timeLeft = 0;
    this.timerRunning = false;
    this.stageComplete = false;
    this.playerDying = false;
  }

  create() {
    const level = LEVELS[this.stageIndex];
    this.levelData = level;
    this.levelWidth = level.width * TILE_SIZE;

    // Background
    this._createBackground(level);

    // Tile groups
    this.platforms = this.physics.add.staticGroup();
    this.bricks     = this.physics.add.staticGroup();
    this.questions  = this.physics.add.staticGroup();
    this.coinGroup  = this.physics.add.staticGroup();
    this.groundTilePositions = []; // ground tile centers for edge detection

    // Build level from row data
    this._buildLevel(level);

    // Exit flag
    this._placeExitFlag(level);

    // Enemies
    this._spawnEnemies(level);

    // Boss (stage 4)
    if (level.boss) {
      this._spawnBoss(level.boss);
    }

    // Player
    const startPx = level.playerStart.x * TILE_SIZE + TILE_SIZE * 0.5;
    const startPy = GROUND_ROW * TILE_SIZE;
    this.player = new Player(this, startPx, startPy);

    // Enemy projectiles group
    this.enemyProjectiles = this.physics.add.group();

    // Physics colliders
    this._setupColliders();

    // Camera
    this.cameras.main.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // HUD
    this._createHUD();

    // Timer
    this.timeLeft = level.timeLimit;
    this.timerRunning = true;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this._tickTimer,
      callbackScope: this,
      loop: true,
    });

    // Stage name banner
    this._showStageBanner(level);
  }

  _createBackground(level) {
    const { sky, ground: groundColor } = level.bgColors;
    const W = this.levelWidth;
    const H = GAME_HEIGHT;

    // Sky
    this.add.rectangle(W * 0.5, H * 0.5, W, H, sky).setScrollFactor(0.1);

    // Background details (clouds / antennas)
    const isIndoor = this.stageIndex >= 2;
    if (!isIndoor) {
      this._addOutdoorBg(W, H);
    } else {
      this._addIndoorBg(W, H);
    }
  }

  _addOutdoorBg(W, H) {
    // Clouds
    for (let x = 0; x < W; x += 280) {
      const y = Phaser.Math.Between(60, 160);
      const cloud = this.add.image(x, y, 'bg_cloud')
        .setScale(Phaser.Math.FloatBetween(2, 4))
        .setAlpha(0.8)
        .setScrollFactor(0.3);
    }
    // Antennas in background
    for (let x = 100; x < W; x += 420) {
      this.add.image(x, GROUND_ROW * TILE_SIZE, 'bg_antenna')
        .setScale(2.5)
        .setOrigin(0.5, 1)
        .setAlpha(0.4)
        .setScrollFactor(0.6);
    }
    // Ground color strip
    this.add.rectangle(W * 0.5, GROUND_ROW * TILE_SIZE + TILE_SIZE,
      W, TILE_SIZE * 2, 0x54a030).setScrollFactor(1);
  }

  _addIndoorBg(W, H) {
    // Grid lines (tech/data center look)
    const gridGfx = this.add.graphics().setScrollFactor(0.2);
    gridGfx.lineStyle(1, 0x002244, 0.3);
    for (let x = 0; x < W * 0.3; x += 48) {
      gridGfx.beginPath();
      gridGfx.moveTo(x, 0);
      gridGfx.lineTo(x, H);
      gridGfx.strokePath();
    }
    for (let y = 0; y < H; y += 48) {
      gridGfx.beginPath();
      gridGfx.moveTo(0, y);
      gridGfx.lineTo(W * 0.3, y);
      gridGfx.strokePath();
    }
  }

  _buildLevel(level) {
    const isIndoor = this.stageIndex >= 2;
    const tileMap = {
      'G': () => isIndoor ? 'tile_dark_ground' : 'tile_ground',
      'g': () => 'tile_underground',
      'H': () => 'tile_hard',
      'S': () => 'tile_server',
    };

    level.rows.forEach((rowStr, row) => {
      [...rowStr].forEach((ch, col) => {
        if (ch === ' ') return;
        const px = col * TILE_SIZE + TILE_SIZE * 0.5;
        const py = row * TILE_SIZE + TILE_SIZE * 0.5;

        if (tileMap[ch]) {
          this.platforms.create(px, py, tileMap[ch]())
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .refreshBody();
          if (ch === 'G') this.groundTilePositions.push({ x: px, y: py });
        } else if (ch === 'B') {
          this.bricks.create(px, py, 'tile_brick')
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .refreshBody();
        } else if (ch === '?') {
          const q = this.questions.create(px, py, 'tile_question')
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .refreshBody();
          q.hasItem = true;
        } else if (ch === 'P') {
          const p = this.questions.create(px, py, 'tile_powerup')
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .refreshBody();
          p.hasItem = true;
          p.isPowerup = true;
        } else if (ch === 'c') {
          this.coinGroup.create(px, py, 'tile_coin')
            .setDisplaySize(TILE_SIZE * 0.6, TILE_SIZE * 0.6)
            .refreshBody();
        }
      });
    });
  }

  _placeExitFlag(level) {
    // Find '|' in level rows
    let flagX = (level.width - 2) * TILE_SIZE;
    let flagRow = GROUND_ROW;

    level.rows.forEach((rowStr, row) => {
      const col = rowStr.indexOf('|');
      if (col >= 0) {
        flagX = col * TILE_SIZE;
        flagRow = row;
      }
    });

    // Flagpole (3 tiles tall)
    for (let i = flagRow - 2; i <= flagRow; i++) {
      this.add.image(flagX + TILE_SIZE * 0.5, i * TILE_SIZE + TILE_SIZE * 0.5, 'tile_exit_pole')
        .setDisplaySize(TILE_SIZE, TILE_SIZE);
    }
    this.add.image(flagX + TILE_SIZE * 0.5, (flagRow - 2) * TILE_SIZE + TILE_SIZE * 0.5, 'tile_exit_flag')
      .setDisplaySize(TILE_SIZE, TILE_SIZE);

    // Exit zone (sensor)
    this.exitFlag = this.add.zone(flagX + TILE_SIZE * 0.5, flagRow * TILE_SIZE)
      .setSize(TILE_SIZE * 1.5, TILE_SIZE * 4);
    this.physics.world.enable(this.exitFlag, Phaser.Physics.Arcade.STATIC_BODY);
  }

  _spawnEnemies(level) {
    level.enemies.forEach(e => {
      const px = e.x * TILE_SIZE + TILE_SIZE * 0.5;
      const py = e.y * TILE_SIZE;
      const enemy = new Enemy(this, e.type, px, py);
      this.enemies.push(enemy);
    });
  }

  _spawnBoss(bossData) {
    const px = bossData.x * TILE_SIZE;
    const py = bossData.y * TILE_SIZE;
    this.boss = new Boss(this, px, py);

    // Boss health bar
    this.bossHealthBg = this.add.rectangle(GAME_WIDTH * 0.5, 30, 400, 20, 0x330000)
      .setScrollFactor(0)
      .setDepth(10);
    this.bossHealthBar = this.add.rectangle(GAME_WIDTH * 0.5, 30, 400, 20, 0xff2200)
      .setScrollFactor(0)
      .setDepth(10);
    this.bossHealthText = this.add.text(GAME_WIDTH * 0.5, 30, '⚠️ MAINFRAME CRÍTICO', {
      fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: '#ff8844',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
  }

  _setupColliders() {
    const allSolid = [this.platforms, this.bricks, this.questions];
    const playerSprite = this.player.sprite;

    // Player vs solid tiles
    allSolid.forEach(grp => {
      this.physics.add.collider(playerSprite, grp);
    });

    // Player vs coins
    this.physics.add.overlap(playerSprite, this.coinGroup, (_, coin) => {
      coin.destroy();
      GameState.addCoin();
      this._updateHUD();
      this._popScore(coin.x, coin.y, '+100');
    });

    // Player vs question blocks (hit from below)
    this.physics.add.collider(playerSprite, this.questions, (player, block) => {
      if (block.hasItem && player.body.velocity.y < 0 && player.y > block.y) {
        this._hitQuestionBlock(block);
      }
    });

    // Player vs exit
    this.physics.add.overlap(playerSprite, this.exitFlag, () => {
      if (!this.stageComplete) this._completeStage();
    });

    // Enemies vs solid tiles
    this.enemies.forEach(enemy => {
      allSolid.forEach(grp => {
        this.physics.add.collider(enemy.sprite, grp);
      });

      // Enemies also collide with bricks
      this.physics.add.collider(enemy.sprite, this.bricks);

      // Player stomps enemy (from above)
      this.physics.add.overlap(playerSprite, enemy.sprite, () => {
        if (!enemy.alive || this.player.isDead) return;
        const playerBottom = this.player.sprite.y;
        const enemyTop     = enemy.sprite.y - enemy.sprite.displayHeight;
        if (playerBottom <= enemyTop + 10 && this.player.sprite.body.velocity.y >= 0) {
          enemy.stomp();
          this.player.bounceOnEnemy();
          this._popScore(enemy.sprite.x, enemy.sprite.y, '+' + (this.stageIndex + 1) * 200);
          GameState.addScore((this.stageIndex + 1) * 200);
          this._updateHUD();
        } else {
          this._hurtPlayer();
        }
      });
    });

    // Boss interactions
    if (this.boss) {
      this.physics.add.collider(playerSprite, this.boss.sprite, () => {
        if (this.boss.alive) this._hurtPlayer();
      });

      // Player jumps on boss
      this.physics.add.overlap(playerSprite, this.boss.sprite, () => {
        if (!this.boss.alive || this.player.isDead) return;
        const pBottom = this.player.sprite.y;
        const bTop    = this.boss.sprite.y - this.boss.sprite.displayHeight;
        if (pBottom <= bTop + 16 && this.player.sprite.body.velocity.y >= 0) {
          const dead = this.boss.hit();
          this.player.bounceOnEnemy();
          if (dead) {
            // bossDefeated called internally
          } else {
            this._updateBossHealthBar();
            this._popScore(this.boss.sprite.x, this.boss.sprite.y, '⚠️ GOLPE');
          }
        } else {
          this._hurtPlayer();
        }
      });

      // Projectiles hit player
      this.physics.add.overlap(playerSprite, this.enemyProjectiles, (_, proj) => {
        proj.destroy();
        this._hurtPlayer();
      });
    }
  }

  _hitQuestionBlock(block) {
    block.hasItem = false;
    block.setTexture('tile_question_hit');
    block.refreshBody();

    // Pop coin from block
    const coinPop = this.physics.add.image(block.x, block.y - TILE_SIZE, 'tile_coin')
      .setDisplaySize(TILE_SIZE * 0.6, TILE_SIZE * 0.6);
    coinPop.body.setVelocityY(-400);
    coinPop.body.setGravityY(600);
    coinPop.body.setAllowGravity(true);

    if (block.isPowerup) {
      // Spawn laptop power-up (for now, just extra score)
      GameState.addScore(500);
      this._popScore(block.x, block.y, '⭐ +500');
    } else {
      GameState.addCoin();
    }
    this._updateHUD();

    this.time.delayedCall(600, () => coinPop.destroy());
  }

  _hurtPlayer() {
    if (this.player.isDead || this.playerDying) return;
    const gameOver = this.player.hurt();
    this._updateHUD();
    if (gameOver) {
      this.playerDying = true;
      this.player.die(this);
      this.time.delayedCall(2000, () => {
        this.scene.start('GameOverScene');
      });
    } else {
      this.cameras.main.shake(200, 0.01);
    }
  }

  _completeStage() {
    if (this.stageComplete) return;
    this.stageComplete = true;
    this.timerRunning = false;

    GameState.completeStage(this.stageIndex);
    // Time bonus
    const timeBonus = this.timeLeft * 50;
    GameState.addScore(timeBonus);

    this.timerEvent?.remove();
    this.player.sprite.body.setVelocityX(200); // run to flag

    // Show banner
    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start('WinScene', {
          stageIndex: this.stageIndex,
          score: GameState.score,
          timeBonus,
        });
      });
    });
  }

  bossDefeated() {
    this._completeStage();
  }

  _updateBossHealthBar() {
    if (!this.bossHealthBar) return;
    const ratio = this.boss.health / 3;
    this.bossHealthBar.scaleX = ratio;
    this.bossHealthBar.x = GAME_WIDTH * 0.5 - (1 - ratio) * 200;
  }

  _popScore(x, y, text) {
    const t = this.add.text(x, y - 20, text, {
      fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold',
      color: '#ffff00', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: t,
      y: y - 70,
      alpha: 0,
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  _showStageBanner(level) {
    const banner = this.add.text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.4, level.name, {
      fontFamily: 'monospace', fontSize: '28px', fontStyle: 'bold',
      color: '#00ccff', stroke: '#003366', strokeThickness: 5,
      backgroundColor: '#00000099', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

    const sub = this.add.text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.4 + 50, level.subtitle, {
      fontFamily: 'monospace', fontSize: '14px', color: '#88aacc',
      backgroundColor: '#00000099', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [banner, sub],
        alpha: 0,
        duration: 500,
        onComplete: () => { banner.destroy(); sub.destroy(); },
      });
    });
  }

  _createHUD() {
    const H = GAME_HEIGHT;

    // HUD background bar
    const hudBg = this.add.rectangle(GAME_WIDTH * 0.5, 20, GAME_WIDTH, 40, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(10);

    // Score
    this.scoreText = this.add.text(16, 20, `PTOS: ${GameState.score}`, {
      fontFamily: 'monospace', fontSize: '15px', fontStyle: 'bold', color: '#ffcc00',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);

    // Stage name
    this.add.text(GAME_WIDTH * 0.5, 20, `${this.levelData.name}`, {
      fontFamily: 'monospace', fontSize: '13px', color: '#88aacc',
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(11);

    // Lives
    this.livesText = this.add.text(GAME_WIDTH - 16, 20, `❤️ × ${GameState.lives}`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#ff4466',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(11);

    // Timer
    this.timerText = this.add.text(GAME_WIDTH * 0.5, 38, `⏱ ${this.timeLeft}`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#aabbdd',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    // Coins
    this.coinsText = this.add.text(200, 20, `🪙 × ${GameState.coins}`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffdd44',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
  }

  _updateHUD() {
    this.scoreText?.setText(`PTOS: ${GameState.score}`);
    this.livesText?.setText(`❤️ × ${GameState.lives}`);
    this.coinsText?.setText(`🪙 × ${GameState.coins}`);
  }

  _tickTimer() {
    if (!this.timerRunning) return;
    this.timeLeft = Math.max(0, this.timeLeft - 1);
    this.timerText?.setText(`⏱ ${this.timeLeft}`);

    if (this.timeLeft <= 30) {
      this.timerText?.setColor('#ff4444');
    }
    if (this.timeLeft <= 0) {
      this._hurtPlayer();
      if (GameState.lives > 0) {
        this.timeLeft = this.levelData.timeLimit;
        this.timerText?.setColor('#aabbdd');
      }
    }
  }

  update(time, delta) {
    if (this.player.isDead) return;

    this.player.update(delta);

    // Update enemies
    this.enemies.forEach(e => {
      if (e.alive) e.update(delta, this.platforms);
    });

    // Update boss
    if (this.boss?.alive) {
      this.boss.update(delta);
    }

    // Kill player if fell off map
    if (this.player.sprite.y > GAME_HEIGHT + 100) {
      this._hurtPlayer();
      if (GameState.lives > 0) {
        // Respawn
        const level = this.levelData;
        this.player.sprite.x = level.playerStart.x * TILE_SIZE + TILE_SIZE * 0.5;
        this.player.sprite.y = GROUND_ROW * TILE_SIZE - 48;
        this.player.sprite.body.setVelocity(0, 0);
        this.player.isDead = false;
        this.player.hurtTimer = this.player.hurtCooldown;
        this.playerDying = false;
      }
    }
  }
}
