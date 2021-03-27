// Kirsten Roethel
// Team Bee

// Mod 1: Changed the grid size to 8 x 2
// Mod 2: Changed the status line to "Play A Song!"
// Mod 3: Changed the status color to black
// Mod 4: Changed grid background to baby blue
// Mod 5: Changed the borders to black
// Mod 6: Removed borders on the perimeter of the grid
// Mod 7: Changed borders to look like piano keys
// Mod 8: Made the beads turn black when clicked, turning white again when released (Removed toggle)
// Mod 9: Added different piano key sounds to each bead
// Mod 10: Made more than one bead turn black when clicked

/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // do not remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

	// Create color variable for baby blue and light grey

	var BABY_BLUE = 0x89cff0;
	var LIGHT_GREY = 0xd3d3d3;

PS.init = function( system, options ) {

	// Establish grid dimensions
	
	PS.gridSize( 8, 2 );
	
	// Set background color to baby blue

	PS.gridColor( BABY_BLUE );

	// Removed border on the perimeter of the grid, gave the border in between beads a width of 4 and color black
	// Makes the grid look like piano keys

	PS.border ( PS.ALL, 0, { top : 0, bottom : 0, right : 4, left : 4});
	PS.border ( PS.ALL, 1, { top : 0, Bottom : 0, right : 1, left : 1});
	PS.border ( 0, PS.ALL, { left: 0});
	PS.border ( 7, PS.ALL, { right: 0});
	PS.borderColor ( PS.ALL, PS.ALL, PS.COLOR_BLACK );

	// Change status line color and text

	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Play A Song!" );

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
	// Toggle color of touched bead and the one under/below from white to light grey when touched.
	// NOTE: The default value of a bead's [data] is 0, which happens to be equal to PS.COLOR_BLACK

	PS.color( x, y, data ); // set color to current value of data

	// Set the bead color to grey when touched

	PS.color( x, y, LIGHT_GREY );

	// The key above/below is also changed

	if ( y == 1 ) {
		PS.color( x, 0, LIGHT_GREY );
	}
		else{
			PS.color ( x, 1, LIGHT_GREY );
		}


	// Play piano sounds

	// Plays piano key C when the first bead is clicked

	if ( x == 0 ) {
		PS.audioPlay( "piano_c4" );
	}

	// Plays piano key D when the second bead is clicked

	if ( x == 1 ) {
		PS.audioPlay( "piano_d4" );
	}

	// Plays piano key E when the third bead is clicked

	if ( x == 2 ) {
		PS.audioPlay( "piano_e4" );
	}

	// Plays piano key F when the fourth bead is clicked

	if ( x == 3 ) {
		PS.audioPlay( "piano_f4" );
	}

	// Plays piano key G when the fifth bead is clicked

	if ( x == 4 ) {
		PS.audioPlay( "piano_g4" );
	}

	// Plays piano key A when the sixth bead is clicked

	if ( x == 5 ) {
		PS.audioPlay( "piano_a4" );
	}

	// Plays piano key B when the seventh bead is clicked

	if ( x == 6 ) {
		PS.audioPlay( "piano_b4" );
	}

	// Plays piano key C when the eighth bead is clicked

	if ( x == 7 ) {
		PS.audioPlay( "piano_c5" );
	}
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

// UNCOMMENT the following code BLOCK to expose the PS.release() event handler:


PS.release = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Set the bead color to white when released

	PS.color( x, y, PS.COLOR_WHITE );

	// The key above/below is also changed

	if ( y == 1 ) {
		PS.color( x, 0, PS.COLOR_WHITE );
	}
	else{
		PS.color ( x, 1, PS.COLOR_WHITE );
	}


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

// UNCOMMENT the following code BLOCK to expose the PS.enter() event handler:

/*

PS.enter = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

*/

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exit() event handler:



PS.exit = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// Turns the bead white when the mouse exits the bead

	PS.color( x, y, PS.COLOR_WHITE );

	// The key above/below is also changed
	
	if ( y == 1 ) {
		PS.color( x, 0, PS.COLOR_WHITE );
	}
	else{
		PS.color ( x, 1, PS.COLOR_WHITE );
	}

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};



/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyDown() event handler:

/*

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

*/

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

// UNCOMMENT the following code BLOCK to expose the PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

// UNCOMMENT the following code BLOCK to expose the PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

*/
