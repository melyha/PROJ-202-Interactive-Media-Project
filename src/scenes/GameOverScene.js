export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data) {
    const score = data?.score || 0;

    this.cameras.main.shake(500, 0.02);
    this.add.rectangle(640, 360, 1280, 720, 0x1a0a2e);

    const goText = this.add.text(640, 180, 'GAME OVER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '56px',
      color: '#cc2244',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: goText, alpha: 1, duration: 600 });

    this.add.text(640, 280, 'SCORE: ' + score, {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const replay = this.add.text(640, 380, '[ REPLAY ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#f5c875'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: replay, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    replay.on('pointerover', () => replay.setTint(0xffff99));
    replay.on('pointerout',  () => replay.clearTint());
    replay.on('pointerdown', () => this.scene.start('GameScene'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}
