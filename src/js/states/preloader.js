var Preloader = function (game) {
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(320, 240, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);

    /* loading sprites */
    // this.load.image('grass', 'assets/tile_grass.png');
    this.load.image('ally', 'assets/ally.png');
    this.load.image('enemy', 'assets/enemy.png');

    /* loading texture atlases */
    this.load.atlasJSONHash('tiles', 'assets/tiles.png', 'assets/tiles.json');
  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('Game', true, false, { test: 1 });
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  },
};
