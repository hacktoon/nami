window.log = console.log.bind(console);

var Direction = (function(){
    var nameMap = {
        NORTH:     { code: 1,  symbol: "\u25B2" },
        EAST:      { code: 2,  symbol: "\u25B6" },
        SOUTH:     { code: -1, symbol: "\u25BC" },
        WEST:      { code: -2, symbol: "\u25C0" },
        NORTHEAST: { code: 3,  symbol: "\u25E5" },
        NORTHWEST: { code: 4,  symbol: "\u25E4" },
        SOUTHEAST: { code: -4, symbol: "\u25E2" },
        SOUTHWEST: { code: -3, symbol: "\u25E3" }
    };

    var idMap = {};

    var buildEnumInterface = function(base){
        _.each(nameMap, function(obj, key){
            base[key] = obj.code;
            obj.name = key;
            idMap[String(obj.code)] = obj;
        });
        return base;
    };

    return buildEnumInterface({
        getName: function(code) {
            return idMap[String(code)].name;
        },

        getSymbol: function(code) {
            return idMap[String(code)].symbol;
        },

        isDivergent: function (dir1, dir2) {
            if (Math.abs(dir1) != Math.abs(dir2)) {
                return false;
            }
            if (dir1 < 0 && dir2 > 0) {
                return true;
            }
            return false;
        },

        isConvergent: function (dir1, dir2) {
            if (Math.abs(dir1) != Math.abs(dir2)) {
                return false;
            }
            if (dir1 > 0 && dir2 < 0) {
                return true;
            }
            return false;
        },

        random: function() {
            return _.sample([
                this.NORTH,
                this.EAST,
                this.SOUTH,
                this.WEST,
                this.NORTHEAST,
                this.NORTHWEST,
                this.SOUTHEAST,
                this.SOUTHWEST,
            ]);
        },

        randomCardinal: function () {
            return _.sample([
                this.NORTH,
                this.EAST,
                this.SOUTH,
                this.WEST
            ]);
        }
    });
})();


var NumberInterpolation = function(from, to, totalItems){
    var totalNumbers = to - from + 1,
        stepValue = totalNumbers / totalItems,
        numbers = [from],
        currentValue = from;

    _.times(totalItems - 2, function(){
        currentValue += stepValue;
        numbers.push(Math.round(currentValue));
    });
    numbers.push(to);

    return numbers;
};