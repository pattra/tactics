'use strict';

const CharBattlePreview = function (game, x, y, properties) {
  this.vitals = game.add.group();
  this.vitals.visible = false;
  this.text = {};

  const style = { font: '24px Arial', fill: '#ff0044' };

  /* preview panel */
  this.text.name = game.add.text(game.world.centerX, game.world.centerY, properties.name, style, this.vitals);
  this.text.hp = game.add.text(game.world.centerX, game.world.centerY + 50, properties.hp + '/' + properties.hp, style, this.vitals);

  this.toggleDisplay = (cursorOn) => {
    this.vitals.visible = cursorOn;
  };

  this.updateHP = (current, max) => {
    this.text.hp.setText(current + '/' + max);
  };
};

CharBattlePreview.prototype.constructor = CharBattlePreview;

/**
 * Automatically called by World.update
 */
CharBattlePreview.prototype.update = function () {
};

module.exports = CharBattlePreview;
