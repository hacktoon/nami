import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'


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
    static random(rangeWidth, rangeHeight) {
        return [Random.int(rangeWidth), Random.int(rangeHeight)]
    }

    static fromHash(hash) {
        return hash.split(',').map(h => parseInt(h, 10))
    }

    static hash(point) {
        return `${point[0]},${point[1]}`
    }

    static equals(p1, p2) {
        return p1[0] === p2[0] && p1[1] === p2[1]
    }

    static differs(p1, p2) {
        return p1[0] !== p2[0] || p1[1] !== p2[1]
    }

    static plus(p1, p2) {
        return [p1[0] + p2[0], p1[1] + p2[1]]
    }

    static minus(p1, p2) {
        return [p1[0] - p2[0], p1[1] - p2[1]]
    }

    static plusScalar(point, value) {
        return [point[0] + value, point[1] + value]
    }

    static multiply(point, another) {
        return [
            point[0] * another[0],
            point[1] * another[1]
        ]
    }

    static multiplyScalar(point, x, y) {
        return [point[0] * x, point[1] * (y ?? x)]
    }

    static angle(p1, p2) {
        // normalize vectors
        const deltaY = p1[1] - p2[1]  // for y getting bigger to the south
        const deltaX = p2[0] - p1[0]
        // get angle between vectors
        let result = Math.atan2(deltaY, deltaX)
        // convert from radians to degrees
        result *= 180 / Math.PI
        return Math.round((result < 0) ? (360 + result) : result)
    }

    static adjacents(center, callback=()=>{}) {
        const points = []
        for (let [x, y, direction] of ADJACENT_NEIGHBORHOOD) {
            const point = Point.plus(center, [x, y])
            callback(point, direction)
            points.push(point)
        }
        return points
    }

    static around(center, callback=()=>{}) {
        const points = []
        for (let [x, y, direction] of AROUND_NEIGHBORHOOD) {
            const point = [center[0] + x, center[1] + y]
            callback(point, direction)
            points.push(point)
        }
        return points
    }

    static insideCircle(center, radius, callback) {
        // Bounding circle algorithm
        // https://www.redblobgames.com/grids/circle-drawing/
        const top    = center[1] - radius
        const bottom = center[1] + radius
        for (let y = top; y <= bottom; y++) {
            const dy    = y - center[1]
            const dx    = Math.sqrt(radius * radius - dy * dy)
            const left  = Math.ceil(center[0] - dx)
            const right = Math.floor(center[0] + dx)
            for (let x = left; x <= right; x++) {
                callback([x, y])
            }
        }
    }

    static distance(p1, p2) {
        let deltaX = Math.pow(p1[0] - p2[0], 2),
            deltaY = Math.pow(p1[1] - p2[1], 2)
        return Math.sqrt(deltaX + deltaY)
    }

    static atDirection(point, direction) {
        return Point.plus(point, direction.axis)
    }

    static directionBetween(sourcePoint, targetPoint) {
        // need to get unwrapped points to get real angle
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle)
    }

    static atNorth(p) { return [p[0], p[1] - 1] }
    static atSouth(p) { return [p[0], p[1] + 1] }
    static atEast(p) { return [p[0] + 1, p[1]] }
    static atWest(p) { return [p[0] - 1, p[1]] }
    static atNortheast(p) { return [p[0] + 1, p[1] - 1] }
    static atSoutheast(p) { return [p[0] + 1, p[1] + 1] }
    static atNorthwest(p) { return [p[0] - 1, p[1] - 1] }
    static atSouthwest(p) { return [p[0] - 1, p[1] + 1] }
}
