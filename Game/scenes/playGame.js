// THE GAME ITSELF

// PlayGame class extends Phaser.Scene class
class PlayGame extends Phaser.Scene {
    // --- Properties ---
    controlKeys;
    player;
    enemyGroup;
    bulletGroup;
    coinGroup;

    // segundo inimigo
   

    // Coins
    coinXPBonus = 0;
    doubleCoinChance = 0; // 0 = 0%

    // Player Stats
    playerHP = 5; // Initial health points
    isInvulnerable = false; // Invulnerability status
    playerBulletCount = 1;
    bulletRate = GameOptions.bulletRate;

    // UI Elements
    hpText = null; // Text object to display HP
    healthBarBg; // Health bar background graphic
    healthBar; // Health bar graphic
    healthBarContainer; // Container for health bar graphics
    timeBarBg; // Time bar background graphic
    timeBar; // Time bar graphic
    timeText = null; // Text object to display time

    // Game Timer
    isPaused = false;

    // Player Movement
    lastDirection = 'down'; // default direction

    // Map
    tileSize = 256;
    tileMap;
    tileLayer;
    tileset;
    tileCache = new Set();
    lastTileX = null;
    lastTileY = null;

    // Upgrades
    allUpgrades = [
        {
            label: 'Correr mais rápido',
            effect: () => GameOptions.playerSpeed += 10,
        },
        {
            label: '+1 HP',
            effect: () => this.playerHP = Math.min(this.playerHP + 1, 5),
        },
        {
            label: 'Tiros Velozes',
            effect: () => GameOptions.bulletSpeed += 30,
        },
        {
            label: 'Maior raio de Coleta',
            effect: () => GameOptions.magnetRadius += 10,
        },
        {
            label: 'Atirar mais vezes',
            effect: () => this.bulletRate = Math.max(this.bulletRate - 50, 100),
        },
        {
            label: '+1 tiro simultâneo',
            effect: () => this.playerBulletCount += 1,
        },
        {
            label: '+5 XP por moeda',
            effect: () => this.coinXPBonus += 5,
        },
        {
            label: 'Chance de moedas duplas',
            effect: () => this.doubleCoinChance = Math.min(this.doubleCoinChance + 0.05, 1),
        }
    ];

    constructor() {
        super({
            key: 'PlayGame'
        });
    }

    // method to be called once the instance has been created
    create() {
        // Camera setup
        this.cameras.main.setScroll(0, 0); // Lock scrolling at the top

<<<<<<< HEAD
        this.selectedCharacter = 'ladinaSprites';

        // Game Objects
<<<<<<< Updated upstream
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, 'player');
=======
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, this.selectedCharacter);
>>>>>>> Stashed changes
=======
        this.referenceX = 0;
        this.referenceY = 0;

        // Game Objects
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, 'paladinoSprites');
>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13
        this.player.setDisplaySize(80, 80);
        this.player.setSize(80, 80);
        this.mapGeneration();
        this.enemyGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.coinGroup = this.physics.add.group();

        // Camera follows the player
        this.cameras.main.startFollow(this.player);

        //Player stats
        this.playerLVL = 1;
        this.playerXP = 0;
        this.nextLevelXP = 100;

        // Game Timer
        this.totalGameTime = 900000; // 15 minutes in milliseconds
        this.totalMinutes = 15;
        this.elapsedTime = 0;


        // UI Creation
        this.createTimeBar();
        this.createHealthBar();
        this.createLevelUI();

        // Input Handling
        this.setupInput();

        // Timed Events
        this.setupTimers();

        // Collisions
        this.setupCollisions();

        this.playerHP = 5;
        this.isInvulnerable = false;
        this.hpText.setText(`HP: ${this.playerHP}`);

        // Initial UI Update
        this.updateHealthBar();
        this.updateTimeBar();
        this.updateLevelText();

        // Set depths (z-index)
        this.enemyGroup.setDepth(100);
        this.timeBarBg.setDepth(1000);
        this.timeBar.setDepth(1001);
        this.timeText.setDepth(1002);
