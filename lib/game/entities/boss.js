ig.module(
    'game.entities.boss'
)
    .requires(
    'impact.entity',
    'plugins.ai'
)
    .defines(function(){

        EntityBoss = ig.Entity.extend({
            animSheet: new ig.AnimationSheet( 'media/drtansfordspritesheet.png', 52, 59 ), //fast:39x54, strong:52x58
            size: {x: 40, y:59},
            offset: {x: 4, y: 0},
            health: 30,

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

            init: function( x, y, settings ) {
                this.parent( x, y, settings );
                this.addAnim('rest', 1, [0]);
                this.addAnim('walk', .07, [1,2,3,4,5]);
                this.addAnim('jump', 1, [6]);
                // Create a timer for bullet
                this.attackTimer = new ig.Timer();

                ai = new ig.ai(this);
            },
            update: function() {
                this.parent();

                //Initialize Player
                var player = ig.game.getEntitiesByType( EntityPlayer )[0];

                // near an edge? return!
                if( !ig.game.collisionMap.getTile(
                        this.pos.x + (this.flip ? 0 : this.size.x ),
                        this.pos.y + this.size.y+1))
                {
                    this.flip = !this.flip;
                    // this.vel.y = -this.jump;
                }
                // End if
/*
                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;
                this.currentAnim.flip.x = this.flip;*/

                // When player dies, it takes some time to generate new player
                // during that time, player object will be undefined; and
                // during that time frame, monster won't be able to detect player
                // Therefore the check is neccesary to check if whether object is define or not
                if(player) {
                      //let the artificial intelligence engine tell us what to do
                     var action = ai.getAction(this);
                      //listen to the commands with an appropriate animation and velocity
                     switch(action){
                     case ig.ai.ACTION.Rest:
                     this.currentAnim =  this.anims.rest;
                     this.vel.x = 0;
                     this.vel.y = 0;
                     break;
                     case ig.ai.ACTION.MoveLeft	:
                     this.currentAnim =  this.anims.walk;
                     this.vel.x = -this.speed;
                     break;
                     case ig.ai.ACTION.MoveRight :
                     this.currentAnim =  this.anims.walk;
                     this.vel.x = this.speed;
                     break;
                     case ig.ai.ACTION.MoveUp	:
                     this.currentAnim =  this.anims.walk;
                     this.vel.y = -this.speed;
                     break;
                     case ig.ai.ACTION.MoveDown	:
                     this.currentAnim =  this.anims.walk;
                     this.vel.y = this.speed;
                     break;
                     case ig.ai.ACTION.Attack:
                         this.currentAnim =  this.anims.walk;

                         if(this.pos.x > player.pos.x){
                             this.vel.x = -50;
                             this.flip = true;
                         }

                         if(this.pos.x < player.pos.x){
                             this.vel.x = 50;
                             this.flip = false;
                         }
                     if(this.attackTimer.delta() > this.attackTimerDelay) {
                     ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
                         var xdir = this.flip ? -1 : 1;
                         this.vel.x = this.speed * xdir;
                         this.currentAnim.flip.x = this.flip;
                         this.attackTimer.reset();
                     }
                     break;
                      //use the defaults if no command is send
                     default	:
                     this.currentAnim =  this.anims.walk;
                     this.vel.x = 0;
                     this.vel.y = 0;
                     break;
/*
                     if(this.pos.x > player.pos.x){
                     this.flip = true;
                     }
                     if(this.pos.x < player.pos.x){
                     this.flip = false;
                     }*/

                     }

                     this.parent();


                    // Zombie speeds up toward player within this range

                  /*  this.entity = this;
                    //by default do nothing
                    var playerList 	  = ig.game.getEntitiesByType('EntityPlayer');
                    var player        = playerList[0];
                    var distance      = this.entity.distanceTo(player);
                    var angle         = this.entity.angleTo(player);
                    var x_dist        = distance * Math.cos(angle);
                    var y_dist        = distance * Math.sin(angle);
                    var collision     = ig.game.collisionMap ;
                    //if collision between the player and the enemy occurs
                    //collision.trace is actually the way ImpactJS simulates line of sight and will be explained later on
                    var res = collision.trace( this.entity.pos.x,this.entity.pos.y,x_dist,y_dist,
                        this.entity.size.x,this.entity.size.y);

                    if( res.collision.x){
                        if(angle > 0){this.vel.y = -this.speed;}else{this.vel.y = this.speed;}
                    }
                    else if(this.distanceTo(player) < 300 && this.distanceTo(player) > 200) {

                        if(angle < 0)
                        {this.vel.y = -this.speed;}
                        else{this.vel.y = this.speed;}

                        if(this.pos.x > player.pos.x){
                            this.vel.x = -50;
                            this.flip = true;
                        }

                        if(this.pos.x < player.pos.x){
                            this.vel.x = 50;
                            this.flip = false;
                        }
                    } else if(this.distanceTo(player) < 200){

                        // Start Shooting
                        if(this.attackTimer.delta() > this.attackTimerDelay) {
                            ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
                            this.attackTimer.reset();
                        }

                        if(this.pos.x > player.pos.x){
                            this.flip = true;
                        }
                        if(this.pos.x < player.pos.x){
                            this.flip = false;
                        }
                    }*/
                }
            },

            handleMovementTrace: function( res ) {
                this.parent( res );
                // collision with a wall? return!
                if( res.collision.x ) {
                    this.flip = !this.flip;
                }
            },
            check: function( other ) {
                other.receiveDamage( 1, this );

                /* If Zombie touches player, there is small invincible time frame where player doesn't receive damage */
                if(!other.invincible) {
                    other.invincibleTimer = new ig.Timer();
                    other.makeInvincible();
                }
            },
            receiveDamage: function(value){
                this.parent(value);
                if(this.health > 0)
                    ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1});
            },
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
            handleMovementTrace: function( res ) {
                this.parent( res );
                if( res.collision.x || res.collision.y ){
                    this.kill();
                }
            },
            check: function( other ) {
                other.receiveDamage( 4, this );
                this.kill();
            }
        });


    });
