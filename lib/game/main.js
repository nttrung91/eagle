ig.module( 
	'game.main' 
)
.requires(
    //Resources
	'impact.game',
	'impact.font',
    'impact.timer',

    //Entities
    'game.entities.player',
    'game.entities.enemy',
    'game.entities.bullet',

    //Levels
    'game.levels.test'


)
.defines(function(){

MyGame = ig.Game.extend({

    //Impact Game Properties

    //A .gravityFactor of 0 will make the entity float,
    //no matter what the game's gravity is set to.
    //The default is 1. ((.gravityFactor??))
    gravity: 300,

    //Load Images
    lifeSprite: new ig.Image('media/eaglelife.png'),
    statMatte: new ig.Image('media/stat-matte.png'),

    // Load Fonts
    font: new ig.Font( 'media/04b03.font.png' ),
    statText: new ig.Font( 'media/04b03.font.png' ),

    //Load Timer
    levelTimer: new ig.Timer(),

    //Set Statistics
    showStats: false,
    stats: {time: 0, kills: 0, deaths: 0},
    lives: 3,
    enemyLives: 6,

    //Set Level Exit (Goal Point)
    goalPoint: null,

    /*
     |--------------------------------------------------------------------------
     | INIT: FUNCTION()
     |--------------------------------------------------------------------------
     | Initialize your game here; bind keys etc.
     */
	init: function() {
        // Bind keys
        ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
        ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
        ig.input.bind( ig.KEY.X, 'jump' );
        ig.input.bind( ig.KEY.C, 'shoot' );
        ig.input.bind( ig.KEY.TAB, 'switch' );
        ig.input.bind( ig.KEY.SPACE, 'continue' );

        //Load Level
        this.loadLevel( LevelTest );
	},

    /*
     |--------------------------------------------------------------------------
     | UPDATE: FUNCTION()
     |--------------------------------------------------------------------------
     | Update all entities and backgroundMaps
     */
	update: function() {
        //Camera centers on player
        var player = this.getEntitiesByType( EntityPlayer )[0];
        if( player ) {
            this.screen.x = player.pos.x - ig.system.width/2;
            //No need to center on y-axis.
            //this.screen.y = player.pos.y - ig.system.height/2;
        }

        //Note: Refactor logic here later, conditionals can be simplified
        //If not viewing Statistics, continue game. If showing statistics
        //and player hits continue, continue game.
        if(!this.showStats) {
            this.parent();
        }else{
            if(ig.input.state('continue')){
                this.showStats = false;
                this.goalPoint.nextLevel();
                this.parent();
            }
        }

	},

    /*
     |--------------------------------------------------------------------------
     | DRAW: FUNCTION()
     |--------------------------------------------------------------------------
     | Draw all entities and backgroundMaps
     */
	draw: function() {
		this.parent();
		
		// If viewing Statistics, print statistics out on a matte background, centered.
        if(this.showStats){
            this.statMatte.draw(0,0);
            var x = ig.system.width/2;
            var y = ig.system.height/2 - 20;
            this.statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
            this.statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
            this.statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
            this.statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
            this.statText.draw('Press Spacebar to continue.', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
        }

        //Draw Player Life sprites at (5,5), spaced accordingly
        this.statText.draw("Player Lives", 5,5);
        for(var i=0; i < this.lives; i++)
            this.lifeSprite.draw(((this.lifeSprite.width + 2) * i)+5, 15);

        //Load Enemy Lives
        var enemyArray = this.getEntitiesByType(EntityEnemy);
        this.enemyLives = enemyArray.length;

        //Draw Enemy Life sprites at (5, 35), spaced accordingly
        this.statText.draw("Enemy Lives", 5, 35);
        for(var j=0; j < this.enemyLives; j++)
            this.lifeSprite.draw(((this.lifeSprite.width + 2) * j)+5, 45);

        //this.font.draw( 'Hello World', x, y, ig.Font.ALIGN.CENTER );
	},

    /*
     |--------------------------------------------------------------------------
     | toggleStats: FUNCTION()
     |--------------------------------------------------------------------------
     | Present the statistics gathered for the level and set the levelExit.
     | Called upon completion of level.
     */
    toggleStats: function(goalPoint){
        this.showStats = true;
        this.stats.time = Math.round(this.levelTimer.delta());
        this.goalPoint = goalPoint;
    },

    /*
     |--------------------------------------------------------------------------
     | loadLevel: FUNCTION()
     |--------------------------------------------------------------------------
     | Reset statistics and timer.
     */
    loadLevel: function( data ){
        this.stats = {time: 0, kills: 0, deaths: 0};
        this.parent(data);
        this.levelTimer.reset();
    }
});

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 230, 160, 2 );

});
