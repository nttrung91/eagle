/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity',
    'impact.sound'
)
.defines(function(){
    EntityPlayer = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/eagleheadspritesheet.png', 50, 60 ),
        size: {x: 20, y:50},
        offset: {x: 0, y: 10},
        flip: false,
        maxVel: {x: 100, y: 150},
        friction: {x: 600, y: 0},
        accelGround: 400,
        accelAir: 200,
        jump: 200,
        health: 10,
        maxHealth: 10,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,

        weapon: 0, //0 = pistol, 1 = shotgun, 2 = sword
        totalWeapons: 3,
        activeWeapon: "EntityBullet",
        knifeattack: false,

        startPosition: null,
        invincible: true,
        invincibleDelay: 0.5,
        invincibleTimer:null,

        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 0, 0.7)',

        //Load sound effects for player.
        jumpSFX: new ig.Sound( 'media/sounds/jump.*' ),
        shootSFX: new ig.Sound( 'media/audio/gun.mp3' ),
        shotgunSFX: new ig.Sound( 'media/audio/shotgun.mp3' ),
        swordSFX: new ig.Sound( 'media/audio/Swoosh-3-SoundBible.com-1573211927.mp3' ),
        struckSFX: new ig.Sound( 'media/audio/Male-Grunt-SoundBible.com-68178715.*' ),
        deathSFX: new ig.Sound( 'media/audio/apprehensive-Mike_Koenig-1694170958.*' ),

        /*
         |--------------------------------------------------------------------------
         | INIT: FUNCTION()
         |--------------------------------------------------------------------------
         | Initialize the player.
         */
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.setupAnimation(this.weapon);
            this.startPosition = {x:x,y:y};

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
            offset = offset * 6; // number of sprites
            this.addAnim('idle', 1, [0+offset]);
            this.addAnim('run', .07, [1+offset,2+offset,3+offset,4+offset,5+offset]);
            this.addAnim('jump', 1, [21]);
            this.addAnim('fall', 0.4, [21]);
            this.addAnim('knife', 0.1, [18, 19, 20]);

        },
        /*
         |--------------------------------------------------------------------------
         | MAKEINVINCIBLE: FUNCTION()
         |--------------------------------------------------------------------------
         | Temporarily grants the player invincibility to prevent instant deaths.
         */
        makeInvincible: function(){
            this.invincible = true;
            this.invincibleTimer.reset();
        },
        /*
         |--------------------------------------------------------------------------
         | UPDATE: FUNCTION()
         |--------------------------------------------------------------------------
         | Update the player.
         */
        update: function() {
            var accel = this.standing ? this.accelGround : this.accelAir;
            // Move Left
            if( ig.input.state('left') ) {
                this.accel.x = -accel;
                this.flip = true;
            // Move Right
            }else if( ig.input.state('right') ) {
                this.accel.x = accel;
                this.flip = false;
            // Idle
            }else{
                this.accel.x = 0;
            }
            // Jump
            if( this.standing && ig.input.pressed('jump') ) {
                this.vel.y = -this.jump;
                this.jumpSFX.play();
            }
            // Attack
            if( ig.input.pressed('shoot') ) {
                // SFX: Swing Knife
                if(this.activeWeapon == "EntityKnife") {
                    this.knifeattack = true;
                    this.swordSFX.play();
                }
                // SFX: Shotgun Bullet
                else if(this.activeWeapon == "EntityShotgunBullet"){
                    this.shotgunSFX.play();
                }else{ // SFX: Regular Bullet
                    this.shootSFX.play();
                }
                //Spawn appropriate weapon.
                ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
            }

            // Switch equipped weapon between pistol, shotgun, or knife.
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

            // set the current animation, based on the player's speed
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
        },
        /*
         |--------------------------------------------------------------------------
         | KILL: FUNCTION()
         |--------------------------------------------------------------------------
         | Kill the player.
         */
        kill: function(){
            this.deathSFX.play();
            this.parent();
            ig.game.respawnPosition = this.startPosition;
            // Create red particle bloodsplatter.
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {callBack:this.onDeath} );

        },
        /*
         |--------------------------------------------------------------------------
         | ONDEATH: FUNCTION()
         |--------------------------------------------------------------------------
         | Called when the player has died.
         */
        onDeath: function(){
            ig.game.stats.deaths ++;
            ig.game.lives --;
            //If the player has lives left, allow continue. Otherwise, game over.
            if(ig.game.lives < 0){
                ig.game.gameOver();
            }else{
                ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, ig.game.respawnPosition.y);
            }
        },
        /*
         |--------------------------------------------------------------------------
         | RECEIVEDAMAGE: FUNCTION()
         |--------------------------------------------------------------------------
         | Register damage to the player.
         */
        receiveDamage: function(amount, from){
            this.struckSFX.play();
            if(this.invincible)
                return;
            this.parent(amount, from);
        },
        /*
         |--------------------------------------------------------------------------
         | DRAW: FUNCTION()
         |--------------------------------------------------------------------------
         | Draw the player. Used for the spawning invincibility animation.
         */
        draw: function(){
            if(this.invincible)
                this.currentAnim.alpha = this.invincibleTimer.delta()/this.invincibleDelay * 1 ;
            this.parent();
        }
    });
    // Bullets for regular gun.
  EntityBullet = ig.Entity.extend({
      size: {x: 5, y: 3},
      animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
      maxVel: {x: 200, y: 0},
      type: ig.Entity.TYPE.NONE,
      checkAgainst: ig.Entity.TYPE.B,
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
          other.receiveDamage( 3, this );
          this.kill();
      }
  });
    // Bullets for shotgun.
  EntityShotgunBullet = ig.Entity.extend({
      size: {x: 21, y: 21},
      animSheet: new ig.AnimationSheet( 'media/shotgunbullet.png', 21, 21 ),
      maxVel: {x: 200, y: 0},
      type: ig.Entity.TYPE.NONE,
      checkAgainst: ig.Entity.TYPE.B,
      collides: ig.Entity.COLLIDES.PASSIVE,
      init: function( x, y, settings ) {
          this.parent( x + (settings.flip ? -4 : 42) , y+14, settings ); //bullet position
          this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
          this.addAnim( 'idle', 0.2, [0] );
          this.timer = new ig.Timer(0.4);
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
// Knife Swing
  EntityKnife = ig.Entity.extend({
      size: {x: 7, y: 7},
      animSheet: new ig.AnimationSheet( 'media/slash.png', 3, 12 ),
      maxVel: {x: 200, y: 0},
      type: ig.Entity.TYPE.NONE,
      checkAgainst: ig.Entity.TYPE.B,
      collides: ig.Entity.COLLIDES.PASSIVE,
      init: function( x, y, settings ) {
          this.parent( x  + (settings.flip ? -3 : 50) , y + 20, settings ); // bullet position
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
    // Explosion when player dies.
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
    // Particles for the explosion when the player dies.
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
