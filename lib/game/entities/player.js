ig.module(
    "game.entities.player"
)
.requires(
    "impact.entity"
)
.defines(function(){
    EntityPlayer = ig.Entity.extend({

    	// sprite sheet
    	animSheet: new ig.AnimationSheet( "media/player.png", 16, 16 ),	
    	size: {x: 8, y: 14}, // size of player
    	offset: {x: 4, y: 2}, // change, makes collisions more accurate
    	flip: false, // stay in original direction

    	// physics properties
    	maxVel: {x: 100, y: 150},
    	friction: {x: 600, y: 0},
    	accelGround: 400,
    	accelAir: 200,
    	jump: 200,

        health: 100, // multiple collisions, needs more work

        // keep track of weapons
        weapon: 0,
        totalWeapons: 3,
        activeWeapon: "EntityBullet",

        // collision properties
        type: ig.Entity.TYPE.A, // friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // zombie will do checking
        collides: ig.Entity.COLLIDES.PASSIVE, // prevent overlap with other passive entity

        // respawning
        startPosition: null,

        // invincibility when respawning
        invincible: true,
        invincibleDelay: 3,
        invincibleTimer: null,

        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.setupAnimation(this.weapon);
            this.startPosition = {x:x, y:y}; 
            this.invincibleTimer = new ig.Timer();
            this.makeInvincible();
        },

        // adds weapon to animation
        setupAnimation: function(offset){
            offset = offset * 8; // number of sprites
            this.addAnim('idle', 1, [0+offset]);
            this.addAnim('run', .07, [1+offset,2+offset,3+offset,4+offset,5+offset]);
            this.addAnim('jump', 1, [6+offset]);
            this.addAnim('fall', 0.4, [7+offset]);
            this.addAnim('knife', 0.04, [25, 26, 27]);
        },

        kill: function() {
            this.parent();
            var x = this.startPosition.x;
            var y = this.startPosition.y;
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, // death explosion
                {callBack:function(){ig.game.spawnEntity( EntityPlayer, x, y)}} );
        },

        makeInvincible: function() { // toggle invicible function
            this.invincible = true;
            this.invincibleTimer.reset();
        },

        receiveDamage: function(amount, from) { // make damage make invincible
            if(this.invincible)
                return;
            this.parent(amount, from);
        },
        draw: function() { // draw invincible
            if(this.invincible)
                this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
            this.parent();
        },        

    	update: function() {
            // move left or right
        	var accel = this.standing ? this.accelGround : this.accelAir;
        	if( ig.input.state('left') ) {
        		this.accel.x = -accel;
        		this.flip = true;
        	}else if( ig.input.state('right') ) {
        		this.accel.x = accel;
        		this.flip = false;
        	}else{
        		this.accel.x = 0;
        	}
        	// jump
        	if( this.standing && ig.input.pressed('jump') ) {
        		this.vel.y = -this.jump;
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
                    case(2):
                        this.activeWeapon = "EntityKnife";
                    break;
                }
                this.setupAnimation(this.weapon);
            }
            if( ig.input.pressed('shoot') && this.activeWeapon == "EntityBullet" || ig.input.pressed('shoot') && this.activeWeapon == "EntityShotgunBullet" ) {
                ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
            }
            if ( ig.input.pressed('shoot') &&  this.activeWeapon == "EntityKnife") { 
                this.currentAnim = this.anims.knife.rewind();
                console.log("shoot");

            }
            if ( this.currentAnim == this.anims.knife || this.currentAnim == this.anims.knife ) {
                ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );                
                if ( this.currentAnim.loopCount ) {
                    this.currentAnim = this.anims.idle;
                }
            } 
            else if ( this.vel.x != 0 || this.currentAnim == this.anims.knife ) {
                if ( this.currentAnim.loopCount ) {
                    this.currentAnim = this.anims.run;
                }                
            }
            else if ( (this.vel.y < 0)  ) {
                if ( this.currentAnim.loopCount ) {
                    this.currentAnim = this.anims.jump.rewind();
                }                
            }
            else {
                this.currentAnim = this.anims.idle;
            }


        	this.currentAnim.flip.x = this.flip;
        	
            if( this.invincibleTimer.delta() > this.invincibleDelay ) { // disable invincibility
                this.invincible = false;
                this.currentAnim.alpha = 1;
            }
        	this.parent();
        }
    });

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


    EntityKnife = ig.Entity.extend({
        size: {x: 7, y: 7},
        animSheet: new ig.AnimationSheet( 'media/slash.png', 3, 12 ),
        maxVel: {x: 200, y: 0},
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,
        init: function( x, y, settings ) {
            this.parent( x  + (settings.flip ? -4 : 8) , y - 2, settings ); // bullet position
            this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
            this.addAnim( 'idle', 0.2, [0] );
            this.timer = new ig.Timer(0.0001);
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


    EntityDeathExplosion = ig.Entity.extend({
        lifetime: 1,
        callBack: null,
        particles: 25,
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
                for(var i = 0; i < this.particles; i++)
                    ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: settings.colorOffset ? settings.colorOffset : 0});
                this.idleTimer = new ig.Timer();
            },
            update: function() {
                if( this.idleTimer.delta() > this.lifetime ) {
                    this.kill();
                    if(this.callBack)
                        this.callBack();
                    return;
                }
            }
    });

    EntityDeathExplosionParticle = ig.Entity.extend({
        size: {x: 2, y: 2},
        maxVel: {x: 160, y: 200},
        lifetime: 2,
        fadetime: 1,
        bounciness: 0,
        vel: {x: 100, y: 30},
        friction: {x:100, y: 0},
        collides: ig.Entity.COLLIDES.LITE,
        colorOffset: 0,
        totalColors: 7,
        animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset * (this.totalColors+1));
            this.addAnim( 'idle', 0.2, [frameID] );
            this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
            this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
            this.idleTimer = new ig.Timer();
        },
        update: function() {
            if( this.idleTimer.delta() > this.lifetime ) {
                this.kill();
                return;
            }
            this.currentAnim.alpha = this.idleTimer.delta().map(
                this.lifetime - this.fadetime, this.lifetime,
                1, 0
            );
            this.parent();
        }
    });
});
