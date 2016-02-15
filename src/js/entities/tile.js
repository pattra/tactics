'use strict';

const Tile = function (game, x, y) {
  this.actionHandler = (action) => {
    if (!action) {
      return;
    }
  };

  this.changeFrame = (frameName) => {
    this.frameName = frameName;
  };

  Phaser.Sprite.call(this, game, x, y, 'tiles', 'grass');
  game.add.existing(this);
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.update = function () {
};

module.exports = Tile;
