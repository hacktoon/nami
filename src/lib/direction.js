import { Random } from '/src/lib/random'

// bitmap code
//  128     1      2
//     NW   N   NE
//  64 W    .    E 4
//     SW   S   SE
//   32     16     8

const _CENTER    = 0
const _NORTH     = 1
const _NORTHEAST = 2
const _EAST      = 3
const _SOUTHEAST = 4
const _SOUTH     = 5
const _SOUTHWEST = 6
const _WEST      = 7
const _NORTHWEST = 8


// these id counts starts from north, clockwise
const DIRECTIONS = {
    CENTER:    { id: _CENTER,    code: 0,   name: 'C',  symbol: 'o',      axis: [ 0,  0]},
    NORTH:     { id: _NORTH,     code: 1,   name: 'N',  symbol: '\u2191', axis: [ 0, -1]},
    NORTHEAST: { id: _NORTHEAST, code: 2,   name: 'NE', symbol: '\u2197', axis: [ 1, -1]},
    EAST:      { id: _EAST,      code: 4,   name: 'E',  symbol: '\u2192', axis: [ 1,  0]},
    SOUTHEAST: { id: _SOUTHEAST, code: 8,   name: 'SE', symbol: '\u2198', axis: [ 1,  1]},
    SOUTH:     { id: _SOUTH,     code: 16,  name: 'S',  symbol: '\u2193', axis: [ 0,  1]},
    SOUTHWEST: { id: _SOUTHWEST, code: 32,  name: 'SW', symbol: '\u2199', axis: [-1,  1]},
    WEST:      { id: _WEST,      code: 64,  name: 'W',  symbol: '\u2190', axis: [-1,  0]},
    NORTHWEST: { id: _NORTHWEST, code: 128, name: 'NW', symbol: '\u2196', axis: [-1, -1]},
}


// map a diagonal X to its neighbors and its diagonal direction back to X
const DIAGONAL_NEIGHBORS = new Map([
    [_NORTHEAST, [{_EAST: DIRECTIONS.NORTHWEST}, {_NORTH: DIRECTIONS.SOUTHEAST}]],
    [_NORTHWEST, [{_WEST: DIRECTIONS.NORTHEAST}, {_NORTH: DIRECTIONS.SOUTHWEST}]],
    [_SOUTHEAST, [{_EAST: DIRECTIONS.SOUTHWEST}, {_SOUTH: DIRECTIONS.NORTHEAST}]],
    [_SOUTHWEST, [{_WEST: DIRECTIONS.SOUTHEAST}, {_SOUTH: DIRECTIONS.NORTHWEST}]],
])


// map an axis pair to its direction
const AXIS_MAP = new Map([
    [-1, new Map([
        [-1, DIRECTIONS.NORTHWEST],
        [ 0, DIRECTIONS.WEST],
        [ 1, DIRECTIONS.SOUTHWEST],
    ])],
    [0, new Map([
        [-1, DIRECTIONS.NORTH],
        [ 0, DIRECTIONS.CENTER],
        [ 1, DIRECTIONS.SOUTH],
    ])],
    [1, new Map([
        [-1, DIRECTIONS.NORTHEAST],
        [ 0, DIRECTIONS.EAST     ],
        [ 1, DIRECTIONS.SOUTHEAST]
    ])],
])


const DIRECTION_MAP = (() => {
    let _map = {}
    for(let [name, props] of Object.entries(DIRECTIONS)) {
        _map[props.id] = {...props, name}
    }
    return _map
})()


const ALL = [
    DIRECTIONS.NORTH,
    DIRECTIONS.EAST,
    DIRECTIONS.SOUTH,
    DIRECTIONS.WEST,
    DIRECTIONS.NORTHEAST,
    DIRECTIONS.NORTHWEST,
    DIRECTIONS.SOUTHEAST,
    DIRECTIONS.SOUTHWEST,
]


export class Direction {
    static get CENTER () { return DIRECTIONS.CENTER }
    static get NORTH () { return DIRECTIONS.NORTH }
    static get EAST () { return DIRECTIONS.EAST }
    static get SOUTH () { return DIRECTIONS.SOUTH }
    static get WEST () { return DIRECTIONS.WEST }
    static get NORTHEAST () { return DIRECTIONS.NORTHEAST }
    static get NORTHWEST () { return DIRECTIONS.NORTHWEST }
    static get SOUTHEAST () { return DIRECTIONS.SOUTHEAST }
    static get SOUTHWEST () { return DIRECTIONS.SOUTHWEST }

    static fromId(id) { return DIRECTION_MAP[id] }

    static fromAxis(x, y) { return AXIS_MAP.get(x).get(y) }

    static getName(direction) { return DIRECTION_MAP[direction.id].name }

    static getSymbol(direction) { return DIRECTION_MAP[direction.id].symbol }

    static getAll() { return ALL }

    static random() { return Random.choiceFrom(ALL) }

    static randomCardinal() {
        return Random.choice(
            DIRECTIONS.NORTH,
            DIRECTIONS.EAST,
            DIRECTIONS.SOUTH,
            DIRECTIONS.WEST
        )
    }

    static isCardinal(direction) {
        return [
            DIRECTIONS.NORTH.id,
            DIRECTIONS.EAST.id,
            DIRECTIONS.SOUTH.id,
            DIRECTIONS.WEST.id
        ].includes(direction.id)
    }

    static getDiagonalNeighbors() {
        return DIAGONAL_NEIGHBORS
    }
}
