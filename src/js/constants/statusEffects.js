'use strict';

this.statusDict = {
  suppressed: {
    name: 'Suppressed',
    tile: 'status_suppress',
    desc: 'This unit is under suppressing fire and is suffering a debuff to all stats.',
    shortDesc: 'ALL STATS -50%',
    canAttack: true,
    canGuard: true,
    canMove: true,
    duration: 1,
    statMods: {
      attack: 0.5,
      magic: 0.5,
      speed: 0.5,
    },
  },
};
