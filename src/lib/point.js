import _ from 'lodash'

import { Direction } from './base'


export class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
    }

    hash () {
        return `${this.x},${this.y}`
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
window.Point = Point


export class PointNeighbors {
    constructor (referencePoint) {
        this.referencePoint = referencePoint;

        const adjacent = {},
              diagonal = {}

        adjacent[Direction.NORTH] = { x: 0, y: -1 }
        adjacent[Direction.SOUTH] = { x: 0, y: 1 }
        adjacent[Direction.EAST] = { x: 1, y: 0 }
        adjacent[Direction.WEST] = { x: -1, y: 0 }

        diagonal[Direction.NORTHEAST] = { x: 1, y: 1 }
        diagonal[Direction.NORTHWEST] = { x: -1, y: 1 }
        diagonal[Direction.SOUTHEAST] = { x: 1, y: -1 }
        diagonal[Direction.SOUTHWEST] = { x: -1, y: -1 }

        this.directions = {
            adjacent: adjacent,
            diagonal: diagonal,
            around: _.extend({}, adjacent, diagonal)
        }
    }

    adjacent (callback) {
        return this.getNeighbors(this.directions.adjacent, callback);
    }

    diagonal (callback) {
        return this.getNeighbors(this.directions.diagonal, callback);
    }

    around (callback) {
        return this.getNeighbors(this.directions.around, callback);
    }

    getNeighbors (neighborType, callback) {
        let neighbors = [];

        _.each(neighborType, (neighbor, direction) => {
            let point = this.createPoint(neighbor);

            neighbors.push({ point: point, direction: direction });
            if (_.isFunction(callback)) {
                callback(point, direction);
            }
        });
        return neighbors;
    }

    createPoint (neighbor) {
        let x = this.referencePoint.x + neighbor.x,
            y = this.referencePoint.y + neighbor.y
        return new Point(x, y);
    }
}
