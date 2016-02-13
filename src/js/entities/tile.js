'use strict';

const Tile = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'testtile');
  game.add.existing(this);
}

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.update = function() {
};

module.exports = Tile;
