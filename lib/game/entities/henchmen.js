ig.module(
    "game.entities.henchmen"
)
.requires(
    "impact.entity"
)
.defines(function(){
    // animation
    EntityHenchmen = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/henchmen.png', 16, 16 ),
        size: {x: 8, y:14},
        offset: {x: 4, y: 2},
        maxVel: {x: 100, y: 100},
        flip: false,
        friction: {x: 150, y: 0},
        speed: 40,

        // shoot time
        cooldownMode: true,
        cooldownDelay: 1,
        cooldownTimer:null,


        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.addAnim('walk', .07, [0,1,2,3,4,5]);

            this.cooldownTimer = new ig.Timer(1);
            this.cooldownTimer.reset();
        },
        accelGround: 400,
        accelAir: 400,
        jump: 400,



        weapon: 0,
        totalWeapons: 1,
        activeWeapon: "EntityEnemyBullet",

        // collision properties
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        // movement, edge, wall control
        update: function() {

            //shoot, but not too often
            if(!this.cooldownMode){
                // this.flip = !this.flip;
                ig.game.spawnEntity( EntityEnemyBullet, this.pos.x, this.pos.y, {flip:this.flip} );
                console.log("shootTime");
                this.cooldownMode = true;
            }

            //turn off cooldown when timer runs out
            if( this.cooldownTimer.delta() > this.cooldownDelay ) {
                this.cooldownMode = false;
                this.cooldownTimer.reset();

                //this.currentAnim.alpha = 1;
            }

            var player = ig.game.getEntitiesByType( EntityPlayer )[0];
            var xdir = this.flip ? -1 : 1;

            try {
                if ( this.distanceTo( player ) < 100 ) {
                    var target = 0;
                    target = player.pos.x;
                }
                if ( target < this.pos.x ) {
                    this.flip = true;
                    this.vel.x = this.speed * xdir;
                }
                else if ( target > this.pos.x ) {
                    this.flip = false;
                    this.vel.x = this.speed * xdir;
                }
                else {
                    this.vel.x = this.speed*xdir;
                }
            }
            catch(err) { // if player dies, distanceTo will have null for player and cause an error
                 var player = ig.game.getEntitiesByType( EntityPlayer )[0];
            }

            // near an edge? return!
            // if( !ig.game.collisionMap.getTile( this.pos.x + (this.flip ? +4 : this.size.x -4),this.pos.y + this.size.y+1) ) {
            //     this.flip = !this.flip;
            // }

            // flip animation
            this.vel.x = this.speed * xdir;
            this.currentAnim.flip.x = this.flip;
            this.parent();

        },
        handleMovementTrace: function( res ) {

              this.parent( res );
                // collision with a wall? return!
                if( res.collision.x ) {
                    this.flip = !this.flip;
                }

        },

        jumpOver: function() {
            // jump, activates in jump.js
            this.vel.y = -this.jump;
        },

        check: function( other ) {
         other.receiveDamage( 1, this );

         /* If Zombie touches player, there is small invincible time frame where player doesn't receive damage */
         if(!other.invincible) {
            other.invincibleTimer = new ig.Timer();
            other.makeInvincible();
        }
        },
        // blood when damage received
        receiveDamage: function( value ) {
            this.parent(value);
            if(this.health > 0)
                ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 2}); // remove , colorOffset: 1} to make blood red
        },
        // death animation
        kill: function() {
            this.parent();
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y); // remove , {colorOffset: 1} to make blood red
        }
    });

    EntityEnemyBullet = ig.Entity.extend({
        size: {x: 5, y: 3},
        animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
        maxVel: {x: 100, y: 0},
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
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
             other.receiveDamage( 1, this );

             /* If Zombie touches player, there is small invincible time frame where player doesn't receive damage */
             if(!other.invincible) {
                other.invincibleTimer = new ig.Timer();
                other.makeInvincible();
            }
            this.kill();
        }
    });

});
