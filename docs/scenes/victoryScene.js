class VictoryScene extends Phaser.Scene {

    tileCache = new Set();
    tileWeightPool = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    11, 11, 11, 11, 11, 11, 11,
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10
    ];

    constructor() {
        super({ key: "victoryScene" });
    }

    preload() {
        this.load.image("tileset", "assets/sprites/mapa/mapaSprites.png");
    }

    init(data) {
        this.characterIndex = data.characterIndex || 0;
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Fundo
        this.createTileBackground();

        // --- PERSONAGEM VENCEDOR ---
        let victoryImage;

        const victoryImages = ['paladinoTwink', 'bardoTwink', 'arqueiraMulher', 'ladinaPassiva'];
        this.add.sprite(centerX, centerY - 100, victoryImages[this.characterIndex])
            .setDisplaySize(300, 300);

        // Adiciona o sprite com a imagem escolhida
        const sprite = this.add.sprite(centerX, centerY - 100, victoryImage)
            .setDisplaySize(300, 300);

        // Mensagem de vitória
        this.add.text(centerX, centerY + 150, "VITÓRIA!", { 
            fontSize: "72px", 
            fill: "#ffff00", 
            fontFamily: "Arial", 
            stroke: "#000000", 
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 5, stroke: true }
        }).setOrigin(0.5);

        // Nome do personagem
        const characterNames = ["Paladino", "Bardo", "Arqueira", "Ladina"];
        this.add.text(centerX, centerY + 220, `${characterNames[this.characterIndex]} conquistou a glória!`, {
            fontSize: "36px",
            fill: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);


        // Volta automaticamente ao menu após 5 segundos (opcional)
        this.time.delayedCall(5000, () => {
            this.scene.start("mainMenu");
        });
    }

    // Reutiliza o método de fundo do MainMenu
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
}
