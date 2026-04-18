import { TILE_SIZE, PLAYER_SPEED, PLAYER_JUMP, PLAYER_BOUNCE } from '../constants.js';
import { GameState } from '../GameState.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.charIndex = GameState.selectedCharacter;
    this.prefix = this.charIndex === 0 ? 'p1' : 'p2';

    this.sprite = scene.physics.add.sprite(x, y, `${this.prefix}_stand`)
      .setDisplaySize(TILE_SIZE * 0.65, TILE_SIZE * 0.9)
      .setOrigin(0.5, 1);

    this.sprite.setCollideWorldBounds(false);
    this.sprite.body.setGravityY(0); // gravity set on scene physics

    this.state = 'idle'; // idle | running | jumping | dead | hurt
    this.facingRight = true;
    this.isGrounded = false;
    this.hurtTimer = 0;
    this.hurtCooldown = 1500; // ms invincibility after being hurt
    this.isDead = false;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.walkFrameRate = 150; // ms per frame

    this._setupAnimations();
    this._setupCursors();
  }

  _setupAnimations() {
    const p = this.prefix;
    const frames = [
      { key: `${p}_walk`, frames: [`${p}_walk1`, `${p}_walk2`], frameRate: 8, repeat: -1 },
      { key: `${p}_stand`, frames: [`${p}_stand`], frameRate: 1, repeat: -1 },
      { key: `${p}_jump`, frames: [`${p}_jump`], frameRate: 1, repeat: -1 },
    ];
    frames.forEach(({ key, frames: f, frameRate, repeat }) => {
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key,
          frames: f.map(k => ({ key: k })),
          frameRate,
          repeat,
        });
      }
    });
    this.sprite.play(`${this.prefix}_stand`);
  }

  _setupCursors() {
    this.cursors = this.scene.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  update(delta) {
    if (this.isDead) return;

    const body = this.sprite.body;
    this.isGrounded = body.blocked.down;

    // Hurt invincibility timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      // Flash effect
      this.sprite.setAlpha(Math.floor(this.hurtTimer / 100) % 2 === 0 ? 1 : 0.4);
    } else {
      this.sprite.setAlpha(1);
    }

    const keys = this.cursors;
    const moveLeft  = keys.left.isDown  || keys.a.isDown;
    const moveRight = keys.right.isDown || keys.d.isDown;
    const jump = Phaser.Input.Keyboard.JustDown(keys.up)
              || Phaser.Input.Keyboard.JustDown(keys.w)
              || Phaser.Input.Keyboard.JustDown(keys.space);

    // Horizontal movement
    if (moveLeft) {
      body.setVelocityX(-PLAYER_SPEED);
      this.facingRight = false;
    } else if (moveRight) {
      body.setVelocityX(PLAYER_SPEED);
      this.facingRight = true;
    } else {
      body.setVelocityX(0);
    }

    // Flip sprite based on direction
    this.sprite.setFlipX(!this.facingRight);

    // Jump
    if (jump && this.isGrounded) {
      body.setVelocityY(PLAYER_JUMP);
      this.scene.sound.play && this.scene.sound.play('jump', { volume: 0.5 });
    }

    // Animation
    const p = this.prefix;
    if (!this.isGrounded) {
      if (this.sprite.anims.currentAnim?.key !== `${p}_jump`) {
        this.sprite.play(`${p}_jump`);
      }
    } else if (moveLeft || moveRight) {
      if (this.sprite.anims.currentAnim?.key !== `${p}_walk`) {
        this.sprite.play(`${p}_walk`);
      }
    } else {
      if (this.sprite.anims.currentAnim?.key !== `${p}_stand`) {
        this.sprite.play(`${p}_stand`);
      }
    }
  }

  bounceOnEnemy() {
    this.sprite.body.setVelocityY(PLAYER_BOUNCE);
  }

  hurt() {
    if (this.hurtTimer > 0 || this.isDead) return false;
    this.hurtTimer = this.hurtCooldown;
    const isDead = GameState.loseLife();
    return isDead;
  }

  die(scene) {
    if (this.isDead) return;
    this.isDead = true;
    this.sprite.body.setVelocityX(0);
    this.sprite.body.setVelocityY(-500);
    this.sprite.body.setGravityY(600);
    this.sprite.body.checkCollision.none = true;
    // Scene will handle game over after animation
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}
