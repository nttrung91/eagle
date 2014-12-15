/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
	'game.entities.levelexit'
)
.requires(
	'impact.entity'
)
.defines(function(){

    EntityLevelexit = ig.Entity.extend({
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
        size: {x: 8, y: 8},
        level: null,
        //check only against the player. no other entities
        //can interact with the goal point.
        checkAgainst: ig.Entity.TYPE.A,
        /*
         |--------------------------------------------------------------------------
         | UPDATE: FUNCTION()
         |--------------------------------------------------------------------------
         | Update the goal point as needed.
         */
        update: function(){},
        /*
         |--------------------------------------------------------------------------
         | CHECK: FUNCTION()
         |--------------------------------------------------------------------------
         | Checks if the player has collided with the goal point. If so,
         | the statistics are shown.
         */
        check: function(other) {
        	if (other instanceof EntityPlayer) {
        		ig.game.toggleStats(this);
        	}
        },
        /*
         |--------------------------------------------------------------------------
         | NEXTLEVEL: FUNCTION()
         |--------------------------------------------------------------------------
         | Loads next level.
         */
        nextLevel: function(){
        	if (this.level) {
        		var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function(m, l, a, b) {
        		return a.toUpperCase() + b;
        	});
        	ig.game.loadLevelDeferred(ig.global['Level' + levelName]);
        	}
        }
    });
});