<<<<<<< HEAD
<<<<<<< Updated upstream
=======

        const playerWalkAnimations = [
            { key: 'walk-down', frames: [0, 1, 2, 3] },
            { key: 'walk-right', frames: [4, 5, 6, 7] },
            { key: 'walk-left', frames: [8, 9, 10, 11] },
            { key: 'walk-up', frames: [12, 13, 14, 15] }
        ];

        playerWalkAnimations.forEach(anim => {
            this.anims.create({
                key: anim.key,
                frames: this.anims.generateFrameNumbers(this.selectedCharacter, { frames: anim.frames }),
                frameRate: 6,
                repeat: -1
            });
        });

        // GatoSlime animation (kept separate due to different frameRate)
        this.anims.create({
            key: 'gatoSlime',
            frames: this.anims.generateFrameNumbers('gatoSlime', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        // this.anims.create({
        //     key: 'gatoCapuz',
        //     frames: this.anims.generateFrameNumbers('gatoCapuzSprites', { frames: [0, 1] }),
        //     frameRate: 2,
        //     repeat: -1
        // });

        // this.anims.create({
        //     key: 'gatoPernas',
        //     frames: this.anims.generateFrameNumbers('gatoPernasSprites', { start: 0, end: 3 }),
        //     frameRate: 9,
        //     repeat: -1
        // });

>>>>>>> Stashed changes
=======

        //Animations
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('paladinoSprites', { frames: [0, 1, 2, 3] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('paladinoSprites', { frames: [4, 5, 6, 7] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('paladinoSprites', { frames: [8, 9, 10, 11] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('paladinoSprites', { frames: [12, 13, 14, 15] }),
            frameRate: 6,
            repeat: -1
        });

>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13
    }

    update(time, delta) {
        if (this.isPaused) return;
        // Update health bar position
        if (this.player) {
            this.healthBarContainer.setPosition(this.player.x, this.player.y - 40);
            this.updateTilemapAroundPlayer();
            this.cleanFarTiles(this.player.x, this.player.y);

            // Atualiza o mapa ao redor do jogador
            this.updateTilemapAroundPlayer();
            // Atualiza a posição de referência se o jogador sair da área central
            const threshold = this.tileSize * 2;
            if (Math.abs(this.player.x - this.referenceX) > threshold || Math.abs(this.player.y - this.referenceY) > threshold) {
                this.referenceX = this.player.x;
                this.referenceY = this.player.y;
            }
            // Remove tiles muito distantes
            this.cleanFarTiles(this.player.x, this.player.y, 15); // Aumentamos o raiso de limpeza

            // Atualiza o timer do jogo
            this.elapsedTime += delta;

            // Atualiza a barra de tempo a cada segundo
            if (Math.floor(this.elapsedTime / 1000) > Math.floor((this.elapsedTime - delta) / 1000)) {
                this.updateTimeBar();
            }
        }
<<<<<<< HEAD
=======

        if (!this.secondEnemySpawned && this.elapsedTime >= 180000) {
                this.spawnSecondEnemy();
        }
>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13

        // Player movement
        this.handlePlayerMovement();

        // Coin collection
        this.collectCoins();

        // Enemy movement
        this.moveEnemies();

        // Game timer
        this.updateGameTimer(delta);
    }

    mapGeneration() {
        this.tileMap = this.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width: 1000,
            height: 1000
        });

        this.tileset = this.tileMap.addTilesetImage('tiles', null, this.tileSize, this.tileSize);
        this.tileLayer = this.tileMap.createBlankLayer('Ground', this.tileset);
        this.tileLayer.setDepth(-10); // Set behind everything

        // Initially fill a few tiles around the player
        this.updateTilemapAroundPlayer();

    }

    updateTilemapAroundPlayer(radius = 3) {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);

        // Only regenerate if player entered a new tile
        if (this.lastTileX === playerTileX && this.lastTileY === playerTileY) {
            return; // Player is still in same tile — skip update
        }

        // Save new position
        this.lastTileX = playerTileX;
        this.lastTileY = playerTileY;

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const tileX = playerTileX + dx;
                const tileY = playerTileY + dy;
                const key = `${tileX},${tileY}`;

                if (!this.tileCache.has(key)) {
                    const tileIndex = 0;
                    this.tileLayer.putTileAt(tileIndex, tileX, tileY);
                    this.tileCache.add(key);
                }
            }
        }
    }

    cleanFarTiles(playerX, playerY, maxDistance = 10) {
        const playerTileX = Math.floor(playerX / this.tileSize);
        const playerTileY = Math.floor(playerY / this.tileSize);

        this.tileCache.forEach((key) => {
            const [tx, ty] = key.split(',').map(Number);
            const dx = tx - playerTileX;
            const dy = ty - playerTileY;

            if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
                this.tileLayer.removeTileAt(tx, ty);
                this.tileCache.delete(key);
            }
        });
    }

    createTimeBar() {
        const barWidth = this.cameras.main.width * 0.9;
        const barHeight = 19;
        const barX = this.cameras.main.width * 0.05; // Left-aligned (5% from left)
        const barY = 30;

        // Background bar (gray - static)
        this.timeBarBg = this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(0, 0, barWidth, barHeight)
            .setPosition(barX, barY)
            .setScrollFactor(0);

        // Progress bar (blue - will grow from left to right)
        this.timeBar = this.add.graphics()
            .fillStyle(0x00a8ff, 1)
            .fillRect(0, 0, 0, barHeight) // Start with width 0
            .setPosition(barX, barY)
            .setScrollFactor(0);

        // Time text
        this.timeText = this.add.text(this.cameras.main.centerX, barY - 8, '15:00', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        })
            .setOrigin(0.5)
            .setScrollFactor(0);

        const checkpointMinutes = [3, 6, 9, 12];
        checkpointMinutes.forEach(min => {
            const checkpointX = barX + (barWidth * (min / this.totalMinutes));
            this.add.graphics()
                .lineStyle(2, 0xffffff, 0.5)
                .beginPath()
                .moveTo(checkpointX, barY)
                .lineTo(checkpointX, barY + barHeight)
                .strokePath()
                .setScrollFactor(0)
                .setDepth(1002);
        });
    }

    updateTimeBar() {
        const barWidth = this.cameras.main.width * 0.9;
        const timePercent = this.elapsedTime / this.totalGameTime;

        this.timeBar.clear()
            .fillStyle(0x00a8ff, 1);

        // Change color to red in the last 30 seconds
        if ((this.totalGameTime - this.elapsedTime) < 30000) {
            this.timeBar.fillStyle(0xff0000, 1);
        }

        this.timeBar.fillRect(0, 0, barWidth * timePercent, 20);

        // Update text
        const remainingTime = this.totalGameTime - this.elapsedTime;
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        this.timeText.setText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }

    createHealthBar() {
        const barWidth = 80;
        const barHeight = 10;

        this.healthBarBg = this.add.graphics();
        this.healthBar = this.add.graphics();

        // Position bars above player
        this.healthBarContainer = this.add.container(this.player.x, this.player.y - 40);
        this.healthBarContainer.add([this.healthBarBg, this.healthBar]);

        // HP Text
        this.hpText = this.add.text(30, 60, `HP: ${this.playerHP}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setScrollFactor(0)
            .setDepth(1003);
    }

    updateHealthBar() {
        const barWidth = 80;
        const barHeight = 10;
        const healthPercent = this.playerHP / 5;

        this.healthBarBg.clear();
        this.healthBar.clear();

        // Background
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(-barWidth / 2, 0, barWidth, barHeight);

        // Health
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(-barWidth / 2, 0, barWidth * healthPercent, barHeight);

        // Border
        this.healthBarBg.lineStyle(1, 0xffffff, 1);
        this.healthBarBg.strokeRect(-barWidth / 2, 0, barWidth, barHeight);
    }

    createLevelUI() {
        const xpBarWidth = this.cameras.main.width * 0.8;
        const xpBarHeight = 20;
        const xpBarX = this.cameras.main.width * 0.1;
        const xpBarY = this.cameras.main.height - 40;

        this.xpBarBg = this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(0, 0, xpBarWidth, xpBarHeight)
            .setPosition(xpBarX, xpBarY)
            .setScrollFactor(0)
            .setDepth(1000);

        this.xpBar = this.add.graphics()
            .fillStyle(0xffff00, 1)
            .fillRect(0, 0, 0, xpBarHeight)
            .setPosition(xpBarX, xpBarY)
            .setScrollFactor(0)
            .setDepth(1001);

        this.xpText = this.add.text(this.cameras.main.centerX, xpBarY - 22, `XP: ${this.playerXP} / ${this.nextLevelXP}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 2, bottom: 2 }
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1002);

        this.levelText = this.add.text(30, 100, `Level: ${this.playerLVL}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
            .setScrollFactor(0)
            .setDepth(1003);
    }

    updateLevelText() {
        this.levelText.setText(`Level: ${this.playerLVL}`);
        this.xpText.setText(`XP: ${this.playerXP} / ${this.nextLevelXP}`);

        const xpBarWidth = this.cameras.main.width * 0.8;
        const xpPercent = Phaser.Math.Clamp(this.playerXP / this.nextLevelXP, 0, 1);

        this.xpBar.clear()
            .fillStyle(0xffff00, 1)
            .fillRect(0, 0, xpBarWidth * xpPercent, 20);
    }

    spawnSecondEnemy() {
        
        // Verifica limite de inimigos ativos
        const activeSecondEnemies = this.enemyGroup.getChildren().filter(e => 
            e.texture.key === 'secondEnemy'
        ).length;
        
        if (activeSecondEnemies >= GameOptions.secondEnemy.maxActive) return;
        
        // Posicionamento fora da tela
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        const padding = 100;
        const cam = this.cameras.main;
        
        switch(side) {
            case 0: x = Phaser.Math.Between(cam.scrollX - padding, cam.scrollX + cam.width + padding);
                    y = cam.scrollY - padding; break; // Topo
            case 1: x = cam.scrollX + cam.width + padding;
                    y = Phaser.Math.Between(cam.scrollY - padding, cam.scrollY + cam.height + padding); break; // Direita
            case 2: x = Phaser.Math.Between(cam.scrollX - padding, cam.scrollX + cam.width + padding);
                    y = cam.scrollY + cam.height + padding; break; // Fundo
            case 3: x = cam.scrollX - padding;
                    y = Phaser.Math.Between(cam.scrollY - padding, cam.scrollY + cam.height + padding); break; // Esquerda
        }
        
        // Criação do inimigo
        const enemy = this.physics.add.sprite(x, y, 'secondEnemy');
        enemy.setDisplaySize(GameOptions.secondEnemy.size, GameOptions.secondEnemy.size);
        enemy.setTint(GameOptions.secondEnemy.color);
        enemy.health = GameOptions.secondEnemy.health;
        enemy.damage = GameOptions.secondEnemy.damage || 2; // Dano padrão se não definido
        
        this.enemyGroup.add(enemy);
    }

    takeDamage() {
        if (this.isInvulnerable) return;

        this.playerHP--;
        this.hpText.setText(`HP: ${this.playerHP}`);
        this.updateHealthBar();

        // Visual effect
        this.isInvulnerable = true;
        this.player.setTint(0xff0000);

        // Blink player
        const blinkInterval = this.time.addEvent({
            delay: 100,
            callback: () => {
                this.player.alpha = this.player.alpha === 1 ? 0.5 : 1;
            },
            repeat: 10
        });

        // Reset after 1 second
        this.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            this.player.clearTint();
            this.player.setAlpha(1);
            blinkInterval.destroy();
        });

        if (this.playerHP <= 0) {
            this.gameOver();
        }
    }

    setupInput() {
        const keyboard = this.input.keyboard;
        this.controlKeys = keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    setupTimers() {
        // Enemy spawn timer
        this.time.addEvent({
            delay: GameOptions.enemyRate,
            loop: true,
            callback: () => {
                const camera = this.cameras.main;
                const cameraBounds = new Phaser.Geom.Rectangle(
                    camera.scrollX,
                    camera.scrollY,
                    camera.width,
                    camera.height
                );

                const spawnArea = new Phaser.Geom.Rectangle(
                    cameraBounds.x - 100,
                    cameraBounds.y - 100,
                    cameraBounds.width + 200,
                    cameraBounds.height + 200
                );

                const side = Phaser.Math.Between(0, 3);
                let spawnPoint;

                switch (side) {
                    case 0: // Top
                        spawnPoint = new Phaser.Geom.Point(
                            Phaser.Math.Between(spawnArea.left, spawnArea.right),
                            spawnArea.top
                        );
                        break;
                    case 1: // Right
                        spawnPoint = new Phaser.Geom.Point(
                            spawnArea.right,
                            Phaser.Math.Between(spawnArea.top, spawnArea.bottom)
                        );
                        break;
                    case 2: // Bottom
                        spawnPoint = new Phaser.Geom.Point(
                            Phaser.Math.Between(spawnArea.left, spawnArea.right),
                            spawnArea.bottom
                        );
                        break;
                    case 3: // Left
                        spawnPoint = new Phaser.Geom.Point(
                            spawnArea.left,
                            Phaser.Math.Between(spawnArea.top, spawnArea.bottom)
                        );
                        break;
                }

<<<<<<< Updated upstream
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy');
<<<<<<< HEAD
=======
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'gatoSlime');
                enemy.setDisplaySize(200, 200);
                enemy.setSize(100, 100);
>>>>>>> Stashed changes
=======
                enemy.setDisplaySize(80, 80);
                enemy.setSize(80, 80);
>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13
                this.enemyGroup.add(enemy);
                enemy.play('gatoSlime');
            }
        });

         // Timer para SecondEnemy (inicia após 3 minutos)
         this.time.delayedCall(GameOptions.secondEnemy.spawnTime, () => {
            this.time.addEvent({
                delay: GameOptions.secondEnemy.spawnInterval, // Intervalo entre spawns
                loop: true,
                callback: this.spawnSecondEnemy,
                callbackScope: this
            });
        });

        // Bullet firing timer
        this.time.addEvent({
            delay: this.bulletRate,
            loop: true,
            callback: () => {
                const closestEnemy = this.physics.closest(this.player, this.enemyGroup.getChildren());
                if (closestEnemy !== null) {
<<<<<<< HEAD
<<<<<<< Updated upstream
                    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
                    this.bulletGroup.add(bullet);
                    this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
=======
                    // Calculate the direction towards the closest enemy
                    const dx = closestEnemy.x - this.player.x;
                    const dy = closestEnemy.y - this.player.y;

                    let bulletFrame = 1; // Default to right-facing (sprite code 1)

                    if (Math.abs(dx) > Math.abs(dy)) {
                        // More horizontal movement
                        if (dx > 0) {
                            bulletFrame = 1; // Right-facing (sprite code 1)
                        } else {
                            bulletFrame = 3; // Left-facing (sprite code 3)
                        }
                    } else {
                        // More vertical movement (or equal)
                        if (dy > 0) {
                            bulletFrame = 4; // Down-facing (sprite code 4)
                        } else {
                            bulletFrame = 2; // Up-facing (sprite code 2)
                        }
                    }

                    for (let i = 0; i < this.playerBulletCount; i++) {
                        // Create the bullet with the determined frame
                        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'armas', bulletFrame);
                        bullet.setDisplaySize(100, 100);
                        bullet.setSize(100, 100);
                        this.bulletGroup.add(bullet);
                        this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
                    }
>>>>>>> Stashed changes
=======
                    for (let i = 0; i < this.playerBulletCount; i++) {
                        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
                        this.bulletGroup.add(bullet);
                        this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
                    }
>>>>>>> 751032238dec3b864e6adc1fe2eb7977231efe13
                }
            }
        });
    }

    setupCollisions() {
        // Player vs Enemy
        this.physics.add.collider(this.player, this.enemyGroup, () => {
            this.takeDamage();
        });

        // Bullet vs Enemy
        this.physics.add.collider(this.bulletGroup, this.enemyGroup, (bullet, enemy) => {
            (bullet.body).checkCollision.none = true;
            (enemy.body).checkCollision.none = true;

            // Verifica se é um SecondEnemy
            const isSecondEnemy = enemy.texture && enemy.texture.key === 'secondEnemy';
            
            if (isSecondEnemy) {
                // Lógica para SecondEnemy
                enemy.health--;
                enemy.setTint(0xff0000); // Feedback visual de dano
                
                this.time.delayedCall(100, () => {
                    if (enemy.active) {
                        enemy.setTint(GameOptions.secondEnemy.color);
                    }
                });

                if (enemy.health <= 0) {
                    // Recompensa maior (5 moedas + XP especial)
                    this.spawnCoinCluster(enemy.x, enemy.y, 5);
                    this.addXP(GameOptions.secondEnemy.xpReward);
                    enemy.destroy();
                }
            } else {
                // Lógica para inimigos normais
                this.spawnCoinCluster(enemy.x, enemy.y, 1);
                enemy.destroy();
            }
        });

        // Player vs Coin 
        this.physics.add.collider(this.player, this.coinGroup, (player, coin) => {
            this.playerXP += 10 + this.coinXPBonus;

            if (this.playerXP >= this.nextLevelXP) {
                this.levelUP();
            } else {
                this.updateLevelText(); // Update XP bar even if no level up
            }

            this.coinGroup.killAndHide(coin);
            coin.body.checkCollision.none = true;
        });
    }

    spawnCoinCluster(x, y, count) {
        for (let i = 0; i < count; i++) {
            const coin = this.physics.add.sprite(x, y, 'coin')
                .setDisplaySize(30, 30)
                .setSize(30, 30);
            this.coinGroup.add(coin);
        }
    }
    
    handlePlayerMovement() {
        if (!this.player) return;

        let direction = null;
        let movementDirection = new Phaser.Math.Vector2(0, 0);
        if (this.controlKeys.right.isDown) {
            movementDirection.x++;
            direction = 'right';
        }
        if (this.controlKeys.left.isDown) {
            movementDirection.x--;
            direction = 'left';
        }
        if (this.controlKeys.up.isDown) {
            movementDirection.y--;
            direction = 'up';
        }
        if (this.controlKeys.down.isDown) {
            movementDirection.y++;
            direction = 'down';
        }

        movementDirection.normalize();
        this.player.setVelocity(movementDirection.x * GameOptions.playerSpeed, movementDirection.y * GameOptions.playerSpeed);

        if (direction) {
            this.lastDirection = direction;
            this.player.anims.play(`walk-${direction}`, true);
        } else {
            // Idle frame based on last direction
            const idleFrames = {
                up: 12,
                down: 0,
                left: 8,
                right: 4
            };
            this.player.anims.stop();
            this.player.setFrame(idleFrames[this.lastDirection]);
        }
    }

    collectCoins() {
        // Ensure player exists before collecting coins
        if (!this.player) return;

        const coinsInCircle = this.physics.overlapCirc(this.player.x, this.player.y, GameOptions.magnetRadius, true, true);
        coinsInCircle.forEach((body) => {
            const bodySprite = body.gameObject;
            if (bodySprite.texture.key == 'coin') {
                this.physics.moveToObject(bodySprite, this.player, 500);
            }
        });
    }

    levelUP() {
        this.playerLVL++;
        this.playerXP -= this.nextLevelXP;
        this.nextLevelXP = Math.floor(this.nextLevelXP * 1.2);
        this.updateLevelText(); // This now updates both level and XP bar
        this.upgradeTime();
    }

    upgradeTime() {
        this.isPaused = true;
        this.physics.pause();
        this.levelUpUI = []; // Keep track of all UI to remove later

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Background overlay
        const overlay = this.add.rectangle(
            centerX, centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.6
        ).setScrollFactor(0).setDepth(2000);
        this.levelUpUI.push(overlay);

        // Title text
        const title = this.add.text(centerX, centerY - 300, 'Subiu de Nível! Escolha uma melhoria:', {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        this.levelUpUI.push(title);

        const shuffled = Phaser.Utils.Array.Shuffle(this.allUpgrades);
        const upgrades = shuffled.slice(0, 3);

        const boxWidth = 400;
        const boxHeight = 600;
        const spacing = 40;
        const totalWidth = (boxWidth * upgrades.length) + (spacing * (upgrades.length - 1));
        const startX = centerX - totalWidth / 2 + boxWidth / 2;

        upgrades.forEach((upgrade, index) => {
            const boxX = startX + index * (boxWidth + spacing);
            const boxY = centerY + 50;

            // Box background
            const box = this.add.rectangle(
                boxX, boxY,
                boxWidth, boxHeight,
                0x222222,
                1
            ).setStrokeStyle(4, 0xffffff)
                .setScrollFactor(0)
                .setInteractive()
                .setDepth(2001)
                .on('pointerover', () => {
                    box.setFillStyle(0x444444);
                })
                .on('pointerout', () => {
                    box.setFillStyle(0x222222);
                })
                .on('pointerdown', () => {
                    upgrade.effect();
                    this.resumeGameAfterLevelUp();
                });

            // Text inside the box
            const text = this.add.text(boxX, boxY, upgrade.label, {
                fontSize: '30px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                align: 'center',
                wordWrap: { width: boxWidth - 100 }
            }).setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(2002);

            this.levelUpUI.push(box, text);
        });
    }

    resumeGameAfterLevelUp() {
        this.isPaused = false;
        this.physics.resume();
        this.levelUpUI.forEach(el => el.destroy());
        this.levelUpUI = [];
        this.updateHealthBar();
        this.updateLevelText();
    }

    moveEnemies() {
        if (!this.player) return;

        this.enemyGroup.getChildren().forEach((enemy) => {
            if (enemy.active) {
                this.physics.moveToObject(enemy, this.player, GameOptions.enemySpeed);
            }
        });
    }

    updateGameTimer(delta) {
        if (this.isPaused) return; // ✅ Don't progress timer when paused

        this.elapsedTime += delta;

        if (Math.floor(this.elapsedTime / 1000) > Math.floor((this.elapsedTime - delta) / 1000)) {
            this.updateTimeBar();
        }

        if (this.elapsedTime >= this.totalGameTime) {
            this.gameOver();
        }
    }

    gameOver() {
        this.physics.pause();

        if (this.player) {
            this.player.setTint(0xff0000);
            this.player.setAlpha(0.7);
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Game Over Text
        this.gameOverText = this.add.text(
            centerX,
            centerY - 50,
            'GAME OVER',
            {
                fontSize: '64px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 5
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        // Restart Text
        this.restartText = this.add.text(
            centerX,
            centerY + 50,
            'Pressione R para reiniciar',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        // Fade-in effect
        this.gameOverText.setAlpha(0);
        this.restartText.setAlpha(0);

        if (this.tweens) {
            this.tweens.add({
                targets: [this.gameOverText, this.restartText],
                alpha: 1,
                ease: 'Linear'
            });
        }

        // Restart setup
        this.input.keyboard?.once('keydown-R', () => {
            this.scene.restart();
        });

        // Completa a barra de tempo
        this.timeBar.clear()
            .fillStyle(0xff0000, 1)
            .fillRect(0, 0, this.cameras.main.width * 0.9, 20);
    }
}
