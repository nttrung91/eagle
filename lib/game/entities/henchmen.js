/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
    'game.entities.henchmen'
)
.requires(
    'impact.entity'
)
.defines(function(){

EntityHenchmen = ig.Entity.extend({
    animSheet: new ig.AnimationSheet( 'media/fasthenchmanspritesheet.png', 39, 54 ), //fast:39x54, strong:52x58
    size: {x: 33, y:54},
    offset: {x: 4, y: 0},

    maxVel: {x: 100, y: 100},
    friction: {x: 150, y: 0},
    speed: 74,
    flip: false,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    weapon: 0,
    totalWeapons: 1,
    activeWeapon: "EntityHenchmanBullet",

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
     | Initialize the enemy. Pass the parent (Entity) the location settings
     | and add the animation used for walking (Sprite #1 through #5).
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
        if(this.distanceTo(player) < 100 && this.distanceTo(player) > 50) {
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
        } else if(this.distanceTo(player) < 50){
          // Start Shooting
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
     | Adjusted from inherited method belonging to entity.js.
     */
    handleMovementTrace: function( res ) {
        this.parent( res );
        // If entity collides with a wall, flip to other direction.
        if( res.collision.x ) {
            this.flip = !this.flip;
        }
    },

    /*
     |--------------------------------------------------------------------------
     | CHECK: FUNCTION()
     |--------------------------------------------------------------------------
     | Check for kind of collision happening to the enemy. If a henchman touches
     | the player, there is small invincible time frame where player doesn't
     | receive damage in order to prevent death within milliseconds.
     */
    check: function( other ) {
        other.receiveDamage( 1, this );

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
     | This method is called to destroy the enemy when it has been killed. The
     | game stats for killed enemies is incremented, the sound effects play,
     | and the enemy explodes by being destroyed and an explosion spawning.
     */
    kill: function(){
        ig.game.stats.kills ++;
        this.parent();
        this.explodeSFX.play();
        ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {colorOffset: 1});
    },

    /*
     |--------------------------------------------------------------------------
     | JUMPOVER: FUNCTION()
     |--------------------------------------------------------------------------
     | For enemy AI.
     */
    jumpOver: function() {
        // jump, activates in jump.js
        this.vel.y = -this.jump;
    }
});


/*
 * Fast Henchman's Bullet
 */
EntityHenchmanBullet = ig.Entity.extend({
    size: {x: 5, y: 3},
    animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
    maxVel: {x: 200, y: 0},
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    //Initialize bullet
    init: function( x, y, settings ) {
        this.parent( x + (settings.flip ? -4 : 42) , y+14, settings ); //bullet position
      this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
      this.addAnim( 'idle', 0.2, [0] );
    },

    //Handle bullet movement. If bullet collides with an environment surface
    // (e.g. cliff), it is destroyed.
    handleMovementTrace: function( res ) {
      this.parent( res );
      if( res.collision.x || res.collision.y ){
        this.kill();
      }
    },

    //If bullet strikes the player, the player receives damage.
    check: function( other ) {
      other.receiveDamage( 1, this );
      this.kill();
    }
});
});
