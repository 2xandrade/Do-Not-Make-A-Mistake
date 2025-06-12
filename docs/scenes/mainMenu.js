class MainMenu extends Phaser.Scene {

tileSize = 256;
tileMap;
tileLayer;
tileset;
tileCache = new Set();
tileWeightPool = [
  0, 0, 0, 0, 0, 0, 0, 0, 0,
  11, 11, 11, 11, 11, 11, 11,
  1, 2, 3, 4, 5, 6, 7,
  8, 9, 10
];

  static CHARACTERS = [
    {
      key: "paladinoSprites",
      name: "Paladino",
      stats: "ATK: ★★★★ | DEF: ★★★★",
      color: 0xff0000,
      frameMenu: 0,
      description: "Um paladino escolhido a dedo pelo rei forte e imparável.",
      story: "Um paladino com a força de cem homens, tão quieto quanto uma flor, mas cabeça dura igual um carneiro, veio de uma vila pequena e a boatos que ele sempre esta a procura de algo, não deixe os olhos frios te enganar ele pode ser tão macio quanto uma ovelha."
    },
    {
      key: "bardoSprites",
      name: "Bardo",
      stats: "ATK: ★★★★ | DEF: ★★★★",
      color: 0x00ff00,
      frameMenu: 0,
      description: "Bardo o qual trazia determinação com cada estrofe de suas músicas.",
      story: "Um bardo que com suas melodias conseguia tanto aumentar o vigor de seus aliados como ferir seus inimigos, nascido em uma família de músicos sempre foi conhecido por seus encantos."
    },
    {
      key: "arqueiraSprites",
      name: "Arqueira",
      stats: "ATK: ★★★★ | DEF: ★★★★",
      color: 0x0000ff,
      frameMenu: 0,
      description: "Uma arqueira conhecida em todos os 7 reinos como olhar de águia pelas suas flechas que nunca erram um alvo.",
      story: "Uma arqueira conhecida nos sete reinos por nunca errar um alvo, estava sempre acompanhada de seu marido, mas a relatos de que eles se separaram, nascida em uma aldeia acima das arvores sua flecha pode atingir ate mesmo uma mosca em uma noite sem lua."
    },
    {
      key: "ladinaSprites",
      name: "Ladina",
      stats: "ATK: ★★★★ | DEF: ★★★★",
      color: 0xffff00,
      frameMenu: 0,
      description: "Uma ladina tão silenciosa como uma sombra mas mortal como uma serpente.",
      story: "Uma ladina que apesar de parecer inofensiva em um piscar de olhos pode fazer sua cabeça rolar, tão silenciosa quanto a noite mas mortal, vinda da das favelas esta gata de rua nunca teve a vida fáci."
    }
  ];

  static TEXT_STYLES = {
    title: { fontSize: "64px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 6 },
    selectionTitle: { fontSize: "36px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterName: { fontSize: "32px", fill: "#ffff00", fontFamily: "Arial", fontWeight: "bold" },
    characterNameSmall: { fontSize: "22px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterStats: { fontSize: "14px", fill: "#ffff00", fontFamily: "Arial" },
    button: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    label: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial" },
    storyTitle: { fontSize: "48px", fill: "#ffff00", fontFamily: "Arial", fontWeight: "bold", stroke: "#000000", strokeThickness: 4, align: "center" },
    descriptionText: { fontSize: "20px", fill: "#ffffff", fontFamily: "Arial", align: "center" },
    storyText: { fontSize: "18px", fill: "#cccccc", fontFamily: "Arial", align: "justify" },
  };

  constructor() {
    super({ key: "mainMenu" });
    this.selectedCharacter = 0;
    this.selectionOpen = false;
    this.characterDetailsModal = null;
  }

  preload() {
    this.load.image("personagensButton", "assets/sprites/icons/personagensNewButton.png");
    this.load.image("startButton", "assets/sprites/icons/startNewButton.png");
    this.load.image("tileset", "assets/sprites/mapa/mapaSprites.png");
    this.load.image("historyIcon", "assets/sprites/icons/historiaNewButton.png");
    this.load.image("backIcon", "assets/sprites/icons/voltarNewButton.png");

    const config = { frameWidth: 200, frameHeight: 200 };
    MainMenu.CHARACTERS.forEach(c => {
      this.load.spritesheet(c.key, `assets/sprites/personagens/${c.key}.png`, config);
    });

    this.load.audio('doNotSong', 'assets/sprites/musica/doNotSong.ogg');
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
    this.selectButton = this.add.image(centerX - 200, buttonY, 'personagensButton')
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(500, 500)
      .on('pointerdown', () => this.toggleCharacterSelection());

    this.startButton = this.add.image(centerX + 200, buttonY, 'startButton')
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(500, 500)
      .on('pointerdown', () => this.startGame());

    this.createCharacterSelection(centerX, centerY);

    this.music = this.sound.add('doNotSong', {
            volume: 0.5,   
            loop: true   
        });
        
    this.music.play();
  }

  createTileBackground() {
    this.tileMap = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: 1000,  // Large enough to fill the menu
      height: 1000
    });

    this.tileset = this.tileMap.addTilesetImage('tileset', null, this.tileSize, this.tileSize);
    this.tileLayer = this.tileMap.createBlankLayer('Ground', this.tileset);

    this.populateTilemap();
  }

  populateTilemap(radius = 10) {
    // Fill the screen area with random tiles like in PlayGame
    const centerX = Math.floor(this.cameras.main.centerX / this.tileSize);
    const centerY = Math.floor(this.cameras.main.centerY / this.tileSize);

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const tileX = centerX + dx;
        const tileY = centerY + dy;
        const key = `${tileX},${tileY}`;

        if (!this.tileCache.has(key)) {
          const tileIndex = Phaser.Utils.Array.GetRandom(this.tileWeightPool);
          this.tileLayer.putTileAt(tileIndex, tileX, tileY);
          this.tileCache.add(key);
        }
      }
    }

    // Send the tile layer to the back
    this.tileLayer.setDepth(-10);
  }

  toggleCharacterSelection() {
    this.selectionOpen = !this.selectionOpen;

    if (this.selectionOpen) {
      this.selectionContainer.removeAll(true);
      this.createCharacterSelection(this.cameras.main.centerX, this.cameras.main.centerY);
    }

    this.selectionContainer.setVisible(this.selectionOpen);
    this.selectedCharDisplay.setVisible(!this.selectionOpen);
    this.selectButton.setVisible(!this.selectionOpen);
    this.startButton.setVisible(!this.selectionOpen);
  }

  updateSelectedCharacterDisplay() {
    this.selectedCharDisplay.removeAll(true);
    const char = MainMenu.CHARACTERS[this.selectedCharacter];

    const sprite = this.safeLoadSprite(0, 0, char.key, char.frameMenu, 150, char.color);
    sprite.setOrigin(0.5);

    const name = this.add.text(0, 100, char.name, MainMenu.TEXT_STYLES.characterName).setOrigin(0.5);

    this.selectedCharDisplay.add([sprite, name]);
    this.selectedCharDisplay.setX(this.cameras.main.centerX);
    this.selectedCharDisplay.setY(this.cameras.main.centerY - 40);
  }

  createCharacterSelection(centerX, centerY) {
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9).setOrigin(0).setInteractive();
    const title = this.add.text(centerX, centerY - 200, "Escolha seu personagem", MainMenu.TEXT_STYLES.selectionTitle).setOrigin(0.5);
    const back = this.createButton(centerX, centerY + 250, "VOLTAR", () => this.toggleCharacterSelection(), 'backIcon');

    this.selectionContainer.add([bg, title, back]);

    const spacing = 200;
    const startX = centerX - spacing * 1.5;
    this.characterSprites = [];

    MainMenu.CHARACTERS.forEach((char, i) => {
      const x = startX + spacing * i;
      const container = this.add.container(0, 0);
      container.setPosition(x, centerY);
      this.selectionContainer.add(container);
      const frame = this.safeLoadImage(0, 0, 160);
      const sprite = this.safeLoadSprite(0, 0, char.key, char.frameMenu, 120, char.color);
      const name = this.add.text(0, 85, char.name, MainMenu.TEXT_STYLES.characterNameSmall).setOrigin(0.5);
      const stats = this.add.text(0, 115, char.stats, MainMenu.TEXT_STYLES.characterStats).setOrigin(0.5);

      const historyButton = this.createButton(0, 170, "HISTÓRIA", () => {
        this.showCharacterDetailsModal(char);
      }, 'historyIcon');

      // Botão individual para cada personagem
      // Ajusta o tamanho da imagem do ícone e o estilo do texto dentro do botão
      if (historyButton.list[0].type === "Image") {
          historyButton.list[0].setDisplaySize(150, 40);
      } else {
          historyButton.list[0].width = 150;
          historyButton.list[0].height = 40;
      }
      historyButton.list[1].setStyle({fontSize: "25px"});
      historyButton.setSize(150, 40);


      container.add([frame, sprite, name, stats, historyButton]);
      container.setSize(160, 160).setInteractive({ useHandCursor: true }).on("pointerdown", (pointer) => {
        const historyButtonGlobalY = container.y + historyButton.y - historyButton.height / 2;
        const historyButtonGlobalHeight = historyButton.height;

        if (pointer.y >= historyButtonGlobalY && pointer.y <= historyButtonGlobalY + historyButtonGlobalHeight) {
            return;
        } else {
            this.selectCharacter(i);
            this.toggleCharacterSelection();
        }
      });

      this.characterSprites.push({ container });
    });
    this.selectionContainer.setDepth(100);
  }

  // Função createButton modificada para aceitar imageKey
  createButton(x, y, label, callback, imageKey = null) {
    const container = this.add.container(x, y);
    let bg;

    if (imageKey) {
      bg = this.safeLoadImage(0, 0, imageKey, 150, 0x1a8f3a);
    } else {
      bg = this.safeLoadImage(0, 0, "button", 150, 0x1a8f3a);
    }

    const text = this.add.text(0, 0, label, MainMenu.TEXT_STYLES.button).setOrigin(0.5);

    if (bg.type === "Image") {
      bg.setDisplaySize(150, 60);
    } else {
      bg.width = 150;
      bg.height = 60;
    }

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
    this.music.stop(); 
    this.scene.start("PreloadAssets", { characterIndex: this.selectedCharacter });
  }

  showCharacterDetailsModal(character) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const modalWidth = this.cameras.main.width * 0.8;
    const modalHeight = this.cameras.main.height * 0.8;

    this.selectionContainer.setVisible(false);

    if (this.characterDetailsModal) {
      this.characterDetailsModal.removeAll(true);
    } else {
      this.characterDetailsModal = this.add.container(centerX, centerY);
      this.characterDetailsModal.setDepth(200);
    }

    const modalBg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9)
      .setOrigin(0.5)
      .setInteractive();

    const title = this.add.text(0, -modalHeight / 2 + 50, character.name, MainMenu.TEXT_STYLES.storyTitle)
      .setOrigin(0.5);

    // descrição
    const description = this.add.text(0, -modalHeight / 2 + 120, character.description, {
      ...MainMenu.TEXT_STYLES.descriptionText,
      wordWrap: { width: modalWidth * 0.9, useAdvancedWrap: true }
    }).setOrigin(0.5);

    // historia
    const story = this.add.text(0, -modalHeight / 2 + 200, character.story, {
      ...MainMenu.TEXT_STYLES.storyText,
      wordWrap: { width: modalWidth * 0.9, useAdvancedWrap: true }
    }).setOrigin(0.5, 0);

    const closeButton = this.createButton(0, modalHeight / 2 - 50, "VOLTAR", () => {
      this.hideCharacterDetailsModal();
    }, 'backIcon');

    this.characterDetailsModal.add([modalBg, title, description, story, closeButton]);
    this.characterDetailsModal.setVisible(true);
  }

  hideCharacterDetailsModal() {
    if (this.characterDetailsModal) {
      this.characterDetailsModal.setVisible(false);
      this.characterDetailsModal.removeAll(true);
      this.characterDetailsModal.destroy();
      this.characterDetailsModal = null;
    }
    this.selectionContainer.setVisible(true);
  }
}
