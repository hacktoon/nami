"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DirectionNameMap = {
  NORTH: {
    code: 1,
    symbol: "\u25B2"
  },
  EAST: {
    code: 2,
    symbol: "\u25B6"
  },
  SOUTH: {
    code: -1,
    symbol: "\u25BC"
  },
  WEST: {
    code: -2,
    symbol: "\u25C0"
  },
  NORTHEAST: {
    code: 3,
    symbol: "\u25E5"
  },
  NORTHWEST: {
    code: 4,
    symbol: "\u25E4"
  },
  SOUTHEAST: {
    code: -4,
    symbol: "\u25E2"
  },
  SOUTHWEST: {
    code: -3,
    symbol: "\u25E3"
  }
};

var DirectionIdMap = function () {
  var _map = {};

  _.each(DirectionNameMap, function (item, key) {
    item.name = key;
    _map[item.code] = item;
  });

  return _map;
}();

var Direction =
/*#__PURE__*/
function () {
  function Direction() {
    _classCallCheck(this, Direction);
  }

  _createClass(Direction, null, [{
    key: "getName",
    value: function getName(code) {
      return DirectionIdMap[code].name;
    }
  }, {
    key: "getSymbol",
    value: function getSymbol(code) {
      return DirectionIdMap[code].symbol;
    }
  }, {
    key: "isDivergent",
    value: function isDivergent(dir1, dir2) {
      if (Math.abs(dir1) != Math.abs(dir2)) {
        return false;
      }

      if (dir1 < 0 && dir2 > 0) {
        return true;
      }

      return false;
    }
  }, {
    key: "isConvergent",
    value: function isConvergent(dir1, dir2) {
      if (Math.abs(dir1) != Math.abs(dir2)) {
        return false;
      }

      if (dir1 > 0 && dir2 < 0) {
        return true;
      }

      return false;
    }
  }, {
    key: "random",
    value: function random() {
      return _.sample([this.NORTH, this.EAST, this.SOUTH, this.WEST, this.NORTHEAST, this.NORTHWEST, this.SOUTHEAST, this.SOUTHWEST]);
    }
  }, {
    key: "randomCardinal",
    value: function randomCardinal() {
      return _.sample([this.NORTH, this.EAST, this.SOUTH, this.WEST]);
    }
  }, {
    key: "NORTH",
    get: function get() {
      return DirectionNameMap.NORTH.code;
    }
  }, {
    key: "EAST",
    get: function get() {
      return DirectionNameMap.EAST.code;
    }
  }, {
    key: "SOUTH",
    get: function get() {
      return DirectionNameMap.SOUTH.code;
    }
  }, {
    key: "WEST",
    get: function get() {
      return DirectionNameMap.WEST.code;
    }
  }, {
    key: "NORTHEAST",
    get: function get() {
      return DirectionNameMap.NORTHEAST.code;
    }
  }, {
    key: "NORTHWEST",
    get: function get() {
      return DirectionNameMap.NORTHWEST.code;
    }
  }, {
    key: "SOUTHEAST",
    get: function get() {
      return DirectionNameMap.SOUTHEAST.code;
    }
  }, {
    key: "SOUTHWEST",
    get: function get() {
      return DirectionNameMap.SOUTHWEST.code;
    }
  }]);

  return Direction;
}();

;

var NumberInterpolation = function NumberInterpolation(from, to, totalItems) {
  var totalNumbers = to - from + 1,
      stepValue = totalNumbers / totalItems,
      numbers = [from],
      currentValue = from;

  _.times(totalItems - 2, function () {
    currentValue += stepValue;
    numbers.push(Math.round(currentValue));
  });

  numbers.push(to);
  return numbers;
};

var HashMap =
/*#__PURE__*/
function () {
  function HashMap() {
    _classCallCheck(this, HashMap);

    this._map = {};
    this._size = 0;
  }

  _createClass(HashMap, [{
    key: "add",
    value: function add(obj) {
      this._map[obj.hash()] = obj;
      this._size++;
    }
  }, {
    key: "has",
    value: function has(obj) {
      return _.has(this._map, obj.hash());
    }
  }, {
    key: "get",
    value: function get(hash) {
      return this._map[hash];
    }
  }, {
    key: "remove",
    value: function remove(obj) {
      delete this._map[obj.hash()];
      this._size--;
    }
  }, {
    key: "size",
    value: function size() {
      return this._size;
    }
  }, {
    key: "each",
    value: function each(callback) {
      _.each(this._map, function (obj) {
        return callback(obj);
      });
    }
  }]);

  return HashMap;
}();