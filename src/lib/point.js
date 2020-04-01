import { Direction } from '/lib/direction'


const ADJACENT_NEIGHBORHOOD = [
    [-1,  0, Direction.WEST],
    [ 1,  0, Direction.EAST],
    [ 0, -1, Direction.NORTH],
    [ 0,  1, Direction.SOUTH]
]



function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

export function grow(point, testPoint=()=>true) {
    return point.OldAdjacentPoints(testPoint)
}
window.grow = grow


export class Point {
    constructor (x=0, y=0) {
        this.x = x
        this.y = y
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
        return points.map(p=>p.hash())
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

    static at(point, direction) {
        let name = "at" + capitalize(Direction.getName(direction))
        return Point[name](point)
    }

    static atNorth(point) {
        return new Point(point.x, point.y - 1)
    }

    static atSouth(point) {
        return new Point(point.x, point.y + 1)
    }

    static atEast(point) {
        return new Point(point.x + 1, point.y)
    }

    static atWest(point) {
        return new Point(point.x - 1, point.y)
    }

    static atNortheast(point) {
        return new Point(point.x + 1, point.y - 1)
    }

    static atSoutheast(point) {
        return new Point(point.x + 1, point.y + 1)
    }

    static atNorthwest(point) {
        return new Point(point.x - 1, point.y - 1)
    }

    static atSouthwest(point) {
        return new Point(point.x - 1, point.y + 1)
    }

    static euclidianDistance (point1, point2) {
        let deltaX = Math.pow(point2.x - point1.x, 2),
            deltaY = Math.pow(point2.y - point1.y, 2)
        return Math.sqrt(deltaX + deltaY)
    }

    static manhattanDistance (point1, point2) {
        let deltaX = Math.abs(point2.x - point1.x),
            deltaY = Math.abs(point2.y - point1.y)
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
