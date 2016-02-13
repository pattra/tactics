'use strict';

const Player = require('../entities/player');
const Tile = require('../entities/tile');

const MAP_SIZE = 3;

const Game = function () {
  this.playerMap = [];
  this.enemyMap = [];
};

module.exports = Game;

Game.prototype = {

  create: function () {
    const mapOffset = 400;

    let i;
    let j;
    let tile;

    /* TILE RENDERS */
    for (i = 0; i < MAP_SIZE; i++) {
      for (j = 0; j < MAP_SIZE; j++) {
        // player tiles
        tile = new Tile(this.game, i*100, j*100);
        this.playerMap.push({ tile });

        // enemy tiles
        tile = new Tile(this.game, i*100 + mapOffset, j*100);
        this.enemyMap.push({ tile });
      }
    }

    this.input.onDown.add(this.onInputDown, this);
  },

  update: function () {

  },

  onInputDown: function () {
    this.game.state.start('Menu');
  }
};
