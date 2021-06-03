import { Random } from '/lib/base/random/'


// these id counts starts from east, anti-clockwise
const DIRECTIONS = {
    EAST:      { id: 0, name: 'E',  symbol: '\u2192', axis: [ 1,  0]},
    NORTHEAST: { id: 1, name: 'NE', symbol: '\u2197', axis: [ 1, -1]},
    NORTH:     { id: 2, name: 'N',  symbol: '\u2191', axis: [ 0, -1]},
    NORTHWEST: { id: 3, name: 'NW', symbol: '\u2196', axis: [-1, -1]},
    WEST:      { id: 4, name: 'W',  symbol: '\u2190', axis: [-1,  0]},
    SOUTHWEST: { id: 5, name: 'SW', symbol: '\u2199', axis: [-1,  1]},
    SOUTH:     { id: 6, name: 'S',  symbol: '\u2193', axis: [ 0,  1]},
    SOUTHEAST: { id: 7, name: 'SE', symbol: '\u2198', axis: [ 1,  1]},
}

const DIRECTION_MAP = (() => {
    let _map = {}
    for(let [name, props] of Object.entries(DIRECTIONS)) {
        _map[props.id] = {...props, name}
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

    static getById(id) {
        return DIRECTION_MAP[id]
    }

    static getName (id) {
        return DIRECTION_MAP[id].name
    }

    static getSymbol (id) {
        return DIRECTION_MAP[id].symbol
    }

    static getAxis(id) {
        return DIRECTION_MAP[id].axis
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