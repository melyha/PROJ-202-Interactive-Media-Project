// Phaser is global via CDN — do not import it

export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.bgMusic = null;
  }

  // ── Singleton — one shared instance across scenes ─────────────────────────

  static getInstance(scene) {
    if (!window._enigmaSoundManager) {
      window._enigmaSoundManager = new SoundManager(scene);
    } else {
      window._enigmaSoundManager.scene = scene;
    }
    return window._enigmaSoundManager;
  }

  // ── Asset loading — call from any scene's preload() ───────────────────────

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
    scene.load.audio('music_menu',    'assets/sounds/when-it-rains-background.ogg');
  }

  // ── Music switchers ───────────────────────────────────────────────────────

  playMenuMusic() {
    if (this.bgMusic) { this.bgMusic.stop(); this.bgMusic.destroy(); }
    this.bgMusic = this.scene.sound.add('music_menu', { loop: true, volume: 0.35 });
    if (this.musicEnabled) this.bgMusic.play();
  }

  playGameMusic() {
    if (this.bgMusic) { this.bgMusic.stop(); this.bgMusic.destroy(); }
    this.bgMusic = this.scene.sound.add('music_bg', { loop: true, volume: 0.4 });
    if (this.musicEnabled) this.bgMusic.play();
  }

  // ── SFX methods ───────────────────────────────────────────────────────────

  playCoin()       { this._play('sfx_coin',      0.6); }
  playGem()        { this._play('sfx_gem',        0.7); }
  playHurt()       { this._play('sfx_hurt',       0.8); }
  playDisappear()  { this._play('sfx_disappear',  0.8); }
  playBump()       { this._play('sfx_bump',       0.7); }
  playThrow()      { this._play('sfx_throw',      0.7); }
  playJump()       { this._play('sfx_jump',       0.6); }
  playSparkle()    { this._play('sfx_sparkle',    0.8); }

  // ── Music / SFX toggles ───────────────────────────────────────────────────

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

  // ── Internal ──────────────────────────────────────────────────────────────

  _play(key, volume = 0.7) {
    if (!this.sfxEnabled) return;
    try {
      this.scene.sound.play(key, { volume });
    } catch (e) {
      // Sound not loaded yet — fail silently
    }
  }
}

// ── Shared settings panel — call from any scene ───────────────────────────────
//
// x, y  = centre of the gear circle button
// Returns { gearBtn, gearCircle, closePanel }
// The O key toggles the panel in whatever scene called this.

export function createSettingsButton(scene, soundManager, x, y) {

  // Fix 2 — Circle background matching ! and ? button style
  const gearCircle = scene.add.graphics().setScrollFactor(0).setDepth(79);
  gearCircle.fillStyle(0x886600, 1);
  gearCircle.fillCircle(x, y, 18);
  gearCircle.lineStyle(2, 0xfac775, 1);
  gearCircle.strokeCircle(x, y, 18);

  // Fix 2 — Gear icon: Press Start 2P, 16px, centred on circle
  const gearBtn = scene.add.text(x, y, '\u2699', {
    fontFamily: '"Press Start 2P"',
    fontSize: '16px',
    color: '#fac775',
  }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(80)
    .setInteractive({ useHandCursor: true });

  let panelOpen = false;
  let panelElements = [];

  const closePanel = () => {
    panelElements.forEach(e => e.destroy());
    panelElements = [];
    panelOpen = false;
  };

  // Fix 3 — Panel opens downward, right edge aligned with gear centre x
  const togglePanel = () => {
    if (panelOpen) { closePanel(); return; }
    panelOpen = true;

    const PL = x - 220; // panel left  (right edge = x)
    const PT = y + 22;  // panel top   (just below circle)
    const PW = 220;
    const PH = 120;

    // Background
    const bg = scene.add.graphics().setScrollFactor(0).setDepth(81);
    bg.fillStyle(0x1a0a2e, 0.95);
    bg.fillRoundedRect(PL, PT, PW, PH, 8);
    bg.lineStyle(1, 0xfac775, 0.6);
    bg.strokeRoundedRect(PL, PT, PW, PH, 8);
    panelElements.push(bg);

    // ── Music row ──────────────────────────────────────────────────────────
    const musicLabel = scene.add.text(PL + 14, PT + 14, '\uD83D\uDD0A  Music', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#ffecd8',
    }).setScrollFactor(0).setDepth(82);
    panelElements.push(musicLabel);

    const musicOn = soundManager.musicEnabled;
    const musicToggle = scene.add.text(x - 8, PT + 14,
      musicOn ? '[ ON ]' : '[ OFF ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: musicOn ? '#00ff88' : '#ff4444',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(82)
      .setInteractive({ useHandCursor: true });
    panelElements.push(musicToggle);

    musicToggle.on('pointerdown', (pointer, lx, ly, event) => {
      if (event) event.stopPropagation();
      const nowOn = soundManager.toggleMusic();
      musicToggle.setText(nowOn ? '[ ON ]' : '[ OFF ]');
      musicToggle.setColor(nowOn ? '#00ff88' : '#ff4444');
    });

    // Divider
    const div = scene.add.graphics().setScrollFactor(0).setDepth(82);
    div.lineStyle(1, 0xfac775, 0.25);
    div.lineBetween(PL + 10, PT + 48, x - 10, PT + 48);
    panelElements.push(div);

    // ── SFX row ────────────────────────────────────────────────────────────
    const sfxLabel = scene.add.text(PL + 14, PT + 60, '\uD83D\uDD08  SFX', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#ffecd8',
    }).setScrollFactor(0).setDepth(82);
    panelElements.push(sfxLabel);

    const sfxOn = soundManager.sfxEnabled;
    const sfxToggle = scene.add.text(x - 8, PT + 60,
      sfxOn ? '[ ON ]' : '[ OFF ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: sfxOn ? '#00ff88' : '#ff4444',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(82)
      .setInteractive({ useHandCursor: true });
    panelElements.push(sfxToggle);

    sfxToggle.on('pointerdown', (pointer, lx, ly, event) => {
      if (event) event.stopPropagation();
      const nowOn = soundManager.toggleSFX();
      sfxToggle.setText(nowOn ? '[ ON ]' : '[ OFF ]');
      sfxToggle.setColor(nowOn ? '#00ff88' : '#ff4444');
    });

    // Close hint
    const closeHint = scene.add.text(PL + PW / 2, PT + 96, 'press O or click \u2699 to close', {
      fontFamily: 'sans-serif',
      fontSize: '9px',
      color: '#666666',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(82);
    panelElements.push(closeHint);
  };

  // Fix 4 — stopPropagation keeps gear clicks from reaching scene pointerdown
  gearBtn.on('pointerdown', (pointer, localX, localY, event) => {
    if (event) event.stopPropagation();
    togglePanel();
  });
  gearBtn.on('pointerover', () => gearBtn.setColor('#ffffff'));
  gearBtn.on('pointerout',  () => gearBtn.setColor('#fac775'));

  // Fix 5 — O key toggles panel in the calling scene
  scene.input.keyboard.on('keydown-O', togglePanel);

  return { gearBtn, gearCircle, closePanel };
}
