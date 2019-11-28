import _ from 'lodash'

import { Direction } from './base'


export class Point {
    constructor (x=0, y=0) {
        this.x = x
        this.y = y
    }

    isNeighbor(point) {
        let x = Math.abs(this.x - point.x)
        let y = Math.abs(this.y - point.y)
        return (x == 1 && y == 0) || (x == 0 && y == 1)
    }

    equals(point) {
        return this.x == point.x && this.y == point.y
    }

    minus(point) {
        return new Point(this.x - point.x, this.y - point.y)
    }

    hash () {
        return `${this.x},${this.y}`
    }

    adjacentPoints(callback) {
        let points = [
            [new Point(this.x - 1, this.y), Direction.WEST],
            [new Point(this.x + 1, this.y), Direction.EAST],
            [new Point(this.x, this.y - 1), Direction.NORTH],
            [new Point(this.x, this.y + 1), Direction.SOUTH]
        ]
        if (_.isFunction(callback))
            for (let point of points) {
                callback(point[0], point[1])
            }
        return points
    }

    pointsAround(callback) {
        let points = this.adjacentPoints().concat([
            [new Point(this.x - 1, this.y - 1), Direction.NORTHWEST],
            [new Point(this.x + 1, this.y + 1), Direction.SOUTHEAST],
            [new Point(this.x + 1, this.y - 1), Direction.NORTHEAST],
            [new Point(this.x - 1, this.y + 1), Direction.SOUTHWEST]
        ])
        if (_.isFunction(callback))
            for (let point of points) {
                callback(point[0], point[1])
            }
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
