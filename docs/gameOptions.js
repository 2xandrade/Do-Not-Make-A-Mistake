var GameOptions = {
    gameSize : { width: 1526, height: 1024 },
    gameBackgroundColor : 0x222222,
    playerSpeed : 100,
    enemySpeed : 50,
    bulletSpeed : 200,
    bulletRate : 1000,
    enemyRate : 1000,
    magnetRadius : 100,

    // BOSS ENEMIES CONFIG:
    secondEnemy: {
        spawnTime: 180000,      // 3 min in ms  180000
        spawnInterval: 30000,   // 30 sec between spawns
        maxActive: 3,           // max simultaneous
        texture: 'gatoPernas',
        health: 3,
        damage: 2,
        speed: 70,
        size: 80,
        xpReward: 50
    },
    thirdEnemy: {
        spawnTime: 360000,      // 6 min in ms 360000
        spawnInterval: 45000,   // 45 sec between spawns
        maxActive: 3,
        texture: 'gatoPreto',
        health: 4,
        damage: 2,
        speed: 80,
        size: 80,
        xpReward: 60
    },
    fourthEnemy: {
        spawnTime: 540000,      // 9 min in ms  540000
        spawnInterval: 30000,
        maxActive: 3,
        texture: 'gatoCapuz',
        health: 6,
        damage: 2,
        speed: 60,
        size: 80,
        xpReward: 80
    },
    fifthEnemy: {
        spawnTime: 720000,      // 12 min in ms  720000
        maxActive: 1,
        texture: 'boss',
        health: 250,
        damage: 5,
        speed: 70,
        size: 250,
    }
};
