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
    playerHP = 5;
    isInvulnerable = false;
    playerBulletCount = 1;
    bulletRate = GameOptions.bulletRate;

    // --- XP & Level ---
    playerLVL = 1;
    playerXP = 0;
    nextLevelXP = 100;

    // --- Coins ---
    coinXPBonus = 0;
    doubleCoinChance = 0; // 0 = 0%

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

    // --- Timer & Pause ---
    totalGameTime = 900000;
    totalMinutes = 15;
    elapsedTime = 0;
    isPaused = false;

    // --- Player Movement ---
    lastDirection = 'down';

    // --- Map Generation ---
    tileSize = 256;
    tileMap;
    tileLayer;
    tileset;
    tileCache = new Set();
    lastTileX = null;
    lastTileY = null;
    referenceX = 0;
    referenceY = 0;

    // --- Upgrades ---
    allUpgrades = [
        { label: 'Correr mais rápido', type: 'speed', spriteKey: 'upgrade_speed', effect: () => GameOptions.playerSpeed += 10 },
        { label: '+1 HP', type: 'hp', spriteKey: 'upgrade_hp', effect: () => this.playerHP = Math.min(this.playerHP + 1, 5) },
        { label: 'Tiros Velozes', type: 'bulletSpeed', spriteKey: 'upgrade_tiros', effect: () => GameOptions.bulletSpeed += 30 },
        { label: 'Maior raio de Coleta', type: 'magnet',spriteKey: 'upgrade_raio', effect: () => GameOptions.magnetRadius += 10 },
        { label: 'Atirar mais vezes', type: 'rate',spriteKey: 'upgrade_atirar', effect: () => this.bulletRate = Math.max(this.bulletRate - 50, 100) },
        { label: '+1 tiro simultâneo', type: 'multi',spriteKey: 'upgrade_multi', effect: () => this.playerBulletCount += 1 },
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
    }

    create() {
        // Camera & Player
        this.cameras.main.setScroll(0, 0);
        this.selectedCharacter = this.selectedSpriteKey;
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, this.selectedCharacter)
            .setDisplaySize(80, 80).setSize(80, 80);

        // Groups
        this.mapGeneration();
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
        if (this.npcArrow && this.npcArrow.target && this.npcArrow.target.active) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.npcArrow.target.x, this.npcArrow.target.y);
            this.npcArrow.setRotation(angle);
            this.npcArrow.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        } else {
            this.npcArrow?.setVisible(false);
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
        this.tileLayer = this.tileMap.createBlankLayer('Ground', this.tileset).setDepth(-10);
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
        if (active >= opt.maxActive) return;

        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;
        if (enemy.anims && enemy.anims.animationManager.exists('gatoPernas')) {
            enemy.play('gatoPernas');
        }
        this.enemyGroup.add(enemy);
    }

    spawnThirdEnemy() {
        const opt = GameOptions.thirdEnemy;
        const active = this.enemyGroup.getChildren().filter(e => e.texture.key === opt.texture && e.active).length;
        if (active >= opt.maxActive) return;

        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;
        if (enemy.anims && enemy.anims.animationManager.exists('gatoPreto')) {
            enemy.play('gatoPreto');
        }
        this.enemyGroup.add(enemy);
    }

    spawnFourthEnemy() {
        const opt = GameOptions.fourthEnemy;
        const active = this.enemyGroup.getChildren().filter(e => e.texture.key === opt.texture && e.active).length;
        if (active >= opt.maxActive) return;

        const { x, y } = this._randomOffscreenPosition();
        const enemy = this.physics.add.sprite(x, y, opt.texture);
        enemy.setDisplaySize(opt.size, opt.size);
        enemy.setSize(opt.size, opt.size);
        enemy.health = opt.health;
        enemy.damage = opt.damage;
        if (enemy.anims && enemy.anims.animationManager.exists('gatoCapuz')) {
            enemy.play('gatoCapuz');
        }
        this.enemyGroup.add(enemy);
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
                if (closestEnemy !== null) {
                    const dx = closestEnemy.x - this.player.x, dy = closestEnemy.y - this.player.y;
                    let bulletFrame = 1;
                    if (Math.abs(dx) > Math.abs(dy)) bulletFrame = dx > 0 ? 1 : 3;
                    else bulletFrame = dy > 0 ? 4 : 2;
                    for (let i = 0; i < this.playerBulletCount; i++) {
                        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'armas', bulletFrame)
                            .setDisplaySize(100, 100).setSize(100, 100);
                        this.bulletGroup.add(bullet);
                        this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
                        this.time.delayedCall(4000, () => { if (bullet && bullet.active) bullet.destroy(); }, [], this);
                    }
                }
            }
        });
    }
    setupCollisions() {
        this.physics.add.collider(this.player, this.enemyGroup, () => { this.takeDamage(); });
        this.physics.add.collider(this.bulletGroup, this.enemyGroup, (bullet, enemy) => {
            bullet.destroy();
            const isSecondEnemy = enemy.texture && enemy.texture.key === 'gatoPernas';
            if (!isSecondEnemy) enemy.body.checkCollision.none = true;
            if (isSecondEnemy) {
                enemy.health--; enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.setTint(GameOptions.secondEnemy.color); });
                if (enemy.health <= 0) { this.spawnCoinCluster(enemy.x, enemy.y, 5); enemy.destroy(); bullet.destroy(); }
            } else { this.spawnCoinCluster(enemy.x, enemy.y, 1); enemy.destroy(); bullet.destroy(); }
        });
        this.physics.add.collider(this.player, this.coinGroup, (player, coin) => {
            this.playerXP += 10 + this.coinXPBonus;
            if (this.playerXP >= this.nextLevelXP) this.levelUP(); else this.updateLevelText();
            this.coinGroup.killAndHide(coin); coin.body.checkCollision.none = true;
        });
        this.physics.add.overlap(this.player, this.npcGroup, (player, npc) => {
            if (!npc.collected) { npc.collected = true; npc.destroy(); this.npcArrow?.setVisible(false); this.upgradeTime(); }
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
            if (enemy.active) this.physics.moveToObject(enemy, thsis.player, GameOptions.enemySpeed);
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
            this.npcArrow = this.add.sprite(0, 20, 'armas', 1).setScrollFactor(0).setDepth(2000);
            this.npcArrow.setDisplaySize(100, 100);
        }
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
        this.input.keyboard?.once('keydown-R', () => { this.scene.restart(); });
        this.timeBar.clear().fillStyle(0xff0000, 1).fillRect(0, 0, this.cameras.main.width * 0.9, 20);
    }
}
