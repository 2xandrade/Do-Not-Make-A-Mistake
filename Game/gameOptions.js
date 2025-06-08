// CONFIGURABLE GAME OPTIONS
// changing these values will affect gameplay

var GameOptions = {

    gameSize : {
<<<<<<< HEAD
        width               : 1526,      // width of the game, in pixels
        height              : 1024       // height of the game, in pixels
=======
        width               : 1200,      // width of the game, in pixels
        height              : 1200       // height of the game, in pixels
>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13
    },
    gameBackgroundColor     : 0x222222, // game background color

    playerSpeed             : 100,      // player speed, in pixels per second
    enemySpeed              : 50,       // enemy speed, in pixels per second
    bulletSpeed             : 200,      // bullet speed, in pixels per second
    bulletRate              : 1000,     // bullet rate, in milliseconds per bullet
    enemyRate               : 1000,       // enemy rate, in milliseconds per enemy
    magnetRadius            : 100,      // radius of the circle within which the coins are being attracted

    secondEnemy: {
        // Configurações de spawn
        spawnTime: 180000,         // 3 minutos em milissegundos (3 * 60 * 1000)
        spawnInterval: 30000,      // 30 segundos entre spawns
        maxActive: 3,              // Máximo de 3 inimigos simultâneos
        
        // Atributos do inimigo
        texture: 'secondEnemy',    // Textura no pré-carregamento
        health: 3,                 // Leva 3 tiros para morrer
        damage: 2,                 // Dano ao jogador (o dobro dos normais)
        speed: 70,                // Velocidade (mais rápido que inimigos normais)
        size: 80,                  // Tamanho do sprite (maior que inimigos normais)
        color: 0xff00ff,           // Cor roxa para diferenciar
        
        // Recompensas
        xpReward: 50               // XP extra ao derrotar (5x mais que inimigos normais)
    }
};
