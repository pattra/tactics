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
  this.suppressionCounter = 2;
  this.statusEffects = {};

  this.abilities = {};
  properties.abilities.forEach(a => {
    this.abilities[a] = Abilities[a];
  });

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
    if (this.statusEffects.suppressed) {
      // TODO: other status effects should be checked based on duration...
      this.suppressionCounter = 0;
      this.statusEffects.suppressed = false;
      this.toggleStatusEffect('suppressed', false);
    }
  };

  this.changeHP = (amt) => {
    this.currentStats.hp = this.currentStats.hp + amt;

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
    console.log('incrementing suppression for', this.name);
    this.suppressionCounter++;

    if (this.suppressionCounter === 3) {
      console.log(this.name, 'is suppressed!');
      this.statusEffects.suppressed = true;
      this.toggleStatusEffect('suppressed', true);
    }
  };

  this.toggleStatusEffect = (effect, enable) => {
    const mods = Status[effect].statMods;
    for (let stat in mods) {
      if (this.currentStats[stat]) {
        this.currentStats[stat] = enable ? this.currentStats[stat] * mods[stat] : this.currentStats[stat] / mods[stat];
        if (!enable) console.log('restoring stats for', this.name, this.currentStats[stat]);
      }
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
