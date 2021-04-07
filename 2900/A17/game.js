/*
 game.js for Perlenspiel 3.3.x
 Last revision: 2021-01-29 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

const _FPS = 6; // 10 fps

const _pool = []; // pool of sprites available for re-use
let _nextPlane = 1; // next assignable sprite plane
const _particles = []; // list of active particles

const NIGHT_SKY = PS.COLOR_BLACK;

const SOUND_SHOOT = "fx_shoot5";
const SOUND_BURST = "fx_blast3";
const SOUND_FIZZLE = "fx_shoot7";



// Call this to create a new particle at x/y with the specified color and alpha (default = opaque)

const _spawn = function ( x, y, color, alpha = 255 ) {
	const self = this;

	let _cx = x;
	let _cy = y;
	let _rgb = color;
	let _a = alpha;
	let _plane = 0;

	const _pathX = [ x ];
	const _pathY = [ y ];
	const _pathExec = [ null ];
	let _len = 1;
	let _lastX = x;
	let _lastY = y;
	let _sprite = null;

	if ( _pool.length > 0 ) {
		_sprite = _pool.pop();
		_plane = PS.spritePlane( _sprite );
	}
	else {
		_sprite = PS.spriteSolid( 1, 1 );
		PS.spritePlane( _sprite, _nextPlane );
		_plane = _nextPlane;
		_nextPlane += 1;
	}
	PS.spriteSolidColor( _sprite, _rgb );
	PS.spriteSolidAlpha( _sprite, _a );

	let _running = false;
	let _step = 0;
	let _loop = false;

	const _stop = function () {
		_running = false;
		PS.spriteShow( _sprite, false );
		_pool.push( _sprite );
	};

	const api = Object.create( null );
	Object.assign( api, {
		add : function ( dx, dy, exec = null ) {
			if ( !dx && !dy ) {
				return;
			}
			if ( exec && ( typeof exec !== "function" ) ) {
				PS.debug( "target(): exec is not a function\n" );
				return;
			}
			let nx = _lastX + dx;
			let ny = _lastY + dy;
			let line = PS.line( _lastX, _lastY, nx, ny );
			line.forEach( function ( point ) {
				_pathX.push( point[ 0 ] );
				_pathY.push( point[ 1 ] );
				_pathExec.push( null );
			} );
			_len = _pathX.length;
			let last = _len - 1;
			_lastX = _pathX[ last ];
			_lastY = _pathY[ last ];
			if ( exec ) {
				_pathExec[ last ] = exec;
			}
		},
		start : function ( doLoop= false ) {
			if ( _running ) {
				PS.debug( "Particle + " + _plane + " already running\n" );
				return;
			}
			_loop = doLoop;
			_running = true;
			_particles.push( api );
		},
		finished : function () {
			return _running;
		},
		stop : function () {
			_stop();
		},
		move : function () {
			if ( !_running ) {
				return false;
			}
			_step += 1;
			if ( _step >= _len ) {
				if ( !_loop ) {
					_stop();
					return false;
				}
				_step = 0;
			}
			_cx = _pathX[ _step ];
			_cy = _pathY[ _step ];
			PS.spriteShow( _sprite, true );
			PS.spriteMove( _sprite, _cx, _cy );
			let exec = _pathExec[ _step ];
			if ( exec ) {
				try {
					exec( _cx, _cy );
				}
				catch ( e ) {
					PS.debug( "Particle + " + _plane + " exec error [" + e.message + "]\n" );
				}
			}
			return true;
		}
	} );
	return Object.freeze( api );
};

const _timer = function () {
	let len = _particles.length;
	let i = 0;
	while ( i < len ) {
		let p = _particles[ i ];
		if ( !p.finished() || !p.move() ) {
			_particles.splice( i, 1 );
			len -= 1;
		}
		else {
			i += 1;
		}
	}
};

let _idTimer = ""; // timer ID

// Create red trails that explode in four diagonals from x, y

const _burst = function ( x, y ) {
	let len = PS.random( 6 ) + 1; // length of each burst is random
	let BURST_COLOR = PS.random( PS.COLOR_WHITE )

	if ( y <= 0 ) {
		PS.audioPlay( SOUND_FIZZLE, {
			volume: .03,
		});

		PS.fade( PS.ALL, PS.ALL, 15, { rgb : PS.COLOR_GRAY_DARK } );
		PS.gridFade( 15, { rgb : PS.COLOR_GRAY_DARK } );

		PS.gridColor( NIGHT_SKY );
		PS.color( PS.ALL, PS.ALL, NIGHT_SKY );
	}
	else
		{
			PS.audioPlay( SOUND_BURST, {
				volume : .03,
			} );

			PS.fade( PS.ALL, PS.ALL, 60, { rgb : BURST_COLOR } );
			PS.gridFade( 60, { rgb : BURST_COLOR } );

			PS.gridColor( NIGHT_SKY );
			PS.color( PS.ALL, PS.ALL, NIGHT_SKY );

			let burst1 = _spawn( x, y,BURST_COLOR );

			burst1.add(-PS.random( 6 ) + 1, -PS.random( 6 ) + 1);
			burst1.add(-1, 1);
			burst1.add(0, 1)
			burst1.start();

			let burst2 = _spawn(x, y, BURST_COLOR );
			burst2.add(PS.random( 6 ) + 1, PS.random( 6 ) + 1);
			burst2.add(1, 1);
			burst2.add(0, 1);
			burst2.start();

			let burst3 = _spawn(x, y, BURST_COLOR );
			burst3.add(PS.random( 6 ) + 1, -PS.random( 6 ) + 1);
			burst3.add(1, 1);
			burst3.add(0, 1);
			burst3.start();

			let burst4 = _spawn(x, y, BURST_COLOR );
			burst4.add(-PS.random( 6 ) + 1, PS.random( 6 ) + 1);
			burst4.add(-1, 1);
			burst4.add(0, 1);
			burst4.start();

			if ( PS.random( 2 ) === 1 ) {
				let burst5 = _spawn(x, y, BURST_COLOR);
				burst5.add(-PS.random(6) + 1, 0);
				burst5.add(-1, 1);
				burst5.add(0, 1);
				burst5.start();

				let burst6 = _spawn(x, y, BURST_COLOR);
				burst6.add(0, -PS.random(6) + 1);
				burst6.add(1, -1);
				burst6.add(0, 1);
				burst6.start();
			}
			else{
				return;
			}

		};
	
};

PS.init = function( system, options ) {

	PS.gridSize( 32, 32 );
	PS.gridColor( NIGHT_SKY );


	PS.color( PS.ALL, PS.ALL, NIGHT_SKY );
	PS.border( PS.ALL, PS.ALL, 0 );


	PS.statusText( "Celebrate!" );
	PS.statusColor( PS.COLOR_WHITE );


	PS.audioLoad( SOUND_SHOOT );
	PS.audioLoad( SOUND_BURST );
	PS.audioLoad( SOUND_FIZZLE );

	_idTimer = PS.timerStart( _FPS, _timer ); // start the particle animator
};

PS.touch = function( x, y, data, options ) {
	let FIREWORK_COLOR = PS.random( PS.COLOR_WHITE );
	let rocket = _spawn( x, y, FIREWORK_COLOR ); // create a new rocket at touch point

	let flight_time = PS.random( 10 ) + 2;

	rocket.add( 0, -( flight_time ), _burst ); // add a target a random number of beads above it that bursts at the end

	PS.audioPlay( SOUND_SHOOT, {
		volume : .03,
	} );

	// Comment out the line above
	// Then uncomment the following 4 lines and re-run
	// to make the rocket fly in a square
	// before it bursts!

	// rocket.add( 0, -8 );
	// rocket.add( 6, 0 );
	// rocket.add( 0, 6 );
	// rocket.add( -6, 0, _burst );

	rocket.start(); // fire!
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

