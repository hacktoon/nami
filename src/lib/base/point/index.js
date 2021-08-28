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

    static differs(p1, p2) {
        return p1.x !== p2.x || p1.y !== p2.y
    }

    static plus(p1, p2) {
        return new Point(p1.x + p2.x, p1.y + p2.y)
    }

    static minus(p1, p2) {
        return new Point(p1.x - p2.x, p1.y - p2.y)
    }

    static multiplyScalar(point, x, y) {
        return new Point(point.x * x, point.y * (y ?? x))
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

    static distance(p1, p2) {
        let deltaX = Math.pow(p1.x - p2.x, 2),
            deltaY = Math.pow(p1.y - p2.y, 2)
        return Math.sqrt(deltaX + deltaY)
    }

    atNorth() { return new Point(this.x, this.y - 1) }
    atSouth() { return new Point(this.x, this.y + 1) }
    atEast() { return new Point(this.x + 1, this.y) }
    atWest() { return new Point(this.x - 1, this.y) }
    atNortheast() { return new Point(this.x + 1, this.y - 1) }
    atSoutheast() { return new Point(this.x + 1, this.y + 1) }
    atNorthwest() { return new Point(this.x - 1, this.y - 1) }
    atSouthwest() { return new Point(this.x - 1, this.y + 1) }
}
