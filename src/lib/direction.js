import { Random } from '/src/lib/random'


//    135°   90°    45°
//       NW   N   NE
// 180°  W    .   E  0°
//       SW   S   SE
//    225°   270°    360°

// these id counts starts from east, anti-clockwise
const NULL_DIRECTION = { id: -1, name: '',  symbol: '', axis: [0, 0]}
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

const CARDINAL_DIRECTIONS = new Set([
    DIRECTIONS.NORTH.id,
    DIRECTIONS.EAST.id,
    DIRECTIONS.SOUTH.id,
    DIRECTIONS.WEST.id
])

export class Direction {
    static get NULL () { return NULL_DIRECTION }
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

    static getName(direction) {
        return DIRECTION_MAP[direction.id].name
    }

    static getSymbol(direction) {
        return DIRECTION_MAP[direction.id].symbol
    }

    static getAxis(direction) {
        return DIRECTION_MAP[direction.id].axis
    }

    static dotProduct(dir1, dir2) {
        const [x1, y1] = dir1.axis
        const [x2, y2] = dir2.axis
        return x1 * x2 + y1 * y2
    }

    static fromAngle(angle) {
        const degreePerDirection = 360 / 8
        const offsetAngle = angle + degreePerDirection / 2
        const wrappedAngle = offsetAngle > 360 ? offsetAngle - 360 : offsetAngle
        const angleIndex = Math.floor(wrappedAngle / degreePerDirection)
        return DIRECTION_MAP[angleIndex]
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

    static isCardinal(direction) {
        return CARDINAL_DIRECTIONS.has(direction.id)
    }
}
