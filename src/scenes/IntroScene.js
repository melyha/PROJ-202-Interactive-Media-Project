// Phaser is global via CDN — do not import it

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    this.cardIndex = 0;

    // Narrative cards — images will replace placeholders when assets are ready
    this.cards = [
      {
        image: null,
        text: [
          'The world was once mapped in full.',
          'Every garden. Every swamp.',
          'Every deep place.'
        ]
      },
      {
        image: null,
        text: [
          'Then the Atlas shattered.',
          'The worlds began to forget.'
        ]
      },
      {
        image: null,
        text: [
          'Maevea woke up in the Golden Garden.',
          'Beside her: Sable.',
          'Already facing the right direction.'
        ]
      },
      {
        image: null,
        text: [
          "She doesn't know where she's going.",
          "She knows she can't stop."
        ]
      }
    ];

    this.cameras.main.setBackgroundColor('#12001c');
    this.cardElements = [];
    this.showCard(0);

    // Click or SPACE advances cards
    this.input.keyboard.on('keydown-SPACE', () => this.nextCard());
    this.input.on('pointerdown', () => this.nextCard());
  }

  showCard(index) {
    // Destroy previous card elements
    this.cardElements.forEach(e => e.destroy());
    this.cardElements = [];

    const card = this.cards[index];

    // Image or placeholder rect
    if (card.image && this.textures.exists(card.image)) {
      const img = this.add.image(640, 260, card.image)
        .setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 600 });
      this.cardElements.push(img);
    } else {
      const rect = this.add.rectangle(640, 260, 700, 320, 0x1a0a2e)
        .setAlpha(0);
      this.tweens.add({ targets: rect, alpha: 1, duration: 400 });
      this.cardElements.push(rect);
    }

    // Narrative text lines
    card.text.forEach((line, i) => {
      const txt = this.add.text(640, 430 + i * 28, line, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffecd8',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: txt, alpha: 1,
        duration: 500, delay: 200 + i * 150
      });
      this.cardElements.push(txt);
    });

    // "SPACE to continue" prompt ([ BEGIN ] on last card)
    const isLast = index === this.cards.length - 1;
    const promptTxt = isLast ? '[ BEGIN ]' : '[ SPACE to continue ]';
    const prompt = this.add.text(640, 660, promptTxt, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#fac775'
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: prompt, alpha: 1,
      duration: 400, delay: 800,
      onComplete: () => {
        this.tweens.add({
          targets: prompt, alpha: 0.3,
          duration: 700, yoyo: true, repeat: -1
        });
      }
    });
    this.cardElements.push(prompt);

    // Card counter dots
    this.cards.forEach((_, i) => {
      const dot = this.add.circle(
        640 - (this.cards.length - 1) * 10 + i * 20,
        640, 4,
        i === index ? 0xf5d47a : 0x4b1528
      );
      this.cardElements.push(dot);
    });
  }

  nextCard() {
    if (this.cardIndex < this.cards.length - 1) {
      this.cardIndex++;
      this.cameras.main.fade(200, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.cameras.main.resetFX();
          this.showCard(this.cardIndex);
        }
      });
    } else {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) this.scene.start('GameScene');
      });
    }
  }
}
