// THE GAME ITSELF

// PlayGame class extends Phaser.Scene class
class PlayGame extends Phaser.Scene {
    // --- Properties ---
    controlKeys;
    player;
    enemyGroup;
    bulletGroup;
    coinGroup;

    // Player Stats
    playerHP = 5; // Initial health points
    isInvulnerable = false; // Invulnerability status
    playerLVL = 1;
    playerXP = 0;
    nextLevelXP = 100;

    // UI Elements
    hpText = null; // Text object to display HP
    healthBarBg; // Health bar background graphic
    healthBar; // Health bar graphic
    healthBarContainer; // Container for health bar graphics
    timeBarBg; // Time bar background graphic
    timeBar; // Time bar graphic
    timeText = null; // Text object to display time

    // Game Timer
    totalGameTime = 900000; // 15 minutes in milliseconds
    totalMinutes = 15;
    elapsedTime = 0;

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

    constructor() {
        super({
            key: 'PlayGame'
        });
    }

    // method to be called once the instance has been created
    create() {
        // Camera setup
        this.cameras.main.setScroll(0, 0); // Lock scrolling at the top

        // Game Objects
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, 'paladinoSprites');
        this.player.setDisplaySize(80, 80);
        this.player.setSize(80, 80);
        this.mapGeneration();
        this.enemyGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.coinGroup = this.physics.add.group();

        // Camera follows the player
        this.cameras.main.startFollow(this.player);

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

    }

    update(time, delta) {
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
        this.healthBarBg.fillRect(-barWidth/2, 0, barWidth, barHeight);

        // Health
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(-barWidth/2, 0, barWidth * healthPercent, barHeight);
        
        // Border
        this.healthBarBg.lineStyle(1, 0xffffff, 1);
        this.healthBarBg.strokeRect(-barWidth/2, 0, barWidth, barHeight);
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

                switch(side) {
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

                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy');
                enemy.setDisplaySize(80, 80);
                enemy.setSize(80, 80);
                this.enemyGroup.add(enemy);
            }
        });

        // Bullet firing timer
        this.time.addEvent({
            delay: GameOptions.bulletRate,
            loop: true,
            callback: () => {
                const closestEnemy = this.physics.closest(this.player, this.enemyGroup.getChildren());
                if (closestEnemy !== null) {
                    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
                    this.bulletGroup.add(bullet);
                    this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
                }
            },
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
            const coin = this.physics.add.sprite(enemy.x, enemy.y, 'coin');
            coin.setDisplaySize(30, 30);
            coin.setSize(30, 30);
            this.coinGroup.add(coin);
            this.bulletGroup.killAndHide(bullet);
            this.enemyGroup.killAndHide(enemy);
        });

        // Player vs Coin 
        this.physics.add.collider(this.player, this.coinGroup, (player, coin) => {
            this.playerXP += 10;

            if (this.playerXP >= this.nextLevelXP) {
                this.levelUP();
            } else {
                this.updateLevelText(); // Update XP bar even if no level up
            }

            this.coinGroup.killAndHide(coin);
            coin.body.checkCollision.none = true;
        });
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
            if (bodySprite.texture.key == 'coin'){
                this.physics.moveToObject(bodySprite, this.player, 500);
            }
        });
    }

    levelUP() {
        this.playerLVL++;
        this.playerXP -= this.nextLevelXP;
        this.nextLevelXP = Math.floor(this.nextLevelXP * 1.2);
        this.updateLevelText(); // This now updates both level and XP bar
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
                duration: 500,
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
