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
    return _map
})()


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
        return DirectionIdMap[code].name
    }

    static getSymbol (code) {
        return DirectionIdMap[code].symbol
    }

    static isHorizontal(dir) {
        let east = dir == DirectionNameMap.EAST.code
        let west = dir == DirectionNameMap.WEST.code
        return east || west
    }

    static isVertical(dir) {
        let north = dir == DirectionNameMap.NORTH.code
        let south = dir == DirectionNameMap.SOUTH.code
        return north || south
    }

    static isOpposite (dir1, dir2) {
        return dir1 * -1 == dir2
    }

    static random () {
        return Random.choice([
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST,
            this.NORTHEAST,
            this.NORTHWEST,
            this.SOUTHEAST,
            this.SOUTHWEST,
        ])
    }

    static randomCardinal () {
        return Random.choiceo([
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST
        ])
    }
}
window.Direction = Direction


var NumberInterpolation = function(from, to, totalItems){
    var totalNumbers = to - from + 1,
        stepValue = totalNumbers / totalItems,
        numbers = [from],
        currentValue = from

    _.times(totalItems - 2, function(){
        currentValue += stepValue
        numbers.push(Math.round(currentValue))
    })
    numbers.push(to)

    return numbers
}


export class HashMap {
    constructor() {
        this._map = {}
        this._size = 0
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
    let value = Random.float()
    return value <= percentage
}


export class Random {
    static set seed(seed) {
        Random._seed = seed
        if (_.isString(seed)) {
            seed = Random._hashString(seed)
        }
        Random._currentSeed = Random._hash(seed)
    }

    static get seed() {
        return Random._seed
    }

    static _hash(seed) {
        let h = 61 ^ seed ^ seed >>> 16
        h += h << 3
        h = Math.imul(h, 668265261)
        h ^= h >>> 15
        return h >>> 0
    }

    static _hashString(string) {
        var h = 0, len = string.length, i = 0
        if (len > 0)
            while (i < len)
                h = (h << 5) - h + string.charCodeAt(i++) | 0
        return h
    }

    static choice(items) {
        let index = Random.int(0, items.length-1)
        return items[index]
    }

    static int(lower=1, upper) {
        let num = Random.float()

        lower = _.toFinite(lower)
        if (upper === undefined) {
            upper = lower
            lower = 0
        } else {
            upper = _.toFinite(upper)
        }

        if (lower > upper) {
            [lower, upper] = [upper, lower]
        }
        return lower + Math.floor(num * (upper - lower + 1))
    }

    static float() {
        if (Random._currentSeed === undefined) {
            Random.seed = Number(new Date())
        }
        let s = Random._currentSeed
        Random._currentSeed = s + 1831565813 | 0
        let t = Math.imul(s ^ s >>> 15, 1 | s)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 2 ** 32
    }
}

window.Random = Random
