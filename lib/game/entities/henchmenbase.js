ig.module(
    "game.entities.henchmenbase"
)
.requires(
    "impact.entity"
)
.defines(function(){
    // animation
    EntityHenchmenbase = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/henchmenbase.png', 16, 16 ),
        size: {x: 16, y:16},

        // shoot time
        cooldownMode: true,
        cooldownDelay: 1,
        cooldownTimer:null,


        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.addAnim('idle', 1, [0]);

            this.cooldownTimer = new ig.Timer(5);
            this.cooldownTimer.reset();
        },


        // collision properties
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        // movement, edge, wall control
        update: function() {

            //shoot, but not too often
            if(ig.game.enemyLives < 50 && !this.cooldownMode){
                ig.game.spawnEntity( EntityHenchmen, this.pos.x, this.pos.y, {flip:this.flip} );
                console.log("shootTime");
                this.cooldownMode = true;
            }

            //turn off cooldown when timer runs out
            if( this.cooldownTimer.delta() > this.cooldownDelay ) {
                this.cooldownMode = false;
                this.cooldownTimer.reset();
            }

            this.parent();

        },
        check: function( other ) {
            other.receiveDamage( 0, this );

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

});
