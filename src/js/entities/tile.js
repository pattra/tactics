'use strict';

const Tile = function (game, x, y) {
  this.status = 'default';
  this.defaultState = 'grass';

  this.setStatus = (frameName, status) => {
    this.frameName = frameName === 'default' ? this.defaultState : frameName;
    this.status = status ? status : frameName;
  };

  Phaser.Sprite.call(this, game, x, y, 'tiles', 'grass');

  game.add.existing(this);
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.update = function () {
};

module.exports = Tile;
