'use strict';
const _ = require('lodash');

const PlayerCharacter = require('../entities/playerCharacter');
const EnemyCharacter = require('../entities/enemyCharacter');
const Tile = require('../entities/tile');

const MAP_SIZE = 3;
const MAP_TOTAL_TILES = 9;

const PLAYER_FILE = {
  party: [
    {
      name: 'Sobel',
      loc: 1,
      baseStats: {
        hp: 15,
        attack: 1,
        magic: 1,
        speed: 17,
      },
      abilities: ['heal'],
      range: 'ranged',
      team: 'player',
    },
    {
      name: 'Fenris',
      loc: 3,
      baseStats: {
        hp: 15,
        attack: 3,
        speed: 16,
      },
      abilities: [],
      range: 'swing',
      team: 'player',
    },
    {
      name: 'Corrin',
      loc: 0,
      baseStats: {
        hp: 15,
        attack: 2,
        speed: 1,
      },
      abilities: [],
      range: 'reach',
      team: 'player',
    },
  ],
};

const LEVEL_MAP = {
  enemies: [
    {
      name: 'baddie 1',
      loc: 2,
      baseStats: {
        hp: 3,
        attack: 1,
        speed: 18,
      },
      abilities: [],
      range: 'spread',
      team: 'enemy',
    },
    {
      name: 'baddie 2',
      loc: 5,
      baseStats: {
        hp: 5,
        attack: 1,
        speed: 1,
      },
      abilities: [],
      range: 'melee',
      team: 'enemy',
    },
    {
      name: 'baddie 3',
      loc: 1,
      baseStats: {
        hp: 5,
        attack: 1,
        speed: 1,
      },
      abilities: [],
      range: 'ranged',
      team: 'enemy',
    },
    {
      name: 'baddie 4',
      loc: 4,
      baseStats: {
        hp: 5,
        attack: 1,
        speed: 1,
      },
      abilities: [],
      range: 'all',
      team: 'enemy',
    },
    {
      name: 'baddie 5',
      loc: 7,
      baseStats: {
        hp: 5,
        attack: 1,
        speed: 1,
      },
      abilities: [],
      range: 'melee',
      team: 'enemy',
    },
    {
      name: 'baddie 6',
      loc: 6,
      baseStats: {
        hp: 5,
        attack: 1,
        speed: 1,
      },
      abilities: [],
      range: 'swing',
      team: 'enemy',
    },
  ],
};

