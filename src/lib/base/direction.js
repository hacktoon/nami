import { Random } from '/lib/base/random'


const DIRECTIONS = {
    WEST:      { id: 'W',  symbol: '\u2190', inverse: 'E' },
    NORTH:     { id: 'N',  symbol: '\u2191', inverse: 'S' },
    EAST:      { id: 'E',  symbol: '\u2192', inverse: 'W' },
    SOUTH:     { id: 'S',  symbol: '\u2193', inverse: 'N' },
    NORTHWEST: { id: 'NW', symbol: '\u2196', inverse: 'SE' },
    NORTHEAST: { id: 'NE', symbol: '\u2197', inverse: 'SW' },
    SOUTHEAST: { id: 'SE', symbol: '\u2198', inverse: 'NW' },
    SOUTHWEST: { id: 'SW', symbol: '\u2199', inverse: 'NE' }
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