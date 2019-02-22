"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function Tile(point) {
  _classCallCheck(this, Tile);

  this.id = point.hash();
  this.point = point;
  this.height = 0;
  this.plate = undefined;
  this.terrain = undefined;
  this.biome = undefined;
  this.isPlateEdge = false;
};

;