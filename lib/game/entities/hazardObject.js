ig.module(
  'game.entities.hazardObject'
)
.requires(
  'impact.entity'
)
.defines(function(){

    EntityHazardObject = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
        size: {x: 5, y: 3},
        maxVel: {x: 0, y: 200},
        speed: 50,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        init: function( x, y, settings ) {
          this.parent( x, y, settings );
          this.vel.y = this.accel.y = 10;
          this.addAnim( 'drop', 0.2, [0] );
        },
        update: function(){
          var ydir = this.flip ? -1 : 1;
          this.vel.y = this.speed * ydir;
          this.parent();
        },
        handleMovementTrace: function( res ) {
          this.parent( res );
          // collision with a wall? return!
          if( res.collision.y ) {
            this.flip = !this.flip;
          }
        },
        check: function(other) {
          other.receiveDamage( 1, this );

          /* If Zombie touches player, there is small invincible time frame where player doesn't receive damage */
          if(!other.invincible) {
              other.invincibleTimer = new ig.Timer();
              other.makeInvincible();
          }
        }
    });
});
