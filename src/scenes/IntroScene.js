// Phaser is global via CDN — do not import it

// FIX 1 — Load Cinzel font from Google Fonts
const cinzelLink = document.createElement('link');
cinzelLink.rel = 'stylesheet';
cinzelLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap';
document.head.appendChild(cinzelLink);

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('intro_card_1', 'assets/introcards/intro-card-1.png');
    this.load.image('intro_card_2', 'assets/introcards/intro-card-2.png');
    this.load.image('intro_card_3', 'assets/introcards/intro-card-3.png');
    this.load.image('intro_card_4', 'assets/introcards/intro-card-4.png');
    this.load.image('dialoguebox1', 'assets/introcards/dialoguebox1.png');
    this.load.image('dialoguebox2', 'assets/introcards/dialoguebox2.png');
    this.load.image('dialoguebox3', 'assets/introcards/dialoguebox3.png');
    this.load.image('dialoguebox4', 'assets/introcards/dialoguebox4.png');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x050917);

    // FIX 3 — Generate particle textures once here, before any card runs
    const gfx1 = this.make.graphics({ add: false });
    gfx1.fillStyle(0xD6BF99, 1);
    gfx1.fillCircle(4, 4, 4);
    gfx1.generateTexture('particle_gold', 8, 8);
    gfx1.destroy();

    const gfx2 = this.make.graphics({ add: false });
    gfx2.fillStyle(0xFDDEDC, 1);
    gfx2.fillCircle(4, 4, 4);
    gfx2.generateTexture('particle_warm', 8, 8);
    gfx2.destroy();

    const gfx3 = this.make.graphics({ add: false });
    gfx3.fillStyle(0xf5d47a, 1);
    gfx3.fillRect(0, 0, 6, 3);
    gfx3.generateTexture('particle_fragment', 6, 3);
    gfx3.destroy();

    this.cards = [
      {
        bg: 'intro_card_1',
        dialogueBox: 'dialoguebox1',
        dialoguePosition: { x: 900, y: 638 },   // FIX 2 — moved right
        text: [
          'The world was once mapped in full.',
          'Every garden. Every swamp.',
          'Every deep place.'
        ],
        effect: 'particles_gold'
      },
      {
        bg: 'intro_card_2',
        dialogueBox: 'dialoguebox2',
        dialoguePosition: { x: 640, y: 618 },
        text: [
          'Then the Atlas shattered.',
          'The worlds began to forget.'
        ],
        effect: 'shatter'
      },
      {
        bg: 'intro_card_3',
        dialogueBox: 'dialoguebox3',
        dialoguePosition: { x: 640, y: 618 },
        text: [
          'Maevea woke up in the Golden Garden.',
          'Beside her: Sable.',
          'Already facing the right direction.'
        ],
        effect: 'particles_warm'
      },
      {
        bg: 'intro_card_4',
        dialogueBox: 'dialoguebox4',
        dialoguePosition: { x: 640, y: 618 },
        text: [
          "She doesn't know where she's going.",
          "She knows she can't stop."
        ],
        effect: 'shatter_soft'
      }
    ];

    this.cardIndex = 0;
    this.transitioning = false;
    this.cardElements = [];
    this.particleEmitter = null;

    // ESC skips all cards — bound once, persists across cards
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('GameScene');
    });

    this.showCard(0);
  }

  showCard(index) {
    // Stop any active particle emitter from previous card
    if (this.particleEmitter) {
      this.particleEmitter.stop();
      this.particleEmitter = null;
    }

    // Destroy all elements from previous card
    this.cardElements.forEach(e => {
      if (e && e.destroy) e.destroy();
    });
    this.cardElements = [];

    const card = this.cards[index];

    // STEP 1 — Full-screen background image
    const bg = this.add.image(640, 360, card.bg)
      .setDisplaySize(1280, 720)
      .setDepth(0)
      .setAlpha(0);
    this.tweens.add({ targets: bg, alpha: 1, duration: 500 });
    this.cardElements.push(bg);

    // STEP 2 — Screen effect
    this._applyEffect(card.effect);

    // STEP 3 — Dialogue box image
    const box = this.add
      .image(card.dialoguePosition.x, card.dialoguePosition.y, card.dialogueBox)
      .setDepth(10)
      .setAlpha(0);
    this.tweens.add({ targets: box, alpha: 1, duration: 400, delay: 300 });
    this.cardElements.push(box);

    // STEP 4 — Text lines centered inside the dialogue box
    const lines = card.text;
    const lineCount = lines.length;
    let offsets;
    if (lineCount === 1)      offsets = [0];
    else if (lineCount === 2) offsets = [-11, 11];
    else                      offsets = [-22, 0, 22];

    lines.forEach((line, i) => {
      const txt = this.add.text(
        card.dialoguePosition.x,
        card.dialoguePosition.y + offsets[i],
        line,
        {
          fontFamily: '"Cinzel", "Georgia", serif',  // FIX 1
          fontSize: '16px',
          color: '#3a2a10',
          align: 'center',
        }
      )
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: txt,
        alpha: 1,
        duration: 350,
        delay: 400 + i * 180,
      });

      this.cardElements.push(txt);
    });

    // STEP 5 — Input to advance (re-added fresh each card via .once())
    this.input.once('pointerdown', () => this.nextCard());
    this.input.keyboard.once('keydown-SPACE', () => this.nextCard());
  }

  nextCard() {
    if (this.transitioning) return;
    this.transitioning = true;

    // Stop particle emitter before fade
    if (this.particleEmitter) {
      this.particleEmitter.stop();
      this.particleEmitter = null;
    }

    const elementsToFade = [...this.cardElements];

    this.tweens.add({
      targets: elementsToFade,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        elementsToFade.forEach(e => {
          if (e && e.destroy) e.destroy();
        });
        this.cardElements = [];

        if (this.cardIndex < 3) {
          this.cardIndex++;
          this.transitioning = false;
          this.showCard(this.cardIndex);
        } else {
          this.scene.start('GameScene');
        }
      }
    });
  }

  _applyEffect(effect) {
    if (effect === 'particles_gold') {
      // FIX 3 — updated emitter: fills screen area, higher quantity
      this.particleEmitter = this.add.particles(640, 400, 'particle_gold', {
        x: { min: 0, max: 1280 },
        y: { min: 0, max: 720 },
        lifespan: 3500,
        speed: { min: 15, max: 45 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.9, end: 0 },
        quantity: 2,
        frequency: 80,
        blendMode: 'ADD',
        tint: 0xD6BF99,
      }).setDepth(5);
      this.cardElements.push(this.particleEmitter);

    } else if (effect === 'particles_warm') {
      // FIX 3 — updated emitter: fills screen area, higher quantity
      this.particleEmitter = this.add.particles(640, 400, 'particle_warm', {
        x: { min: 0, max: 1280 },
        y: { min: 0, max: 720 },
        lifespan: 3500,
        speed: { min: 15, max: 45 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.9, end: 0 },
        quantity: 2,
        frequency: 80,
        blendMode: 'ADD',
        tint: 0xFDFBCA,
      }).setDepth(5);
      this.cardElements.push(this.particleEmitter);

    } else if (effect === 'shatter') {
      this.cameras.main.shake(600, 0.008);

      const flash = this.add
        .rectangle(640, 360, 1280, 720, 0xffd700)
        .setDepth(8)
        .setAlpha(0)
        .setScrollFactor(0);
      this.tweens.add({
        targets: flash,
        alpha: 0.25,
        duration: 120,
        yoyo: true,
        repeat: 2,
      });
      this.cardElements.push(flash);
      // FIX 4 — vignette removed

    } else if (effect === 'shatter_soft') {
      const flash = this.add
        .rectangle(640, 360, 1280, 720, 0xffd700)
        .setDepth(8)
        .setAlpha(0)
        .setScrollFactor(0);
      this.tweens.add({
        targets: flash,
        alpha: 0.12,
        duration: 120,
        yoyo: true,
        repeat: 1,
      });
      this.cardElements.push(flash);
      // FIX 4 — vignette removed

      // FIX 4 — increased quantity, frequency, lifespan
      this.particleEmitter = this.add.particles(0, 0, 'particle_fragment', {
        x: { min: 200, max: 1000 },
        y: { min: 100, max: 500 },
        speed: { min: 15, max: 40 },
        angle: { min: -30, max: 210 },
        lifespan: 3200,
        quantity: 3,
        frequency: 60,
        scale: { start: 1, end: 0 },
        alpha: { start: 0.6, end: 0 },
        gravityY: 30,
      }).setDepth(5);
      this.cardElements.push(this.particleEmitter);
    }
  }
}
