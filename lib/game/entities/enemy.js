ig.module(
    'game.entities.enemy'
)
    .requires(
    'impact.entity',
    'plugins.ai',
    'impact.timer'
)
    .defines(function() {
        EntityEnemy = ig.Entity.extend({

            animSheet: new ig.AnimationSheet( 'media/enemy.png', 16, 16 ),
            size: {x: 8, y:14},
            offset: {x: 4, y: 2},
            flip: false,

            maxVel: {x: 100, y: 100},
            friction: {x: 150, y: 0},
            speed: 14,

            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,
            health: 20,

            attackRange: 1,
            attack: 10,

            cooldownMode: true,
            cooldownDelay: 1,
            cooldownTimer:null,

            /*
             |--------------------------------------------------------------------------
             | INIT: FUNCTION()
             |--------------------------------------------------------------------------
             | Initialize the enemy.
             */
            init: function( x, y, settings ) {
                this.parent( x, y, settings );
                this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
                this.addAnim('walk', .07, [0,1]);
                this.addAnim('idle',1,[0]);
                this.addAnim('left',1,[0,1]);
                this.addAnim('right',1,[0,1]);

                this.currentAnim.flip.x = settings.flip;

                this.cooldownTimer = new ig.Timer();
                this.cooldownTimer.reset();

                ai = new ig.ai(this);
            },

            /*
             |--------------------------------------------------------------------------
             | UPDATE: FUNCTION()
             |--------------------------------------------------------------------------
             | Update the enemy.
             */
            update: function() {
                // Fetch the action from the Action list given the entity.
                var action = ai.getAction(this);
                //console.info(action);
                /* listen to the commands with an appropriate animation and velocity */
                switch(action){
                    case ig.ai.ACTION.Rest:
                        this.currentAnim =  this.anims.walk;
                        //this.vel.x = 0;
                        //walk aimlessly
                        var xdir = this.flip ? -1 : 1;
                        //console.info(xdir);
                        this.vel.x = this.speed * xdir;
                        //this.vel.y = 0;
                        break;
                    case ig.ai.ACTION.MoveLeft	:
                        this.currentAnim = this.anims.left;
                        this.vel.x = -this.speed;
                        this.flip = true;
                        //this.currentAnim.flip.x = this.flip;
                        //this.flip = !this.flip;
                        break;
                    case ig.ai.ACTION.MoveRight :
                        this.currentAnim = this.anims.right;
                        this.vel.x = this.speed;
                        break;
                    /*case ig.ai.ACTION.AttackLeft	:
                        this.currentAnim = this.anims.left;
                        this.vel.x = -this.speed;
                        break;
                    case ig.ai.ACTION.AttackRight	:
                        this.currentAnim = this.anims.right;
                        this.vel.x = this.speed;
                        break;*/
                    case ig.ai.ACTION.Attack:
                        this.currentAnim = this.anims.idle;
                        //shoot, but not too often
                        if(!this.cooldownMode){
                            this.flip = !this.flip;
                            ig.game.spawnEntity( EntityEnemyBullet, this.pos.x, this.pos.y, {flip:this.flip} );

                        }
                        this.cooldownTimer.reset();
                        this.vel.x = 0;
                        //this.vel.y = 0;
                        ig.game.getEntitiesByType('EntityPlayer')[0].receiveDamage(2,this);
                        break;
                    /* use the defaults if no command is send*/
                    default	:
                        this.currentAnim =  this.anims.idle;
                        this.vel.x = 0;
                        //this.vel.y = 0;
                        break;
                }
                if (!ig.game.collisionMap.getTile(
                        this.pos.x + (this.flip ? +4 : this.size.x - 4),
                        this.pos.y + this.size.y + 1
                    )
                ) {
                    this.flip = !this.flip;
                }

                //turn off cooldown when timer runs out
                if( this.cooldownTimer.delta() > this.cooldownDelay ) {
                    this.cooldownMode = false;
                    //this.currentAnim.alpha = 1;
                }

                this.currentAnim.flip.x = this.flip;
                this.parent();

                /*if (!ig.game.collisionMap.getTile(
                        this.pos.x + (this.flip ? +4 : this.size.x - 4),
                        this.pos.y + this.size.y + 1
                    )
                ) {
                    this.flip = !this.flip;
                }
                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;
                this.currentAnim.flip.x = this.flip;
                this.parent();*/
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
                this.parent();
            },

            /*
             |--------------------------------------------------------------------------
             | CHECK: FUNCTION()
             |--------------------------------------------------------------------------
             | Check for kind of collision happening to the enemy.
             */
            check: function( other ) {
                if( other instanceof EntityPlayer){
                    other.receiveDamage(this.attack, this);
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
        EntityEnemyBullet = ig.Entity.extend({
            size: {x: 5, y: 3},
            animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
            maxVel: {x: 200, y: 0},
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,
            init: function( x, y, settings ) {
                this.parent( x + (settings.flip ? -4 : 8) , y+8, settings );
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

    });
