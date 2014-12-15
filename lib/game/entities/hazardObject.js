/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
  'game.entities.hazardObject'
)
.requires(
  'impact.entity'
)
.defines(function(){

    EntityHazardObject = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/hazardrock.png', 7, 10 ),
        size: {x: 7, y: 10},
        maxVel: {x: 0, y: 200},
        speed: 50,

        //Sets the hazard to register damage collisions only with the player type.
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        /*
         |--------------------------------------------------------------------------
         | INIT: FUNCTION()
         |--------------------------------------------------------------------------
         | Initialize the hazard.
         */
        init: function( x, y, settings ) {
          this.parent( x, y, settings );
          this.vel.y = this.accel.y = 10;
          this.addAnim( 'drop', 0.2, [0] );
        },
        /*
         |--------------------------------------------------------------------------
         | UPDATE: FUNCTION()
         |--------------------------------------------------------------------------
         | Updates the direction of the health item.
         */
        update: function(){
          var ydir = this.flip ? -1 : 1;
          this.vel.y = this.speed * ydir;
          this.parent();
        },
        /*
         |--------------------------------------------------------------------------
         | HANDLEMOVEMENTTRACE: FUNCTION()
         |--------------------------------------------------------------------------
         | Adjusted from inherited method belonging to entity.js. If the hazard
         | collides with the wall, it reverses direction.
         */
        handleMovementTrace: function( res ) {
          this.parent( res );
          // collision with a wall? return!
          if( res.collision.y ) {
            this.flip = !this.flip;
          }
        },
        /*
         |--------------------------------------------------------------------------
         | HANDLEMOVEMENTTRACE: FUNCTION()
         |--------------------------------------------------------------------------
         | Adjusted from inherited method belonging to entity.js. Invokes
         | temporary invincibility for the player to avoid instant death.
         */
        check: function(other) {
          other.receiveDamage( 1, this );

          /* If hazard touches player, there is small invincible time frame where
          the player doesn't receive damage */
          if(!other.invincible) {
              other.invincibleTimer = new ig.Timer();
              other.makeInvincible();
          }
        }
    });
});
