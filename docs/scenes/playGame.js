// THE GAME ITSELF

class PlayGame extends Phaser.Scene {
    // --- Game State & Config ---
    controlKeys;
    player;
    enemyGroup;
    bulletGroup;
    coinGroup;
    npcGroup;
    npcArrow;
    npcCheckpoints = [3, 6, 9, 12]; // minutes
    npcVisited = new Set();

    // --- Character Selection ---
    selectedSpriteKey;
    selectedCharacterIndex = 0;

    // --- Player State ---
    initialSpawnX = 50000;
    initialSpawnY = 50000;
    playerHP = 5;
    isInvulnerable = false;
    playerBulletCount = 1;
    bulletRate = GameOptions.bulletRate;

    // --- XP & Level ---
    playerLVL = 1;
    playerXP = 0;
    nextLevelXP = 100;

    // --- UI Elements ---
    hpText = null;
    healthBarBg;
    healthBar;
    healthBarContainer;
    timeBarBg;
    timeBar;
    timeText = null;
    xpBarBg;
    xpBar;
    xpText;
    levelText;
    levelUpUI = [];
    
    // --- Player Movement ---
    lastDirection = 'down';

    // --- Map Generation ---
    tileSize = 256;
    tileMap;
    tileLayer;
    tileset;
    referenceX = 0;
    referenceY = 0;

    secondEnemySpawned = false;
    thirdEnemySpawned = false;
    fourthEnemySpawned = false;
    bossSpawned = false; 

    // --- Upgrades ---
    allUpgrades = [
        { label: 'Correr mais rápido', type: 'speed', spriteKey: 'upgrade_speed', effect: () => GameOptions.playerSpeed += 10 },
        { label: '+1 HP', type: 'hp', spriteKey: 'upgrade_hp', effect: () => this.playerHP = Math.min(this.playerHP + 1, 5) },
        { label: 'Tiros Velozes', type: 'bulletSpeed', spriteKey: 'upgrade_tiros', effect: () => GameOptions.bulletSpeed += 30 },
        { label: 'Maior raio de Coleta', type: 'magnet',spriteKey: 'upgrade_raio', effect: () => GameOptions.magnetRadius += 10 },
        { label: 'Atirar mais vezes', type: 'rate', spriteKey: 'upgrade_atirar', effect: () => {this.bulletRate = Math.max(this.bulletRate - 50, 100); if (this.orb && this.orb.orbitSpeed) {this.orb.orbitSpeed += 0.01;}}},        { label: '+1 tiro simultâneo', type: 'multi',spriteKey: 'upgrade_multi', effect: () => this.playerBulletCount += 1 },
        { label: '+5 XP por cookie', type: 'xpcoin',spriteKey: 'upgrade_exp', effect: () => this.coinXPBonus += 5 },
        { label: 'Chance de cookies duplas', type: 'doublecoin',spriteKey: 'upgrade_coin', effect: () => this.doubleCoinChance = Math.min(this.doubleCoinChance + 0.05, 1) }
    ];
    upgradeCounts = {
        'hp': 0,
        'speed': 0,
        'bulletSpeed': 0,
        'magnet': 0,
        'rate': 0,
        'multi': 0,
        'xpcoin': 0,
        'doublecoin': 0
    };
    upgradesText = null;

    constructor() { super({ key: 'PlayGame' }); }

    // === INIT & CREATE ===

    init(data) {
        const characterSpriteKeys = [
            "paladinoSprites", "bardoSprites", "arqueiraSprites", "ladinaSprites"
        ];
        if (data && data.characterIndex !== undefined) {
            this.selectedCharacterIndex = data.characterIndex;
            this.selectedSpriteKey = characterSpriteKeys[data.characterIndex] || "paladinoSprites";
        } else {
            this.selectedCharacterIndex = 0;
            this.selectedSpriteKey = "paladinoSprites";
        }

        // Add this for spawn position:
        if (data && data.spawnX !== undefined && data.spawnY !== undefined) {
            this.spawnX = data.spawnX;
            this.spawnY = data.spawnY;
        } else {
            // fallback default spawn positions
            this.spawnX = this.initialSpawnX; // or whatever default you want
            this.spawnY = this.initialSpawnY;
        }
    }

    create() {
        // Camera & Player
        this.cameras.main.setScroll(0, 0);
        this.selectedCharacter = this.selectedSpriteKey;
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, this.selectedCharacter)
            .setDisplaySize(80, 80)
            .setSize(80, 80);
        this.initialSpawnX = this.player.x;
        this.initialSpawnY = this.player.y;
        this.boomerangGroup = this.physics.add.group();

        // === MÚSICA ===
        this.music = this.sound.add('jogoSong2', {
            volume: 0.5,   
            loop: true   
        });
        this.music.play();

        // --- Coins ---
        this.coinXPBonus = 0;
        this.doubleCoinChance = 0; // 0 = 0%

        // --- Timer & Pause ---
        this.totalGameTime = 900000;
        this.totalMinutes = 15;
        this.elapsedTime = 0;
        this.isPaused = false;

        this.mapGeneration();
        
        // Groups
        this.enemyGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.coinGroup = this.physics.add.group();
        this.npcGroup = this.physics.add.group();

        this.referenceX = 0;
        this.referenceY = 0;
        this.cameras.main.startFollow(this.player);

