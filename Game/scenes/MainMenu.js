// Versão atualizada do MainMenu.js com fundo opaco, botões centralizados e bug de sobreposição resolvido
class MainMenu extends Phaser.Scene {
  static CHARACTERS = [
    { key: "paladinoSprites", name: "Paladino", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0xff0000, frameMenu: 0 },
    { key: "bardoSprites", name: "Bardo", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0x00ff00, frameMenu: 0 },
    { key: "arqueiraSprites", name: "Arqueira", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0x0000ff, frameMenu: 0 },
    { key: "ladinaSprites", name: "Ladina", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0xffff00, frameMenu: 0 }
  ];

  static TEXT_STYLES = {
    title: { fontSize: "64px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 6 },
    selectionTitle: { fontSize: "36px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterName: { fontSize: "32px", fill: "#ffff00", fontFamily: "Arial", fontWeight: "bold" },
    characterNameSmall: { fontSize: "22px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterStats: { fontSize: "14px", fill: "#ffff00", fontFamily: "Arial" },
    button: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    label: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial" }
  };

  constructor() {
    super({ key: "mainMenu" });
    this.selectedCharacter = 0;
    this.selectionOpen = false;
  }

  preload() {
    this.load.image("personagensButton", "assets/sprites/personagensButton.png");
    this.load.image("startButton", "assets/sprites/startButton.png");
    this.load.image("tileset", "assets/sprites/mapa/mapaSprites.png");

    const config = { frameWidth: 200, frameHeight: 200 };
    MainMenu.CHARACTERS.forEach(c => {
      this.load.spritesheet(c.key, `assets/sprites/personagens/${c.key}.png`, config);
    });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.createTileBackground();
    this.add.text(centerX, 100, "Do Not Make a Mistake", MainMenu.TEXT_STYLES.title).setOrigin(0.5);

    this.selectionContainer = this.add.container(0, 0).setVisible(false);
    this.selectedCharDisplay = this.add.container(centerX, centerY - 40).setDepth(9999);
    this.updateSelectedCharacterDisplay();

    const buttonY = centerY + 180;
    this.selectButton = this.add.image(centerX - 100, buttonY, 'personagensButton')
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(150, 60)
      .on('pointerdown', () => this.toggleCharacterSelection());

    this.startButton = this.add.image(centerX + 100, buttonY, 'startButton')
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(150, 60)
      .on('pointerdown', () => this.startGame());

    this.createCharacterSelection(centerX, centerY);
  }

  createTileBackground() {
    const tileSize = 256;
    const cols = Math.ceil(this.cameras.main.width / tileSize) + 1;
    const rows = Math.ceil(this.cameras.main.height / tileSize) + 1;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const posX = x * tileSize;
        const posY = y * tileSize;
        this.add.image(posX, posY, 'tileset', 0)
          .setOrigin(0)
          .setDisplaySize(tileSize, tileSize)
          .setAlpha(0.6);
      }
    }
  }

  toggleCharacterSelection() {
    this.selectionOpen = !this.selectionOpen;

    if (this.selectionOpen) {
      this.selectionContainer.removeAll(true); // remove elementos anteriores para evitar bug
      this.createCharacterSelection(this.cameras.main.centerX, this.cameras.main.centerY);
    }

    this.selectionContainer.setVisible(this.selectionOpen);
    this.selectedCharDisplay.setVisible(!this.selectionOpen);
    this.selectButton.setVisible(!this.selectionOpen);
    this.startButton.setVisible(!this.selectionOpen);
  }

  updateSelectedCharacterDisplay() {
    this.selectedCharDisplay.removeAll();
    const char = MainMenu.CHARACTERS[this.selectedCharacter];

    const sprite = this.safeLoadSprite(0, 0, char.key, char.frameMenu, 150, char.color);
    sprite.setOrigin(0.5);

    const name = this.add.text(0, 100, char.name, MainMenu.TEXT_STYLES.characterName).setOrigin(0.5);

    sprite.setPosition(0, 0); // centraliza corretamente
    name.setPosition(0, 100);
    this.selectedCharDisplay.add([sprite, name]);
    this.selectedCharDisplay.setX(this.cameras.main.centerX);
    this.selectedCharDisplay.setY(this.cameras.main.centerY - 40);
  }

  createCharacterSelection(centerX, centerY) {
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 1).setOrigin(0);
    const title = this.add.text(centerX, centerY - 200, "Escolha seu personagem", MainMenu.TEXT_STYLES.selectionTitle).setOrigin(0.5);
    const back = this.createButton(centerX, centerY + 250, "VOLTAR", () => this.toggleCharacterSelection());

    this.selectionContainer.add([bg, title, back]);

    const spacing = 200;
    const startX = centerX - spacing * 1.5;
    this.characterSprites = [];

    MainMenu.CHARACTERS.forEach((char, i) => {
      const x = startX + spacing * i;
      const container = this.add.container(x, centerY);
      const frame = this.safeLoadImage(0, 0, "frame", 160);
      const sprite = this.safeLoadSprite(0, 0, char.key, char.frameMenu, 120, char.color);
      const name = this.add.text(0, 85, char.name, MainMenu.TEXT_STYLES.characterNameSmall).setOrigin(0.5);
      const stats = this.add.text(0, 115, char.stats, MainMenu.TEXT_STYLES.characterStats).setOrigin(0.5);

      container.add([frame, sprite, name, stats]);
      container.setSize(160, 160).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.selectCharacter(i);
        this.toggleCharacterSelection();
      });

      this.selectionContainer.add(container);
      this.characterSprites.push({ container });
    });
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);
    const bg = this.safeLoadImage(0, 0, "button", 150, 0x1a8f3a);
    const text = this.add.text(0, 0, label, MainMenu.TEXT_STYLES.button).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(150, 60).setInteractive({ useHandCursor: true })
      .on("pointerdown", callback)
      .on("pointerover", () => {
        text.setStyle({ ...MainMenu.TEXT_STYLES.button, fill: "#ffff00" });
        bg.setTint(0xcccccc);
      })
      .on("pointerout", () => {
        text.setStyle(MainMenu.TEXT_STYLES.button);
        bg.clearTint();
      });

    return container;
  }

  safeLoadImage(x, y, key, size, fallbackColor = 0x333333) {
    try {
      return this.add.image(x, y, key).setDisplaySize(size, size);
    } catch {
      return this.add.rectangle(x, y, size, size, fallbackColor);
    }
  }

  safeLoadSprite(x, y, key, frame, size, fallbackColor = 0x333333) {
    try {
      return this.add.sprite(x, y, key, frame).setDisplaySize(size, size);
    } catch {
      return this.add.circle(x, y, size / 2, fallbackColor);
    }
  }

  selectCharacter(index) {
    if (this.selectedCharacter === index) return;

    this.selectedCharacter = index;

    const ref = this.characterSprites[index];
    if (ref) {
      this.tweens.add({
        targets: ref.container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true
      });
    }

    this.updateSelectedCharacterDisplay();
  }

  startGame() {
    this.scene.start("PreloadAssets", { characterIndex: this.selectedCharacter });
  }
}
