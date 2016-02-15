'use strict';

const Preview = require('../entities/charBattlePreview');
const Detail = require('../entities/charBattleDetail');

const Character = function (game, x, y, properties) {
  /* PROPERTIES */
  this.loc = properties.loc;

  this.handler = properties.actionHandler;
  this.UIHandler = (action) => {
    this.handler(action, this.loc);
  };

  this.preview = new Preview(game, x, y, properties);
  this.detail = new Detail(game, x, y, properties, this.UIHandler);
  this.name = properties.name;
  this.maxHP = properties.maxHP;
  this.currentHP = properties.maxHP;
  this.team = properties.team;
  this.enableClick = true;

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  this.toggleSelect = () => {
    if (this.enableClick) this.detail.toggleDisplay();
  };

  this.changeHP = (amt) => {
    this.currentHP = this.currentHP + amt;
    this.preview.updateHP(this.currentHP, this.maxHP);
    this.detail.updateHP(this.currentHP, this.maxHP);
  };

  this.changeLoc = (loc, x, y) => {
    this.loc = loc;
    this.sprite.x = x;
    this.sprite.y = y;
  };

  this.sprite = game.add.sprite(x, y, properties.sprite);

  this.sprite.inputEnabled = true;
  this.sprite.events.onInputOver.add(() => { this.onHover(true); });
  this.sprite.events.onInputOut.add(() => { this.onHover(false); });
  this.sprite.events.onInputDown.add(() => { this.handler('select', this.loc); });
};

// Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;

/**
 * Automatically called by World.update
 */
Character.prototype.update = function () {
};

module.exports = Character;
