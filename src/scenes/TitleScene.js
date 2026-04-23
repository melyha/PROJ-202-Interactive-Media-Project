import SoundManager, { createSettingsButton } from '../managers/SoundManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    this.load.image('title_bg', 'assets/backgrounds/title-background.png');
    SoundManager.preloadAssets(this);
  }

  create() {
    // ── Background image ─────────────────────────────────────────────────────
    this.add.image(640, 360, 'title_bg')
      .setDisplaySize(1280, 720)
      .setDepth(0);

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
      fontSize: '14px',
      color: '#d4c4e8',
       stroke: "#8040c0",
            strokeThickness: 2,
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
        fontSize: '10px',
        color: '#ffecd8',
        stroke: "#080808",
            strokeThickness: 2,
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
        fontSize: '10px',
        color: '#e8a880',
        stroke: "#69300d",
            strokeThickness: 2,
        resolution: 2
      }).setOrigin(0.5);
    });

    // ── Start prompt ─────────────────────────────────────────────────────────
    const prompt = this.add.text(640, 516, '[ PRESS SPACE OR CLICK TO START ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#fac775',
      stroke: "#74521d",
            strokeThickness: 2,
      resolution: 2
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('IntroScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('IntroScene'));
    this.gearClicked = false;
    this.input.once('pointerdown', () => {
      if (this.gearClicked) return;
      this.scene.start('IntroScene');
    });

    // ── Sound — shared singleton, start menu music ────────────────────────────
    this.soundManager = SoundManager.getInstance(this);
    this.soundManager.playMenuMusic();
    const { gearBtn } = createSettingsButton(this, this.soundManager, 1250, 29);
    gearBtn.on('pointerdown', () => {
      this.gearClicked = true;
      this.time.delayedCall(100, () => { this.gearClicked = false; });
    });
  }
}
