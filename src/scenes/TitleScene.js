export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#c8e8f0');

    const title = this.add.text(640, 160, 'ENIGMA', {
      fontFamily: '"Press Start 2P"',
      fontSize: '64px',
      color: '#f5c8a0',
      stroke: '#000000',
      strokeThickness: 6
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

    this.add.text(640, 240, 'A game by Maevea', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#ffffff',
      alpha: 0.7
    }).setOrigin(0.5);

    const controls = [
      'ARROW KEYS / WASD  \u2014  MOVE',
      'SPACE  \u2014  JUMP',
      'J \u2014 ATTACK     K \u2014 KICK'
    ];
    controls.forEach((line, i) => {
      this.add.text(640, 320 + i * 30, line, {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#ccddee'
      }).setOrigin(0.5);
    });

    const prompt = this.add.text(640, 460, '[ PRESS SPACE OR CLICK TO START ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#f5c875'
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}
