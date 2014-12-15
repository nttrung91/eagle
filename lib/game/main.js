/*
 |--------------------------------------------------------------------------
 | Written with guidance from [ Freeman, Jesse. Introducing HTML5 Game
 | Development. N.p.: O'Reilly Media, 2012. ].
 |--------------------------------------------------------------------------
 */
ig.module(
	'game.main'
)
.requires(
    'impact.game',
    'game.levels.dorm1',
    'game.levels.dorm2',
    'game.levels.dorm3',
    'impact.font'
)

.defines(function(){

MyGame = ig.Game.extend({

    gravity: 300,

    //Set Level Exit (Goal Point)
    levelExit: null,

    //Set Statistics
    stats: {time: 0, kills: 0, deaths: 0},
    lives: 1,
    showStats: false,

    //Load Timer
    levelTimer: new ig.Timer(),
    //Load Images
    lifeSprite: new ig.Image('media/eaglelifecounter.png'),
    healthSprite: new ig.Image('media/healthSprite.png'),
    statMatte: new ig.Image('media/stat-matte.png'),
    // Load Fonts
    instructText: new ig.Font( 'media/04b03.font.png' ),
    statText: new ig.Font( 'media/04b03.font.png' ),
    //Load SFX
    loseSFX: new ig.Sound( 'media/audio/Sad-Trombone-Joe-Lamb-665429450.*' ),

    /*
     |--------------------------------------------------------------------------
     | INIT: FUNCTION()
     |--------------------------------------------------------------------------
     | Initialize your game here; bind keys etc.
     */
	init: function() {
        this.loadLevel( LevelDorm1 );
        // Bind keys
        ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
        ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
        ig.input.bind( ig.KEY.X, 'jump' );
        ig.input.bind( ig.KEY.C, 'shoot' );
        ig.input.bind( ig.KEY.TAB, 'switch' );
        ig.input.bind( ig.KEY.SPACE, 'continue' );
        // Play background music
        ig.music.add( 'media/audio/2-04 Run!.*' );
        ig.music.volume = 0.5;
        ig.music.play();
	},
    /*
     |--------------------------------------------------------------------------
     | loadLevel: FUNCTION()
     |--------------------------------------------------------------------------
     | Reset statistics and timer.
     */
    loadLevel: function( data ) {
        this.stats = {time: 0, kills: 0, deaths: 0};
    	this.parent(data);
        this.levelTimer.reset();
    },
    /*
     |--------------------------------------------------------------------------
     | UPDATE: FUNCTION()
     |--------------------------------------------------------------------------
     | Updates the main game screen, including the camera.
     */
    update: function() {
    	// Sets screen to follow the player
    	var player = this.getEntitiesByType( EntityPlayer )[0];
    	if( player ) {
    		this.screen.x = player.pos.x - ig.system.width/2;
    		this.screen.y = player.pos.y - ig.system.height/1.5;
            if(player.accel.x > 0 && this.instructText)
                this.instructText = null;
    	}
    	// Update all entities and BackgroundMaps
        if(!this.showStats){
        	this.parent();
        }else{
            if(ig.input.state('continue')){
                this.showStats = false;
                this.levelExit.nextLevel();
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
		// Draw all entities and backgroundMaps
		this.parent();

        // Create Player Object
        var player = this.getEntitiesByType( EntityPlayer )[0];

        // At the beginning of a level, display gameplay instructions.
        if(this.instructText){
            var x = ig.system.width/2,
            y = ig.system.height - 10;
            this.instructText.draw( 'Left/Right Moves, X Jumps, C Fires & Tab Switches Weapons.', x, y, ig.Font.ALIGN.CENTER );
        }

        // If displaying statistics, print what is below:
        if(this.showStats){
            this.statMatte.draw(0,0);
            var x = ig.system.width/2;
            var y = ig.system.height/2 - 20;
            this. statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
            this. statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
            this. statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
            this. statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
            this. statText.draw('Press Spacebar to continue.', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
        }

        /* Number of lives */
        this.statText.draw("Lives", 5,5);
        for(var i=0; i < this.lives; i++){
            this.lifeSprite.draw(((this.lifeSprite.width + 2) * i)+5, 15);
        }

        if(player){
         /* Draw Health */
         for(var j=0; j < player.health; j++){
            this.healthSprite.draw(5, ((this.healthSprite.height + 2) * j)+ 40);
        }
        }

	},
    /*
     |--------------------------------------------------------------------------
     | toggleStats: FUNCTION()
     |--------------------------------------------------------------------------
     | Present the statistics gathered for the level and set the levelExit.
     | Called upon completion of level.
     */
    toggleStats: function(levelExit){
        this.showStats = true;
        this.stats.time = Math.round(this.levelTimer.delta());
        this.levelExit = levelExit;
    },
    /*
     |--------------------------------------------------------------------------
     | gameOver: FUNCTION()
     |--------------------------------------------------------------------------
     | Called when the player has lost the game (i.e. run out of lives).
     */
    gameOver: function(){
        console.log('gameOver');
        this.loseSFX.play();
        ig.finalStats = ig.game.stats;
        ig.system.setGame(GameOverScreen);
    }
});

StartScreen = ig.Game.extend({
    instructText: new ig.Font( 'media/04b03.font.png' ),
    background: new ig.Image('media/screen-bg.png'),
    init: function() {
        ig.input.bind( ig.KEY.SPACE, 'start');
    },
    update: function() {
        if(ig.input.pressed ('start')){
            ig.system.setGame(MyGame)
        }
        this.parent();
    },
    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2,
        y = ig.system.height - 10;
        this.instructText.draw( 'Press Spacebar To Start', x+40, y, ig.Font.ALIGN.CENTER );
    }
});

GameOverScreen = ig.Game.extend({
    instructText: new ig.Font( 'media/04b03.font.png' ),
    gameOver: new ig.Image('media/GAMEOVER.png'),
    stats: {},
    init: function() {
        console.log('init end screen');
        ig.input.bind( ig.KEY.SPACE, 'start');
        this.stats = ig.finalStats;
    },
    update: function() {
        if(ig.input.pressed('start')){
            ig.system.setGame(CreditScreen)
        }
        this.parent();
    },
    draw: function() {
        this.parent();
        var x = ig.system.width/2;
        var y = ig.system.height/2 - 20;
        this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
        var score = (this.stats.kills * 100) - (this.stats.deaths * 50);
        this.instructText.draw('Total Kills: '+this.stats.kills, x, y+30, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Total Deaths: '+this.stats.deaths, x, y+40, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Press Spacebar To Continue.', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
    }
});

CreditScreen = ig.Game.extend({
    instructText: new ig.Font( 'media/04b03.font.png' ),
    gameOver: new ig.Image('media/victory.png'),
    stats: {},
    init: function() {
        console.log('init credit screen');
        ig.input.bind( ig.KEY.SPACE, 'start');
        this.stats = ig.finalStats;
    },
    update: function() {
        if(ig.input.pressed('start')){
            ig.system.setGame(StartScreen)
        }
        this.parent();
    },
    draw: function() {
        this.parent();
        var x = ig.system.width/2;
        var y = ig.system.height/2 - 20;
        this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
        this.instructText.draw('CREDITS', x, y+25, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Developers: ', x, y+40, ig.Font.ALIGN.RIGHT);
        this.instructText.draw('Antonio Montalvo \nTrung Nguyen \nAlexis Hoshino', x, y+40, ig.Font.ALIGN.LEFT);
        this.instructText.draw('Impact Library Creator: ', x, y+70, ig.Font.ALIGN.RIGHT);
        this.instructText.draw('Dominic Szablewski', x, y+70, ig.Font.ALIGN.LEFT);
        this.instructText.draw('Music: ', x, y+80, ig.Font.ALIGN.RIGHT);
        this.instructText.draw('RMN Music Pack', x, y+80, ig.Font.ALIGN.LEFT);
        this.instructText.draw('Sound Effects: ', x, y+90, ig.Font.ALIGN.RIGHT);
        this.instructText.draw('Joe Lamb, Yuri Santana, man \nMike Koenig, Simon Craggs\nGoodSoundForYou, RA The Sun God', x, y+90, ig.Font.ALIGN.LEFT);
        this.instructText.draw('Written with guidance from "Introducing HTML5 Game Development" by Jesse Freeman\n' +
        'and "HTML5 Game Development with ImpactJS" by Davy Cielen and Arno Meysman', x, ig.system.height - 45, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Thanks for playing!', x, ig.system.height - 25, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Press Spacebar To Continue.', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
    }
});


if( ig.ua.mobile ) {
    // Disable sound for all mobile devices
    ig.Sound.enabled = false;
}

// Start the Game with 60fps, a resolution of 520x340, scaled
// up by a factor of 2
ig.main( '#canvas', StartScreen, 70, 520, 340, 2 );

});
