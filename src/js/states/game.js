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

const LEVEL_MAP = {
  enemies: [
    {
      name: 'baddie 1',
      maxHP: 3,
      defaultLoc: 0,
      loc: 0,
    },
    {
      name: 'baddie 2',
      maxHP: 5,
      defaultLoc: 6,
      loc: 6,
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
          x: j * 100 + mapOffset,
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
    });

    /* INIT BADDIES */
    // LEVEL_MAP.enemies.forEach((char, index) => {
    //   let slot = this.enemyMap[char.defaultLoc];
    //   slot.character = new Character(this.game, slot.x, slot.y, Object.assign(char, {
    //     team: 'enemy',
    //     sprite: 'enemy',
    //     actionHandler: this._actionHandler.bind(this),
    //   }));
    //
    //   slot.character.inputEnabled = true;
    //   slot.character.events.onInputOver.add(() => { slot.character.onHover(true); });
    //   slot.character.events.onInputOut.add(() => { slot.character.onHover(false); });
    //   slot.character.events.onInputDown.add(() => { this.selectCharacter(slot.character); });
    // });
  },

  update: function () {

  },

  _selectCharacter: function (character) {
    if (this.charFocus && this.charFocus !== character.loc
        && this.playerMap[this.charFocus].character) {
      this.playerMap[this.charFocus].character.toggleSelect();
    }

    if (this.charFocus && this.playerMap[this.charFocus].character === character) {
      this.charFocus = null;
    } else {
      this.charFocus = character.loc;
    }
  },

  _enableMove: function (loc) {
    this.playerMap.forEach((val, index) => {
      val.tile.inputEnabled = true;
      if (val.character) {
        val.character.sprite.events.onInputDown.removeAll();
        val.character.sprite.events.onInputDown.add(() => { this._moveCharacter(loc, index); });
      }

      val.tile.setStatus('selectable');
      val.tile.events.onInputDown.add(() => { this._moveCharacter(loc, index); });
    });
  },

  _moveCharacter: function (origin, target) {
    const originSlot = this.playerMap[origin];
    const targetSlot = this.playerMap[target];
    const char = originSlot.character;
    const swapChar = targetSlot.character;

    if (!!char && !!char.name) char.changeLoc(target, targetSlot.x, targetSlot.y);
    this.playerMap[target].character = char;
    this.playerMap[origin].character = null;
    if (!!swapChar && !!swapChar.name) {
      swapChar.changeLoc(origin, originSlot.x, originSlot.y);
      this.playerMap[origin].character = swapChar;
    }

    this.playerMap.forEach((val) => {
      val.tile.setStatus('default');
      val.tile.events.onInputDown.removeAll();
      if (val.character) {
        val.character.sprite.events.onInputDown.removeAll();
        val.character.sprite.events.onInputDown.add(val.character.onClick);
        val.character.onHover(false);
      }
    });

    this.charFocus = target;
  },

  _actionHandler: function (action, loc) {
    if (action === 'select') {
      this._selectCharacter(this.playerMap[loc].character);
    } else if (action === 'move') {
      this._enableMove(loc);
    }
  },
};
