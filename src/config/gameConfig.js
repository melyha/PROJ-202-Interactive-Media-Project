import TitleScene from '../scenes/TitleScene.js';
import IntroScene from '../scenes/IntroScene.js';
import GameScene  from '../scenes/GameScene.js';

const gameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: true   // toggle at runtime with G key
    }
  },
  scene: [TitleScene, IntroScene, GameScene]
};

export default gameConfig;
