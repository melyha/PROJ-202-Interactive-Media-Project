// Phaser is global via CDN — do not import it

export class Enemy {
  constructor(scene, x, y, texture, patrolRange) {
    this.scene = scene;
    this.sprite = scene.add.image(x, y, texture);
    this.sprite.setDepth(8);
    this.startX = x;
    this.patrolRange = patrolRange;
    this.direction = 1;
    this.speed = 80;
    this.alive = true;
    this.hit = false;
  }

  update(time, delta) {
    if (!this.alive) return;
    this.sprite.x += this.direction * this.speed * (delta / 1000);
    if (this.sprite.x > this.startX + this.patrolRange) {
      this.direction = -1;
      this.sprite.setFlipX(true);
    }
    if (this.sprite.x < this.startX - this.patrolRange) {
      this.direction = 1;
      this.sprite.setFlipX(false);
    }
  }

  takeDamage() {
    if (!this.alive || this.hit) return;
    this.hit = true;
    this.scene.time.delayedCall(400, () => this.die());
  }

  die() {
    this.alive = false;
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      y: this.sprite.y + 200,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.In',
      onComplete: () => { this.sprite.destroy(); }
    });
  }
}

export class Frog extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'frog', 200);
    this.speed = 70;
    this.leapTimer = 0;
    this.leapInterval = 1800;
    this.isLeaping = false;
    this.groundY = y;
  }

  update(time, delta) {
    if (!this.alive) return;
    this.leapTimer += delta;
    if (this.leapTimer >= this.leapInterval && !this.isLeaping) {
      this.leapTimer = 0;
      this.isLeaping = true;
      this.sprite.setTexture('frog_leap');
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.groundY - 40,
        duration: 200,
        yoyo: true,
        ease: 'Sine.Out',
        onComplete: () => {
          if (this.alive) {
            this.isLeaping = false;
            this.sprite.y = this.groundY;
            this.sprite.setTexture('frog');
          }
        }
      });
    }
    super.update(time, delta);
    // Pin to ground y — prevents any drift from tweens or rounding
    if (!this.isLeaping) this.sprite.y = this.groundY;
  }

  takeDamage() {
    if (!this.alive || this.hit) return;
    this.sprite.setTexture('frog_hit');
    super.takeDamage();
  }

  die() {
    this.sprite.setTexture('frog_dead');
    super.die();
  }
}
