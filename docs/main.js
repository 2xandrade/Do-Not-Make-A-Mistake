// MAIN GAME FILE

// This assumes GameOptions, PreloadAssets, and PlayGame are loaded globally via script tags in index.html

window.onload = function() {

    // object to initialize the Scale Manager
    const scaleObject = {
        mode        : Phaser.Scale.FIT,                     // adjust size to automatically fit in the window
        autoCenter  : Phaser.Scale.CENTER_BOTH,             // center the game horizontally and vertically
        parent      : 'thegame',                            // DOM id where to render the game
        width       : GameOptions.gameSize.width,           // game width, in pixels
        height      : GameOptions.gameSize.height           // game height, in pixels
    };

    // game configuration object
    const configObject = {
        type            : Phaser.WEBGL,                     // game renderer
        backgroundColor : GameOptions.gameBackgroundColor,  // game background color
        scale           : scaleObject,                      // scale settings
        scene           : [                                 // array with game scenes
            MainMenu,
            VictoryScene,
            PreloadAssets, // Assumes PreloadAssets class is globally available
            PlayGame       // Assumes PlayGame class is globally available
        ],
        physics         : {                                 // physics engine used
            default : 'arcade'
        }
    };

    // the game itself
    new Phaser.Game(configObject);
};
