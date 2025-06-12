class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "victoryScene" });
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
        const tileSize = 256;
        const cols = Math.ceil(this.cameras.main.width / tileSize) + 1;
        const rows = Math.ceil(this.cameras.main.height / tileSize) + 1;

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                this.add.image(x * tileSize, y * tileSize, 'tileset', 0)
                    .setOrigin(0)
                    .setDisplaySize(tileSize, tileSize)
                    .setAlpha(0.4);
            }
        }
    }
}
