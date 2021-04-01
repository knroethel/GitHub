/*
game.js for Perlenspiel 3.3.x
Last revision: 2021-03-24 (BM)

The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API
documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// Necessary variables
var COLOR_DARKNESS = 0x1F1F1F;
var COLOR_MIDBURST = 0xA10000;
var COLOR_DIMBURST = 0x5F0000;

var GLYPH_CIRCLE = 0x2B24;

var RATE_FLASH = 60;
var RATE_TRAVEL = 15;

var SOUND_SHOOT = "fx_shoot5";
var SOUND_BURST = "fx_blast3";
var SOUND_FIZZLE = "fx_rip";

// fireworks array
var fireworks = [];

var takeoff = function () {

	// A function that will be called in timerStart
	// Adds the bead to the fireworks array
	// Begins the animation of a bead (firework) up in the grid
	// The previous bead is turned invisible, and the y value of the coordinate is decreased
	// Loops are counted by a local variable, ensuring the bead travels up 6 beads (in 3 seconds, using RATE_TRAVEL)
	// Every loop checks the beads y coordinate
	// If the y coordinate reaches 0, except the last loop, the function fizzle is called and
	// the bead is removed from fireworks
	// If the y coordinate never equals 0, or hits 0 on the last loop, the function explode is called
	// and the bead is removed from fireworks

	var count, len, i, rocket, x, y;

	len = fireworks.length;

	count = 0;
	i = 0;
	while ( i < len) {
		rocket = fireworks[ i ];
		x = rocket[ 0 ];
		y = rocket[ 1 ];
		if ( y > 0 ) {
			PS.visible( x, y, false );
			y -= 1;
			rocket[ 1 ] = y;
			count += 1;
			if ( y == 0) {
				PS.visible(x, y, true);
				fizzle(x, y);
			}
			if (count = 6 ) {
				PS.visible(x, y, true);
				PS.color( x, y, COLOR_MIDBURST );
				PS.glyph( x, y, GLYPH_CIRCLE );
				PS.glyphColor( x, y, PS.COLOR_RED );
			}
			else {
				explode( x, y );
			}

			i += 1;
		}
		else {
			PS.visible( x, y, false );
			fireworks.splice( i, 1);
			len -= 1;
		}
	}

}

var fizzle = function ( x, y ) {
	// A function called if a bead hits the top of the grid before it finishes its travel animation
	// The glyph fades from red to the background color
	// The bead disappears after the glyph fade
	// Plays the SOUND_FIZZLE audio
	PS.visible(x, y, true);

	PS.fade( x, y, RATE_FLASH, { rgb : PS.COLOR_BLACK } );
	PS.glyphFade( x, y, RATE_FLASH, { rgb : PS.COLOR_BLACK } );

	PS.color( x, y, PS.COLOR_DARKNESS );
	PS.glyphColor( x, y, COLOR_DARKNESS );

	PS.audioPlay( SOUND_FIZZLE );
}
var explode = function ( x, y ) {
	// Called when a bead finishes its trajectory without interruption and can explode
	// The glyph will flash white using PS.fade and { rgb : PS.COLOR_WHITE }
	// The bead will also flash a dimmer color, fading with the circle
	// The grid background will flash and fade an even dimmer color than the bead background
	// The bead disappears after the fades conclude
	// Plays the SOUND_BURST audio
	PS.visible( x, y, true);

	PS.fade( x, y, RATE_FLASH, { rgb : PS.COLOR_RED } );
	PS.glyphFade( x, y, RATE_FLASH, { rgb : PS.COLOR_WHITE } );
	PS.gridFade( RATE_FLASH, { rgb : PS.COLOR_MIDBURST } );

	PS.color ( x, y, COLOR_MIDBURST );
	PS.glyphColor( x, y, PS.COLOR_RED );
	PS.gridColor ( COLOR_DIMBURST );

	PS.audioPlay ( SOUND_BURST );
}

PS.init = function( system, options ) {
	// Change this string to your team name
	// Use only ALPHABETIC characters
	// No numbers, spaces or punctuation!

	const TEAM = "Bee";

	// Begin with essential setup
	// Establish initial grid size

	// Grid size set to 28x28 and set to color DARKNESS
	PS.gridSize( 24, 24 );
	PS.gridColor( COLOR_DARKNESS );

	// Grid will fade
	// PS.gridFade( RATE_FLASH );

	// All beads are invisible and round
	PS.visible( PS.ALL, PS.ALL, false );
	PS.radius( PS.ALL, PS.ALL, 50 );

	// Beads will fade and flash red
	// PS.fade( PS.ALL, PS.ALL, RATE_FLASH, { rgb : PS.COLOR_RED} );

	// Glyphs will fade and flash white
	// PS.glyphFade( PS.ALL, PS.ALL, RATE_FLASH, { rgb : PS.COLOR_WHITE } );

	// Border erased
	PS.border( PS.ALL, PS.ALL, 0 );

	// Status line text and color both changed
	PS.statusText( "Celebrate!" );
	PS.statusColor( PS.COLOR_WHITE );

	// Load in the three necessary audio clips
	PS.audioLoad( SOUND_SHOOT );
	PS.audioLoad( SOUND_BURST );
	PS.audioLoad( SOUND_FIZZLE );

	// Start timer (NOT IN USE YET)
	PS.timerStart( RATE_TRAVEL, takeoff );


	// PS.dbLogin() must be called at the END
	// of the PS.init() event handler (as shown)
	// DO NOT MODIFY THIS FUNCTION CALL
	// except as instructed

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			return PS.dbErase( TEAM );
		}
		PS.dbEvent( TEAM, "startup", user );
		PS.dbSave( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
	if ( y > 0 ) {
		PS.visible( x, y, true );
		PS.color( x, y, COLOR_MIDBURST );
		PS.glyph( x, y, GLYPH_CIRCLE );
		PS.glyphColor( x, y, PS.COLOR_RED );
		PS.audioPlay( SOUND_SHOOT );
	}
	else {
		fizzle( x, y );
	}
	fireworks.push( [x, y] );

};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.

};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

	//	 var device = sensors.wheel; // check for scroll wheel
	//
	//	 if ( device ) {
	//	   PS.debug( "PS.input(): " + device + "\n" );
	//	 }

	// Add code here for when an input event is detected.
};

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

