'use strict';

const Status = require('../constants/statusEffects').statusDict;
const Preview = require('../entities/charBattlePreview');

const EnemyCharacter = function (game, x, y, properties) {
  this.sprite = game.add.sprite(x, y, properties.sprite);

  /* PROPERTIES */
  this.loc = properties.loc;
  this.handler = properties.actionHandler;

  this.preview = new Preview(game, x, y, properties);
  this.name = properties.name;
  this.range = properties.range;
  this.team = properties.team;
  this.baseStats = properties.baseStats;
  this.currentStats = _.clone(properties.baseStats);

  this.suppressionCounter = 2;
  this.isSuppressed = false;

  this.statusEffects = {};

  const style = { font: '24px Arial', fill: '#fff' };
  const damageText = game.add.text(this.sprite.x, this.sprite.y, '', style);

  /* SECRET... */
  const _getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
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
    console.log('ending enemy turn', this.statusEffects);
    if (this.statusEffects.suppressed) {
      // TODO: other status effects should be checked based on duration...
      this.suppressionCounter = 0;
      this.statusEffects.suppressed = false;
      this.toggleStatusEffect('suppressed', false);
    }
  };

  this.getTargets = () => {
    this.handler('targetPlayer', this.loc);
  };

  this.chooseTarget = (targets) => {
    const numTargets = targets.length;
    const targetLoc = _getRandomInt(0, numTargets);

    console.log('targeting', targets[targetLoc].target.name, targetLoc);
    return targets[targetLoc];
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
      }
    }, 1000);
  };

  this.incSuppress = () => {
    this.suppressionCounter++;

    if (this.suppressionCounter === 3) {
      console.log('suppressed!');
      this.statusEffects.suppressed = true;
      this.toggleStatusEffect('suppressed', true);
    }
  };

  this.toggleStatusEffect = (effect, enable) => {
    const mods = Status[effect].statMods;
    for (let stat in mods) {
      if (this.currentStats[stat]) {
        this.currentStats[stat] = enable ? this.currentStats[stat] * mods[stat] : this.currentStats[stat] / mods[stat];
        if (!enable) console.log('restoring stats', this.name, this.currentStats[stat]);
      }
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
