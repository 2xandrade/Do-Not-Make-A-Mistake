// CLASS TO PRELOAD ASSETS

// PreloadAssets class extends Phaser.Scene class
class PreloadAssets extends Phaser.Scene {

    // constructor
    constructor(){
        super({
            key: 'PreloadAssets'
        });
    }

    // method to be called during class preloading
    preload() {

        const commonSpriteSheetConfig = { frameWidth: 200, frameHeight: 200 };

        const spritesheets = [
            // Inimigos
            { key: 'gatoCapuz', path: 'assets/sprites/inimigos/gatoCapuzSprites.png' },
            { key: 'gatoPernas', path: 'assets/sprites/inimigos/gatoPernasSprites.png' },
            { key: 'gatoPreto', path: 'assets/sprites/inimigos/gatoPretoSprites.png' },
            { key: 'gatoSlime', path: 'assets/sprites/inimigos/gatoSlimeSprites.png' },
            // Personagens
            { key: 'paladinoSprites', path: 'assets/sprites/personagens/paladinoSprites.png' },
            { key: 'ladinaSprites', path: 'assets/sprites/personagens/ladinaSprites.png' },
            { key: 'arqueiraSprites', path: 'assets/sprites/personagens/arqueiraSprites.png' },
            { key: 'bardoSprites', path: 'assets/sprites/personagens/bardoSprites.png' },
            // Miscellaneous
            { key: 'armas', path: 'assets/sprites/armas/armasSprite.png' }
        ];

        spritesheets.forEach(sheet => {
            this.load.spritesheet(sheet.key, sheet.path, commonSpriteSheetConfig);
        });

        this.load.image('coin', 'assets/sprites/coin.png');
        this.load.image('tiles', 'assets/sprites/grassy_field.png');
    }

    // method to be executed when the scene is created
    create() {

        // start PlayGame scene
        this.scene.start('PlayGame');
    }
}
