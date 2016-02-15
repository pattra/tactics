'use strict';

const Preview = require('../entities/charBattlePreview');
const Detail = require('../entities/charBattleDetail');

const Character = function (game, x, y, properties) {
  /* PROPERTIES */
  this.preview = new Preview(game, x, y, properties);
  this.detail = new Detail(game, x, y, properties);
  this.name = properties.name;
  this.loc = properties.loc;
  this.maxHP = properties.maxHP;
  this.currentHP = properties.maxHP;

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  this.toggleSelect = () => {
    this.detail.toggleDisplay();
  };

  this.changeHP = (amt) => {
    this.currentHP = this.currentHP + amt;
    this.preview.updateHP(this.currentHP, this.maxHP);
    this.detail.updateHP(this.currentHP, this.maxHP);
  };

  Phaser.Sprite.call(this, game, x, y, properties.sprite);
  game.add.existing(this);
};

Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;

/**
 * Automatically called by World.update
 */
Character.prototype.update = function () {
};

module.exports = Character;
