import { Direction } from '/lib/direction'
import { Random } from '/lib/random'


const ADJACENT_NEIGHBORHOOD = [
    [-1,  0, Direction.WEST],
    [ 1,  0, Direction.EAST],
    [ 0, -1, Direction.NORTH],
    [ 0,  1, Direction.SOUTH]
]


export function grow(point, testPoint) {
    return point.adjacents(testPoint)
}
window.grow = grow


export function organicGrow(point, testPoint) {
    return point.adjacents(testPoint)
}
window.grow = grow


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

    hash () {
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


export class PointMap {
    /*
        A 2D geometric map of points
    */

    constructor() {
        this.hashMap = new Map()
        this.extremePoints = {
            [Direction.NORTH]: new Point(),
            [Direction.SOUTH]: new Point(),
            [Direction.EAST]: new Point(),
            [Direction.WEST]: new Point(),
        }
    }

    add(point, value) {
        if (this.hashMap.has(point)) return
        const key = point.hash()
        this.hashMap.set(key, value)
    }

    updateExtremes(point) {

    }

    size() {
        return this.hashMap.size
    }

    get(point, defaultValue=null) {
        return this.hashMap.get(point.hash()) || defaultValue
    }
}
window.PointMap = PointMap
