'use strict';

const Preview = require('../entities/charBattlePreview');
const Detail = require('../entities/charBattleDetail');

const PlayerCharacter = function (game, x, y, properties) {
  /* PROPERTIES */
  this.loc = properties.loc;
  this.range = properties.range;

  this.handler = properties.actionHandler;
  this.UIHandler = (action, params) => {
    if (action === 'attack') {
      params = { range: this.range };
    }

    if (action) {
      this.handler(action, this.loc, params);
    }
  };

  this.preview = new Preview(game, x, y, properties);
  this.detail = new Detail(game, x, y, properties, this.UIHandler);
  this.name = properties.name;
  this.baseStats = {
    hp: properties.hp,
    attack: properties.attack,
    speed: properties.speed,
  };
  this.currentStats = {
    hp: properties.hp,
    attack: properties.attack,
    speed: properties.speed,
  };

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  this.toggleSelect = () => {
    this.detail.toggleDisplay();
  };

  this.toggleDisplay = () => {
    this.detail.toggleDisplay();
  };

  this.startTurn = () => {
    this.toggleDisplay();
  };

  this.endTurn = () => {
    this.toggleDisplay();
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
      this.detail.updateHP(this.currentStats.hp, this.baseStats.hp);
    }
  };

  this.changeLoc = (loc, x, y) => {
    this.loc = loc;
    this.sprite.x = x;
    this.sprite.y = y;
  };

  this.onClick = () => {
    this.handler('select', this.loc);
    this.detail.toggleDisplay();
  };

  this.sprite = game.add.sprite(x, y, properties.sprite);

  this.sprite.inputEnabled = true;
  this.sprite.events.onInputOver.add(() => { this.onHover(true); });
  this.sprite.events.onInputOut.add(() => { this.onHover(false); });

  // this.sprite.events.onInputDown.add(this.onClick);
};

// Character.prototype = Object.create(Phaser.Sprite.prototype);
PlayerCharacter.prototype.constructor = PlayerCharacter;

/**
 * Automatically called by World.update
 */
PlayerCharacter.prototype.update = function () {
};

module.exports = PlayerCharacter;