        // Timers, Collisions, Input, UI
        this.createTimeBar();
        this.createHealthBar();
        this.createLevelUI();
        this.setupInput();
        this.setupTimers();
        this.setupCollisions();

        // Set initial stats & UI
        this.playerHP = 5;
        this.isInvulnerable = false;
        this.hpText.setText(`HP: ${this.playerHP}`);
        this.updateHealthBar();
        this.updateTimeBar();
        this.updateLevelText();

        // Set depths (z-index)
        this.enemyGroup.setDepth(100);
        this.timeBarBg.setDepth(1000); this.timeBar.setDepth(1001); this.timeText.setDepth(1002);

        this.time.addEvent({
            delay: 5000, // Verifica a cada 5 segundos
            loop: true,
            callback: () => {
                if (this.activeEnemies.second < 3) this.spawnSecondEnemy();
                if (this.activeEnemies.third < 3) this.spawnThirdEnemy();
                if (this.activeEnemies.fourth < 3) this.spawnFourthEnemy();
            }
        });
        
        this.activeEnemies = {
            second: 0,
            third: 0,
            fourth: 0,
            boss: 0,
        };


        // Animations
        [
            { key: 'walk-down', frames: [0, 1, 2, 3] },
            { key: 'walk-right', frames: [4, 5, 6, 7] },
            { key: 'walk-left', frames: [8, 9, 10, 11] },
            { key: 'walk-up', frames: [12, 13, 14, 15] }
        ].forEach(anim => {
            this.anims.create({
                key: anim.key,
                frames: this.anims.generateFrameNumbers(this.selectedCharacter, { frames: anim.frames }),
                frameRate: 6,
                repeat: -1
            });
        });
        this.anims.create({
            key: 'gatoSlime',
            frames: this.anims.generateFrameNumbers('gatoSlime', { start: 0, end: 7 }),
            frameRate: 8, repeat: -1
        });
        this.anims.create({
            key: 'npcSprites',
            frames: this.anims.generateFrameNumbers('npcSprites', { frames: [0, 1] }),
            frameRate: 3, repeat: -1
        });
        this.anims.create({
            key: 'gatoPernas',
            frames: this.anims.generateFrameNumbers('gatoPernas', { start: 0, end: 3 }),
            frameRate: 9, repeat: -1
        });
        this.anims.create({
            key: 'gatoCapuz',
            frames: this.anims.generateFrameNumbers('gatoCapuz', { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'gatoPreto',
            frames: this.anims.generateFrameNumbers('gatoPreto', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'bossSprites',
            frames: this.anims.generateFrameNumbers('bossSprites', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
    }

    // === UPDATE LOOP ===

    update(time, delta) {
        if (this.isPaused) return;

        // Bars follow player
        if (this.player) {
            this.healthBarContainer.setPosition(this.player.x, this.player.y - 40);
            this.updateTilemapAroundPlayer();
            this.cleanFarTiles(this.player.x, this.player.y);

            // Reference movement
            const threshold = this.tileSize * 2;
            if (Math.abs(this.player.x - this.referenceX) > threshold || Math.abs(this.player.y - this.referenceY) > threshold) {
                this.referenceX = this.player.x; this.referenceY = this.player.y;
            }
            this.cleanFarTiles(this.player.x, this.player.y, 15);
            this.elapsedTime += delta;
            if (Math.floor(this.elapsedTime / 1000) > Math.floor((this.elapsedTime - delta) / 1000)) {
                this.updateTimeBar();
            }
        }

        // NPC Arrow
        if (this.npcArrow) {
            this.npcArrow.x = this.player.x;
            this.npcArrow.y = this.player.y + 100;
            if (this.npcArrow.visible && this.npcArrow.target) {
                const dx = this.npcArrow.target.x - this.npcArrow.x;
                const dy = this.npcArrow.target.y - this.npcArrow.y;

                this.npcArrow.rotation = Phaser.Math.Angle.Between(0, 0, dx, dy);
            }
        }

        //Armas
        this.boomerangGroup.getChildren().forEach(boomerang => {
            if (boomerang.isReturning) {
                this.physics.moveToObject(boomerang, this.player, GameOptions.bulletSpeed);
                
                const dist = Phaser.Math.Distance.Between(boomerang.x, boomerang.y, this.player.x, this.player.y);
                if (dist < 10) {
                    boomerang.destroy();
                }
            }
        });

        // Inimigos

        if (!this.secondEnemySpawned && this.elapsedTime >= GameOptions.secondEnemy.spawnTime) {
            this.spawnSecondEnemy();
            this.secondEnemySpawned = true; 
        }

        if (!this.thirdEnemySpawned && this.elapsedTime >= GameOptions.thirdEnemy.spawnTime) {
            this.spawnThirdEnemy();
            this.thirdEnemySpawned = true;
        }

        if (!this.fourthEnemySpawned && this.elapsedTime >= GameOptions.fourthEnemy.spawnTime) {
            this.spawnFourthEnemy();
            this.fourthEnemySpawned = true;
        }

        if (!this.bossSpawned && this.elapsedTime >= GameOptions.fifthEnemy.spawnTime) {
            this.spawnBoss();
            this.bossSpawned = true;
        }

        this.handlePlayerMovement();
        this.collectCoins();
        this.moveEnemies();
        this.updateGameTimer(delta);
    }

    // === MAP GENERATION & TILE MANAGEMENT ===

    mapGeneration() {
        this.tileSize = 256;
        this.tileMap = this.make.tilemap({ tileWidth: this.tileSize, tileHeight: this.tileSize, width: 1000, height: 1000 });
        this.tileset = this.tileMap.addTilesetImage('tileset', null, this.tileSize, this.tileSize);
        this.tileLayer = this.tileMap.createBlankLayer('Ground', this.tileset)
            .setDepth(-10);
        this.tileCache = new Set();
        this.lastTileX = null;
        this.lastTileY = null;
        this.tileWeightPool = [
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            11, 11, 11, 11, 11, 11, 11,
            1, 2, 3, 4, 5, 6, 7,
            8, 9, 10
        ];
        this.updateTilemapAroundPlayer();
    }
    updateTilemapAroundPlayer(radius = 20) {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        if (this.lastTileX === playerTileX && this.lastTileY === playerTileY) return;
        this.lastTileX = playerTileX; this.lastTileY = playerTileY;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const tileX = playerTileX + dx, tileY = playerTileY + dy, key = `${tileX},${tileY}`;
                if (!this.tileCache.has(key)) {
                    const tileIndex = Phaser.Utils.Array.GetRandom(this.tileWeightPool);
                    this.tileLayer.putTileAt(tileIndex, tileX, tileY); this.tileCache.add(key);
                }
            }
        }
    }
    cleanFarTiles(playerX, playerY, maxDistance = 20) {
        const playerTileX = Math.floor(playerX / this.tileSize), playerTileY = Math.floor(playerY / this.tileSize);
        this.tileCache.forEach((key) => {
            const [tx, ty] = key.split(',').map(Number), dx = tx - playerTileX, dy = ty - playerTileY;
            if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
                this.tileLayer.removeTileAt(tx, ty); this.tileCache.delete(key);
            }
        });
    }

    // === UI BARS ===

    createTimeBar() {
        const barWidth = this.cameras.main.width * 0.9, barHeight = 19, barX = this.cameras.main.width * 0.05, barY = 30;
        this.timeBarBg = this.add.graphics().fillStyle(0x333333, 1).fillRect(0, 0, barWidth, barHeight).setPosition(barX, barY).setScrollFactor(0);
        this.timeBar = this.add.graphics().fillStyle(0x00a8ff, 1).fillRect(0, 0, 0, barHeight).setPosition(barX, barY).setScrollFactor(0);
        this.timeText = this.add.text(this.cameras.main.centerX, barY - 8, '15:00', {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        const checkpointMinutes = [3, 6, 9, 12];
        this.checkpointMarkers = [];
        checkpointMinutes.forEach(min => {
            const checkpointX = barX + (barWidth * (min / this.totalMinutes));
            const marker = this.add.graphics()
                .lineStyle(2, 0xffffff, 0.5).beginPath()
                .moveTo(checkpointX, barY)
                .lineTo(checkpointX, barY + barHeight)
                .strokePath().setScrollFactor(0).setDepth(1002);
            this.checkpointMarkers.push({ marker, min });
        });
    }
    updateTimeBar() {
        const barWidth = this.cameras.main.width * 0.9, timePercent = this.elapsedTime / this.totalGameTime;
        this.timeBar.clear().fillStyle((this.totalGameTime - this.elapsedTime) < 30000 ? 0xff0000 : 0x00a8ff, 1)
            .fillRect(0, 0, barWidth * timePercent, 20);
        const remainingTime = this.totalGameTime - this.elapsedTime, minutes = Math.floor(remainingTime / 60000),
            seconds = Math.floor((remainingTime % 60000) / 1000);
        this.timeText.setText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        this.updateCheckpointMarkers();
    }
    updateCheckpointMarkers() {
        const minutesElapsed = this.elapsedTime / 60000;
        this.checkpointMarkers.forEach(({ marker, min }) => {
            marker.clear();
            marker.lineStyle(minutesElapsed >= min ? 4 : 2, minutesElapsed >= min ? 0xffe066 : 0xffffff, minutesElapsed >= min ? 1 : 0.5);
            const barWidth = this.cameras.main.width * 0.9, barX = this.cameras.main.width * 0.05, barY = 30, barHeight = 19,
                checkpointX = barX + (barWidth * (min / this.totalMinutes));
            marker.beginPath().moveTo(checkpointX, barY).lineTo(checkpointX, barY + barHeight).strokePath();
        });
    }
    createHealthBar() {
        const barWidth = 80, barHeight = 10;
        this.healthBarBg = this.add.graphics(); this.healthBar = this.add.graphics();
        this.healthBarContainer = this.add.container(this.player.x, this.player.y - 40);
        this.healthBarContainer.add([this.healthBarBg, this.healthBar]);
        this.hpText = this.add.text(30, 60, `HP: ${this.playerHP}`, {
            fontSize: '24px', fill: '#fff', fontFamily: 'Arial', backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setScrollFactor(0).setDepth(1003);
    }
    updateHealthBar() {
        const barWidth = 80, barHeight = 10, healthPercent = this.playerHP / 5;
        this.healthBarBg.clear(); this.healthBar.clear();
        this.healthBarBg.fillStyle(0x333333, 1).fillRect(-barWidth / 2, 0, barWidth, barHeight);
        this.healthBar.fillStyle(0xff0000, 1).fillRect(-barWidth / 2, 0, barWidth * healthPercent, barHeight);
        this.healthBarBg.lineStyle(1, 0xffffff, 1).strokeRect(-barWidth / 2, 0, barWidth, barHeight);
    }
    createLevelUI() {
        const xpBarWidth = this.cameras.main.width * 0.8, xpBarHeight = 20, xpBarX = this.cameras.main.width * 0.1,
            xpBarY = this.cameras.main.height - 40;
        this.xpBarBg = this.add.graphics().fillStyle(0x333333, 1)
            .fillRect(0, 0, xpBarWidth, xpBarHeight).setPosition(xpBarX, xpBarY).setScrollFactor(0).setDepth(1000);
        this.xpBar = this.add.graphics().fillStyle(0xffff00, 1)
            .fillRect(0, 0, 0, xpBarHeight).setPosition(xpBarX, xpBarY).setScrollFactor(0).setDepth(1001);
        this.xpText = this.add.text(this.cameras.main.centerX, xpBarY - 22, `XP: ${this.playerXP} / ${this.nextLevelXP}`, {
            fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial', backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 2, bottom: 2 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
        this.levelText = this.add.text(30, 100, `Level: ${this.playerLVL}`, {
            fontSize: '24px', fill: '#fff', fontFamily: 'Arial', backgroundColor: '#000000AA',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setScrollFactor(0).setDepth(1003);
        this.upgradesText = this.add.text(
            30, 140,
            '',
            {
                fontSize: '18px',
                fill: '#00ff00',
                fontFamily: 'Arial',
                backgroundColor: '#000000AA',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        ).setScrollFactor(0).setDepth(1003);
        this.updateUpgradesText();
    }
    updateLevelText() {
        this.levelText.setText(`Level: ${this.playerLVL}`);
        this.xpText.setText(`XP: ${this.playerXP} / ${this.nextLevelXP}`);
        const xpBarWidth = this.cameras.main.width * 0.8, xpPercent = Phaser.Math.Clamp(this.playerXP / this.nextLevelXP, 0, 1);
        this.xpBar.clear().fillStyle(0xffff00, 1).fillRect(0, 0, xpBarWidth * xpPercent, 20);
    }

    // === ENEMY, BULLET, NPC & COIN LOGIC ===

    spawnSecondEnemy() {
        const opt = GameOptions.secondEnemy;
        const active = this.enemyGroup.getChildren().filter(e => e.texture.key === opt.texture && e.active).length;
        if (active >= opt.maxActive || (this.activeEnemies && this.activeEnemies.second >= 3)) return;


        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;

        enemy.type = 'second';

        if (this.activeEnemies) {
            this.activeEnemies.second++;
        }

        if (enemy.anims && enemy.anims.animationManager.exists('gatoPernas')) {
            enemy.play('gatoPernas');
        }
        this.enemyGroup.add(enemy);

        enemy.on('destroy', () => {
            if (this.activeEnemies) {
                this.activeEnemies.second--;
                this.time.delayedCall(2000, () => this.spawnSecondEnemy()); // Respawn após 2 segundos
            }
        });
    }

    spawnThirdEnemy() {
        const opt = GameOptions.thirdEnemy;
        const active = this.enemyGroup.getChildren().filter(e => e.texture.key === opt.texture && e.active).length;
        if (active >= opt.maxActive || (this.activeEnemies && this.activeEnemies.third >= 3)) return;

        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;

        enemy.type = 'third';

        if (this.activeEnemies) {
            this.activeEnemies.third++;
        }

        if (enemy.anims && enemy.anims.animationManager.exists('gatoPreto')) {
            enemy.play('gatoPreto');
        }
        this.enemyGroup.add(enemy);

        enemy.on('destroy', () => {
            if (this.activeEnemies) {
                this.activeEnemies.third--;
                this.time.delayedCall(2000, () => this.spawnThirdEnemy()); // Respawn após 2 segundos
            }
        });
    }

    spawnFourthEnemy() {
        const opt = GameOptions.fourthEnemy;
        const active = this.enemyGroup.getChildren().filter(e => e.texture.key === opt.texture && e.active).length;
        if (active >= opt.maxActive || (this.activeEnemies && this.activeEnemies.fourth >= 3)) return;

        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;

         enemy.type = 'fourth';

        if (this.activeEnemies) {
            this.activeEnemies.fourth++;
        }
        if (enemy.anims && enemy.anims.animationManager.exists('gatoCapuz')) {
            enemy.play('gatoCapuz');
        }
        this.enemyGroup.add(enemy);
        enemy.on('destroy', () => {
            if (this.activeEnemies) {
                this.activeEnemies.second--;
                this.time.delayedCall(2000, () => this.spawnFourthEnemy()); // Respawn após 2 segundos
            }
        });
    }

    spawnBoss() {
        if (this.bossSpawned || this.activeEnemies.boss > 0) return;

        const opt = GameOptions.fifthEnemy;
        const { x, y } = this._randomOffscreenPosition();
        
        const boss = this.physics.add.sprite(x, y, opt.texture)
            .setDisplaySize(opt.size, opt.size)
            .setSize(opt.size, opt.size);
        
        boss.health = opt.health;
        boss.damage = opt.damage;
        boss.type = 'boss';

        // Efeito visual ao spawnar
        boss.setAlpha(0);
        this.tweens.add({
            targets: boss,
            alpha: 1,
            duration: 2000,
            ease: 'Power2'
        });

        this.activeEnemies.boss++;
        this.bossSpawned = true;
        this.enemyGroup.add(boss);

        // Animação do boss
        if (boss.anims && boss.anims.animationManager.exists('boss')) {
            boss.play('boss');
        }

        this.enemyGroup.add(boss);

        // Efeito sonoro ao spawnar (se tiver sistema de áudio)
        // this.sound.play('bossSpawnSound');

        boss.on('destroy', () => {
            this.activeEnemies.boss--;
            // Não faz respawn - boss aparece apenas uma vez
            this.spawnCoinCluster(boss.x, boss.y, 20); // Muitas moedas ao derrotar o boss
            // this.sound.play('bossDefeatSound');
        });
    }

    _randomOffscreenPosition() {
        const cam = this.cameras.main, padding = 100;
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        switch (side) {
            case 0: x = Phaser.Math.Between(cam.scrollX - padding, cam.scrollX + cam.width + padding); y = cam.scrollY - padding; break;
            case 1: x = cam.scrollX + cam.width + padding; y = Phaser.Math.Between(cam.scrollY - padding, cam.scrollY + cam.height + padding); break;
            case 2: x = Phaser.Math.Between(cam.scrollX - padding, cam.scrollX + cam.width + padding); y = cam.scrollY + cam.height + padding; break;
            case 3: x = cam.scrollX - padding; y = Phaser.Math.Between(cam.scrollY - padding, cam.scrollY + cam.height + padding); break;
        }
        return { x, y };
    }
    takeDamage() {
        if (this.isInvulnerable) return;
        this.playerHP--; this.hpText.setText(`HP: ${this.playerHP}`); this.updateHealthBar();
        this.isInvulnerable = true; this.player.setTint(0xff0000);
        const blinkInterval = this.time.addEvent({
            delay: 100, callback: () => { this.player.alpha = this.player.alpha === 1 ? 0.5 : 1; }, repeat: 10
        });
        this.time.delayedCall(1000, () => {
            this.isInvulnerable = false; this.player.clearTint(); this.player.setAlpha(1); blinkInterval.destroy();
        });
        if (this.playerHP <= 0) this.gameOver();
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
        this.time.addEvent({
            delay: GameOptions.enemyRate, loop: true, callback: () => {
                const camera = this.cameras.main, cameraBounds = new Phaser.Geom.Rectangle(camera.scrollX, camera.scrollY, camera.width, camera.height),
                    spawnArea = new Phaser.Geom.Rectangle(cameraBounds.x - 100, cameraBounds.y - 100, cameraBounds.width + 200, cameraBounds.height + 200),
                    side = Phaser.Math.Between(0, 3); let spawnPoint;
                switch (side) {
                    case 0: spawnPoint = new Phaser.Geom.Point(Phaser.Math.Between(spawnArea.left, spawnArea.right), spawnArea.top); break;
                    case 1: spawnPoint = new Phaser.Geom.Point(spawnArea.right, Phaser.Math.Between(spawnArea.top, spawnArea.bottom)); break;
                    case 2: spawnPoint = new Phaser.Geom.Point(Phaser.Math.Between(spawnArea.left, spawnArea.right), spawnArea.bottom); break;
                    case 3: spawnPoint = new Phaser.Geom.Point(spawnArea.left, Phaser.Math.Between(spawnArea.top, spawnArea.bottom)); break;
                }
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'gatoSlime').setDisplaySize(200, 200).setSize(100, 100);
                this.enemyGroup.add(enemy); enemy.play('gatoSlime');
            }
        });
        this.time.delayedCall(GameOptions.secondEnemy.spawnTime, () => {
            this.time.addEvent({
                delay: GameOptions.secondEnemy.spawnInterval, loop: true, callback: this.spawnSecondEnemy, callbackScope: this
            });
        });
        this.time.delayedCall(GameOptions.thirdEnemy.spawnTime, () => {
            this.time.addEvent({
                delay: GameOptions.thirdEnemy.spawnInterval,
                loop: true,
                callback: this.spawnThirdEnemy,
                callbackScope: this
            });
        });
        this.time.delayedCall(GameOptions.fourthEnemy.spawnTime, () => {
            this.time.addEvent({
                delay: GameOptions.fourthEnemy.spawnInterval,
                loop: true,
                callback: this.spawnFourthEnemy,
                callbackScope: this
            });
        });
        this.time.addEvent({
            delay: this.bulletRate, loop: true, callback: () => {
                const closestEnemy = this.physics.closest(this.player, this.enemyGroup.getChildren());
                if (closestEnemy !== null || this.selectedCharacterIndex === 1 || this.selectedCharacterIndex === 0) {
                    switch (this.selectedCharacterIndex) {
                        // Paladino - Floating Orb
                        case 0:
                            if (!this.orb || !this.orb.active) {
                                this.orb = this.physics.add.sprite(this.player.x + 100, this.player.y, 'armas', 5)
                                    .setDisplaySize(150, 150)
                                    .setSize(80, 80)
                                    .setCircle(40);

                                this.bulletGroup.add(this.orb);

                                // Initialize orb speed and angle
                                this.orb.orbitAngle = 0;
                                this.orb.orbitSpeed = 0.025; // Set your starting speed

                                this.physics.add.overlap(this.orb, this.enemyGroup, (orb, enemy) => {
                                    if (!enemy.lastHitTime || this.time.now - enemy.lastHitTime > 300) {
                                        enemy.lastHitTime = this.time.now;

                                        if (enemy.health === undefined || enemy.health === null) {
                                            enemy.health = 1;
                                        }

                                        this.colissions(enemy);

                                        enemy.setTint(0xff0000);
                                        this.time.delayedCall(100, () => {
                                            if (enemy.active) enemy.clearTint();
                                        });
                                    }
                                });
                            }
                            if (!this.orbEvent) {
                                this.orbEvent = this.time.addEvent({
                                    delay: 16,
                                    loop: true,
                                    callback: () => {
                                        if (this.orb?.active && this.player?.active) {
                                            this.orb.orbitAngle = (this.orb.orbitAngle + this.orb.orbitSpeed) % (2 * Math.PI);
                                            this.orb.x = this.player.x + 100 * Math.cos(this.orb.orbitAngle);
                                            this.orb.y = this.player.y + 100 * Math.sin(this.orb.orbitAngle);
                                        }
                                    }
                                });
                            }
                        break;
                        // Bardo - Boomerang
                        case 1:
                            if (closestEnemy) {
                                for (let i = 0; i < this.playerBulletCount; i++) {
                                    this.time.delayedCall(i * 300, () => { 
                                        const boomerang = this.physics.add.sprite(this.player.x, this.player.y, 'armas', 12)
                                            .setDisplaySize(80, 80)
                                            .setSize(80, 80);
                                        this.boomerangGroup.add(boomerang);

                                        boomerang.isReturning = false;

                                        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.x, closestEnemy.y);
                                        this.physics.velocityFromRotation(angle, GameOptions.bulletSpeed, boomerang.body.velocity);

                                        // Add an update event to track boomerang returning
                                        boomerang.updateReturn = () => {
                                            if (boomerang.isReturning) {
                                                // Continuously move the boomerang toward the player's current position
                                                this.physics.moveToObject(boomerang, this.player, GameOptions.bulletSpeed);
                                            }
                                        };

                                        this.events.on('update', () => {
                                            if (boomerang.active) {
                                                boomerang.updateReturn();
                                            }
                                        });

                                        // Enemy collision stays the same
                                        this.physics.add.overlap(boomerang, this.enemyGroup, (boomerang, enemy) => {
                                            if (!boomerang.isReturning) {
                                                boomerang.isReturning = true;
                                                boomerang.setFrame(13);
                                                this.physics.moveToObject(boomerang, this.player, GameOptions.bulletSpeed);

                                                this.colissions(enemy); // 
                                            } else {
                                                this.colissions(enemy); // 
                                                boomerang.destroy();
                                            }
                                        });
                                        // Player collision same as before
                                        this.physics.add.overlap(this.player, boomerang, () => {
                                            if (boomerang.active && boomerang.isReturning) {
                                                boomerang.destroy();
                                            }
                                        });
                                    });
                                }
                            }
                            break;
                        // Arqueira - Default Weapon
                        case 2: // Arqueira
                            if (closestEnemy) {
                                for (let i = 0; i < this.playerBulletCount; i++) {
                                    this.time.delayedCall(i * 300, () => {
                                        const dx = closestEnemy.x - this.player.x;
                                        const dy = closestEnemy.y - this.player.y;

                                        let arrowFrame = 1;
                                        if (Math.abs(dx) > Math.abs(dy)) {
                                            arrowFrame = dx > 0 ? 1 : 3;
                                        } else {
                                            arrowFrame = dy > 0 ? 4 : 2; 
                                        }
                                        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'armas', arrowFrame)
                                            .setDisplaySize(100, 100)
                                            .setSize(100, 100);

                                        this.bulletGroup.add(bullet);
                                        this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);

                                        this.time.delayedCall(4000, () => {
                                            if (bullet && bullet.active) bullet.destroy();
                                        });
                                    });
                                }
                            }
                            break;
                        // Ladina - Shoots in facing direction
                        case 3:
                            let dx = 0, dy = 0;
                            let daggerFrame = 0;
                            switch (this.lastDirection) {
                                case 'up': dy = -1; daggerFrame = 8; break;
                                case 'down': dy = 1; daggerFrame = 10; break;
                                case 'left': dx = -1; daggerFrame = 9; break;
                                case 'right': dx = 1; daggerFrame = 7; break;
                            }

                            for (let i = 0; i < this.playerBulletCount; i++) {
                                this.time.delayedCall(i * 300, () => {
                                    const dagger = this.physics.add.sprite(this.player.x, this.player.y, 'armas', daggerFrame)
                                        .setDisplaySize(120, 120)
                                        .setSize(120, 120);
                                    this.bulletGroup.add(dagger);
                                    dagger.setVelocity(dx * GameOptions.bulletSpeed, dy * GameOptions.bulletSpeed);

                                    this.time.delayedCall(3000, () => {
                                        if (dagger && dagger.active) dagger.destroy();
                                    });
                                });
                            }
                        break;
                    }
                }
            }
        });
    }
    setupCollisions() {
        this.physics.add.collider(this.player, this.enemyGroup, () => { this.takeDamage(); });
        this.physics.add.collider(this.bulletGroup, this.enemyGroup, (bullet, enemy) => {
            if (this.selectedCharacterIndex === 0 && bullet === this.orb) {
                enemy.health--;
                enemy.setTint(0xff0000);

                this.time.delayedCall(100, () => {
                    if (enemy.active) enemy.clearTint();
                });

                if (enemy.health <= 0) {
                    this.spawnCoinCluster(enemy.x, enemy.y, 3);
                    enemy.destroy();
                }

                return;
            }

            if (this.selectedCharacterIndex === 1 && (bullet.frame.name === 12 || bullet.frame.name === 13)) {
                this.colissions(enemy);
                return;
            }

            if (this.selectedCharacterIndex === 3) {
                this.colissions(enemy);
                this.colissions(enemy);
                bullet.destroy();
                return; 
            }

            bullet.destroy();
            this.colissions(enemy);
        });

        if (this.selectedCharacterIndex === 0 && this.orb) {
            this.physics.add.overlap(this.orb, this.enemyGroup, (orb, enemy) => {
                if (!enemy.lastHitTime || this.time.now - enemy.lastHitTime > 300) { // 300ms cooldown per enemy
                    enemy.lastHitTime = this.time.now;

                    if (enemy.health === undefined || enemy.health === null) {
                        enemy.health = 1; // Assume normal enemies have 1 HP
                    }

                    enemy.health--;
                    enemy.setTint(0xff0000);

                    this.time.delayedCall(100, () => {
                        if (enemy.active) enemy.clearTint();
                    });

                    if (enemy.health <= 0) {
                        this.spawnCoinCluster(enemy.x, enemy.y, 1);
                        enemy.destroy();
                    }
                }
            });
        }
        this.physics.add.collider(this.player, this.coinGroup, (player, coin) => {
            this.playerXP += 10 + this.coinXPBonus;
            if (this.playerXP >= this.nextLevelXP) this.levelUP(); else this.updateLevelText();
            this.coinGroup.killAndHide(coin); coin.body.checkCollision.none = true;
        });
        this.physics.add.overlap(this.player, this.npcGroup, (player, npc) => {
            if (!npc.collected) { npc.collected = true; npc.destroy(); this.npcArrow?.setVisible(false); this.npcArrow.target = null; this.upgradeTime(); }
        });
    }
    colissions(enemy){
            const enemyType = enemy.texture?.key;

            if (enemyType === 'gatoPernas') {
                enemy.health--;
                enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.setTint(GameOptions.secondEnemy.color); });
                if (enemy.health <= 0) { this.spawnCoinCluster(enemy.x, enemy.y, 5); enemy.destroy(); }
            }
            else if (enemyType === 'gatoPreto') {
                enemy.health--;
                enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.setTint(GameOptions.thirdEnemy.color); });
                if (enemy.health <= 0) { this.spawnCoinCluster(enemy.x, enemy.y, 6); enemy.destroy(); }
            }
            else if (enemyType === 'gatoCapuz') {
                enemy.health--;
                enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.setTint(GameOptions.fourthEnemy.color); });
                if (enemy.health <= 0) { this.spawnCoinCluster(enemy.x, enemy.y, 8); enemy.destroy(); }
            }
            else if (enemyType === 'boss') {
                enemy.health--;
                enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.setTint(GameOptions.fifthEnemy.color); });
                if (enemy.health <= 0) {
                    this.spawnCoinCluster(enemy.x, enemy.y, 20);
                    enemy.destroy();
                    this.time.delayedCall(1000, () => { this.showBossDefeatedMessage(); });
                }
            }
            else {
                this.spawnCoinCluster(enemy.x, enemy.y, 1);
                enemy.destroy();
            }
    }

    showBossDefeatedMessage() {
        this.music.stop()
        this.scene.start("victoryScene", {
            characterIndex: this.selectedCharacterIndex 
        });
    }
    spawnCoinCluster(x, y, count) {
        for (let i = 0; i < count; i++) {
            const coin = this.physics.add.sprite(x, y, 'coin').setDisplaySize(50, 50).setSize(40, 40);
            this.coinGroup.add(coin);
        }
    }
    handlePlayerMovement() {
        if (!this.player) return;
        let direction = null, movementDirection = new Phaser.Math.Vector2(0, 0);
        if (this.controlKeys.right.isDown) { movementDirection.x++; direction = 'right'; }
        if (this.controlKeys.left.isDown) { movementDirection.x--; direction = 'left'; }
        if (this.controlKeys.up.isDown) { movementDirection.y--; direction = 'up'; }
        if (this.controlKeys.down.isDown) { movementDirection.y++; direction = 'down'; }
        movementDirection.normalize();
        this.player.setVelocity(movementDirection.x * GameOptions.playerSpeed, movementDirection.y * GameOptions.playerSpeed);
        if (direction) {
            this.lastDirection = direction; this.player.anims.play(`walk-${direction}`, true);
        } else {
            const idleFrames = { up: 12, down: 0, left: 8, right: 4 };
            this.player.anims.stop(); this.player.setFrame(idleFrames[this.lastDirection]);
        }
    }
    collectCoins() {
        if (!this.player) return;
        const coinsInCircle = this.physics.overlapCirc(this.player.x, this.player.y, GameOptions.magnetRadius, true, true);
        coinsInCircle.forEach((body) => {
            const bodySprite = body.gameObject;
            if (bodySprite.texture.key == 'coin') this.physics.moveToObject(bodySprite, this.player, 500);
        });
    }

    // === LEVEL & UPGRADE LOGIC ===

    levelUP() {
        this.playerLVL++; this.playerXP -= this.nextLevelXP;
        this.nextLevelXP = Math.floor(this.nextLevelXP * 1.2);
        this.updateLevelText();
        this.upgradeTime();
    }
    upgradeTime() {
        this.isPaused = true;
        this.physics.pause();
        this.levelUpUI = [];

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Overlay
        const overlay = this.add.rectangle(
            centerX, centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.6
        ).setScrollFactor(0).setDepth(2000);
        this.levelUpUI.push(overlay);

        // Title
        const title = this.add.text(
            centerX, centerY - 300,
            'Subiu de Nível! Escolha uma melhoria:',
            { fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        this.levelUpUI.push(title);

        // Shuffle upgrades and pick three
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

            // Transparent interactive rectangle for interaction and border
            const box = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x222222, 0)
                .setStrokeStyle(4, 0xffffff)
                .setScrollFactor(0)
                .setInteractive()
                .setDepth(2001)
                .on('pointerover', () => box.setStrokeStyle(4, 0xffff00))
                .on('pointerout', () => box.setStrokeStyle(4, 0xffffff))
                .on('pointerdown', () => {
                    upgrade.effect();
                    this.upgradeCounts[upgrade.type] = (this.upgradeCounts[upgrade.type] || 0) + 1;
                    this.updateUpgradesText();
                    this.resumeGameAfterLevelUp();
                });
            // Full-size sprite for the upgrade
            const sprite = this.add.sprite(boxX, boxY, upgrade.spriteKey)
                .setDisplaySize(boxWidth, boxHeight)
                .setScrollFactor(0)
                .setDepth(2002);

            this.levelUpUI.push(box, sprite);
        });
    }
    resumeGameAfterLevelUp() {
        this.isPaused = false; this.physics.resume();
        this.levelUpUI.forEach(el => el.destroy()); this.levelUpUI = [];
        this.updateHealthBar(); this.updateLevelText();
    }
    updateUpgradesText() {
        const labels = {
            hp: "HP",
            speed: "Velocidade",
            bulletSpeed: "Tiro rápido",
            magnet: "Raio",
            rate: "Rate",
            multi: "Tiro Simultâneo",
            xpcoin: "XP",
            doublecoin: "Moeda dupla"
        };
        let text = '';
        for (const key in this.upgradeCounts) {
            if (this.upgradeCounts[key] > 0) {
                text += `${labels[key]}: ${this.upgradeCounts[key]}\n`;
            }
        }
        if (!text) text = "(Nenhum upgrade ainda)";
        this.upgradesText.setText(text);
    }

    // === ENEMY & NPC MOVEMENT ===

    moveEnemies() {
        if (!this.player) return;
        this.enemyGroup.getChildren().forEach((enemy) => {
            if (enemy.active) this.physics.moveToObject(enemy, this.player, GameOptions.enemySpeed);
        });
    }
    updateGameTimer(delta) {
        if (this.isPaused) return;
        this.elapsedTime += delta;
        if (Math.floor(this.elapsedTime / 1000) > Math.floor((this.elapsedTime - delta) / 1000)) this.updateTimeBar();
        if (this.elapsedTime >= this.totalGameTime) this.gameOver();
        const elapsedMinutes = Math.floor(this.elapsedTime / 60000);
        this.npcCheckpoints.forEach(min => {
            if (elapsedMinutes === min && !this.npcVisited.has(min)) {
                this.spawnNPC(min); this.npcVisited.add(min);
            }
        });
    }
    spawnNPC(minuteCheckpoint) {
        const cam = this.cameras.main, padding = 300;
        const x = Phaser.Math.Between(cam.scrollX - padding, cam.scrollX + cam.width + padding),
            y = Phaser.Math.Between(cam.scrollY - padding, cam.scrollY + cam.height + padding);
        const npc = this.physics.add.sprite(x, y, 'npcSprites').setDisplaySize(150, 150);
        npc.checkpointMinute = minuteCheckpoint; this.npcGroup.add(npc);
        if (!this.npcArrow) {
            this.npcArrow = this.add.sprite(0, 20, 'armas', 1).setScrollFactor(0).setDepth(5000);
            this.npcArrow.setDisplaySize(100, 100);
        } 
        this.npcArrow.setVisible(true);
        this.npcArrow.target = npc;
    }

    // === GAME OVER ===

    gameOver() {
        this.physics.pause();
        if (this.player) { this.player.setTint(0xff0000); this.player.setAlpha(0.7); }
        const centerX = this.cameras.main.width / 2, centerY = this.cameras.main.height / 2;
        this.gameOverText = this.add.text(centerX, centerY - 50, 'GAME OVER', {
            fontSize: '64px', fill: '#ff0000', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
        this.restartText = this.add.text(centerX, centerY + 50, 'Pressione R para reiniciar', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
        this.gameOverText.setAlpha(0); this.restartText.setAlpha(0);
        if (this.tweens) {
            this.tweens.add({
                targets: [this.gameOverText, this.restartText], alpha: 1, ease: 'Linear'
            });
        }
        console.log('Restarting scene with:', {
            characterIndex: this.selectedCharacterIndex,
            spawnX: this.initialSpawnX,
            spawnY: this.initialSpawnY
        });
        this.music.stop(); 
        this.input.keyboard?.once('keydown-R', () => { 
        this.scene.restart({ characterIndex: this.selectedCharacterIndex, spawnX: this.player.x, spawnY: this.player.y }); });
        this.timeBar.clear().fillStyle(0xff0000, 1).fillRect(0, 0, this.cameras.main.width * 0.9, 20);
    }
}
