import { Random } from '/lib/random'

/*
    pattern
    1  2  4
    8     16
    32 64 128
*/
const DirectionNameMap = {
    NORTH:     { id: 2,  symbol: "\u25B2" },
    EAST:      { id: 16,  symbol: "\u25B6" },
    SOUTH:     { id: 64, symbol: "\u25BC" },
    WEST:      { id: 8, symbol: "\u25C0" },
    NORTHEAST: { id: 4,  symbol: "\u25E5" },
    NORTHWEST: { id: 1,  symbol: "\u25E4" },
    SOUTHEAST: { id: 128, symbol: "\u25E2" },
    SOUTHWEST: { id: 32, symbol: "\u25E3" }
}

const DirectionIdMap = (() => {
    let _map = {}
    for(let [key, value] of Object.entries(DirectionNameMap)) {
        value.name = key
        _map[value.id] = value
    }
    return _map
})()


export class Direction {
    static get NORTH () { return DirectionNameMap.NORTH.id }
    static get EAST () { return DirectionNameMap.EAST.id }
    static get SOUTH () { return DirectionNameMap.SOUTH.id }
    static get WEST () { return DirectionNameMap.WEST.id }
    static get NORTHEAST () { return DirectionNameMap.NORTHEAST.id }
    static get NORTHWEST () { return DirectionNameMap.NORTHWEST.id }
    static get SOUTHEAST () { return DirectionNameMap.SOUTHEAST.id }
    static get SOUTHWEST () { return DirectionNameMap.SOUTHWEST.id }

    static getName (id) {
        return DirectionIdMap[id].name
    }

    static getSymbol (id) {
        return DirectionIdMap[id].symbol
    }

    static isHorizontal(dir) {
        let east = dir == DirectionNameMap.EAST.id
        let west = dir == DirectionNameMap.WEST.id
        return east || west
    }

    static isVertical(dir) {
        let north = dir == DirectionNameMap.NORTH.id
        let south = dir == DirectionNameMap.SOUTH.id
        return north || south
    }

    static random () {
        return Random.choice(
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST,
            this.NORTHEAST,
            this.NORTHWEST,
            this.SOUTHEAST,
            this.SOUTHWEST,
        )
    }

    static randomCardinal () {
        return Random.choice(
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST
        )
    }
}