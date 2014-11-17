ig.module(
    'game.entities.enemy'
)
    .requires(
    'impact.entity'
)
    .defines(function() {
        EntityEnemy = ig.Entity.extend({

            animSheet: new ig.AnimationSheet( 'media/enemy.png', 16, 16 ),
            size: {x: 8, y:14},
            offset: {x: 4, y: 2},

            maxVel: {x: 100, y: 100},
            flip: false,
            friction: {x: 150, y: 0},
            speed: 14,
            health: 10,

            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            attackRange: 1,

            /*
             |--------------------------------------------------------------------------
             | INIT: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the enemy.
             */
            init: function( x, y, settings ) {
                this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
                this.parent( x, y, settings );
                this.addAnim('walk', .07, [0,1]);
            },

            /*
             |--------------------------------------------------------------------------
             | UPDATE: FUNCTION()
             |--------------------------------------------------------------------------
             | Update the enemy.
             */
            update: function() {
                this.parent();
            },

            /*
             |--------------------------------------------------------------------------
             | HANDLEMOVEMENTTRACE: FUNCTION()
             |--------------------------------------------------------------------------
             | Adjusted from inherited method belonging to entity.js.
             */
            handleMovementTrace: function( res ) {
                this.parent( res );
                // if collision with a wall, then flip
                if( res.collision.x ) {
                    this.flip = !this.flip;
                }
            },

            /*
             |--------------------------------------------------------------------------
             | DRAW: FUNCTION()
             |--------------------------------------------------------------------------
             | Draw the enemy. Used for red flashing when damage has been inflicted.
             */
            draw: function() {
            },

            /*
             |--------------------------------------------------------------------------
             | CHECK: FUNCTION()
             |--------------------------------------------------------------------------
             | Check for kind of collision happening to the enemy.
             */
            check: function( other ) {
               if( other instanceof EntityPlayer){
                    other.receiveDamage(10, this);
                }
               //else if( other instanceOf EntityEnemy ) {
                    // do nothing, it's another enemy
                //}
                //else if( other instanceOf EntityItem ) {
                    // do nothing, it's an item for the player
                //}
            },

            /*
             |--------------------------------------------------------------------------
             | RECEIVEDAMAGE: FUNCTION()
             |--------------------------------------------------------------------------
             | Register damage to the enemy.
             */
            receiveDamage: function(value) {
                this.parent(value);
            },

            /*
             |--------------------------------------------------------------------------
             | KILL: FUNCTION()
             |--------------------------------------------------------------------------
             | Kill the enemy.
             */
            kill: function() {
                this.parent();

                //Adjust stats.
                ig.game.stats.kills ++;
                ig.game.stats.enemyLives --;
            },

            /*
             |--------------------------------------------------------------------------
             | AI: FUNCTION()
             |--------------------------------------------------------------------------
             | Calls entity from ai.js. Work in progress. - Alexis
             */
            ai: function() {
            }



        });

    });
