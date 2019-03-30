import _ from 'lodash'

import { Direction } from './base'


export class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
    }

    isNeighbor(point) {
        let x = Math.abs(this.x - point.x)
        let y = Math.abs(this.y - point.y)
        return (x == 1 && y == 0) || (x == 0 && y == 1)
    }

    hash () {
        return `${this.x},${this.y}`
    }

    adjacentPoints(callback) {
        let points = [
            new Point(this.x - 1, this.y),
            new Point(this.x + 1, this.y),
            new Point(this.x, this.y - 1),
            new Point(this.x, this.y + 1)
        ]
        points.forEach(callback)
        return points
    }

    static at(point, direction) {
        let name = "at" + _.capitalize(Direction.getName(direction))
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
