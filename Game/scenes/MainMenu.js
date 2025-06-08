// MAIN MENU SCENE
class MainMenu extends Phaser.Scene {

  static CHARACTERS = [
    { key: "paladinoSprites", name: "Paladino", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0xff0000, frameMenu: 0 },
    { key: "bardoSprites", name: "Bardo", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0x00ff00, frameMenu: 0 },
    { key: "arqueiraSprites", name: "Arqueira", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0x0000ff, frameMenu: 0 },
    { key: "ladinaSprites", name: "Ladina", stats: "ATK: ★★★★ | DEF: ★★★★", color: 0xffff00, frameMenu: 0 }
  ]

  // texto padronizados
  static TEXT_STYLES = {
    title: { fontSize: "64px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 6 },
    subtitle: { fontSize: "32px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 4 },
    selectionTitle: { fontSize: "36px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterName: { fontSize: "32px", fill: "#ffff00", fontFamily: "Arial", fontWeight: "bold" },
    characterNameSmall: { fontSize: "22px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    characterStats: { fontSize: "14px", fill: "#ffff00", fontFamily: "Arial" },
    button: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial", fontWeight: "bold" },
    label: { fontSize: "24px", fill: "#ffffff", fontFamily: "Arial" }
  }

  constructor() {
    super({
      key: "MainMenu",
    })
    this.selectedCharacter = 0 // 0-3 for the 4 characters
    this.selectionOpen = false // Controls whether the selection is open
  }

  preload() {
    // Load menu-specific assets
    this.load.image("menu-bg", "assets/sprites/grassy_field.png")

    // Load character SPRITESHEETS for display in the MainMenu
    // SPRITESHEETS completas, não imagens estáticas separadas
    const commonSpriteSheetConfig = { frameWidth: 200, frameHeight: 200 };
    MainMenu.CHARACTERS.forEach(char => {
      this.load.spritesheet(char.key, `assets/sprites/personagens/${char.key}.png`, commonSpriteSheetConfig);
    })

    // Load UI resources
    this.load.image("button", "assets/sprites/botaoWood.png")
    this.load.image("frame", "assets/sprites/molduraPrata.png")
  }

  create() {
    // Settings
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    // Add background
    this.createBackground(centerX, centerY)

    // Game title
    this.add
      .text(centerX, 100, "Do Not Make a Mistake", MainMenu.TEXT_STYLES.title)
      .setOrigin(0.5)

    // Subtitle
    this.subtitleText = this.add
      .text(centerX, 180, "Menu", MainMenu.TEXT_STYLES.subtitle)
      .setOrigin(0.5)

    // Create character selection container (initially hidden)
    this.selectionContainer = this.add.container(0, 0)
    this.selectionContainer.setVisible(false)

    // Create 4 characters for selection (inside the container)
    this.createCharacterSelection(centerX, centerY)

    // Show currently selected character
    this.selectedCharDisplay = this.add.container(centerX, centerY - 50)
    this.updateSelectedCharacterDisplay()

    // Button to open character selection
    this.selectButton = this.createButton(centerX, centerY + 100, "PERSONAGENS", () => {
      this.toggleCharacterSelection()
    })

    // Start button (below)
    this.startButton = this.createButton(centerX, centerY + 200, "START", () => {
      this.startGame()
    })
  }

  // Helper method for background
  createBackground(centerX, centerY) {
    try {
      this.add.image(centerX, centerY, "menu-bg").setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    } catch (e) {
      // Fallback: create a gradient background if the image is missing
      const bg = this.add.graphics()
      bg.fillGradientStyle(0x000033, 0x000033, 0x330033, 0x330033, 1)
      bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
    }
  }

  // Helper method for safe image loading
  safeLoadImage(x, y, key, size, fallbackColor = 0x333333) {
    try {
      return this.add.image(x, y, key).setDisplaySize(size, size)
    } catch (e) {
      return this.add.rectangle(x, y, size, size, fallbackColor)
    }
  }

  // Helper method for safe sprite loading (usado para exibir um FRAME específico da spritesheet)
  safeLoadSprite(x, y, key, frame, size, fallbackColor = 0x333333) { // AQUI: Adicionado 'frame'
    try {
      // passando o frame específico
      const sprite = this.add.sprite(x, y, key, frame);
      sprite.setDisplaySize(size, size);
      return sprite;
    } catch (e) {
      return this.add.circle(x, y, size / 2, fallbackColor)
    }
  }

  createButton(x, y, text, callback) {
    // Create an interactive button
    const button = this.add.container(x, y)

    // Try to use the button image, or fallback to a rectangle
    let buttonBg = this.safeLoadImage(0, 0, "button", 300, 0x1a8f3a)
    if (buttonBg.type === "Image") {
      buttonBg.setDisplaySize(300, 80)
    } else {
      buttonBg.width = 300
      buttonBg.height = 80
    }

    const buttonText = this.add
      .text(0, 0, text, MainMenu.TEXT_STYLES.button)
      .setOrigin(0.5)

    button.add([buttonBg, buttonText])
    button.setSize(300, 80)
    button
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", callback)
      .on("pointerover", () => {
        buttonText.setStyle({ ...MainMenu.TEXT_STYLES.button, fill: "#ffff00" })
        buttonBg.setTint(0xcccccc)
      })
      .on("pointerout", () => {
        buttonText.setStyle(MainMenu.TEXT_STYLES.button)
        buttonBg.clearTint()
      })

    return button
  }

  toggleCharacterSelection() {
    this.selectionOpen = !this.selectionOpen

    if (this.selectionOpen) {
      // Show character selection
      this.selectionContainer.setVisible(true)
      this.subtitleText.setText("Selecione o personagem")
      this.selectedCharDisplay.setVisible(false)
      this.selectButton.setVisible(false)
      this.startButton.setVisible(false)
    } else {
      // Hide character selection
      this.selectionContainer.setVisible(false)
      this.subtitleText.setText("Main Menu")
      this.updateSelectedCharacterDisplay()
      this.selectedCharDisplay.setVisible(true)
      this.selectButton.setVisible(true)
      this.startButton.setVisible(true)
    }
  }

  updateSelectedCharacterDisplay() {
    // Clear the container
    this.selectedCharDisplay.removeAll()

    const character = MainMenu.CHARACTERS[this.selectedCharacter]

    const titleText = this.add
      .text(0, -100, "Selecione o personagem:", MainMenu.TEXT_STYLES.label)
      .setOrigin(0.5)

    // Passando a chave da spritesheet e o frame específico
    const charSprite = this.safeLoadSprite(
      0, 0,
      character.key,
      character.frameMenu,
      150,
      character.color
    )

    // Add character name
    const nameText = this.add
      .text(0, 100, character.name, MainMenu.TEXT_STYLES.characterName)
      .setOrigin(0.5)

    // Add to container
    this.selectedCharDisplay.add([titleText, charSprite, nameText])
  }

  createCharacterSelection(centerX, centerY) {
    // Semi-transparent background for selection
    const selectionBg = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width * 0.8,
      this.cameras.main.height * 0.8,
      0x000000,
      0.8,
    )

    // Selection title
    const selectionTitle = this.add
      .text(centerX, centerY - 200, "Escolha seu personagem", MainMenu.TEXT_STYLES.selectionTitle)
      .setOrigin(0.5)

    // Back button
    const backButton = this.createButton(centerX, centerY + 250, "VOLTAR", () => {
      this.toggleCharacterSelection()
    })

    // Add to selection container
    this.selectionContainer.add([selectionBg, selectionTitle, backButton])

    // Positions (in a row)
    const spacing = 200
    const startX = centerX - spacing * 1.5

    // Create each character
    this.characterSprites = []

    MainMenu.CHARACTERS.forEach((char, index) => {
      // Container for each character
      const charContainer = this.add.container(startX + spacing * index, centerY)

      // Frame (normal or selected)
      const frame = this.safeLoadImage(0, 0, "frame", 160)
      if (frame.type !== "Image") {
        frame.setStrokeStyle(4, 0xffffff)
      }

      // passando a chave da spritesheet e o frame específico
      const sprite = this.safeLoadSprite(0, 0, char.key, char.frameMenu, 120, char.color)

      // Make interactive
      charContainer.setSize(160, 160)
      charContainer.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.selectCharacter(index)
        this.toggleCharacterSelection() // Close after choosing
      })

      // Character name
      const text = this.add
        .text(0, 85, char.name, MainMenu.TEXT_STYLES.characterNameSmall)
        .setOrigin(0.5)

      // Character stats
      const statsText = this.add
        .text(0, 115, char.stats, MainMenu.TEXT_STYLES.characterStats)
        .setOrigin(0.5)

      // Add to character container
      charContainer.add([frame, sprite, text, statsText])

      // Add to selection container
      this.selectionContainer.add(charContainer)

      // Store reference
      this.characterSprites.push({
        container: charContainer,
        sprite: sprite,
        frame: frame
      })
    })
  }

  selectCharacter(index) {
    if (this.selectedCharacter === index) return;

    this.selectedCharacter = index;

    if (this.characterSprites[index]) {
      // Apenas efeito de destaque visual
      this.tweens.add({
        targets: this.characterSprites[index].container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
      });
    }

    this.updateSelectedCharacterDisplay();
  }

  startGame() {
    // Pass selected character's INDEX to game scene
    this.scene.start("PreloadAssets", { characterIndex: this.selectedCharacter })
  }
}