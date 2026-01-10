import { Random } from '/src/lib/random'

// bitmap code
//  128     1      2
//     NW   N   NE
//  64 W    o    E 4
//     SW   S   SE
//   32     16     8

const CENTER_ID = 0
const N_ID      = 1
const NE_ID     = 2
const E_ID      = 3
const SE_ID     = 4
const S_ID      = 5
const SW_ID     = 6
const W_ID      = 7
const NW_ID     = 8


// these id counts starts from north, clockwise
const DIRECTIONS = {
    CENTER: {
        id: CENTER_ID,
        code: 0,
        name: 'C',
        symbol: 'o',
        axis: [0,  0],
        components: [CENTER_ID]
    },
    NORTH: {
        id: N_ID,
        code: 1,
        name: 'N',
        symbol: '\u2191',
        axis: [0, -1],
        components: [N_ID]
    },
    NORTHEAST: {
        id: NE_ID,
        code: 2,
        name: 'NE',
        symbol: '\u2197',
        axis: [1, -1],
        components: [N_ID, E_ID]
    },
    EAST: {
        id: E_ID,
        code: 4,
        name: 'E',
        symbol: '\u2192',
        axis: [1,  0],
        components: [E_ID]
    },
    SOUTHEAST: {
        id: SE_ID,
        code: 8,
        name: 'SE',
        symbol: '\u2198',
        axis: [1,  1],
        components: [S_ID, E_ID]
    },
    SOUTH: {
        id: S_ID,
        code: 16,
        name: 'S',
        symbol: '\u2193',
        axis: [0,  1],
        components: [S_ID]
    },
    SOUTHWEST: {
        id: SW_ID,
        code: 32,
        name: 'SW',
        symbol: '\u2199',
        axis: [-1,  1],
        components: [S_ID, W_ID]
    },
    WEST: {
        id: W_ID,
        code: 64,
        name: 'W',
        symbol: '\u2190',
        axis: [-1,  0],
        components: [W_ID]
    },
    NORTHWEST: {
        id: NW_ID,
        code: 128,
        name: 'NW',
        symbol: '\u2196',
        axis: [-1, -1],
        components: [N_ID, W_ID]
    },
}


// map a diagonal X to its neighbors and its diagonal direction back to X
const DIAGONAL_NEIGHBORS = new Map([
    [NE_ID, [{E_ID: DIRECTIONS.NORTHWEST}, {N_ID: DIRECTIONS.SOUTHEAST}]],
    [NW_ID, [{W_ID: DIRECTIONS.NORTHEAST}, {N_ID: DIRECTIONS.SOUTHWEST}]],
    [SE_ID, [{E_ID: DIRECTIONS.SOUTHWEST}, {S_ID: DIRECTIONS.NORTHEAST}]],
    [SW_ID, [{W_ID: DIRECTIONS.SOUTHEAST}, {S_ID: DIRECTIONS.NORTHWEST}]],
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

    static getComponents(direction) { return DIRECTION_MAP[direction.id].components }

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

    static getComponents(direction) {
        return direction.components.map(dir => Direction.fromId(dir))
    }

    static getDiagonalNeighbors() {
        return DIAGONAL_NEIGHBORS
    }
}
