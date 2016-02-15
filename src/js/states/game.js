'use strict';

const Character = require('../entities/character');
const Tile = require('../entities/tile');

const MAP_SIZE = 3;
const MAP_TOTAL_TILES = 9;

const PLAYER_FILE = {
  party: [
    {
      name: 'Sobel',
      maxHP: 10,
      isPlayer: true,
      defaultLoc: 3,
      loc: 3,
    },
    {
      name: 'Fenris',
      maxHP: 15,
      defaultLoc: 5,
      loc: 5,
    },
    {
      name: 'Corrin',
      maxHP: 15,
      defaultLoc: 2,
      loc: 2,
    },
  ],
};

const Game = function () {
  this.charFocus = null;
  this.playerMap = [];
  this.enemyMap = [];
};

module.exports = Game;

Game.prototype = {

  init: function (param) {
    // console.log(param);
  },

  create: function () {
    const mapOffset = 400;
    let i;
    let j;

    /* INIT TILES */
    for (i = 0; i < MAP_SIZE; i++) {
      for (j = 0; j < MAP_SIZE; j++) {
        let playerTile;
        let enemyTile;

        // player tiles
        playerTile = new Tile(this.game, j * 100, i * 100);
        this.playerMap.push({
          tile: playerTile,
          x: j * 100,
          y: i * 100,
        });

        // enemy tiles
        enemyTile = new Tile(this.game, j * 100 + mapOffset, i * 100);
        this.enemyMap.push({
          tile: enemyTile,
          x: j * 100,
          y: i * 100,
        });
      }
    }

    /* INIT CHARACTERS */
    PLAYER_FILE.party.forEach((char, index) => {
      // TODO: error checking for location overlaps
      let slot = this.playerMap[char.defaultLoc];
      slot.character = new Character(this.game, slot.x, slot.y, Object.assign(char, {
        team: 'ally',
        sprite: 'ally',
        actionHandler: this._actionHandler.bind(this),
      }));

      slot.character.inputEnabled = true;
      slot.character.events.onInputOver.add(() => { slot.character.onHover(true); });
      slot.character.events.onInputOut.add(() => { slot.character.onHover(false); });
      slot.character.events.onInputDown.add(() => { this.selectCharacter(slot.character); });
    });
  },

  update: function () {

  },

  onInputDown: function () {
    this.game.state.start('Menu');
  },

  selectCharacter: function (character) {
    if (this.charFocus && this.charFocus !== character.loc
        && this.playerMap[this.charFocus].character) {
      this.playerMap[this.charFocus].character.toggleSelect();
    }

    if (this.charFocus && this.playerMap[this.charFocus].character === character) {
      this.charFocus = null;
    } else {
      this.charFocus = character.loc;
    }

    character.toggleSelect();
  },

  _moveCharacter: function (loc) {
    const char = this.playerMap[loc].character;
    this.playerMap.forEach((val, index) => {
      val.tile.setStatus('selectable');
      val.tile.inputEnabled = true;
      val.tile.events.onInputDown.add(() => { this._selectTile('move', loc, index); });
    });
  },

  _selectTile: function (action, loc, target) {
    const slot = this.playerMap[loc];
    const targetSlot = this.playerMap[target];

    if (action === 'move') {
      const char = slot.character;
      char.changeLoc(target, targetSlot.x, targetSlot.y);

      this.playerMap.forEach((val) => {
        val.tile.setStatus('default');
      });
    }
  },

  _actionHandler: function (action, params) {
    if (action === 'move') {
      this._moveCharacter(params.loc);
    }
  },
};
