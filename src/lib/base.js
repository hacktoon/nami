import _ from 'lodash'


const DirectionNameMap = {
    NORTH:     { code: -1,  symbol: "\u25B2" },
    EAST:      { code: 2,  symbol: "\u25B6" },
    SOUTH:     { code: 1, symbol: "\u25BC" },
    WEST:      { code: -2, symbol: "\u25C0" },
    NORTHEAST: { code: 3,  symbol: "\u25E5" },
    NORTHWEST: { code: 4,  symbol: "\u25E4" },
    SOUTHEAST: { code: -4, symbol: "\u25E2" },
    SOUTHWEST: { code: -3, symbol: "\u25E3" }
}

const DirectionIdMap = (() => {
    let _map = {}
    _.each(DirectionNameMap, (item, key) => {
        item.name = key
        _map[item.code] = item
    })
    return _map;
})();


export class Direction {
    static get NORTH () { return DirectionNameMap.NORTH.code }
    static get EAST () { return DirectionNameMap.EAST.code }
    static get SOUTH () { return DirectionNameMap.SOUTH.code }
    static get WEST () { return DirectionNameMap.WEST.code }
    static get NORTHEAST () { return DirectionNameMap.NORTHEAST.code }
    static get NORTHWEST () { return DirectionNameMap.NORTHWEST.code }
    static get SOUTHEAST () { return DirectionNameMap.SOUTHEAST.code }
    static get SOUTHWEST () { return DirectionNameMap.SOUTHWEST.code }

    static getName (code) {
        return DirectionIdMap[code].name;
    }

    static getSymbol (code) {
        return DirectionIdMap[code].symbol;
    }

    static isOpposite (dir1, dir2) {
        return dir1 * -1 == dir2
    }

    static random () {
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
    }

    static randomCardinal () {
        return _.sample([
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST
        ]);
    }
};


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


export class HashMap {
    constructor() {
        this._map = {}
        this._size = 0;
    }

    add(obj) {
        if (this.has(obj))
            return
        this._map[obj.hash()] = obj
        this._size++
    }

    has(obj) {
        return _.has(this._map, obj.hash())
    }

    get(obj) {
        return this._map[obj.hash()]
    }

    remove(obj) {
        delete this._map[obj.hash()]
        this._size--
    }

    size() {
        return this._size
    }

    each(callback) {
        _.each(this._map, obj => callback(obj))
    }
}


export function getChance(percentage) {
    window._ = _
    let value = _.random(1.0, true)
    return value <= percentage
}
