export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // ── Gradient sky background ──────────────────────────────────────────────
    const bg = this.add.graphics();
    // Top: lavender → rose gold
    bg.fillGradientStyle(0xc8a4d4, 0xc8a4d4, 0xe8b4c0, 0xe8b4c0, 1);
    bg.fillRect(0, 0, 1280, 260);
    // Mid: peach → amber
    bg.fillGradientStyle(0xf5c9a0, 0xf5c9a0, 0xe8a880, 0xe8a880, 1);
    bg.fillRect(0, 260, 1280, 260);
    // Bottom: amber → coral
    bg.fillGradientStyle(0xe8a880, 0xe8a880, 0xd4875a, 0xd4875a, 1);
    bg.fillRect(0, 520, 1280, 200);

    // ── Star scatter — upper sky (y: 0–200) ──────────────────────────────────
    const starGfx = this.add.graphics();
    starGfx.fillStyle(0xffecd8, 1);
    for (let i = 0; i < 12; i++) {
      const sx = Math.floor(Math.random() * 1260) + 10;
      const sy = Math.floor(Math.random() * 195) + 5;
      starGfx.fillCircle(sx, sy, 2);
    }
    starGfx.setAlpha(0.6);
    this.tweens.add({
      targets: starGfx,
      alpha: 0.2,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    // ── Title ────────────────────────────────────────────────────────────────
    const title = this.add.text(640, 160, 'ENIGMA', {
      fontFamily: '"Press Start 2P"',
      fontSize: '64px',
      color: '#f5d47a',
      stroke: '#8040c0',
      strokeThickness: 4,
      resolution: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    // ── Subtitle ─────────────────────────────────────────────────────────────
    this.add.text(640, 248, 'A Game by Melyha', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#d4c4e8',
      resolution: 2
    }).setOrigin(0.5);

    // ── Controls ─────────────────────────────────────────────────────────────
    const controls = [
      'ARROW KEYS / WASD  \u2014  MOVE',
      'SPACE  \u2014  JUMP',
      'Z \u2014 ATTACK     X \u2014 KICK',
      'TAB  \u2014  SWITCH TO COMPANION'
    ];
    controls.forEach((line, i) => {
      this.add.text(640, 318 + i * 30, line, {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#ffecd8',
        resolution: 2
      }).setOrigin(0.5);
    });

    // ── Tips ─────────────────────────────────────────────────────────────────
    const tips = [
      'COLLECT 15 COINS  \u2014  POWER SABLE',
      'LAVA \u00b7 FIRE \u00b7 ENEMIES  \u2014  DAMAGE BOTH'
    ];
    tips.forEach((line, i) => {
      this.add.text(640, 448 + i * 24, line, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#e8a880',
        resolution: 2
      }).setOrigin(0.5);
    });

    // ── Start prompt ─────────────────────────────────────────────────────────
    const prompt = this.add.text(640, 516, '[ PRESS SPACE OR CLICK TO START ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#fac775',
      resolution: 2
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('IntroScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('IntroScene'));
    this.input.once('pointerdown', () => this.scene.start('IntroScene'));
  }
}
