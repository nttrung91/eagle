/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
  'game.entities.healthPotion'
)
.requires(
  'impact.entity'
)
.defines(function(){

    EntityHealthPotion = ig.Entity.extend({
        animSheet: new ig.AnimationSheet( 'media/bread.png', 19, 12 ),
        size: {x: 19, y: 12},
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        active: true,

        /* Position The layer above or below certain component */
        zIndex: -1,
        timer: null,

        eatSFX: new ig.Sound( 'media/audio/apple.*' ),

        /*
         |--------------------------------------------------------------------------
         | INIT: FUNCTION()
         |--------------------------------------------------------------------------
         | Initialize the health item.
         */
        init: function( x, y, settings ) {
          this.parent( x, y, settings );
          this.addAnim('idle', 1, [0]);
        },
        /*
         |--------------------------------------------------------------------------
         | SETUPANIMATION: FUNCTION()
         |--------------------------------------------------------------------------
         | Set up the health item's animation so that it will disappear after use.
         */
        setupAnimation: function(offset){
            offset = offset * 10;
            this.addAnim('disappear', .07, [1]);
        },
        /*
         |--------------------------------------------------------------------------
         | CHECK: FUNCTION()
         |--------------------------------------------------------------------------
         | If the health item has not yet been used, apply it for maximum health.
         */
        check: function(other) {
          if(this.active) {
            other.health += other.maxHealth - other.health;
            other.maxVel.x *= 1.5;
            other.maxVel.y *= 1.5;
            this.active = false;
            this.timer = new ig.Timer(2);
          }
        },
        /*
         |--------------------------------------------------------------------------
         | UPDATE: FUNCTION()
         |--------------------------------------------------------------------------
         | Called when the health item is used.
         */
        update: function(){
          if(!this.active) {
            this.currentAnim = this.anims.disappear;
          }

          if (this.timer != null) {
            if(this.timer.delta() >= 0) {
              this.timer.pause();
              var player = ig.game.getEntitiesByType( EntityPlayer )[0];
              player.maxVel.x /= 1.5;
              player.maxVel.y /= 1.5;
              this.eatSFX.play();
              this.kill();
            }
          }
          this.parent();
        }
    });
});
