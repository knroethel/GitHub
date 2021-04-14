/*
game.js for Perlenspiel 3.3.xd
Last revision: 2021-04-08 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-21 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Add code to the event handlers required by your project.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
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
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

const G = ( function () {
	// These are values used for the map images you use to define levels.
	// I switched to primary colors for flexibility.
	// You want to decouple the colors in the map (which must be simple and distinctive)
	// from the colors on the screen (which can be as subtle/varied as you want).

	const BACKGROUND_COLOR = 0x8f634c;

	const MAP_ACTOR = 0x00FF00; // initial location of actor
	const MAP_FRAME = 0xFF0000; // frame area
	const MAP_CANVAS = 0x0000FF; // canvas area
	const MAP_PAINT = 0x000000; // blocks already placed that cannot be moved
	const MAP_EMPTY = 0xFFFFFF; // locations where a block needs to be placed
	const MAP_BLOCK = 0xFFFF00; // initial location of a block

	// These are the colors that are actually drawn

	const COLOR_FRAME = 0x452616;
	const COLOR_CANVAS = 0x3C2940;
	const COLOR_PAINT = 0x88EBEB;
	const COLOR_BLOCK = 0x417291;
	const COLOR_ARTIST = 0xFF3065;

	// Defines planes for different elements (canvas is on default plane)

	const PLANE_BLOCK = 1;
	const PLANE_ARTIST = 2;

	let _rgb_frame; // used for shading frame colors
	let _rgb_canvas; // used for shading canvas colors

	// Hint Timer
	let hint_time;
	let end_hint;

	// Sounds

	const MOVE_SOUND = "fx_pop";
	const PUSH_SOUND = "perc_block_low";
	const HIT_SOUND = "fx_hoot";

	// Size of grid (controlled by map image dimensions)

	let _grid_x = 0;
	let _grid_y = 0;

	var clicks = 0;

	// Current location of artist

	var _artist_x = 0;
	var _artist_y = 0;

	var _artist_sprite; // sprite ID of artist

	// This array holds information about all block sprites

	let _blocks = [];
	let _mapdata = []; // holds information about map layout

	let _spaces = 0; // number of spaces in this level
	let _filled = 0; // number of FILLED spaces
	let _won = false; // set to true at end of level

	// Returns true if location (x, y) is in the frame

	const _is_frame = function ( x, y ) {
		let data = _mapdata[ ( y * _grid_x ) + x ];
		return ( data === MAP_FRAME );
	};

	// Returns true if location (x, y) is paint

	const _is_paint = function ( x, y ) {
		let data = _mapdata[ ( y * _grid_x ) + x ];
		return ( data === MAP_PAINT );
	};

	// Returns true if location (x, y) is an empty paint space

	const _is_empty = function ( x, y ) {
		let data = _mapdata[ ( y * _grid_x ) + x ];
		return ( data === MAP_EMPTY );
	};

	// Returns block if location (x, y) contains a block, else false

	const _is_block = function ( x, y ) {
		// Traverse list of blocks to see if any match
		let len = _blocks.length;
		for ( let i = 0; i < len; i += 1 ) {
			let block = _blocks[ i ];
			if ( ( block.x === x ) && ( block.y === y ) ) {
				return block;
			}
		}
		return false;
	};

	const _place_artist = function ( x, y ) {
		PS.spriteMove( _artist_sprite, x, y );
		_artist_x = x;
		_artist_y = y;
	};

	const _step = function ( h, v ) {
		let dx = h;
		let dy = v;

		let nx = _artist_x + dx;
		let ny = _artist_y + dy;

		if ( ( nx < 0 ) || ( nx >= _grid_x ) || ( ny < 0 ) || ( ny >= _grid_y ) ) {
			PS.audioPlay( HIT_SOUND, { volume: .1 } );
			return;
		}

		// Prevent artist from stepping on paint

		if ( _is_paint( nx, ny ) ) {
			PS.audioPlay( HIT_SOUND, { volume: .1 } );
			return;
		}

		// Is artist pushing against one or more blocks?

		let chain = []; // for building block chain

		let block = _is_block( nx, ny );
		while ( block ) {
			let bx = nx + dx;
			let by = ny + dy;
			// Can't push a block into paint or into the frame

			if ( _is_frame( bx, by ) || _is_paint( bx, by ) ) {
				PS.audioPlay( HIT_SOUND, { volume: .1 } );
				return;
			}

			block.nx = bx;
			block.ny = by;
			chain.push( block ); // add to list of potential moves

			dx += h;
			dy += v;
			block = _is_block( bx, by );
		}

		// Push all blocks in chain (if any)
		// Chain must be moved from front to back!

		let i = chain.length;
		while ( i > 0 ) {
			i -= 1;
			block = chain[ i ];
			if ( _is_empty( block.x, block.y ) ) {
				_filled -= 1;
				PS.spriteSolidColor( block.id, COLOR_BLOCK );
			}
			block.x = block.nx;
			block.y = block.ny;
			PS.spriteMove( block.id, block.x, block.y );
			if ( _is_empty( block.x, block.y ) ) {
				PS.spriteSolidColor( block.id, COLOR_PAINT );
				_filled += 1;
				if ( _filled === _spaces ) {
					_won = true;
					PS.statusText( "A Masterpiece! Any button to continue." );
					PS.audioPlay( "perc_triangle", { volume: .3 } );
				}
			}
		}

		_place_artist( nx, ny );

		let snd = ( chain.length > 0 ) ? PUSH_SOUND : MOVE_SOUND;
		PS.audioPlay( snd, { volume : 0.1 } );
	};

	const _shade = function ( color ) {
		const RANGE = 6;

		const vary = function ()  {
			return ( PS.random( RANGE * 2 ) - RANGE );
		};

		let r = color.r + vary();
		let g = color.g + vary();
		let b = color.b + vary();

		return PS.makeRGB( r, g, b );
	};

	const _place_block = function ( x, y ) {
		// No need to manipulate grid planes when dealing with sprites
		// They do everything for you!

		let sprite = PS.spriteSolid( 1, 1 ); // create a sprite ID
		PS.spriteSolidColor( sprite, COLOR_BLOCK ); // color it
		PS.spritePlane( sprite, PLANE_BLOCK ); // assign plane
		PS.spriteMove( sprite, x, y ); // move it there

		// Create a data structure that stores the ID and location of each block

		let block = {
			id : sprite, // ID of sprite
			x : x, // x-position
			y : y, // y-position
			nx : x, // potential x-pos
			ny : y // potential y-pos
		};

		_blocks.push( block ); // save the data here (I like how you get to "push" a block :) )
	};

	// This code is your level system
	// Each entry in the _LEVELS array defines a separate level
	// Just create a new object for each level you build
	// You can customize levels with unique palettes/sounds by adding properties

	const _LEVELS = [
		{
			muse: "■",
			map: "images/level_SQUARE.gif"
		},

		{
			muse: "- - -",
			map: "images/level_LINEBREAK.gif"
		},

		{
			muse: "†",
			map: "images/level_CROSS.gif"
		},

		{
			muse: "M",
			map: "images/level_M.gif"
		},

		{
			muse: "〇",
			map : "images/level_CIRCLE.gif"
		},
	]

	let _level = 0; // current level

	const remove_hint = function (){
		let level = _LEVELS[ _level - 1 ];
		PS.statusText( "Muse: " + level.muse );
	}

	const give_hint = function () {
		end_hint = PS.timerStart( 300, remove_hint );
		PS.statusText( "Stuck? Press R to Reload!" );
	}

	// Called when a level map is loaded.
	// Handles grid sizing, map drawing, actor/block placement.

	const _on_load  = function ( image ) {
		if ( image === PS.ERROR ) {
			PS.debug( "onMapLoad(): image load error\n" );
			return;
		}

		// Prepare grid for map drawing

		_grid_x = image.width;
		_grid_y = image.height;

		PS.gridSize( _grid_x, _grid_y );
		PS.gridColor( BACKGROUND_COLOR );

		PS.border( PS.ALL, PS.ALL, 0 );
		PS.borderColor( PS.ALL, PS.ALL, PS.COLOR_BLACK );

		PS.border( PS.ALL, 0, { bottom : 5 } );
		PS.border( PS.ALL, _grid_y - 1, { top : 5 } );
		PS.border( 0, PS.ALL, { right : 5 } );
		PS.border( _grid_x - 1, PS.ALL, { left : 5 } );

		PS.border( 0, 0, 0 );
		PS.border( 0, _grid_y - 1, 0 );
		PS.border( _grid_x - 1, 0, 0);
		PS.border( _grid_x - 1, _grid_y - 1, 0 );

		// Translate map pixels to the drawn map and sprites

		let i = 0;
		for ( let y = 0; y < _grid_y; y += 1 ) {
			for ( let x = 0; x < _grid_x; x += 1 ) {
				let pixel = image.data[ i ];
				let data = pixel;
				switch ( pixel ) {
					case MAP_FRAME:
						PS.color( x, y, _shade( _rgb_frame, {} ) );
						break;
					case MAP_CANVAS:
						PS.color( x, y, _shade( _rgb_canvas, {} ) );
						break;
					case MAP_EMPTY:
						_spaces += 1; // found a space
						PS.color( x, y, _shade( _rgb_canvas, {} ) ); // Empty spaces colored same as canvas
						break;
					case MAP_PAINT:
						PS.color( x, y, COLOR_PAINT );
						break;
					case MAP_BLOCK:
						_place_block( x, y );
						PS.color( x, y, _shade( _rgb_canvas, {} ) ); // Blocks always located on canvas
						data = MAP_CANVAS; // logically appears as canvas space
						break;
					case MAP_ACTOR:
						_place_artist( x, y );
						PS.color( x, y, _shade( _rgb_frame, {} ) ); // Artist always starts on frame
						data = MAP_FRAME; // logically appears as frame space
						break;
					default:
						PS.debug( "Unrecognized pixel value!\n" );
						break;
				}
				_mapdata[ i ] = data; // save pixel value here for movement control
				i += 1; // update array pointer
			}
		}
		PS.gridRefresh(); // forces grid to be drawn
	};


	const _next_level = function () {
		// Fetch data for next level (starts at zero)

		let level = _LEVELS[ _level ];

		// Game over if no more level data

		if ( !level ) {
			PS.statusText( "You win!" );
			PS.audioPlay( "perc_cymbal_ride" );
			return;
		}

		_level += 1; // point to next level

		_mapdata = []; // clear previous map data;

		_spaces = 0;
		_filled = 0;
		_won = false;

		// Delete all blocks from previous level

		_blocks.forEach( function ( block ) {
			PS.spriteDelete( block.id );
		} );

		_blocks = [];

		PS.statusText( "Muse: " + level.muse ); // display muse
		PS.imageLoad( level.map, _on_load, 1 ); // load the level map in format 1
	};

	// Perlenspiel functions

	return {
		init : function () {
			// Initialization function

			PS.audioLoad( "xylo_eb5" );
			PS.audioLoad( "perc_block_low" );
			PS.audioLoad( "fx_hoot" );
			PS.audioLoad( "perc_triangle" );
			PS.audioLoad( "perc_cymbal_ride");

			// Create artist sprite (only once)

			_artist_sprite = PS.spriteSolid( 1, 1 );
			PS.spriteSolidColor( _artist_sprite, COLOR_ARTIST );
			PS.spritePlane( _artist_sprite, PLANE_ARTIST );

			// Set these colors up for shading

			_rgb_frame = PS.unmakeRGB( COLOR_FRAME, {} );
			_rgb_canvas = PS.unmakeRGB( COLOR_CANVAS, {} );

			// Timer
			hint_time = PS.timerStart( 1800, give_hint );


			_next_level(); // set up first level

			PS.statusText( "Use WASD/Arrows to Move!")

			// This code should be the last thing
			// called by your PS.init() handler.
			// DO NOT MODIFY IT, except for the change
			// explained in the comment below.

			const TEAM = "bee";

			PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
				if ( user === PS.ERROR ) {
					return;
				}
				PS.dbEvent( TEAM, "startup", user );
				PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
			}, { active : false } );

			// Change the false in the final line above to true
			// before deploying the code to your Web site.

		},
		keyDown : function ( key ) {

			if ( _won ) {
				_next_level();
				return;
			}

			if ( clicks === 0 ){
				let level = _LEVELS[ _level - 1 ];
				PS.statusText( "Muse: " + level.muse );
				clicks += 1;
			}

			switch ( key ) {
				case PS.KEY_ARROW_UP:
				case 119:
				case 87: {
					_step( 0, -1 );
					break;
				}
				case PS.KEY_ARROW_DOWN:
				case 115:
				case 83: {
					_step( 0, 1 );
					break;
				}
				case PS.KEY_ARROW_LEFT:
				case 97:
				case 65: {
					_step( -1, 0 );
					break;
				}
				case PS.KEY_ARROW_RIGHT:
				case 100:
				case 68: {
					_step( 1, 0 );
					break;
				}

				case 114:
				case 64: {
					if ( _level > 0 ) {
						_level -= 1;
					}
					_next_level();
					break;
				}
			}
		}
	}

} () );

PS.init = G.init;
PS.keyDown = G.keyDown;

