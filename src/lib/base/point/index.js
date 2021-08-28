import { Direction } from '/lib/base/direction'
import { Random } from '/lib/base/random'


const ADJACENT_NEIGHBORHOOD = [
    [-1,  0, Direction.WEST],
    [ 1,  0, Direction.EAST],
    [ 0, -1, Direction.NORTH],
    [ 0,  1, Direction.SOUTH]
]


const AROUND_NEIGHBORHOOD = ADJACENT_NEIGHBORHOOD.concat([
    [-1, -1, Direction.NORTHWEST],
    [ 1,  1, Direction.SOUTHEAST],
    [ 1, -1, Direction.NORTHEAST],
    [-1,  1, Direction.SOUTHWEST],
])


export class Point {
    constructor (x=0, y=0) {
        this.x = x
        this.y = y
    }

    static random(rangeWidth, rangeHeight) {
        const [x, y] = [Random.int(rangeWidth), Random.int(rangeHeight)]
        return new Point(x, y)
    }

    static fromHash(hash) {
        const [x, y] = hash.split(',').map(h => parseInt(h, 10))
        return new Point(x, y)
    }

    static hash(point) {
        return `${point.x},${point.y}`
    }

    static equals(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y
    }

    differs(point) {
        return this.x !== point.x || this.y !== point.y
    }

    plus(point) {
        return new Point(this.x + point.x, this.y + point.y)
    }

    minus(point) {
        return new Point(this.x - point.x, this.y - point.y)
    }

    multiplyScalar(x, y) {
        return new Point(this.x * x, this.y * (y ?? x))
    }

    abs() {
        return new Point(Math.abs(this.x), Math.abs(this.y))
    }

    angle(point) {
        // normalize vectors
        const deltaY = this.y - point.y  // for y getting bigger to the south
        const deltaX = point.x - this.x
        // get angle between vectors
        let result = Math.atan2(deltaY, deltaX)
        // convert from radians to degrees
        result *= 180 / Math.PI
        return Math.round((result < 0) ? (360 + result) : result)
    }

    isAdjacent(point) {
        const x = Math.abs(this.x - point.x)
        const y = Math.abs(this.y - point.y)
        return (x == 1 && y == 0) || (x == 0 && y == 1)
    }

    adjacents(predicate=()=>true) {
        const points = []
        for (let [x, y, direction] of ADJACENT_NEIGHBORHOOD) {
            const point = new Point(this.x + x, this.y + y)
            if (predicate(point, direction)) {
                points.push(point)
            }
        }
        return points
    }

    around(predicate=()=>true) {
        const points = []
        for (let [x, y, direction] of AROUND_NEIGHBORHOOD) {
            const point = new Point(this.x + x, this.y + y)
            if (predicate(point, direction)) {
                points.push(point)
            }
        }
        return points
    }

    atNorth() { return new Point(this.x, this.y - 1) }
    atSouth() { return new Point(this.x, this.y + 1) }
    atEast() { return new Point(this.x + 1, this.y) }
    atWest() { return new Point(this.x - 1, this.y) }
    atNortheast() { return new Point(this.x + 1, this.y - 1) }
    atSoutheast() { return new Point(this.x + 1, this.y + 1) }
    atNorthwest() { return new Point(this.x - 1, this.y - 1) }
    atSouthwest() { return new Point(this.x - 1, this.y + 1) }
    isAtDirection(point, dir) {
        const north = dir === Direction.NORTH && this.y > point.y
        const south = dir === Direction.SOUTH && this.y < point.y
        const west = dir === Direction.WEST && this.x > point.x
        const east = dir === Direction.SOUTH && this.x < point.x
        return north || south || east || west
    }

    distance(point) {
        let deltaX = Math.pow(point.x - this.x, 2),
            deltaY = Math.pow(point.y - this.y, 2)
        return Math.sqrt(deltaX + deltaY)
    }

    manhattanDistance(point) {
        let deltaX = Math.abs(point.x - this.x),
            deltaY = Math.abs(point.y - this.y)
        return deltaX + deltaY
    }
}
