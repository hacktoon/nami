import { repeat } from '/lib/function'
import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const ADJACENT_NEIGHBORHOOD = [
    [-1,  0, Direction.WEST],
    [ 1,  0, Direction.EAST],
    [ 0, -1, Direction.NORTH],
    [ 0,  1, Direction.SOUTH]
]


export class Point {
    constructor (x=0, y=0) {
        this.x = x
        this.y = y
    }

    static random(rangeWidth, rangeHeight) {
        const [x, y] = [Random.int(rangeWidth), Random.int(rangeHeight)]
        return new Point(x, y)
    }

    get hash() {
        return `${this.x},${this.y}`
    }

    equals(point) {
        return this.x == point.x && this.y == point.y
    }

    plus(point) {
        return new Point(this.x + point.x, this.y + point.y)
    }

    minus(point) {
        return new Point(this.x - point.x, this.y - point.y)
    }

    test(predicate=()=>true) {
        return predicate(this.x, this.y)
    }

    isPositive() { return this.x >= 0 && this.y >= 0 }

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

    //TODO: switch to new version adjacents
    OldAdjacentPoints(callback=()=>{}) {
        let points = [
            [new Point(this.x - 1, this.y), Direction.WEST],
            [new Point(this.x + 1, this.y), Direction.EAST],
            [new Point(this.x, this.y - 1), Direction.NORTH],
            [new Point(this.x, this.y + 1), Direction.SOUTH]
        ]
        for (let point of points) {
            callback(point[0], point[1])
        }
        return points
    }

    //TODO: refactor
    pointsAround(callback=function(){}) {
        let points = this.OldAdjacentPoints().concat([
            [new Point(this.x - 1, this.y - 1), Direction.NORTHWEST],
            [new Point(this.x + 1, this.y + 1), Direction.SOUTHEAST],
            [new Point(this.x + 1, this.y - 1), Direction.NORTHEAST],
            [new Point(this.x - 1, this.y + 1), Direction.SOUTHWEST]
        ])
        for (let point of points) {
            callback(point[0], point[1])
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
window.Point = Point


export class PointGroup {
    constructor(points=[]) {
        this.points   = points
        this.hash     = new PointHash(points)
        this._cachedExtremes = null
        this._cachedBorders = null
    }

    get size() {
        return this.points.length
    }

    get center() {
        const extremes = this.extremes()
        const xLength = extremes.east.x + extremes.west.x
        const yLength = extremes.south.y + extremes.north.y
        const x = Math.floor(xLength / 2)
        const y = Math.floor(yLength / 2)
        return new Point(x, y)
    }

    has(point) {
        return this.hash.has(point)
    }

    extremes() {
        if (this._cachedExtremes != null) return this._cachedExtremes
        let [north, south, east, west] = repeat(4, ()=>new Point())
        for(let point of this.points) {
            if (point.x >= east.x)  east  = point
            if (point.x <= west.x)  west  = point
            if (point.y <= north.y) north = point
            if (point.y >= south.y) south = point
        }
        this._cachedExtremes = {north, south, east, west}
        return this._cachedExtremes
    }

    borders(filter=()=>true) {
        if (this._cachedBorders != null) return this._cachedBorders
        const borderPoints = []
        const inGroup = p => this.has(p) && filter(p)
        for(let point of this.points) {
            const adjacentsInGroup = point.adjacents(inGroup)
            if (adjacentsInGroup.length < 4) {
                borderPoints.push(point)
            }
        }
        this._cachedBorders = borderPoints
        return borderPoints
    }
}


export class PointHash {
    constructor(points=[]) {
        this.set    = new Set(points.map(p=>p.hash))
    }

    get size() {
        return this.set.size
    }

    has(point) {
        return this.set.has(point.hash)
    }
}