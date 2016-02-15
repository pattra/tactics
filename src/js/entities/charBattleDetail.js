'use strict';

const CharBattleDetail = function (game, x, y, properties, handler) {
  this.vitals = game.add.group();
  this.vitals.visible = false;
  this.text = {};
  this.handler = handler;

  const style = { font: '24px Arial', fill: '#ff0044' };

  /* full detail panel */
  this.text.name = game.add.text(0, game.world.centerY, properties.name, style, this.vitals);
  this.text.hp = game.add.text(0, game.world.centerY + 50, properties.maxHP + '/' + properties.maxHP, style, this.vitals);

  /* actions */
  this.text.move = game.add.text(0, game.world.centerY + 100, 'Move Character', style, this.vitals);
  this.text.move.inputEnabled = true;
  this.text.move.events.onInputDown.add(() => { this.handler('move'); });

  this.text.attack = game.add.text(0, game.world.centerY + 150, 'Attack', style, this.vitals);
  this.text.attack.inputEnabled = true;
  this.text.attack.events.onInputDown.add(() => { this.handler('attack', { loc: properties.loc, ability: 'standard' }); });

  this.toggleDisplay = () => {
    this.vitals.visible = !this.vitals.visible;
  };

  this.updateHP = (current, max) => {
    this.text.hp.setText(current + '/' + max);
  };
};

CharBattleDetail.prototype.constructor = CharBattleDetail;

/**
 * Automatically called by World.update
 */
CharBattleDetail.prototype.update = function () {
};

module.exports = CharBattleDetail;
