// Phaser is global via CDN — do not import it
import { createSettingsButton } from '../managers/SoundManager.js';

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
    this._atlasOpen = false;
  }

  init(data) {
    // data.mode tells MapScene what to show:
    // 'fragment_popup' | 'fragment_notif' | 'win' | 'atlas'
    this.mode = data.mode;
    this.gameScene = this.scene.get('GameScene');
  }

  preload() {
    if (!this.textures.exists('title_bg')) {
      this.load.image('title_bg', 'assets/backgrounds/title-background.png');
    }
    if (!this.textures.exists('char_head')) {
      this.load.image('char_head', 'assets/sprites/character/PNG/Parts/head.png');
    }
    if (!this.textures.exists('hud_player_purple')) {
      this.load.image('hud_player_purple', 'assets/sprites/tiles/hud_player_purple.png');
    }
    this.load.image('atlas_fragment_01_gold', 'assets/map/atlas_fragment_01_gold.png');
    if (!this.textures.exists('celestial_atlas_map')) {
      this.load.image('celestial_atlas_map', 'assets/map/atlas_fragment_01_gold1.png');
    }
  }

  create() {
    this._atlasOpen = false;
    if (this.mode === 'fragment_popup') this.showFragmentPopup();
    else if (this.mode === 'fragment_notif') this.showFragmentNotif();
    else if (this.mode === 'win') this.showWinScreen();
    else if (this.mode === 'atlas') this.showAtlas();
  }

  // ── PART 2 — Fragment popup (was showMapFragmentPopup in GameScene) ──────────

  showFragmentPopup() {
    this.gameScene.conversionPopupOpen = true;
    this.gameScene.player.body.moves = false;

    const PX = 640,
      PY = 360;
    const elements = [];

    const panel = this.add
      .rectangle(PX, PY, 700, 450, 0x050f05, 0.95)
      .setScrollFactor(0)
      .setDepth(60);
    elements.push(panel);

    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xffd700, 1);
    border.strokeRect(PX - 350, PY - 225, 700, 450);
    elements.push(border);

    const title = this.add
      .text(PX, PY - 190, 'Map Fragment Recovered!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '13px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61);
    elements.push(title);

    // Fragment image — always attempt; fallback rect if load failed
    let glowTarget;
    if (this.textures.exists('atlas_fragment_01_gold')) {
      glowTarget = this.add
        .image(PX, PY - 30, 'atlas_fragment_01_gold')
        .setScrollFactor(0)
        .setDepth(61)
        .setDisplaySize(400, 290);
    } else {
      glowTarget = this.add
        .rectangle(PX, PY - 30, 400, 290, 0x1a2a1a)
        .setScrollFactor(0)
        .setDepth(61);
      this.add
        .text(PX, PY - 30, '[ Map Fragment ]', {
          fontFamily: '"Press Start 2P"',
          fontSize: '10px',
          color: '#44aa44',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(62);
    }
    elements.push(glowTarget);

    // Golden glow tween
    this.tweens.add({
      targets: glowTarget,
      alpha: 0.6,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const subText = this.add
      .text(PX, PY + 145, 'The path forward is revealed...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61);
    elements.push(subText);

    const contBtn = this.add
      .text(PX, PY + 190, '[ Y \u2014 CONTINUE ]', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: '#332200',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61)
      .setInteractive({ useHandCursor: true });
    elements.push(contBtn);

    const keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    const keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const doClose = () => {
      keyY.destroy();
      keyEsc.destroy();
      if (glowTarget) this.tweens.killTweensOf(glowTarget);
      elements.forEach((e) => e.destroy());
      this.gameScene.conversionPopupOpen = false;
      this.gameScene.player.body.moves = true;
      this.gameScene.mapFragmentFound = true;
      this.gameScene.showFloatingText(
        this.gameScene.player.x,
        this.gameScene.player.y - 80,
        'EXIT UNLOCKED!',
        '#ffd700',
      );
      this.gameScene.notifQueue.push({
        show: (gs) => gs.scene.launch('MapScene', { mode: 'fragment_notif' }),
      });
      this.gameScene.setNotifActive(true);
      this.scene.stop();
    };

    keyY.once('down', doClose);
    keyEsc.once('down', doClose);

    contBtn.on('pointerdown', doClose);
    contBtn.on('pointerover', () => contBtn.setColor('#ffffff'));
    contBtn.on('pointerout', () => contBtn.setColor('#ffd700'));
  }

  // ── PART 3 — Fragment notif (was showMapFragmentNotif in GameScene) ──────────

  showFragmentNotif() {
    this.gameScene.notifPanelOpen = true;
    const PX = 640,
      PY = 360;

    const panel = this.add
      .rectangle(PX, PY, 480, 180, 0x000033, 0.92)
      .setScrollFactor(0)
      .setDepth(60);
    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xffd700, 1);
    border.strokeRect(PX - 240, PY - 90, 480, 180);

    const xBtn = this.add
      .text(PX + 228, PY - 80, '\u2715', {
        fontFamily: '"Press Start 2P"',
        fontSize: '13px',
        color: '#ffd700',
        stroke: '#ffd700',
        strokeThickness: 3,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(62)
      .setInteractive({ useHandCursor: true });

    const msg = this.add
      .text(PX, PY - 20, 'Map Fragment recovered!\nThe exit is now unlocked.', {
        fontFamily: '"Press Start 2P"',
        fontSize: '11px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61);

    const hint = this.add
      .text(PX, PY + 68, 'Press Y or ESC to close', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#aaaaaa',
        resolution: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61);

    const allEls = [panel, border, xBtn, msg, hint];
    this.gameScene.notifPanelElements = allEls;

    const keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    const closeThis = () => {
      allEls.forEach((e) => e.destroy());
      this.gameScene.notifPanelOpen = false;
      this.gameScene.notifPanelElements = [];
      keyEsc.destroy();
      keyY.destroy();
      this.gameScene.dismissCurrentNotif();
      this.scene.stop();
    };

    keyEsc.once('down', closeThis);
    keyY.once('down', closeThis);

    xBtn.on('pointerdown', closeThis);
    xBtn.on('pointerover', () => xBtn.setColor('#ffffff'));
    xBtn.on('pointerout', () => xBtn.setColor('#ffd700'));
  }

  // ── PART 3 — Win screen (was triggerWinSequence in GameScene) ───────────────

  showWinScreen() {
    // Clear notification state before win screen
    this.gameScene.notifQueue = [];
    this.gameScene.setNotifActive(false);
    if (this.gameScene.notifPanelOpen) {
      this.gameScene.notifPanelElements.forEach((e) => e.destroy());
      this.gameScene.notifPanelElements = [];
      this.gameScene.notifPanelOpen = false;
    }

    const restart = () => {
      this.scene.stop();
      this.scene.get('GameScene').scene.restart();
    };

    // White flash
    const flash = this.add
      .rectangle(640, 360, 1280, 720, 0xffffff)
      .setScrollFactor(0)
      .setDepth(45)
      .setAlpha(0);
    this.tweens.add({ targets: flash, alpha: 0.8, duration: 800 });

    this.time.delayedCall(1000, () => {
      flash.destroy();

      // ── Background image ──
      const winBg = this.add
        .image(640, 360, 'title_bg')
        .setDisplaySize(1280, 720)
        .setScrollFactor(0)
        .setDepth(48)
        .setAlpha(0);
      this.tweens.add({ targets: winBg, alpha: 1, duration: 400 });

      // ── Star scatter — top of screen ──
      const winStarGfx = this.add.graphics().setScrollFactor(0).setDepth(49);
      winStarGfx.fillStyle(0xffecd8, 1);
      for (let i = 0; i < 8; i++) {
        winStarGfx.fillCircle(
          Math.floor(Math.random() * 1260) + 10,
          Math.floor(Math.random() * 100) + 5,
          2,
        );
      }
      winStarGfx.setAlpha(0.5);
      this.tweens.add({
        targets: winStarGfx,
        alpha: 0.1,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });

      this.time.delayedCall(400, () => {
        // ── "FRAGMENT FOUND!" ──
        const winText = this.add
          .text(640, 160, 'FRAGMENT FOUND!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            color: '#f5d47a',
            stroke: '#8040c0',
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(50)
          .setAlpha(0);

        this.tweens.add({
          targets: winText,
          alpha: 1,
          duration: 600,
          onComplete: () => {
            this.tweens.add({
              targets: winText,
              alpha: 0.7,
              duration: 1200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.InOut',
            });
          },
        });

        // ── Character icons ──
        const charHead = this.add
          .image(580, 280, 'char_head')
          .setScale(2.0)
          .setScrollFactor(0)
          .setDepth(50)
          .setAlpha(0);
        const compHead = this.add
          .image(700, 280, 'hud_player_purple')
          .setScale(2.0)
          .setScrollFactor(0)
          .setDepth(50)
          .setAlpha(0);

        this.tweens.add({
          targets: [charHead, compHead],
          alpha: 1,
          duration: 600,
        });
        this.time.delayedCall(600, () => {
          this.tweens.add({
            targets: charHead,
            y: 268,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut',
          });
          this.tweens.add({
            targets: compHead,
            y: 268,
            duration: 800,
            delay: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut',
          });
        });

        // ── Narrative text — two lines ──
        const line1 = this.add
          .text(640, 370, 'Sable glows. Maevea keeps moving', {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#ffecd8',
            stroke: '#000000',
            strokeThickness: 2,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(50)
          .setAlpha(0);

        const line2 = this.add
          .text(640, 395, 'The Atlas stirs awake.', {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#ffecd8',
            stroke: '#000000',
            strokeThickness: 2,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(50)
          .setAlpha(0);

        this.tweens.add({
          targets: [line1, line2],
          alpha: 1,
          duration: 800,
          delay: 600,
        });

        // ── Play Again button ──
        const btnBg = this.add.graphics().setScrollFactor(0).setDepth(50);
        btnBg.fillStyle(0x8040c0, 0.8);
        btnBg.fillRoundedRect(530, 462, 220, 36, 8);
        btnBg.setAlpha(0);

        const playAgainBtn = this.add
          .text(640, 480, '[ PLAY AGAIN ]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#fac775',
            stroke: '#000000',
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(51)
          .setAlpha(0)
          .setInteractive({ useHandCursor: true });

        this.tweens.add({
          targets: [btnBg, playAgainBtn],
          alpha: 1,
          duration: 600,
        });

        playAgainBtn.on('pointerdown', restart);
        playAgainBtn.on('pointerover', () => playAgainBtn.setTint(0xffffff));
        playAgainBtn.on('pointerout', () => playAgainBtn.clearTint());

        this.input.keyboard.once('keydown-SPACE', restart);

        // PART 4B — VIEW MAP button
        const mapBtnBg = this.add.graphics().setScrollFactor(0).setDepth(50);
        mapBtnBg.fillStyle(0x8040c0, 0.8);
        mapBtnBg.fillRoundedRect(530, 508, 220, 36, 8);
        mapBtnBg.setAlpha(0);

        const viewMapBtn = this.add
          .text(640, 526, '[ VIEW MAP ]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#fac775',
            stroke: '#000000',
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(51)
          .setAlpha(0)
          .setInteractive({ useHandCursor: true });

        this.tweens.add({
          targets: [mapBtnBg, viewMapBtn],
          alpha: 1,
          duration: 600,
        });

        const openAtlas = () => this.showAtlas();
        viewMapBtn.on('pointerdown', openAtlas);
        viewMapBtn.on('pointerover', () => viewMapBtn.setTint(0xffffff));
        viewMapBtn.on('pointerout', () => viewMapBtn.clearTint());

        // M key also opens atlas
        this.input.keyboard.on('keydown-M', openAtlas);

        // ── Gear / settings button (top-right) ──
        const sm = window._enigmaSoundManager;
        if (sm) {
          sm.scene = this;
          createSettingsButton(this, sm, 1250, 30);
        }
      });
    });
  }

  // ── PART 5 — Celestial Atlas overlay ────────────────────────────────────────

  showAtlas() {
    if (this._atlasOpen) return;
    this._atlasOpen = true;

    const W = 1280,
      H = 720;
    const cx = W / 2,
      cy = H / 2;

    const overlay = this.add
      .rectangle(cx, cy, W, H, 0x000000, 0.88)
      .setScrollFactor(0)
      .setDepth(200);

    const mapImg = this.add
      .image(cx, cy, 'celestial_atlas_map')
      .setDisplaySize(W - 80, H - 60)
      .setScrollFactor(0)
      .setDepth(201);

    const closeBtn = this.add
      .text(W - 60, 36, '\u2715', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#f5d47a',
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setInteractive({ useHandCursor: true });

    const escLabel = this.add
      .text(cx, H - 24, '[ ESC \u2014 CLOSE ]', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const doClose = () => {
      if (!this._atlasOpen) return;
      this._atlasOpen = false;
      overlay.destroy();
      mapImg.destroy();
      closeBtn.destroy();
      escLabel.destroy();
      this.input.keyboard.off('keydown-ESC', doClose);
    };

    closeBtn.on('pointerdown', doClose);
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#f5d47a'));
    this.input.keyboard.once('keydown-ESC', doClose);
  }
}
