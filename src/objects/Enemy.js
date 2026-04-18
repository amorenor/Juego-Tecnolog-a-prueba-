import { TILE_SIZE } from '../constants.js';
import { GameState } from '../GameState.js';

const ENEMY_SPEED = {
  wifi:  90,
  bug:   110,
  phone: 130,
  drone: 100,
};

const ENEMY_SCORE = {
  wifi:  200,
  bug:   300,
  phone: 400,
  drone: 500,
};

export class Enemy {
  constructor(scene, type, x, y) {
    this.scene = scene;
    this.type = type;
    this.alive = true;
    this.dying = false;
    this.speed = ENEMY_SPEED[type] || 90;
    this.dir = -1; // start walking left
    this.flyOffset = 0;
    this.flyTime = 0;

    const key = type === 'drone' ? `${type}_fly1` : `${type}_walk1`;
    this.sprite = scene.physics.add.sprite(x, y, key)
      .setDisplaySize(TILE_SIZE * 0.85, TILE_SIZE * 0.85)
      .setOrigin(0.5, 1);

    if (type === 'drone') {
      this.sprite.body.setAllowGravity(false);
      this.baseY = y;
    }

    this._setupAnimation();
  }

  _setupAnimation() {
    const t = this.type;
    if (t === 'drone') {
      if (!this.scene.anims.exists(`${t}_fly`)) {
        this.scene.anims.create({
          key: `${t}_fly`,
          frames: [{ key: `${t}_fly1` }, { key: `${t}_fly2` }],
          frameRate: 6,
          repeat: -1,
        });
      }
      this.sprite.play(`${t}_fly`);
    } else {
      if (!this.scene.anims.exists(`${t}_walk`)) {
        this.scene.anims.create({
          key: `${t}_walk`,
          frames: [{ key: `${t}_walk1` }, { key: `${t}_walk2` }],
          frameRate: t === 'phone' ? 10 : 7,
          repeat: -1,
        });
      }
      this.sprite.play(`${t}_walk`);
    }
  }

  update(delta, platforms) {
    if (!this.alive || this.dying) return;

    const body = this.sprite.body;

    if (this.type === 'drone') {
      // Drone: horizontal movement + sine wave vertical
      this.flyTime += delta;
      body.setVelocityX(this.speed * this.dir);
      const sineOffset = Math.sin(this.flyTime * 0.003) * 40;
      this.sprite.y = this.baseY + sineOffset;

      // Reverse if hitting level bounds
      if (this.sprite.x < TILE_SIZE || this.sprite.x > this.scene.levelWidth - TILE_SIZE) {
        this.dir *= -1;
      }
    } else {
      body.setVelocityX(this.speed * this.dir);

      // Turn around when hitting a wall or edge of platform
      if (body.blocked.left)  this.dir = 1;
      if (body.blocked.right) this.dir = -1;

      // Turn around at platform edge (avoid falling)
      if (body.blocked.down) {
        const edgeCheckX = this.sprite.x + this.dir * (TILE_SIZE * 0.6);
        const edgeCheckY = this.sprite.y + 4;
        // Simple edge detection via raycasting is complex; use tile check instead
        // We'll do a basic version: if there's no ground within half a tile ahead, turn
        if (this._isEdgeAhead(edgeCheckX, edgeCheckY)) {
          this.dir *= -1;
        }
      }
    }

    // Flip sprite
    this.sprite.setFlipX(this.dir < 0);
  }

  _isEdgeAhead(checkX, checkY) {
    const positions = this.scene.groundTilePositions;
    if (!positions) return false;
    for (const pos of positions) {
      if (Math.abs(pos.x - checkX) < TILE_SIZE * 0.5 &&
          Math.abs(pos.y - checkY) < TILE_SIZE * 1.5) {
        return false;
      }
    }
    return true;
  }

  stomp() {
    if (!this.alive) return;
    this.alive = false;
    this.dying = true;
    GameState.addScore(ENEMY_SCORE[this.type]);
    this.sprite.body.setVelocityX(0);
    this.sprite.body.setAllowGravity(false);
    // Show flat/dead texture
    this.sprite.setTexture(`${this.type}_dead`);
    this.sprite.setDisplaySize(TILE_SIZE * 0.85, TILE_SIZE * 0.3);
    this.scene.time.delayedCall(600, () => {
      this.sprite.destroy();
    });
  }

  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}

export class Boss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.alive = true;
    this.health = 3;
    this.phase = 0;
    this.shootTimer = 0;
    this.shootInterval = 2000;
    this.hurtTimer = 0;
    this.projectiles = [];

    // Boss is 2x2 tiles
    this.sprite = scene.physics.add.sprite(x, y, 'boss_top')
      .setDisplaySize(TILE_SIZE * 2, TILE_SIZE * 2)
      .setOrigin(0.5, 1)
      .setImmovable(true);
    this.sprite.body.setAllowGravity(false);

    // Pulse animation
    scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 0.98 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta) {
    if (!this.alive) return;

    this.shootTimer += delta;

    const interval = this.phase === 0 ? 2500 :
                     this.phase === 1 ? 1800 : 1200;

    if (this.shootTimer >= interval) {
      this.shootTimer = 0;
      this._shoot();
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      this.sprite.setTint(this.hurtTimer > 0 ? 0xff4444 : 0xffffff);
      if (this.hurtTimer <= 0) this.sprite.clearTint();
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  _shoot() {
    const player = this.scene.player;
    if (!player) return;

    const dx = player.x - this.sprite.x;
    const dy = player.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = this.phase === 0 ? 200 :
                  this.phase === 1 ? 280 : 350;

    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    const proj = this.scene.physics.add.sprite(
      this.sprite.x, this.sprite.y - TILE_SIZE, 'projectile'
    ).setDisplaySize(TILE_SIZE * 0.6, TILE_SIZE * 0.6);

    proj.body.setAllowGravity(false);
    proj.body.setVelocity(vx, vy);

    this.projectiles.push(proj);
    this.scene.enemyProjectiles.add(proj);

    // Destroy after 4 seconds
    this.scene.time.delayedCall(4000, () => {
      if (proj.active) proj.destroy();
    });
  }

  hit() {
    if (this.hurtTimer > 0) return false;
    this.health--;
    this.hurtTimer = 800;
    this.phase = 3 - this.health;

    if (this.health <= 0) {
      this._die();
      return true;
    }
    // Flash red
    this.sprite.setTint(0xff2222);
    // Speed up
    this.shootInterval *= 0.7;
    return false;
  }

  _die() {
    this.alive = false;
    this.sprite.body.setVelocity(0, 0);

    // Explosion effect
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        const ex = this.sprite.x + Phaser.Math.Between(-40, 40);
        const ey = this.sprite.y + Phaser.Math.Between(-60, 0);
        const exp = this.scene.add.circle(ex, ey, 12, 0xff4400);
        this.scene.tweens.add({
          targets: exp,
          alpha: 0,
          scaleX: 3,
          scaleY: 3,
          duration: 500,
          onComplete: () => exp.destroy(),
        });
      });
    }

    this.scene.time.delayedCall(1500, () => {
      this.sprite.destroy();
      this.scene.bossDefeated();
    });
  }
}
