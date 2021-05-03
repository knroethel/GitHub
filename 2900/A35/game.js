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
	// Game variables

	// Maze map readers
	const MAP_SCHOLAR = 0xFFFFFF;
	const MAP_WALL = 0x000000;
	const MAP_TOME = 0x00FF00;
	const MAP_PATHWAY = 0x0000FF;

	// Colors
	const COLOR_BACKGROUND = 0x2B2B2B;
	const COLOR_TEXT = 0xEEEEEE;
	const COLOR_SCHOLAR = 0xFFFFFF;
	const COLOR_WALL = 0x000000;
	const COLOR_TOME = 0x9A9A9A
	const COLOR_PATHWAY = 0x646464;
	const COLOR_SPINE = 0x4D4D4D;

	// Dimensions
	let grid_x = 0;
	let grid_y = 0;

	// Planes
	const PLANE_TOME = 1;
	const PLANE_SCHOLAR = 2;

	// Scholar location
	let scholar_x = 0;
	let scholar_y = 0;

	var scholar_sprite;

	// Arrays to hold tomes and maps

	let mazedata = [];

	let tomes_total = 0; // Number of tomes in this level
	let tomes_collected = 0; // Number of tomes collected
	let translated = false; // Set to true at end of a maze
	let game_over = false;

	// Sayings for each level's collection of tomes

	var one_sayings = [
		"Your first tome! Let's translate it...",
		"The second tome has been found!",
		"Another letter has been translated!",
		"What could the message possibly say...",
		"It's nearly finished!",
		"You found all the tomes!",
	];

	var two_sayings = [
		"The next translation begins...",
		"I wonder what the scroll will say?",
		"The tome revealed a letter!",
		"Have you checked the translation progress?",
		"The message is almost complete!",
		"Time to reveal the scroll's wisdom...",
		"That was the final one!",
	];

	var three_sayings = [
		"You found a tome! A letter was translated...",
		"Another tome! A letter reveals itself",
		"Can you read the scroll yet?",
		"More letters are revealed!",
		"You are getting closer...",
		"The message is getting clearer!",
		"Nearly there...",
		"The translation is almost complete!",
		"All tomes have been found!"
	];

	var four_sayings = [
		"The first letter's tome is found.",
		"Keep searching for more!",
		"Can't seem to decipher it yet...",
		"This adventure must be worth it.",
		"The knowledge is so close!",
		"Is the translation complete?",
		"The message can almost be read!",
		"Another scroll translated!",
	];

	var five_sayings = [
		"Off we go again!",
		"The next translation is underway...",
		"Did you check the scroll?",
		"Yet another letter done.",
		"Can you read the message?",
		"Another one found and translated!",
		"We need more tomes...",
		"It's becoming more clear!",
		"Keep searching, only a few more to go!",
		"It's still not quite complete...",
		"You got another! The message is so close!",
		"Just one more should do it...",
		"The translation is finished!",
	];

	// Current scroll
	let scroll = "";

	// Basic status text
	let basic_text = "Tomes will help to translate the scroll...";

	// How many moves have been made
	let moves = 0;

	// Returns true if coordinate is a wall
	const is_wall = function ( x, y ) {
		let data = mazedata[ ( y * grid_x ) + x ];
		return ( data === MAP_WALL );
	};

	// Returns true if coordinate is a tome
	const is_tome = function ( x, y ) {
		let data = mazedata[ ( y * grid_x ) + x ];MAP_PATHWAY
		return ( data === MAP_TOME );
	};

	// Places the scholar
	const place_scholar = function ( x, y ) {
		PS.spriteMove( scholar_sprite, x, y );
		scholar_x = x;
		scholar_y = y;
	};

	const place_tome = function ( x, y ) {
		let oplane = PS.gridPlane();

		PS.gridPlane( PLANE_TOME );
		PS.color( x, y, COLOR_TOME );
		PS.border( x, y, { left: 7 } );
		PS.borderColor( x, y, COLOR_SPINE );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );

		PS.gridPlane( oplane );
	};

	const level_one_scroll = function() {
		if ( tomes_collected === 1 ) {
			scroll = "S❄︎⚐︎🏱︎ ♓︎︎❄︎✏"
		}

		if ( tomes_collected === 2 ) {
			scroll = "S❄︎⚐︎P ︎♓︎︎❄︎✏"
		}

		if ( tomes_collected === 3 ) {
			scroll = "ST⚐︎P ︎♓︎︎T✏"
		}

		if ( tomes_collected === 4 ) {
			scroll = "ST⚐︎P ︎♓︎︎T!"
		}

		if ( tomes_collected === 5 ) {
			scroll = "ST⚐︎P ︎IT!"
		}

		if ( tomes_collected === 6 ) {
			scroll = "STOP ︎IT!"
		}

	};

	const level_two_scroll = function() {
		if ( tomes_collected === 1 ) {
			scroll = "❖︎E🗐︎⬧︎︎E ︎⧫☟︎E ⬧︎︎E🗐☼︎❖︎︎☟"
		}

		if ( tomes_collected === 2 ) {
			scroll = "❖︎E🗐︎SE ︎︎⧫☟︎E SE🗐︎☼︎❖︎︎☟"
		}

		if ( tomes_collected === 3 ) {
			scroll = "❖︎E🗐SE ︎T☟︎E SE🗐☼︎❖☟"
		}

		if ( tomes_collected === 4 ) {
			scroll = "❖︎E🗐SE ︎THE SE🗐︎☼︎❖︎︎H"
		}

		if ( tomes_collected === 5 ) {
			scroll = "CE🗐︎SE ︎THE SE🗐︎☼︎CH"
		}

		if ( tomes_collected === 6 ) {
			scroll = "CE🗐SE ︎THE SE🗐︎RCH"
		}

		if ( tomes_collected === 7 ) {
			scroll = "CEASE THE SEARCH"
		}
	};

	const level_three_scroll = function() {
		if ( tomes_collected === 1 ) {
			scroll = "☝︎⚐︎ N⚐︎ ☞︎🕆︎☼︎❄︎☟︎☜︎☼︎"
		}

		if ( tomes_collected === 2 ){
			scroll = "☝︎⚐︎ N⚐︎ ☞︎🕆︎R❄︎☟︎☜︎R"
		}

		if ( tomes_collected === 3 ){
			scroll = "G⚐︎ N⚐︎ ☞︎🕆︎R❄︎☟︎☜︎R"
		}

		if ( tomes_collected === 4 ){
			scroll = "G⚐︎ N⚐︎ F🕆︎R❄︎☟︎☜︎R"
		}

		if ( tomes_collected === 5 ){
			scroll = "G⚐︎ N⚐︎ F🕆︎R❄︎H☜︎R"
		}

		if ( tomes_collected === 6 ){
			scroll = "G⚐︎ N⚐︎ F🕆︎R❄︎HER"
		}

		if ( tomes_collected === 7 ){
			scroll = "GO NO ︎F🕆︎R❄︎HER"
		}

		if ( tomes_collected === 8 ){
			scroll = "GO NO ︎F🕆︎RTHER"
		}

		if ( tomes_collected === 9 ){
			scroll = "GO NO FURTHER"
		}
	}

	const level_four_scroll = function() {
		if ( tomes_collected === 1 ) {
			scroll = "I❍︎ ■︎⚐︎⧫︎ ☺︎⚐︎🙵I■︎♑︎"
		}

		if ( tomes_collected === 2 ){
			scroll = "I❍︎ ■︎O⧫︎ ☺︎O🙵I■︎♑︎"
		}

		if ( tomes_collected === 3 ){
			scroll = "I❍︎ ■︎O⧫︎ ☺︎O🙵I■G"
		}

		if ( tomes_collected === 4 ){
			scroll = "IM ■︎O⧫︎ ☺︎O🙵I■G"
		}

		if ( tomes_collected === 5 ){
			scroll = "IM ■︎O⧫︎ ☺︎OKI■G"
		}

		if ( tomes_collected === 6 ){
			scroll = "IM ■︎OT ︎☺︎OKI■G"
		}

		if ( tomes_collected === 7 ){
			scroll = "IM NOT ︎☺︎OKING"
		}

		if ( tomes_collected === 8 ){
			scroll = "IM NOT JOKING"
		}
	}

	const level_five_scroll = function() {
		if ( tomes_collected === 1 ) {
			scroll = "❄︎☟︎☜︎☼︎☜︎❼︎⬧︎ N⚐︎ 🕈︎●︎︎⬧︎♎︎⚐︎❍︎︎ ☟︎☜︎☼︎☜︎✏︎"
		}

		if ( tomes_collected === 2 ){
			scroll = "❄︎☟︎☜︎R☜︎❼︎⬧︎ N⚐︎ 🕈︎●︎︎⬧︎♎︎⚐︎❍︎︎ ☟︎☜︎R☜︎✏︎"
		}

		if ( tomes_collected === 3 ){
			scroll = "❄︎☟︎☜︎R☜︎❼︎⬧︎ N⚐︎ 🕈︎●︎︎⬧︎♎︎⚐︎❍︎︎ ☟︎☜︎R☜︎!"
		}

		if ( tomes_collected === 4 ){
			scroll = "T☟︎☜︎R☜︎❼︎⬧︎ N⚐︎ 🕈︎●︎︎⬧︎♎︎⚐︎❍︎︎ ☟︎☜︎R☜︎!"
		}

		if ( tomes_collected === 5 ){
			scroll = "T☟︎☜︎R☜︎❼︎S N⚐︎ 🕈︎●︎︎S♎︎⚐︎❍︎︎ ☟︎☜︎R☜︎!"
		}

		if ( tomes_collected === 6 ){
			scroll = "T☟︎☜︎R☜︎❼︎S N⚐︎ 🕈︎●︎︎S♎︎⚐︎M ︎︎☟︎☜︎R☜︎!"
		}

		if ( tomes_collected === 7 ){
			scroll = "T☟︎☜︎R☜︎❼︎S N⚐︎ 🕈︎IS♎︎⚐︎M ︎︎☟︎☜︎R☜︎!"
		}

		if ( tomes_collected === 8 ){
			scroll = "TH☜︎R☜︎❼︎S N⚐︎ 🕈︎IS♎︎⚐︎M ︎︎H☜︎R☜︎!"
		}

		if ( tomes_collected === 9 ){
			scroll = "TH☜︎R☜︎'S N⚐︎ 🕈︎IS♎︎⚐︎M ︎︎H☜︎R☜︎!"
		}

		if ( tomes_collected === 10 ){
			scroll = "TH☜︎R☜︎'S N⚐︎ 🕈︎ISD⚐︎M ︎︎H☜︎R☜︎!"
		}

		if ( tomes_collected === 11 ){
			scroll = "TH☜︎R☜︎'S NO 🕈︎ISDOM ︎︎H☜︎R☜︎!"
		}

		if ( tomes_collected === 12 ){
			scroll = "TH☜︎R☜︎'S NO WISDOM ︎︎H☜︎R☜︎!"
		}

		if ( tomes_collected === 13 ){
			scroll = "THERE'S NO WISDOM HERE!"
		}
	}

	const collect_tome = function ( x, y ) {
		let oplane = PS.gridPlane();

		mazedata[ ( y * grid_x ) + x ] = MAP_PATHWAY; // *BM* This removes the tome LOGICALLY from the map

		PS.gridPlane( PLANE_TOME );
		PS.alpha( x, y, PS.ALPHA_TRANSPARENT );
		PS.border( x, y, 0 );

		if ( _level === 1 ){
			PS.statusText( one_sayings [ tomes_collected ] );
			tomes_collected += 1;
			level_one_scroll();
		}

		if ( _level === 2 ){
			PS.statusText( two_sayings [ tomes_collected ] );
			tomes_collected += 1;
			level_two_scroll();
		}

		if ( _level === 3 ){
			PS.statusText( three_sayings [ tomes_collected ] );
			tomes_collected += 1;
			level_three_scroll();
		}

		if ( _level === 4 ){
			PS.statusText( four_sayings [ tomes_collected ] );
			tomes_collected += 1;
			level_four_scroll();
		}

		if ( _level === 5 ){
			PS.statusText( five_sayings [ tomes_collected ] );
			tomes_collected += 1;
			level_five_scroll();
		}


		if ( tomes_collected === tomes_total ){
			PS.audioPlay( "l_hchord_eb6" , { volume : 0.1 } );
			translated = true;
		}


		PS.gridPlane( oplane );
	}
	
	// Moves the scholar
	const step = function ( h, v ) {
		let dx = h;
		let dy = v;

		let nx = scholar_x + dx;
		let ny = scholar_y + dy;

		if ( is_wall ( nx, ny ) ) {
			// PS.audioPlay( "fx_shoot7" , { volume : 0.1 } );
			return;
		}

		if ( is_tome ( nx, ny ) ){
			PS.audioPlay( "fx_coin2" , { volume : 0.1 } );
			collect_tome( nx, ny );
		}

		place_scholar ( nx, ny );
		PS.audioPlay( "perc_bongo_low", { volume : 0.1 } );

	};

	// Stores level maps

	const LEVELS = [
		{
			map: "images/level_one.gif"
		},

		{
			map: "images/level_two.gif"
		},

		{
			map: "images/level_three.gif"
		},

		{
			map: "images/level_four.gif"
		},

		{
			map: "images/level_five.gif"
		},
	]

	let _level = 0; // current level

	// Makes a scroll for each level
	const scroll_text = function() {

		if ( _level === 1 ) {
			scroll = "⬧︎❄︎⚐︎🏱︎ ♓︎︎❄︎✏︎";
		}

		if ( _level === 2 ) {
			scroll = "❖︎☜🗐︎⬧☜ ︎⧫☟︎☜ ⬧︎︎☜🗐☼︎❖︎︎☟";
		}

		if ( _level === 3 ) {
			scroll = "☝︎⚐︎ ☠︎⚐︎ ☞︎🕆︎☼︎❄︎☟︎☜︎☼︎";
		}

		if ( _level === 4 ) {
			scroll = "●︎︎❍︎ ■︎⚐︎⧫︎ ☺︎⚐︎🙵●︎■︎♑︎";
		}

		if ( _level === 5 ) {
			scroll = "❄︎☟︎☜︎☼︎☜︎❼︎⬧︎ ☠︎⚐︎ 🕈︎●︎︎⬧︎♎︎⚐︎❍︎︎ ☟︎☜︎☼︎☜︎✏︎";
		}

	}

	// Called when level is loaded

	const on_load  = function ( image ) {
		if ( image === PS.ERROR ) {
			PS.debug( "onMapLoad(): image load error\n" );
			return;
		}

		// Prepare grid for map drawing

		grid_x = image.width;
		grid_y = image.height;

		PS.gridSize( grid_x, grid_y );
		PS.gridColor( COLOR_BACKGROUND );
		PS.border( PS.ALL, PS.ALL, 0 );
		PS.statusColor( COLOR_TEXT );

		// Translate map pixels to the drawn map and scholar sprite

		let i = 0;
		for ( let y = 0; y < grid_y; y += 1 ) {
			for ( let x = 0; x < grid_x; x += 1 ) {
				let pixel = image.data[ i ];
				let data = pixel;
				switch ( pixel ) {
					case MAP_WALL:
						PS.color( x, y, COLOR_WALL );
						break;
					case MAP_PATHWAY:
						PS.color( x, y, COLOR_PATHWAY );
						break;
					case MAP_TOME:
						tomes_total += 1;
						place_tome ( x, y );
						PS.color( x, y, COLOR_PATHWAY );
						break;
					case MAP_SCHOLAR:
						place_scholar ( x, y );
						PS.color ( x, y, COLOR_PATHWAY );
						data = MAP_PATHWAY;
						break;
					default:
						PS.debug( "Unrecognized pixel value!\n" );
						break;
				}
				mazedata[ i ] = data; // save pixel value here for movement control
				i += 1; // update array pointer
			}
		}
		PS.gridRefresh(); // forces grid to be drawn
	};

	const next_level = function () {
		// Fetch data for next level (starts at zero)

		let level = LEVELS[ _level ];

		// Game over if no more level data

		if ( !level ) {
			game_over = true;
			PS.statusText( "You've read all scrolls, so wise!" );
			PS.audioPlay( "l_hchord_ab6", { volume : 0.1 } );
			return;
		}

		_level += 1; // point to next level

		scroll_text();

		if ( _level > 1 ) {
			PS.statusText( "Hold Space to observe the scroll..." );
		}

		mazedata = []; // clear previous map data;

		tomes_total = 0;
		tomes_collected = 0;
		translated = false;

		PS.imageLoad( level.map, on_load, 1 ); // load the level map in format 1
	};



	// Perlenspiel functions

	return {
		init: function () {

			// Audio
			PS.audioLoad( "perc_bongo_low" );
			PS.audioLoad( "fx_shoot7" );
			PS.audioLoad( "fx_coin2" );
			PS.audioLoad( "l_hchord_eb6" );
			PS.audioLoad( "l_hchord_ab6" );

			// Create artist sprite (only once)

			scholar_sprite = PS.spriteSolid( 1, 1 );
			PS.spriteSolidColor( scholar_sprite, COLOR_SCHOLAR );
			PS.spritePlane( scholar_sprite, PLANE_SCHOLAR );


			// Set up first level
			next_level();

			PS.statusColor( COLOR_TEXT );
			PS.statusText( "Venture along with WASD/Arrow Keys..." );


			const TEAM = "bee";

			// This code should be the last thing
			// called by your PS.init() handler.
			// DO NOT MODIFY IT, except for the change
			// explained in the comment below.

			PS.dbLogin("imgd2900", TEAM, function (id, user) {
				if (user === PS.ERROR) {
					return;
				}
				PS.dbEvent(TEAM, "startup", user);
				PS.dbSend(TEAM, PS.CURRENT, {discard: true});
			}, {active: false});

			// Change the false in the final line above to true
			// before deploying the code to your Web site.
		},

		keyDown : function ( key ) {

			if ( game_over ){
				return;
			}


			if ( moves === 0 ){
				PS.statusText( "Hold SPACE to observe the scroll" );
				moves += 1;
			}


			switch ( key ) {
				case PS.KEY_ARROW_UP:
				case 119:
				case 87: {
					if ( translated ) {
						next_level();
						return;
					}

					else {
						step( 0, -1 );
						break;
					}

				}

				case PS.KEY_ARROW_DOWN:
				case 115:
				case 83: {
					if ( translated ) {
						next_level();
						return;
					}

					else {
						step(0, 1);
						break;
					}
				}

				case PS.KEY_ARROW_LEFT:
				case 97:
				case 65: {
					if ( translated ) {
						next_level();
						return;
					}

					else {
						step(-1, 0);
						break;
					}
				}

				case PS.KEY_ARROW_RIGHT:
				case 100:
				case 68: {
					if ( translated ) {
						next_level();
						return;
					}

					else {
						step(1, 0);
						break;
					}

				}

				case PS.KEY_SPACE: {
					PS.statusText ( scroll );
				}
			}
		},


		keyUp : function ( key ) {

			if ( game_over ){
				return;
			}

				switch (key) {
					case PS.KEY_SPACE: {
						PS.statusText(basic_text);
					}

				}

		},
	};

} () );

PS.init = G.init;
PS.keyDown = G.keyDown;
PS.keyUp = G.keyUp;

