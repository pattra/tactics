'use strict';

const CharBattleDetail = function (game, x, y, properties, handlerFn) {
  const vitalsDisplay = game.add.group();
  vitalsDisplay.visible = false;

  const abilityDisplay = game.add.group();
  abilityDisplay.visible = false;

  const text = { abilities: [] };
  const handler = handlerFn;
  const style = { font: '24px Arial', fill: '#ffffff' };

  this.showDisplay = () => {
    vitalsDisplay.visible = true;
  };

  this.showAbilities = () => {
    vitalsDisplay.visible = false;
    abilityDisplay.visible = true;
  };

  this.hideAbilities = () => {
    abilityDisplay.visible = false;
    vitalsDisplay.visible = true;
  };

  this.hideAll = () => {
    vitalsDisplay.visible = false;
    abilityDisplay.visible = false;
  };

  this.toggleDisplay = () => {
    vitalsDisplay.visible = !vitalsDisplay.visible;
  };

  this.updateHP = (current, max) => {
    text.hp.setText(current + '/' + max);
  };

  /* full detail panel */
  text.name = game.add.text(0, game.world.centerY, properties.name, style, vitalsDisplay);
  text.hp = game.add.text(0, game.world.centerY + 50, properties.baseStats.hp + '/' + properties.baseStats.hp, style, vitalsDisplay);

  /* actions */
  text.move = game.add.text(0, game.world.centerY + 100, 'Move Character', style, vitalsDisplay);
  text.move.inputEnabled = true;
  text.move.events.onInputDown.add(() => { handler('move'); });

  text.attack = game.add.text(0, game.world.centerY + 150, 'Attack', style, vitalsDisplay);
  text.attack.inputEnabled = true;
  text.attack.events.onInputDown.add(() => { handler('attack'); });

  text.ability = game.add.text(0, game.world.centerY + 200, 'Ability', style, vitalsDisplay);
  text.ability.inputEnabled = true;
  text.ability.events.onInputDown.add(this.showAbilities);

  text.cancelAbility = game.add.text(0, game.world.centerY + 200, 'Back', style, abilityDisplay);
  text.cancelAbility.inputEnabled = true;
  text.cancelAbility.events.onInputDown.add(this.hideAbilities);

  /* ability panel */
  for (let a in properties.abilities) {
    let aText = game.add.text(0, game.world.centerY + (text.abilities.length * 100), properties.abilities[a].name, style, abilityDisplay);
    aText.inputEnabled = true;
    aText.events.onInputDown.add(() => { handler('ability', properties.abilities[a]); });
    text.abilities.push(aText);
  }

};

CharBattleDetail.prototype.constructor = CharBattleDetail;

/**
 * Automatically called by World.update
 */
CharBattleDetail.prototype.update = function () {
};

module.exports = CharBattleDetail;
