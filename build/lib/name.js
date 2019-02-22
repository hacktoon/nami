"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var personNames = {
  first: ["Joe", "Mary", "Zoe", "La", "Bo", "Jack", "Zedd", "Will", "Bill", "Hassam", "Jen", "Eva", "Adam", "Moe", "Liz", "Walter", "John", "Mick", "Ana", "Luci", "Ceci", "Fran", "Carol", "James", "Eric", "Cesar", "Rudi", "May", "Laila", "Vic", "Albert", "Steve", "Jane", "Sara", "Vivi", "Liane", "Ada", "Cindy", "Amora", "Bea", "Isobel", "Iane", "Hector", "Mandy", "Amanda", "Bob", "Liv", "Licia", "Obi", "Dave", "Pat", "Ani", "Bel"],
  last: ["Brum", "Vick", "Liz", "Laverne", "Melifleur", "Baroq", "Almon", "Hadd", "Orlon", "Labelle", "Flops", "Baron", "Zuid", "Well", "Katman", "Arman", "Odd", "Virgo", "Atuk"]
};
var landMassNames = {
  first: ["Bre", "Ad", "Bren", "Ard", "Meso", "Atla", "Ard", "Astra", "Dra", "Tre", "Ar", "Eud", "Aud"],
  last: ["wana", "inia", "lum", "meria", "moria", "ania", "andia", "icia", "vedia"]
};

var NameGenerator =
/*#__PURE__*/
function () {
  function NameGenerator() {
    _classCallCheck(this, NameGenerator);
  }

  _createClass(NameGenerator, null, [{
    key: "createLandMassName",
    value: function createLandMassName() {
      return _.sample(landMassNames.first) + _.sample(landMassNames.last);
    }
  }, {
    key: "createPersonName",
    value: function createPersonName() {
      return _.sample(personNames.first) + " " + _.sample(personNames.last);
    }
  }]);

  return NameGenerator;
}();