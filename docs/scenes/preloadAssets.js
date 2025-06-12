// CLASS TO PRELOAD ASSETS

// PreloadAssets class extends Phaser.Scene class
class PreloadAssets extends Phaser.Scene {

    // constructor
    constructor(){
        super({
            key: 'PreloadAssets'
        });
    }

    init(data) {
        if (data && data.characterIndex !== undefined) {
            this.characterIndexToLoad = data.characterIndex;
        }
    }

    // method to be called during class preloading
    preload() {

        const commonSpriteSheetConfig = { frameWidth: 200, frameHeight: 200 };

        const spritesheets = [
            // Inimigos
            { key: 'boss', path: 'assets/sprites/inimigos/bossSprites.png' },
            { key: 'gatoCapuz', path: 'assets/sprites/inimigos/gatoCapuzSprites.png' },
            { key: 'gatoPernas', path: 'assets/sprites/inimigos/gatoPernasSprites.png' },
            { key: 'gatoPreto', path: 'assets/sprites/inimigos/gatoPretoSprites.png' },
            { key: 'gatoSlime', path: 'assets/sprites/inimigos/gatoSlimeSprites.png' },
            // Personagens
            { key: 'paladinoSprites', path: 'assets/sprites/personagens/paladinoSprites.png' },
            { key: 'bardoSprites', path: 'assets/sprites/personagens/bardoSprites.png' },
            { key: 'arqueiraSprites', path: 'assets/sprites/personagens/arqueiraSprites.png' },
            { key: 'ladinaSprites', path: 'assets/sprites/personagens/ladinaSprites.png' },
            { key: 'npcSprites', path: 'assets/sprites/npc/npcSprites.png' },
            // Miscellaneous
            { key: 'armas', path: 'assets/sprites/armas/armasSprite.png' }
        ];

        spritesheets.forEach(sheet => {
            this.load.spritesheet(sheet.key, sheet.path, commonSpriteSheetConfig);
        });
        this.load.image('bardoTwink','assets/sprites/personagens/bardoTwink.png');
        this.load.image('ladinaPassiva','assets/sprites/personagens/ladinaPassiva.png');
        this.load.image('arqueiraMulher','assets/sprites/personagens/arqueiraMulher.png');
        this.load.image('paladinoTwink','assets/sprites/personagens/paladinoTwink.png');
        this.load.image('upgrade_speed','assets/sprites/velocidade.png');
        this.load.image('upgrade_hp','assets/sprites/mais1Hp.png');
        this.load.image('upgrade_tiros','assets/sprites/tiroVeloz.png');
        this.load.image('upgrade_raio','assets/sprites/maisAreaColeta.png');
        this.load.image('upgrade_atirar','assets/sprites/atirarMaisVezes.png');
        this.load.image('upgrade_multi','assets/sprites/mais1Tirooo.png');
        this.load.image('upgrade_exp','assets/sprites/mais5Xp.png');
        this.load.image('upgrade_coin','assets/sprites/cookieDuplo.png');
        this.load.image('coin', 'assets/sprites/coin.png');
        this.load.image('tileset', 'assets/sprites/mapa/mapaSprites.png');

        this.load.audio('jogoSong2', 'assets/sprites/musica/jogoSong2.ogg');
    }

    // method to be executed when the scene is created
    create() {

        // start PlayGame scene
        this.scene.start('PlayGame', { characterIndex: this.characterIndexToLoad });
    }
}
