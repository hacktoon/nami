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

    static random(rangeSize) {
        return new Point(Random.int(rangeSize), Random.int(rangeSize))
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

    get hash() {
        return `${this.x},${this.y}`
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


export class PointSet {
    constructor(points=[]) {
        this.set = new Set(points.map(p=>p.hash))
    }

    get size() {
        return this.set.size
    }

    has(point) {
        return this.set.has(point.hash)
    }
}


export class PointMap {
    constructor(points=[], callback=()=>true) {
        this.map = new Map(points.map(p=>[p.hash, callback(p)]))
    }

    get size() {
        return this.map.size
    }

    has(point) {
        return this.map.has(point.hash)
    }

    get(point) {
        return this.map.get(point.hash)
    }
}


// get extreme points,
// points in group, get median center, etc
//x = new PointGroup([new Point(-5, 4), new Point(8, 2), new Point(2, -2), new Point(0, -10)])
export class PointGroup {
    constructor(points) {
        this.points = points
        this.set    = new PointSet(points)
    }

    has(point) {
        return this.set.has(point)
    }

    center() {
        return this.points[0]
    }

    edges() {
        return this.points
    }

    extremes() {
        let north = new Point()
        let south = new Point()
        let east = new Point()
        let west =  new Point()
        this.points.forEach(p => {
            if (p.x >= east.x) east = p
            if (p.x <= west.x) west = p
            if (p.y >= north.y) north = p
            if (p.y <= south.y) south = p
        })
        return {north, south, east, west}
    }
}
window.PointGroup = PointGroup
