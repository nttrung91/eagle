ig.module(
    'game.entities.boss'
)
    .requires(
    'impact.entity'
)
    .defines(function(){

        EntityBoss = ig.Entity.extend({
            animSheet: new ig.AnimationSheet( 'media/drtansfordspritesheet.png', 52, 59 ), //fast:39x54, strong:52x58
            size: {x: 40, y:59},
            offset: {x: 4, y: 0},
            health: 50,

            maxVel: {x: 100, y: 200},
            friction: {x: 150, y: 0},
            speed: 54,
            flip: false,

            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            weapon: 0,
            totalWeapons: 1,
            activeWeapon: "StrongBullet",

            // Control Bullet Speed
            attackTimer: null,
            attackTimerDelay: 1,

            accelGround: 400,
            accelAir: 400,
            jump: 400,

            explodeSFX: new ig.Sound( 'media/audio/Smashing-Yuri_Santana-1233262689.*' ),
            /*
             |--------------------------------------------------------------------------
             | INIT: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the boss with a timer for bullets to prevent bullet spam.
             */
            init: function( x, y, settings ) {
                this.parent( x, y, settings );
                this.addAnim('walk', .07, [1,2,3,4,5]);
                // Create a timer for bullet
                this.attackTimer = new ig.Timer();

            },
            /*
             |--------------------------------------------------------------------------
             | UPDATE: FUNCTION()
             |--------------------------------------------------------------------------
             | Update the enemy. Includes the enemy AI.
             */
            update: function() {
                this.parent();

                // Initialize player variable by getting the player entity from the game.
                var player = ig.game.getEntitiesByType( EntityPlayer )[0];

                // Turn around if near an edge.
                if( !ig.game.collisionMap.getTile(
                        this.pos.x + (this.flip ? 0 : this.size.x ),
                        this.pos.y + this.size.y+1))
                {
                    this.flip = !this.flip;
                }
                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;
                this.currentAnim.flip.x = this.flip;

                // When player dies, it takes some time to generate new player
                // during that time, player object will be undefined; and
                // during that time frame, monster won't be able to detect player
                // Therefore the check is necessary to check if whether object is define or not
                if(player) {
                    // Henchman speeds up toward player within this range
                    if(this.distanceTo(player) < 300 && this.distanceTo(player) > 200) {
                        //Move left
                        if(this.pos.x > player.pos.x){
                            this.vel.x = -50;
                            this.flip = true;
                        }
                        //Move Right
                        if(this.pos.x < player.pos.x){
                            this.vel.x = 50;
                            this.flip = false;
                        }
                    } else if(this.distanceTo(player) < 200){
                        // Start Shooting
                        console.log("shoot");

                        //Spawn bullet for the equipped weapon.
                        if(this.attackTimer.delta() > this.attackTimerDelay) {
                            ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
                            this.attackTimer.reset();
                        }
                        //Flip to face player.
                        if(this.pos.x > player.pos.x){
                            this.flip = true;
                        }
                        //Flip to face player.
                        if(this.pos.x < player.pos.x){
                            this.flip = false;
                        }
                    }
                }
            },
            /*
             |--------------------------------------------------------------------------
             | HANDLEMOVEMENTTRACE: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the enemy.
             */
            handleMovementTrace: function( res ) {
                this.parent( res );
                // collision with a wall? return!
                if( res.collision.x ) {
                    this.flip = !this.flip;
                }
            },
            /*
             |--------------------------------------------------------------------------
             | CHECK: FUNCTION()
             |--------------------------------------------------------------------------
             | Check for kind of collision happening to the enemy.
             */
            check: function( other ) {
                other.receiveDamage( 1, this );

                /* If Zombie touches player, there is small invincible time frame where player doesn't receive damage */
                if(!other.invincible) {
                    other.invincibleTimer = new ig.Timer();
                    other.makeInvincible();
                }
            },
            /*
             |--------------------------------------------------------------------------
             | RECEIVEDAMAGE: FUNCTION()
             |--------------------------------------------------------------------------
             | Register damage to the enemy.
             */
            receiveDamage: function(value){
                this.parent(value);
                if(this.health > 0)
                    ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1});
            },
            /*
             |--------------------------------------------------------------------------
             | KILL: FUNCTION()
             |--------------------------------------------------------------------------
             | Kill the enemy.
             */
            kill: function(){
                ig.game.stats.kills ++;
                this.parent();
                this.explodeSFX.play();
                ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {colorOffset: 1});
                ig.system.setGame(CreditScreen)
            },
            jumpOver: function() {
                // jump, activates in jump.js
                this.vel.y = -this.jump;
            }
        });


        /*
         * Strong Henchman's Bullet
         */
        StrongBullet = ig.Entity.extend({
            size: {x: 5, y: 3},
            animSheet: new ig.AnimationSheet( 'media/drbullet.png', 5, 3 ),
            maxVel: {x: 200, y: 0},
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            init: function( x, y, settings ) {
                this.parent( x + (settings.flip ? -4 : 42) , y+14, settings ); //bullet position
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.addAnim( 'idle', 0.2, [0] );
            },
            //If the bullet hits a cliff, destroy the bullet.
            handleMovementTrace: function( res ) {
                this.parent( res );
                if( res.collision.x || res.collision.y ){
                    this.kill();
                }
            },
            //If the bullet hits the player, damage the player.
            check: function( other ) {
                other.receiveDamage( 4, this );
                this.kill();
            }
        });


    });
