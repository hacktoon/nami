import { Random } from '/src/lib/random'


//    135°   90°    45°
//       NW   N   NE
// 180°  W    .   E  0°
//       SW   S   SE
//    225°   270°    360°

// these id counts starts from east, anti-clockwise
const DIRECTIONS = {
    CENTER:    { id: 0, code: 1,   name: '',   symbol: '\u2192', axis: [ 0,  0]},
    EAST:      { id: 1, code: 2,   name: 'E',  symbol: '\u2192', axis: [ 1,  0]},
    NORTHEAST: { id: 2, code: 4,   name: 'NE', symbol: '\u2197', axis: [ 1, -1]},
    NORTH:     { id: 3, code: 8,   name: 'N',  symbol: '\u2191', axis: [ 0, -1]},
    NORTHWEST: { id: 4, code: 16,  name: 'NW', symbol: '\u2196', axis: [-1, -1]},
    WEST:      { id: 5, code: 32,  name: 'W',  symbol: '\u2190', axis: [-1,  0]},
    SOUTHWEST: { id: 6, code: 64,  name: 'SW', symbol: '\u2199', axis: [-1,  1]},
    SOUTH:     { id: 7, code: 128, name: 'S',  symbol: '\u2193', axis: [ 0,  1]},
    SOUTHEAST: { id: 8, code: 256, name: 'SE', symbol: '\u2198', axis: [ 1,  1]},
}


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

    static fromId(id) {
        return DIRECTION_MAP[id]
    }

    static fromAxis([x, y]) {
        return AXIS_MAP.get(x).get(y)
    }

    static getName(direction) {
        return DIRECTION_MAP[direction.id].name
    }

    static getSymbol(direction) {
        return DIRECTION_MAP[direction.id].symbol
    }

    static getAll() {
        return [
            Direction.NORTH,
            Direction.EAST,
            Direction.SOUTH,
            Direction.WEST,
            Direction.NORTHEAST,
            Direction.NORTHWEST,
            Direction.SOUTHEAST,
            Direction.SOUTHWEST,
        ]
    }

    static random() {
        return Random.choiceFrom(Direction.getAll())
    }

    static randomCardinal() {
        return Random.choice(
            Direction.NORTH,
            Direction.EAST,
            Direction.SOUTH,
            Direction.WEST
        )
    }
}
