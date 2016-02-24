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
      hp: 10,
      isPlayer: true,
      loc: 1,
      attack: 1,
      speed: 12,
      range: 'pierce',
    },
    {
      name: 'Fenris',
      hp: 15,
      loc: 5,
      attack: 3,
      speed: 4,
      range: 'swing',
    },
    {
      name: 'Corrin',
      hp: 15,
      loc: 2,
      attack: 2,
      speed: 6,
      range: 'reach',
    },
  ],
};

const LEVEL_MAP = {
  enemies: [
    {
      name: 'baddie 1',
      hp: 3,
      loc: 0,
      speed: 15,
      range: 'pierce',
    },
    {
      name: 'baddie 2',
      hp: 5,
      loc: 7,
      speed: 2,
    },
    {
      name: 'baddie 3',
      hp: 3,
      loc: 1,
      speed: 3,
    },
    {
      name: 'baddie 4',
      hp: 3,
      loc: 2,
      speed: 3,
    },
    {
      name: 'baddie 5',
      hp: 3,
      loc: 3,
      speed: 1,
    },
    {
      name: 'baddie 6',
      hp: 3,
      loc: 4,
      speed: 2,
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

  // TODO: probably want to consolidate this with getPlayerTargets at some point,
  // the code is pretty repetitive
  this.getEnemyTargets = {
    melee: function (origin, targetSide) {
      const targetable = [];
      let index;

      for (let i = MAP_SIZE; i > 0; i--) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE - j - 1;
          if (this.playerMap[index].character) {
            targetable.push({ target: this.playerMap[index].character, neighbors: [] });
            break;
          }
        }
      }

      return targetable;
    },

    ranged: function (origin) {
      /* [ ][ ][ ]
         [ ][x][ ] (any)
         [ ][ ][ ] */
      const targetable = [];
      const map = this.playerMap;

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          targetable.push({ target: map[i].character, neighbors: [] });
        }
      }

      return targetable;
    },

    reach: function (origin) {
      /* [ ][ ][ ]
         [x][x][ ]
         [ ][ ][ ] */
      const targetable = [];
      const map = this.playerMap;
      let index;
      let reachIndex;
      let neighbors;

      for (let i = MAP_SIZE; i > 0; i--) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE - j - 1;
          if (map[index].character) {
            neighbors = [];
            reachIndex = index - 1;

            if (reachIndex % MAP_SIZE !== (MAP_SIZE - 1) && map[reachIndex].character) {
              neighbors.push(map[reachIndex].character);
            }

            targetable.push({ target: map[index].character, neighbors });

            break;
          }
        }
      }

      return targetable;
    },

    pierce: function (origin) {
      /* [ ][ ][ ]
         [x][x][x]
         [ ][ ][ ] */
      const targetable = [];
      const map = this.playerMap;
      let index;
      let neighbors;

      for (let i = MAP_SIZE; i > 0; i--) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE - j - 1;
          if (map[index].character) {
            neighbors = [];
            for (let k = i - 1; k < i * MAP_SIZE; k++) {
              if (k !== index && map[k].character) {
                neighbors.push(map[k].character);
              }
            }

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    spread: function (origin) {
      /* [ ][x][ ]
         [x][x][x]
         [ ][x][ ] */
      const targetable = [];
      const map = this.playerMap;
      let index;
      let neighbors;

      for (let i = MAP_SIZE; i > 0; i--) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE - j - 1;
          if (map[index].character) {
            neighbors = [];

            // horizontal checks
            if ((index + 1) % 3 > index % 3
                && (index + 1) < MAP_TOTAL_TILES
                && map[index + 1].character) neighbors.push(map[index + 1].character);
            if ((index - 1) % 3 < index % 3
                && (index - 1) > -1
                && map[index - 1].character) neighbors.push(map[index - 1].character);

            // vertical checks
            if ((index + 3) < MAP_TOTAL_TILES) neighbors.push(map[index + 3].character);
            if ((index - 3) > -1) neighbors.push([index - 3].character);

            targetable.push({ target: map[index].character, neighbors });
          }
        }
      }

      return targetable;
    },

    swing: function (origin) {
      /* [O][ ][x]
         [x][x][O]
         [ ][O][x] */
      const map = this.playerMap;
      const targetable = [];
      let index;
      let neighbors;
      let topIndex;
      let botIndex;

      for (let i = MAP_SIZE; i > 0; i--) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE - j - 1;

          if (map[index].character) {
            neighbors = [];
            topIndex = index - MAP_SIZE;
            botIndex = index + MAP_SIZE;

            if (topIndex > -1 && map[topIndex].character) neighbors.push(map[topIndex].character);
            if (botIndex < MAP_TOTAL_TILES && map[botIndex].character) neighbors.push(map[botIndex].character);

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    impact: function (origin) {
      /* [x][ ][ ]
         [x][ ][ ]
         [x][ ][ ] */
      const map = this.playermap;
      const targetable = [];
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];

            for (let k = j; k < (j + 1 + (MAP_SIZE * (MAP_SIZE - 1))); k += 3) {
              if (k !== index) neighbors.push(map[k].character);
            }

            targetable.push({ target: map[index].character, neighbors });
            break;
          }
        }
      }

      return targetable;
    },

    all: function (origin) {
      /* [x][x][x]
         [x][x][x]
         [x][x][x] */
      const map = this.playerMap;
      const targetable = [];
      let neighbors;

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          neighbors = [];

          for (let j = 0; j < MAP_TOTAL_TILES; j++) {
            if (j !== i) neighbors.push(j);
          }

          targetable.push({ target: map[index].character, neighbors });
        }
      }

      return targetable;
    },
  };

  this.getPlayerTargets = {
    melee: function (origin, targetSide) {
      /* [ ][ ][ ]
         [x][ ][ ]
         [ ][ ][ ] */
      let index;

      if (targetSide === 'player') {
        for (let i = MAP_SIZE; i > 0; i--) {
          for (let j = 0; j < MAP_SIZE; j++) {
            index = i * MAP_SIZE - j - 1;
            if (this.playerMap[index].character) {
              this._setUpTarget(this.enemyMap, origin, index, []);
              break;
            }
          }
        }
      } else if (targetSide === 'enemy') {
        for (let i = 0; i < MAP_SIZE; i++) {
          for (let j = 0; j < MAP_SIZE; j++) {
            index = i * MAP_SIZE + j;
            if (this.enemyMap[index].character) {
              this._setUpTarget(this.enemyMap, origin, index, []);
              break;
            }
          }
        }
      } else {
        console.log('um what r u going for kid');
      }
    },

    ranged: function (origin) {
      /* [ ][ ][ ]
         [ ][x][ ] (any)
         [ ][ ][ ] */
      const map = this.enemyMap;

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          this._setUpTarget(map, origin, i, []);
        }
      }
    },

    reach: function (origin) {
      /* [ ][ ][ ]
         [x][x][ ]
         [ ][ ][ ] */
      const map = this.enemyMap;
      let index;
      let reachIndex;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            reachIndex = index + 1;
            if (reachIndex % MAP_SIZE !== 0) {
              this._setUpTarget(map, origin, index, [reachIndex]);
            } else {
              this._setUpTarget(map, origin, index, []);
            }

            break;
          }
        }
      }
    },

    pierce: function (origin) {
      /* [ ][ ][ ]
         [x][x][x]
         [ ][ ][ ] */
      const map = this.enemyMap;
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];
            for (let k = i * MAP_SIZE; k < (i + 1) * MAP_SIZE; k++) {
              if (k !== index) neighbors.push(k);
            }

            this._setUpTarget(map, origin, index, neighbors);
            break;
          }
        }
      }
    },

    spread: function (origin) {
      /* [ ][x][ ]
         [x][x][x]
         [ ][x][ ] */
      const map = this.enemyMap;
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];

            // horizontal checks
            if ((index + 1) % 3 > index % 3 && (index + 1) < MAP_TOTAL_TILES) neighbors.push(index + 1);
            if ((index - 1) % 3 < index % 3 && (index - 1) > -1) neighbors.push(index - 1);

            // vertical checks
            if ((index + 3) < MAP_TOTAL_TILES) neighbors.push(index + 3);
            if ((index - 3) > -1) neighbors.push(index - 3);

            this._setUpTarget(map, origin, index, neighbors);
          }
        }
      }
    },

    swing: function (origin) {
      /* [O][ ][x]
         [x][x][O]
         [ ][O][x] */
      const map = this.enemyMap;
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

            if (topIndex > -1) neighbors.push(index - MAP_SIZE);
            if (botIndex < MAP_TOTAL_TILES) neighbors.push(index + MAP_SIZE);

            this._setUpTarget(map, origin, index, neighbors);
            break;
          }
        }
      }
    },

    impact: function (origin) {
      /* [x][ ][ ]
         [x][ ][ ]
         [x][ ][ ] */
      const map = this.enemyMap;
      let index;
      let neighbors;

      for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
          index = i * MAP_SIZE + j;
          if (map[index].character) {
            neighbors = [];

            for (let k = j; k < (j + 1 + (MAP_SIZE * (MAP_SIZE - 1))); k += 3) {
              if (k !== index) neighbors.push(k);
            }

            this._setUpTarget(map, origin, index, neighbors);
            break;
          }
        }
      }
    },

    all: function (origin) {
      /* [x][x][x]
         [x][x][x]
         [x][x][x] */
      const map = this.enemyMap;
      let neighbors;

      for (let i = 0; i < MAP_TOTAL_TILES; i++) {
        if (map[i].character) {
          neighbors = [];

          for (let j = 0; j < MAP_TOTAL_TILES; j++) {
            if (j !== i) neighbors.push(j);
          }

          this._setUpTarget(map, origin, i, neighbors);
        }
      }
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

    /* INIT TILES */
    for (i = 0; i < MAP_SIZE; i++) {
      for (j = 0; j < MAP_SIZE; j++) {
        let playerTile;
        let enemyTile;

        // player tiles
        playerTile = new Tile(this.game, j * 100, i * 100);
        this.playerMap.push({
          tile: playerTile,
          x: playerTile.x,
          y: playerTile.y,
        });

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
    let combinedMap = this.playerMap.concat(this.enemyMap);
    this.turnOrder = _.chain(combinedMap)
                      .filter(tile => { return tile.character; })
                      .map('character')
                      .sortBy(c => { return c.baseStats.speed * -1; })
                      .toArray()
                      .value();
    console.log(this.turnOrder);
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

    // this.charFocus = target;
    this._manageTurn();
  },

  _targetCharacter: function (origin, target, neighbors) {
    let recipMap = this.enemyMap;
    let actor = this.playerMap[origin].character;
    let recip = this.enemyMap[target].character;

    recip.changeHP(-1 * actor.currentStats.attack);
    neighbors.forEach(n => {
      if (recipMap[n].character) recipMap[n].character.changeHP(-1 * actor.currentStats.attack);
    });
    this._clearMap(recipMap);
    this._manageTurn();
  },

  _setUpTarget: function (map, origin, loc, neighbors) {
    let val = map[loc];

    val.character.sprite.events.onInputDown.removeAll();
    val.character.sprite.events.onInputDown.add(() => { this._targetCharacter(origin, loc, neighbors); });

    val.tile.inputEnabled = true;
    val.tile.events.onInputDown.add(() => { this._targetCharacter(origin, loc, neighbors); });
    this._setTileHover(map, val.tile, val.character.sprite, 'attack', neighbors);
  },

  _setTileHover: function (map, tile, char, frameName, neighbors) {
    tile.events.onInputOver.add(() => {
      tile.setStatus(frameName);
      neighbors.forEach((n) => {
        map[n].tile.setStatus('affect');
      });
    });

    tile.events.onInputOut.add(() => {
      tile.setStatus('default');
      neighbors.forEach((n) => {
        map[n].tile.setStatus('default');
      });
    });

    char.events.onInputOver.add(() => {
      tile.setStatus(frameName);
      neighbors.forEach((n) => {
        map[n].tile.setStatus('affect');
      });
    });

    char.events.onInputOut.add(() => {
      tile.setStatus('default');
      neighbors.forEach((n) => {
        map[n].tile.setStatus('default');
      });
    });
  },

  _enableTargeting: function (origin, range, targetSide) {
    this.mapClear = false;
    this.getPlayerTargets[range].bind(this)(origin, targetSide);
  },

  _playerActionHandler: function (action, loc, params) {
    if (action === 'select') {
      // TODO: currently not being used (the select action)
      this._selectCharacter(this.playerMap[loc].character);
    } else if (action === 'move') {
      this._enableMove(loc);
    } else if (action === 'attack') {
      this._enableTargeting(loc, params.range, 'enemy');
    }
  },

  _enemyActionHandler: function (action, loc) {
    if (action === 'kill') {
      this._killCharacter(this.enemyMap, loc);
    } else if (action === 'targetPlayer') {
      console.log(this.getEnemyTargets.swing.bind(this)(loc));
    }
  },

  _manageTurn: function () {
    this.turnOrder[this.currentTurn].endTurn();

    this.currentTurn += 1;
    if (this.currentTurn >= this.turnOrder.length) {
      this.currentTurn = 0;
    }

    this.turnOrder[this.currentTurn].startTurn();
  },

  _killCharacter: function (map, loc) {
    map[loc].character = null;
  },
};
