var game = new Phaser.Game(800, 500, Phaser.AUTO, document.getElementById('game'));
var Game = {};

var backgroundMap;
var playerShip;
var enemyShip;
var cursors;
var direction = 1;
var boom;
var enemyBullets;
var playerBullets;
var bullet;
var pbullet;
var fire;

Game.init = function () {
    //game.stage.disableVisibilityChange = true;
    //game.time.advancedTiming = true;
};

Game.preload = function () {
    game.load.image('background', 'assets/starfield.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('playerBullet', 'assets/bullet.png');
    game.load.image('enemy', 'assets/invader.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('boom', 'assets/explode.png', 128, 128);
};

Game.create = function () {
    backgroundMap = game.add.tileSprite(0, 0, 800, 500, 'background');
    game.physics.enable(backgroundMap, Phaser.Physics.ARCADE);
    // backgroundMap.body.collideWorldBounds = true;
    // backgroundMap.body.immovable = true;

    // playerShip sprite
    playerShip = game.add.sprite(400, 450, 'player');
    playerShip.scale.setTo(0.4, 0.4); // set playerShip size
    game.physics.arcade.enable(playerShip); // enable playerShip properties like velocity etc.
    playerShip.body.collideWorldBounds = true; // enable that playerShip hit the game world bound

    // playerBullets sprite group
    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    playerBullets.createMultiple(400, 'enemyBullet');

    // enemyShip sprite
    enemyShip = game.add.sprite(400, 400, 'enemy');
    game.physics.arcade.enable(enemyShip);
    // enemyShip.body.collideWorldBounds = true;

    // enemyBullets sprite group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.createMultiple(200, 'playerBullet');

    // explosion sprite group
    boom = game.add.group();
    boom.createMultiple(100, 'boom');
    boom.forEach(function (explosion) {
        explosion.animations.add('boom');
    });

    // keyboard listener
    cursors = game.input.keyboard.createCursorKeys();
    fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
};

Game.update = function () {
    
    // if playerShip is dead, respawn it in the center of the game world map
    if (playerShip.alive == false) {
        playerShip.reset(game.world.centerX, game.world.centerY);
        playerShip.revive();
    }
    
    // if enemyShip is on the x-coordinate 200 or 400 or 600 -> fire Bullets
    if (Math.floor(enemyShip.body.x) == 400 || Math.floor(enemyShip.body.x) == 200 || Math.floor(enemyShip.body.x) == 600) {
        for (var i = 0; i < 50; i++) {
            bullet = enemyBullets.getFirstDead();
            bullet.reset(enemyShip.body.x, enemyShip.body.y);
            bullet.body.velocity.x = Math.cos(i) * 100;
            bullet.body.velocity.y = Math.sin(i) * 100;
            bullet.checkWorldBounds = true;
            bullet.events.onOutOfBounds.add(function (bullet) {
                bullet.alive = false;
            });
        }
    }

    // backgroundMap movement
    backgroundMap.tilePosition.y += 2;

    // enemyShip ping pong movement
    enemyShip.body.velocity.x = 200 * direction;
    if (enemyShip.body.x >= 784) {
        direction = -1;
        for (var i = 0; i < 16; i++) {
            enemyShip.body.y += 0.3;
        }
    } else if (enemyShip.body.x <= 0) {
        direction = 1;
        for (var i = 0; i < 16; i++) {
            enemyShip.body.y += 0.3;
        }
    }

    // if enemyShip is out of the y-coordinate of the game world
    if (enemyShip.body.y > 500) {
        enemyShip.body.y = 0;
        enemyShip.body.x = 400;
    }

    // playerShip movement key input 
    playerShip.body.velocity.x = 0;
    playerShip.body.velocity.y = 0;
    if (cursors.left.isDown) {
        playerShip.body.velocity.x = -200;
    } else if (cursors.right.isDown) {
        playerShip.body.velocity.x = +200;
    } else if (cursors.up.isDown) {
        playerShip.body.velocity.y = -200;
    } else if (cursors.down.isDown) {
        playerShip.body.velocity.y = +200;
    }

    // playerShip fire Bullet key input
    if (fire.isDown) {
        for (var j = 0; j < 20; j++) {
            if (playerBullets.getFirstDead()) {
                pbullet = playerBullets.getFirstDead();
                pbullet.reset(playerShip.body.x, playerShip.body.y);
                pbullet.body.velocity.x = Math.cos(j) * 100;
                pbullet.body.velocity.y = Math.sin(j) * 100;
                pbullet.checkWorldBounds = true;
                pbullet.events.onOutOfBounds.add(function (pbullet) {
                    pbullet.alive = false;
                });
            }
        }
    }

    // check overlap
    game.physics.arcade.overlap(enemyBullets, playerShip, destroyPlayer, null, this);
    game.physics.arcade.overlap(enemyBullets, playerBullets, destroyBullet, null, this);
}

// destory playerShip if it is hit by enemyBullet
function destroyPlayer() {
    if (boom.getFirstExists(false)) {
        var explosion = boom.getFirstExists(false);
        explosion.reset(playerShip.body.x - 70, playerShip.body.y - 70);
        explosion.play('boom', 30, false, true);
        playerShip.kill();
    }
}

// destory player and enemy bullets if they overlap
function destroyBullet(playerBullet, enemyBullet) {
    if (boom.getFirstExists(false)) {
        var explosion = boom.getFirstExists(false);
        explosion.reset(playerBullet.body.x - 70, playerBullet.body.y - 70);
        explosion.play('boom', 30, false, true);
        playerBullet.kill();
        enemyBullet.kill();
    }

}

// start Game
game.state.add('Game', Game);
game.state.start('Game');
