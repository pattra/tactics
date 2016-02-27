'use strict';

const Preview = require('../entities/charBattlePreview');

const EnemyCharacter = function (game, x, y, properties) {
  /* PROPERTIES */
  this.loc = properties.loc;
  this.handler = properties.actionHandler;

  this.preview = new Preview(game, x, y, properties);
  this.name = properties.name;
  this.range = properties.range;
  this.team = properties.team;
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

  this.startTurn = () => {
    console.log('enemyCharacter', this.name, 'starting turn');
    setTimeout(this.getTargets, 1000);
  };

  this.endTurn = () => {
    console.log('ending enemy turn');
  };

  this.getTargets = () => {
    this.handler('targetPlayer', this.loc);
  };

  this._getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  this.chooseTarget = (targets) => {
    const numTargets = targets.length;
    const targetLoc = this._getRandomInt(0, numTargets);

    console.log('targeting', targets[targetLoc].target.name, targetLoc);
    return targets[targetLoc];
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
