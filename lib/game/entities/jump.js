ig.module(
    "game.entities.jump"
)
.requires(
    "impact.entity"
)
.defines(function(){
    // animation
    EntityJump = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/jump.png', 16, 1 ),
        size: {x: 16, y:1},
        invincible: true,

        init: function( x, y, settings ) {
            this.parent( x, y, settings );
             this.addAnim( "idle", 1, [0] );
        },

        // collision properties
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,

        check: function( other ) {
            // other.receiveDamage( 1000, this ); // does 10 damage
            if (other instanceof EntityHenchmen) {
                other.jumpOver();
                console.log("Jump")
            }
        }

    });
});
