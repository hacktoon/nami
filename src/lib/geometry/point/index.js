import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'


const ADJACENT_NEIGHBORHOOD = [
    [ 1,  0, Direction.EAST],
    [-1,  0, Direction.WEST],
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

    static multiplyScalar(point, xValue, yValue) {
        return [point[0] * xValue, point[1] * (yValue ?? xValue)]
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

    static directionBetween(source, target) {
        // need to get unwrapped points to get real angle
        const [sx, sy] = source
        const [tx, ty] = target
        if (tx == sx + 1 && ty == sy) return Direction.EAST
        if (tx == sx - 1 && ty == sy) return Direction.WEST
        if (ty == sy - 1 && tx == sx) return Direction.NORTH
        if (ty == sy + 1 && tx == sx) return Direction.SOUTH
        if (tx == sx + 1 && ty == sy - 1) return Direction.NORTHEAST;
        if (tx == sx - 1 && ty == sy - 1) return Direction.NORTHWEST;
        if (tx == sx + 1 && ty == sy + 1) return Direction.SOUTHEAST;
        if (tx == sx - 1 && ty == sy + 1) return Direction.SOUTHWEST;
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
