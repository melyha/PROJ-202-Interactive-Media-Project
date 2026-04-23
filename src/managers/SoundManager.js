// Phaser is global via CDN — do not import it

export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.bgMusic = null;
  }

  // Called from GameScene preload() — registers all asset paths
  static preloadAssets(scene) {
    scene.load.audio('sfx_coin',      'assets/sounds/sfx_coin.ogg');
    scene.load.audio('sfx_gem',       'assets/sounds/sfx_gem.ogg');
    scene.load.audio('sfx_hurt',      'assets/sounds/sfx_hurt.ogg');
    scene.load.audio('sfx_disappear', 'assets/sounds/sfx_disappear.ogg');
    scene.load.audio('sfx_bump',      'assets/sounds/sfx_bump.ogg');
    scene.load.audio('sfx_throw',     'assets/sounds/sfx_throw.ogg');
    scene.load.audio('sfx_jump',      'assets/sounds/sfx_jump.ogg');
    scene.load.audio('sfx_sparkle',   'assets/sounds/sfx_sparkle.ogg');
    scene.load.audio('music_bg',      'assets/sounds/bitwave-background.ogg');
  }

  // Called from GameScene create() after assets are loaded
  init() {
    this.bgMusic = this.scene.sound.add('music_bg', {
      loop: true,
      volume: 0.4
    });
    if (this.musicEnabled) this.bgMusic.play();
  }

  // ── SFX methods ──────────────────────────────────────────────

  playCoin()       { this._play('sfx_coin',      0.6); }
  playGem()        { this._play('sfx_gem',        0.7); }
  playHurt()       { this._play('sfx_hurt',       0.8); }
  playDisappear()  { this._play('sfx_disappear',  0.8); }
  playBump()       { this._play('sfx_bump',       0.7); }
  playThrow()      { this._play('sfx_throw',      0.7); }
  playJump()       { this._play('sfx_jump',       0.6); }
  playSparkle()    { this._play('sfx_sparkle',    0.8); }

  // ── Music controls ───────────────────────────────────────────

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.bgMusic) {
      if (this.musicEnabled) this.bgMusic.resume();
      else this.bgMusic.pause();
    }
    return this.musicEnabled;
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  stopAll() {
    if (this.bgMusic) this.bgMusic.stop();
    this.scene.sound.stopAll();
  }

  // ── Internal ─────────────────────────────────────────────────

  _play(key, volume = 0.7) {
    if (!this.sfxEnabled) return;
    try {
      this.scene.sound.play(key, { volume });
    } catch (e) {
      // Sound not loaded yet — fail silently
    }
  }
}
