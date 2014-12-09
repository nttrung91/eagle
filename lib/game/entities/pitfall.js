ig.module(
    "game.entities.pitfall"
)
.requires(
    "impact.entity"
)
.defines(function(){
    // animation
    EntityPitfall = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/pitfall.png', 16, 16 ),
        size: {x: 16, y:16},
        invincible: true,
        // collision properties
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        init: function( x, y, settings ) {
            this.parent( x, y, settings );
             this.addAnim( "idle", 1, [0] );
        },

        check: function( other ) {
            other.receiveDamage( 100, this ); // does 10 damage
        }

    });
});