const Game = function () {
  this.charFocus = null;
  this.playerMap = [];
  this.enemyMap = [];
  this.mapClear = true;

  this.currentTurn = 0;
  this.turnOrder = {};
  this.needReorder = false;

  this._pushNeighborsUtil = (nbArr, char, loc) => {
    nbArr.push(char ? char : { loc });
  },

  this.getTargets = {
    melee: function (origin, targetSide) {
      /* [ ][ ][ ]
         [x][ ][ ]
         [ ][ ][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            targetable.push({ target: map[index].character, neighbors: [] });
            break;
          }
        }
      }

      return targetable;
    },

    ranged: function (origin, targetSide) {
      /* [ ][ ][ ]
         [ ][x][ ] (any)
         [ ][ ][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          targetable.push({ target: map[i].character, neighbors: [] });
        }
      }

      return targetable;
    },

    reach: function (origin, targetSide) {
      /* [ ][ ][ ]
         [x][x][ ]
         [ ][ ][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;
      let reachIndex;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];
            reachIndex = index + 1;

            if (reachIndex % MAP_SIZE !== 0) {
              this._pushNeighborsUtil(neighbors, map[reachIndex].character, reachIndex);
            }

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    pierce: function (origin, targetSide) {
      /* [ ][ ][ ]
         [x][x][x]
         [ ][ ][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];
            for (let k = i * MAP_SIZE; k < (i + 1) * MAP_SIZE; k++) {
              if (k !== index) this._pushNeighborsUtil(neighbors, map[k].character, k);
            }

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    spread: function (origin, targetSide) {
      /* [ ][x][ ]
         [x][x][x]
         [ ][x][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];

            // horizontal checks
            if ((index + 1) % 3 > index % 3 && (index + 1) < MAP_TOTAL_TILES) this._pushNeighborsUtil(neighbors, map[index + 1].character, index + 1);
            if ((index - 1) % 3 < index % 3 && (index - 1) > -1) this._pushNeighborsUtil(neighbors, map[index - 1].character, index - 1);

            // vertical checks
            if ((index + 3) < MAP_TOTAL_TILES) this._pushNeighborsUtil(neighbors, map[index + 3].character, index + 3);
            if ((index - 3) > -1) this._pushNeighborsUtil(neighbors, map[index - 3].character, index - 3);

            targetable.push({ target: map[index].character, neighbors });
          }
        }
      }

      return targetable;
    },

    swing: function (origin, targetSide) {
      /* [O][ ][x]
         [x][x][O]
         [ ][O][x] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;
      let neighbors;
      let topIndex;
      let botIndex;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;

          if (map[index].character) {
            neighbors = [];
            topIndex = index - MAP_SIZE;
            botIndex = index + MAP_SIZE;

            if (topIndex > -1) this._pushNeighborsUtil(neighbors, map[topIndex].character, topIndex);
            if (botIndex < MAP_TOTAL_TILES) this._pushNeighborsUtil(neighbors, map[botIndex].character, botIndex);

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    impact: function (origin, targetSide) {
      /* [x][ ][ ]
         [x][ ][ ]
         [x][ ][ ] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];

            for (let k = j; k < (j + 1 + (MAP_SIZE * (MAP_SIZE - 1))); k += 3) {
              if (k !== index) this._pushNeighborsUtil(neighbors, map[k].character, k);
            }

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    all: function (origin, targetSide) {
      /* [x][x][x]
         [x][x][x]
         [x][x][x] */
      const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
      const targetable = [];
      let neighbors;

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          neighbors = [];

          for (let j = 0; j < MAP_TOTAL_TILES; j++) {
            if (j !== i) this._pushNeighborsUtil(neighbors, map[j].character, j);;
          }

          targetable.push({ target: map[i].character, neighbors });
        }
      }

      return targetable;
    },
  };

  this._clearMap = (map) => {
    this.mapClear = true;
    map.forEach((val, index) => {
      if (val.character) {
        val.character.sprite.events.onInputDown.removeAll();
        val.character.sprite.events.onInputOver.removeAll();
        val.character.sprite.events.onInputOver.add(val.character.onHover);
      }

      val.tile.events.onInputDown.removeAll();
      val.tile.events.onInputOver.removeAll();
      val.tile.events.onInputOut.removeAll();
      val.tile.setStatus('default');
    });
  };
};

module.exports = Game;

