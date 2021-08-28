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

    static angle(p1, p2) {
        // normalize vectors
        const deltaY = p1.y - p2.y  // for y getting bigger to the south
        const deltaX = p2.x - p1.x
        // get angle between vectors
        let result = Math.atan2(deltaY, deltaX)
        // convert from radians to degrees
        result *= 180 / Math.PI
        return Math.round((result < 0) ? (360 + result) : result)
    }

    static adjacents(center, predicate=()=>true) {
        const points = []
        for (let [x, y, direction] of ADJACENT_NEIGHBORHOOD) {
            const point = new Point(center.x + x, center.y + y)
            if (predicate(point, direction)) {
                points.push(point)
            }
        }
        return points
    }

    static around(center, predicate=()=>true) {
        const points = []
        for (let [x, y, direction] of AROUND_NEIGHBORHOOD) {
            const point = new Point(center.x + x, center.y + y)
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

    static atNorth(p) { return new Point(p.x, p.y - 1) }
    static atSouth(p) { return new Point(p.x, p.y + 1) }
    static atEast(p) { return new Point(p.x + 1, p.y) }
    static atWest(p) { return new Point(p.x - 1, p.y) }
    static atNortheast(p) { return new Point(p.x + 1, p.y - 1) }
    static atSoutheast(p) { return new Point(p.x + 1, p.y + 1) }
    static atNorthwest(p) { return new Point(p.x - 1, p.y - 1) }
    static atSouthwest(p) { return new Point(p.x - 1, p.y + 1) }
}
