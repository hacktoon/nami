import { Random } from '/lib/base/random'


const DIRECTIONS = {
    NORTH:     { id: 'N',  symbol: "\u25B2", inverse: 'S' },
    EAST:      { id: 'E',  symbol: "\u25B6", inverse: 'W' },
    SOUTH:     { id: 'S',  symbol: "\u25BC", inverse: 'N' },
    WEST:      { id: 'W',  symbol: "\u25C0", inverse: 'E' },
    NORTHEAST: { id: 'NE', symbol: "\u25E5", inverse: 'SW' },
    NORTHWEST: { id: 'NW', symbol: "\u25E4", inverse: 'SE' },
    SOUTHEAST: { id: 'SE', symbol: "\u25E2", inverse: 'NW' },
    SOUTHWEST: { id: 'SW', symbol: "\u25E3", inverse: 'NE' }
}

const DIRECTION_MAP = (() => {
    let _map = {}
    for(let [key, value] of Object.entries(DIRECTIONS)) {
        _map[value.id] = {...value, name: key}
    }
    return _map
})()


export class Direction {
    static get NORTH () { return DIRECTIONS.NORTH.id }
    static get EAST () { return DIRECTIONS.EAST.id }
    static get SOUTH () { return DIRECTIONS.SOUTH.id }
    static get WEST () { return DIRECTIONS.WEST.id }
    static get NORTHEAST () { return DIRECTIONS.NORTHEAST.id }
    static get NORTHWEST () { return DIRECTIONS.NORTHWEST.id }
    static get SOUTHEAST () { return DIRECTIONS.SOUTHEAST.id }
    static get SOUTHWEST () { return DIRECTIONS.SOUTHWEST.id }

    static getName (id) {
        return DIRECTION_MAP[id].name
    }

    static getSymbol (id) {
        return DIRECTION_MAP[id].symbol
    }

    static isHorizontal(id) {
        return id === Direction.EAST || id === Direction.WEST
    }

    static isVertical(id) {
        return id === Direction.NORTH || id === Direction.SOUTH
    }

    static random () {
        return Random.choice(
            Direction.NORTH,
            Direction.EAST,
            Direction.SOUTH,
            Direction.WEST,
            Direction.NORTHEAST,
            Direction.NORTHWEST,
            Direction.SOUTHEAST,
            Direction.SOUTHWEST,
        )
    }

    static randomCardinal () {
        return Random.choice(
            Direction.NORTH,
            Direction.EAST,
            Direction.SOUTH,
            Direction.WEST
        )
    }
}