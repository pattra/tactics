'use strict';

const Preview = require('../entities/charBattlePreview');

const EnemyCharacter = function (game, x, y, properties) {
  /* PROPERTIES */
  this.loc = properties.loc;
  this.handler = properties.actionHandler;

  this.preview = new Preview(game, x, y, properties);
  this.name = properties.name;
  this.maxHP = properties.maxHP;
  this.currentHP = properties.maxHP;

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  // this.toggleSelect = () => {
  //   this.detail.toggleDisplay();
  // };

  this.changeHP = (amt) => {
    this.currentHP = this.currentHP + amt;

    if (this.currentHP < 1) {
      this.sprite.kill();
      this.handler('kill', this.loc);
    } else {
      this.preview.updateHP(this.currentHP, this.maxHP);
    }
  };

  this.changeLoc = (loc, x, y) => {
    this.loc = loc;
    this.sprite.x = x;
    this.sprite.y = y;
  };

  this.onClick = () => {
    this.handler('select', this.loc);
  };

  this.sprite = game.add.sprite(x, y, properties.sprite);

  this.sprite.inputEnabled = true;
  this.sprite.events.onInputOver.add(() => { this.onHover(true); });
  this.sprite.events.onInputOut.add(() => { this.onHover(false); });
  this.sprite.events.onInputDown.add(this.onClick);
};

// Character.prototype = Object.create(Phaser.Sprite.prototype);
EnemyCharacter.prototype.constructor = EnemyCharacter;

/**
 * Automatically called by World.update
 */
EnemyCharacter.prototype.update = function () {
};

module.exports = EnemyCharacter;
