'use strict';

const Preview = require('../entities/charBattlePreview');

const EnemyCharacter = function (game, x, y, properties) {
  /* PROPERTIES */
  console.log(properties);
  this.loc = properties.loc;
  this.handler = properties.actionHandler;

  this.preview = new Preview(game, x, y, properties);
  this.name = properties.name;
  this.baseStats = {
    hp: properties.hp,
    speed: properties.speed,
  };
  this.currentStats = {
    hp: properties.hp,
    speed: properties.speed,
  };

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  this.startTurn = () => {
    console.log('beep bop');
    this.getTargets();
  };

  this.getTargets = () => {
    this.handler('targetPlayer', this.loc);
  };

  this.changeHP = (amt) => {
    this.currentStats.hp = this.currentStats.hp + amt;

    if (this.currentStats.hp < 1) {
      this.sprite.kill();
      this.handler('kill', this.loc);
      return;
    } else {
      if (this.currentStats.hp > this.baseStats.hp) {
        this.currentStats.hp = this.baseStats.hp;
      }

      this.preview.updateHP(this.currentStats.hp, this.baseStats.hp);
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

  // this.sprite.events.onInputDown.add(this.onClick);
};

// Character.prototype = Object.create(Phaser.Sprite.prototype);
EnemyCharacter.prototype.constructor = EnemyCharacter;

/**
 * Automatically called by World.update
 */
EnemyCharacter.prototype.update = function () {
};

module.exports = EnemyCharacter;
