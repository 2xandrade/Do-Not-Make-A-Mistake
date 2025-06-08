// CONFIGURABLE GAME OPTIONS
// changing these values will affect gameplay

var GameOptions = {

    gameSize : {
        width               : 1526,      // width of the game, in pixels
        height              : 1024       // height of the game, in pixels
    },
    gameBackgroundColor     : 0x222222, // game background color

    playerSpeed             : 100,      // player speed, in pixels per second
    enemySpeed              : 50,       // enemy speed, in pixels per second
    bulletSpeed             : 200,      // bullet speed, in pixels per second
    bulletRate              : 1200,     // bullet rate, in milliseconds per bullet
    enemyRate               : 1000,      // enemy rate, in milliseconds per enemy
    magnetRadius            : 100       // radius of the circle within which the coins are being attracted
};