Game.prototype = {

  init: function (param) {
  },

  create: function () {
    const mapOffset = 400;
    let i;
    let j;
    let playerTile;
    let enemyTile;

    /* INIT TILES */
    for (i = 0; i < MAP_SIZE; i++) {
      for (j = MAP_SIZE - 1; j >= 0; j--) {
        // player tiles
        playerTile = new Tile(this.game, j * 100, i * 100);
        this.playerMap.push({
          tile: playerTile,
          x: playerTile.x,
          y: playerTile.y,
        });
      }
    }

    for (i = 0; i < MAP_SIZE; i++) {
      for (j = 0; j < MAP_SIZE; j++) {
        // enemy tiles
        enemyTile = new Tile(this.game, j * 100 + mapOffset, i * 100);
        this.enemyMap.push({
          tile: enemyTile,
          x: enemyTile.x,
          y: enemyTile.y,
        });
      }
    }

    /* INIT CHARACTERS */
    PLAYER_FILE.party.forEach((char, index) => {
      // TODO: error checking for location overlaps
      let slot = this.playerMap[char.loc];
      slot.character = new PlayerCharacter(this.game, slot.x, slot.y, Object.assign(char, {
        team: 'ally',
        sprite: 'ally',
        actionHandler: this._playerActionHandler.bind(this),
      }));

      slot.tile.events.onInputOver.add(() => slot.character.onHover(true));
      slot.tile.events.onInputOut.add(() => slot.character.onHover(false));
    });

    /* INIT BADDIES */
    LEVEL_MAP.enemies.forEach((char, index) => {
      let slot = this.enemyMap[char.loc];
      slot.character = new EnemyCharacter(this.game, slot.x, slot.y, Object.assign(char, {
        team: 'enemy',
        sprite: 'enemy',
        actionHandler: this._enemyActionHandler.bind(this),
      }));

      slot.tile.events.onInputOver.add(() => slot.character.onHover(true));
      slot.tile.events.onInputOut.add(() => slot.character.onHover(false));
    });

    /* INIT TURN ORDER */
    const combinedMap = this.playerMap.concat(this.enemyMap);
    this.turnOrder = _.chain(combinedMap)
                      .filter(tile => { return tile.character; })
                      .map('character')
                      .sortBy(c => { return c.baseStats.speed * -1; })
                      .value();
    const currentMap = this.turnOrder[0].team === 'enemy' ? this.enemyMap : this.playerMap;
    currentMap[this.turnOrder[0].loc].tile.setStatus('current');
    this.turnOrder[0].startTurn();

    /* INIT CONTROLS */
    this.input.mouse.mouseDownCallback = (e) => {
      if (e.button === Phaser.Mouse.RIGHT_BUTTON) {
        e.preventDefault();

        if (!this.mapClear) {
          this._clearMap(this.enemyMap);
        }
      }
    };
  },

  update: function () {
  },

  // _selectCharacter: function (character) {
  //   if (this.charFocus && this.charFocus !== character.loc
  //       && this.playerMap[this.charFocus].character) {
  //     this.playerMap[this.charFocus].character.toggleSelect();
  //   }
  //
  //   if (this.charFocus && this.playerMap[this.charFocus].character === character) {
  //     this.charFocus = null;
  //   } else {
  //     this.charFocus = character.loc;
  //   }
  // },

  _enableMove: function (loc) {
    this.mapClear = false;
    this.playerMap.forEach((val, index) => {
      val.tile.inputEnabled = true;
      if (val.character) {
        val.character.sprite.events.onInputDown.removeAll();
        val.character.sprite.events.onInputDown.add(() => { this._moveCharacter(loc, index); });
      }

      val.tile.setStatus('affect');
      val.tile.events.onInputDown.add(() => { this._moveCharacter(loc, index); });
    });
  },

  _moveCharacter: function (origin, target) {
    const originSlot = this.playerMap[origin];
    const targetSlot = this.playerMap[target];
    const char = originSlot.character;
    const swapChar = targetSlot.character;

    if (!!char && !!char.name) char.changeLoc(target, targetSlot.x, targetSlot.y);
    this.playerMap[target].character = char;
    this.playerMap[origin].character = null;
    if (!!swapChar && !!swapChar.name) {
      swapChar.changeLoc(origin, originSlot.x, originSlot.y);
      this.playerMap[origin].character = swapChar;
    }

    this.playerMap.forEach((val) => {
      val.tile.setStatus('default');
      val.tile.events.onInputDown.removeAll();
      val.tile.events.onInputOver.removeAll();
      val.tile.events.onInputOut.removeAll();

      if (val.character) {
        val.character.sprite.events.onInputDown.removeAll();

        // val.character.sprite.events.onInputDown.add(val.character.onClick);
        val.character.onHover(false);

        val.tile.events.onInputOver.add(() => val.character.onHover(true));
        val.tile.events.onInputOut.add(() => val.character.onHover(false));
      }
    });

    this._manageTurn();
  },

  _setUpTarget: function (map, origin, loc, neighbors, ability) {
    console.log('setting up target', ability);
    let val = map[loc];

    val.character.sprite.events.onInputDown.removeAll();
    val.character.sprite.events.onInputDown.add(() => { this._targetCharacter(origin, loc, neighbors, ability); });

    val.tile.inputEnabled = true;
    val.tile.events.onInputDown.add(() => { this._targetCharacter(origin, loc, neighbors, ability); });
    this._setTileHover(map, val.tile, val.character.sprite, 'attack', neighbors);
  },

  _enemySetUpTarget: function (map, loc, neighbors) {
    map[loc].tile.setStatus('attack');
    neighbors.forEach((n) => {
      map[n.loc].tile.setStatus('affect');
    });
  },

  _targetCharacter: function (origin, target, neighbors, ability) {
    let recipMap = ability.targetSide === 'ally' ? this.playerMap : this.enemyMap;
    let actor = this.playerMap[origin].character;
    let recip = recipMap[target].character;
    let amt = !ability ? -1 * actor.currentStats.attack : ability.amt;

    recip.changeHP(amt);
    neighbors.forEach(n => {
      if (recipMap[n.loc].character) recipMap[n.loc].character.changeHP(amt);
    });
    this._clearMap(recipMap);

    setTimeout(this._manageTurn.bind(this), 1000);
  },

  _enemyTargetCharacter: function (origin, target, neighbors) {
    let recipMap = this.playerMap;
    let actor = this.enemyMap[origin].character;
    let recip = recipMap[target].character;

    recip.changeHP(-1 * actor.currentStats.attack);
    neighbors.forEach(n => {
      if (recipMap[n.loc].character) recipMap[n.loc].character.changeHP(-1 * actor.currentStats.attack);
    });
    this._clearMap(recipMap);
    setTimeout(this._manageTurn.bind(this), 1000);
  },

  _setTileHover: function (map, tile, char, frameName, neighbors) {
    tile.events.onInputOver.add(() => {
      tile.setStatus(frameName);
      neighbors.forEach((n) => {
        map[n.loc].tile.setStatus('affect');
      });
    });

    tile.events.onInputOut.add(() => {
      tile.setStatus('default');
      neighbors.forEach((n) => {
        map[n.loc].tile.setStatus('default');
      });
    });

    char.events.onInputOver.add(() => {
      tile.setStatus(frameName);
      neighbors.forEach((n) => {
        map[n.loc].tile.setStatus('affect');
      });
    });

    char.events.onInputOut.add(() => {
      tile.setStatus('default');
      neighbors.forEach((n) => {
        map[n.loc].tile.setStatus('default');
      });
    });
  },

  _enableTargeting: function (origin, range, targetSide, ability) {
    console.log('enabling', ability);
    this.mapClear = false;
    const map = targetSide === 'enemy' ? this.enemyMap : this.playerMap;
    const targets = this.getTargets[range].bind(this)(origin, targetSide);

    targets.forEach((t, index) => {
      this._setUpTarget(map, origin, t.target.loc, t.neighbors, ability);
    });
  },

  _playerActionHandler: function (action, loc, params) {
    if (action === 'select') {
      // TODO: currently not being used (the select action)
      this._selectCharacter(this.playerMap[loc].character);
    } else if (action === 'move') {
      this._enableMove(loc);
    } else if (action === 'attack') {
      this._enableTargeting(loc, params.range, 'enemy');
    } else if (action === 'ability') {
      const side = params.targetSide === 'ally' ? this.playerMap : this.enemyMap;
      this._enableTargeting(loc, params.range, side, params);
    }
  },

  _enemyActionHandler: function (action, loc) {
    if (action === 'kill') {
      this._killCharacter(this.enemyMap, loc);
    } else if (action === 'targetPlayer') {
      const originChar = this.enemyMap[loc].character;
      const playerTargets = this.getTargets[originChar.range].bind(this)(loc, 'player');
      const t = this.enemyMap[loc].character.chooseTarget(playerTargets);

      this._enemySetUpTarget(this.playerMap, t.target.loc, t.neighbors);

      setTimeout(() => { this._enemyTargetCharacter(loc, t.target.loc, t.neighbors); }, 1000);
    }
  },

  _manageTurn: function () {
    const len = this.turnOrder.length;
    const prevMap = this.turnOrder[this.currentTurn].team === 'enemy' ? this.enemyMap : this.playerMap;
    const prevTile = prevMap[this.turnOrder[this.currentTurn].loc].tile;

    prevTile.setStatus('default');
    this.turnOrder[this.currentTurn].endTurn();

    this.currentTurn += 1;
    while (!this.turnOrder[this.currentTurn] &&
           this.currentTurn <= len) {
      this.currentTurn += 1;
    }

    if (this.currentTurn >= len) {
      _.remove(this.turnOrder, (char) => {
        return char === null;
      });
      this.currentTurn = 0;
    }

    const nextMap = this.turnOrder[this.currentTurn].team === 'enemy' ? this.enemyMap : this.playerMap;
    const nextTile = nextMap[this.turnOrder[this.currentTurn].loc].tile;
    nextTile.setStatus('current');
    this.turnOrder[this.currentTurn].startTurn();
  },

  _killCharacter: function (map, loc) {
    const len = this.turnOrder.length;
    for (let i = 0; i < len; i++) {
      if (this.turnOrder[i] &&
          this.turnOrder[i] === map[loc].character) {
        this.turnOrder[i] = null;
        break;
      }
    }

    map[loc].character = null;
  },
};
