'use strict';

const Tile = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'tiles', 'grass');

  this.inputEnabled = true;
  this.status = 'default';
  this.defaultState = 'grass';

  this.setStatus = (frameName, status) => {
    this.frameName = frameName === 'default' ? this.defaultState : frameName;
    this.status = status ? status : frameName; // doesn't currently do anything
  };

  game.add.existing(this);
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.update = function () {
};

module.exports = Tile;
