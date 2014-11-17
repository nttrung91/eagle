ig.module(
    'game.entities.player'
)
    .requires(
    'impact.entity'
)
    .defines(function() {
        EntityPlayer = ig.Entity.extend({
            animSheet: new ig.AnimationSheet( 'media/player.png', 16, 16 ),
            size: {x: 8, y:14},
            offset: {x: 4, y: 2},
            flip: false,

            maxVel: {x: 100, y: 150},
            friction: {x: 600, y: 0},
            accelGround: 400,
            accelAir: 200,
            jump: 200,

            type: ig.Entity.TYPE.A,
            checkAgainst: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.PASSIVE,
            health: 20,

            weapon: 0,
            totalWeapons: 2,
            activeWeapon: "EntityBullet",

            startPosition: null,


            /*
             |--------------------------------------------------------------------------
             | INIT: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the player.
             */
            init: function( x, y, settings ) {
                ig.game.player = this; 
                // this.startPosition = {x:x,y:y};
                // this.addAnim( 'idle', 0.8, [0] ); 
                // this.parent( x, y, settings );
                this.parent( x, y, settings );
                this.setupAnimation(this.weapon);
                this.startPosition = {x:x, y:y}; 
                this.invincibleTimer = new ig.Timer();
                this.makeInvincible();                
            },

            /*
             |--------------------------------------------------------------------------
             | SETUPANIMATION: FUNCTION()
             |--------------------------------------------------------------------------
             | Create animation based on sprites in an array. Change sprite set with offset
             | based on the activeWeapon.
             */
            setupAnimation: function(offset){
                offset = offset * 11; // number of sprites
                this.addAnim('idle', 1, [0+offset]);
                this.addAnim('run', .07, [1+offset,2+offset,3+offset,4+offset,5+offset]);
                this.addAnim('jump', 1, [6+offset]);
                this.addAnim('fall', 0.4, [7+offset]);
            },


            /*
             |--------------------------------------------------------------------------
             | UPDATE: FUNCTION()
             |--------------------------------------------------------------------------
             | Update the player.
             */
            update: function() {

                //handle keyboard input
                var accel = this.standing ? this.accelGround : this.accelAir;
                if (ig.input.state('left')) {
                    this.accel.x = -accel;
                    this.flip = true; //face left
                } else if (ig.input.state('right')) {
                    this.accel.x = accel;
                    this.flip = false; //face right
                } else {
                    this.accel.x = 0;
                }
                // jump
                if( this.standing && ig.input.pressed('jump') ) {
                    this.vel.y = -this.jump;
                }

                // shoot, changed EntityBullet to activeWeapon
                if( ig.input.pressed('shoot') ) {
                    ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
                }

                // switch weapon to bullet or shotgun
                if( ig.input.pressed('switch') ) {
                    this.weapon ++;
                    if(this.weapon >= this.totalWeapons)
                        this.weapon = 0;
                    switch(this.weapon){
                        case(0):
                            this.activeWeapon = "EntityBullet";
                            break;
                        case(1):
                            this.activeWeapon = "EntityShotgunBullet";
                        break;
                    }
                    this.setupAnimation(this.weapon);
                }
                // set the current animation, based on player's speed
                if( this.vel.y < 0) {
                    this.currentAnim = this.anims.jump;
                }
                else if( this.vel.y > 0 ) {
                    this.currentAnim = this.anims.fall;
                }
                else if( this.vel.x != 0 ) {
                    this.currentAnim = this.anims.run;
                }
                else {
                    this.currentAnim = this.anims.idle;
                }

                //flips for direction
                this.currentAnim.flip.x = this.flip;
                
                if( this.invincibleTimer.delta() > this.invincibleDelay ) { // disable invincibility
                    this.invincible = false;
                    this.currentAnim.alpha = 1;
                }
                this.parent();
            },

           

            /*
             |--------------------------------------------------------------------------
             | DRAW: FUNCTION()
             |--------------------------------------------------------------------------
             | Draw the player. Used for the spawning invincibility animation.
             */
            draw: function() {
                if(this.invincible)
                    this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;                
                this.parent();
            },

            /*
             |--------------------------------------------------------------------------
             | RECEIVEDAMAGE: FUNCTION()
             |--------------------------------------------------------------------------
             | Register damage to the player.
             */
            receiveDamage: function(amount, from) {
                if(this.invincible)
                    return;
                this.parent(amount, from);
            },

            /*
             |--------------------------------------------------------------------------
             | KILL: FUNCTION()
             |--------------------------------------------------------------------------
             | Kill the player.
             */
            kill: function() {
                this.parent();
                ig.game.stats.deaths ++;
                var x = this.startPosition.x;
                var y = this.startPosition.y;
                ig.game.respawnPosition = this.startPosition;
            },

            /*
             |--------------------------------------------------------------------------
             | MAKEINVINCIBLE: FUNCTION()
             |--------------------------------------------------------------------------
             | After the player is dies they will respawn with a few seconds of invicibility.
             */
            makeInvincible: function() { // toggle invicible function
                this.invincible = true;
                this.invincibleTimer.reset();
            },

            /*
             |--------------------------------------------------------------------------
             | ONDEATH: FUNCTION()
             |--------------------------------------------------------------------------
             | Called when the player has died.
             */
            onDeath: function() {
                ig.game.stats.deaths ++;
                ig.game.lives --;
                if(ig.game.lives < 0){
                    //ig.game.gameOver(); TO BE IMPLEMENTED LATER
                    ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, ig.game.respawnPosition.y);
                }else{
                    ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, ig.game.respawnPosition.y);
                }
            }

        });

            /*
             |--------------------------------------------------------------------------
             | BULLET: ENTITY
             |--------------------------------------------------------------------------
             | Handgun functionality...
             */
            EntityBullet = ig.Entity.extend({
                size: {x: 5, y: 3},
                animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
                maxVel: {x: 200, y: 0},
                type: ig.Entity.TYPE.NONE,
                checkAgainst: ig.Entity.TYPE.B,
                collides: ig.Entity.COLLIDES.PASSIVE,
                init: function( x, y, settings ) {
                    this.parent( x + (settings.flip ? -4 : 8) , y+4, settings ); // bullet position
                    this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                    this.addAnim( 'idle', 0.2, [0] );
                },
                handleMovementTrace: function( res ) {
                    this.parent( res );
                    if( res.collision.x || res.collision.y ){
                        this.kill();
                    }
                },
                check: function( other ) {
                    other.receiveDamage( 3, this );
                    this.kill();
                }
            });

            /*
             |--------------------------------------------------------------------------
             | SHOTGUN: ENTITY
             |--------------------------------------------------------------------------
             | Shotgun functionality...
             */
            EntityShotgunBullet = ig.Entity.extend({
                size: {x: 7, y: 7},
                animSheet: new ig.AnimationSheet( 'media/shotgunbullet.png', 7, 7 ),
                maxVel: {x: 200, y: 0},
                type: ig.Entity.TYPE.NONE,
                checkAgainst: ig.Entity.TYPE.B,
                collides: ig.Entity.COLLIDES.PASSIVE,
                init: function( x, y, settings ) {
                    this.parent( x  + (settings.flip ? -10 : 10) , y + 2, settings ); // bullet position
                    this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                    this.addAnim( 'idle', 0.2, [0] );
                    this.timer = new ig.Timer(0.2);
                },
                handleMovementTrace: function( res) {
                    
                    this.parent( res );
                    if( res.collision.x || res.collision.y ){
                        this.kill();
                        
                    }
                },
                check: function( other ) {
                    other.receiveDamage( 50, this );
                    this.kill();
                },

                update: function() {
                    if (this.timer.delta() > 0) {
                        this.kill();
                    }
                    this.parent();            
                }
            }); 

    });
