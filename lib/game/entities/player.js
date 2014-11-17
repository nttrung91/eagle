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

            //weapon: 0,
            //totalWeapons: 2,
            //activeWeapon: "EntityBullet",

            startPosition: null,


            /*
             |--------------------------------------------------------------------------
             | INIT: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the player.
             */
            init: function( x, y, settings ) {
                ig.game.player = this;
                this.startPosition = {x:x,y:y};
                this.addAnim( 'idle', 0.8, [0] );
                this.parent( x, y, settings );
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
                //flips for direction
                this.currentAnim.flip.x = this.flip;
                this.parent();
            },

            /*
             |--------------------------------------------------------------------------
             | DRAW: FUNCTION()
             |--------------------------------------------------------------------------
             | Draw the player. Used for the spawning invincibility animation.
             */
            draw: function() {
                this.parent();
            },

            /*
             |--------------------------------------------------------------------------
             | RECEIVEDAMAGE: FUNCTION()
             |--------------------------------------------------------------------------
             | Register damage to the player.
             */
            receiveDamage: function() {
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

    });
