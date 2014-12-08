ig.module(
	'game.main'
)
.requires(
    'impact.game',
    'game.levels.dorm1'
)

.defines(function(){

MyGame = ig.Game.extend({
    gravity: 300,
	init: function() {
        this.loadLevel( LevelDorm1 );

        // Bind keys
        ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
        ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
        ig.input.bind( ig.KEY.X, 'jump' );
        ig.input.bind( ig.KEY.C, 'shoot' );
        ig.input.bind( ig.KEY.TAB, 'switch' );
	},

	update: function() {
		//Camera centers on player
        var player = this.getEntitiesByType( EntityPlayer )[0];
        if( player ) {
            this.screen.x = player.pos.x - ig.system.width/2;
            //No need to center on y-axis.
            // this.screen.y = player.pos.y - ig.system.height/2;
        }

        //Note: Refactor logic here later, conditionals can be simplified
        //If not viewing Statistics, continue game. If showing statistics
        //and player hits continue, continue game.
        if( !this.showStats ) {
            this.parent();
        } 
        else {
            if( ig.input.state('continue') ){
                this.showStats = false;
                this.goalPoint.nextLevel();
                this.parent();
            }
        }

        // Find number of enemies for the henchmenbase.js
        var enemyArray = this.getEntitiesByType(EntityHenchmen);
        this.enemyLives = enemyArray.length;
        console.log(this.enemyLives.length);        
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 550, 340, 2 );

});
