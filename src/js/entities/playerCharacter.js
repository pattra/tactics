'use strict';

const Abilities = require('../constants/abilities').abilitiesDict;
const Status = require('../constants/statusEffects').statusDict;
const Preview = require('../entities/charBattlePreview');
const Detail = require('../entities/charBattleDetail');

const PlayerCharacter = function (game, x, y, properties) {
  this.sprite = game.add.sprite(x, y, properties.sprite);

  /* PROPERTIES */
  this.loc = properties.loc;
  this.range = properties.range;
  this.team = properties.team;

  this.handler = properties.actionHandler;
  this.UIHandler = (action, params) => {
    if (action === 'attack') {
      params = { range: this.range };
    }

    if (action) {
      this.handler(action, this.loc, params);
    }
  };

  this.name = properties.name;

  this.baseStats = properties.baseStats;
  this.currentStats = _.clone(properties.baseStats);
  this.suppressionCounter = 0;
  this.isSuppressed = false;

  this.abilities = {};
  properties.abilities.forEach(a => {
    this.abilities[a] = Abilities[a];
  });

  console.log('from playerC', this.abilities);

  this.preview = new Preview(game, x, y, { name: this.name, baseStats: properties.baseStats });
  this.detail = new Detail(game, x, y, { name: this.name, baseStats: properties.baseStats, abilities: this.abilities }, this.UIHandler);

  const style = { font: '24px Arial', fill: '#fff' };
  const damageText = game.add.text(this.sprite.x, this.sprite.y, '', style);

  /* FUNCTIONS */
  this.onHover = (cursorOn) => {
    this.preview.toggleDisplay(cursorOn);
  };

  // this.toggleSelect = () => {
  //   this.detail.toggleDisplay();
  // };
  //
  // this.toggleDisplay = () => {
  //   this.detail.toggleDisplay();
  // };

  this.startTurn = () => {
    this.detail.showDisplay();
  };

  this.endTurn = () => {
    this.detail.hideAll();
  };

  this.changeHP = (amt) => {
    this.currentStats.hp = this.currentStats.hp + amt;
    console.log(this.currentStats, this.currentStats.hp);

    // damage anim
    damageText.x = this.sprite.x;
    damageText.y = this.sprite.y;
    damageText.setText(amt);

    setTimeout(() => {
      if (this.currentStats.hp < 1) {
        damageText.kill();
        this.sprite.kill();
        this.handler('kill', this.loc);
        return;
      } else {
        if (this.currentStats.hp > this.baseStats.hp) {
          this.currentStats.hp = this.baseStats.hp;
        }

        damageText.setText('');
        this.preview.updateHP(this.currentStats.hp, this.baseStats.hp);
        this.detail.updateHP(this.currentStats.hp, this.baseStats.hp);
      }
    }, 1000);
  };

  this.changeLoc = (loc, x, y) => {
    this.loc = loc;
    this.sprite.x = x;
    this.sprite.y = y;
  };

  this.incSuppress = () => {
    this.suppressionCounter++;

    if (this.suppressionCounter === 3) {
      console.log('suppressed!');
      this.suppressionCounter = 0;
    }
  };

  this.onClick = () => {
    this.handler('select', this.loc);
    this.detail.toggleDisplay();
  };

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
