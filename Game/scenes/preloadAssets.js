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

        // load images
        // NOTE: These asset paths point to files not included in the blog post code.
        // You will need to provide these image files in an 'assets/sprites/' directory.
        this.load.image('enemy', 'assets/sprites/enemy.png');      // the big circle
        this.load.image('player', 'assets/sprites/paladinoSprites.png');    // the player
        this.load.image('bullet', 'assets/sprites/bullet.png');    // the spike
        this.load.image('coin', 'assets/sprites/coin.png');
        this.load.image('tiles', 'assets/sprites/grassy_field.png');
        this.load.image('secondEnemy', 'assets/sprites/pedra.png');
    
        this.load.spritesheet('paladinoSprites', 'assets/sprites/paladinoSprites.png', {
            frameWidth: 200,  // Ajuste conforme seu sprite
            frameHeight: 200,
        });
    }

    // method to be executed when the scene is created
    create() {

        // start PlayGame scene
        this.scene.start('PlayGame');
    }
}
