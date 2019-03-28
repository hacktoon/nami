import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { getChance, Direction } from '../../lib/base';
import { PointNeighbors, Point } from '../../lib/point';


const RIVER_CHANCE = 0.2
const EMPTY_VALUE = 0


export class RiverMap {
    constructor(world, waterbodyMap) {
        this.nextId = 1
        this.world = world
        this.waterbodyMap = waterbodyMap
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.sources = []
        this.idMap = {}
    }

    get(point) {
        let id = this.grid.get(point)
        return this.idMap[id]
    }

    detect(point) {
        let tile = this.world.get(point)
        let isProperPoint = this._isValidNeighborhood(point)
        let isElevated = tile.elevation.isRiverPossible
        let isWetEnough = tile.moisture.isRiverPossible
        let chance = this._isIsolated(point)

        if(chance && isElevated && isProperPoint && isWetEnough) {
            this.buildRiver(point)
        }
    }

    _isIsolated(newPoint) {
        let minDistance = 30
        for(let point of this.sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= minDistance) {
                return false
            }
        }
        return true
    }

    _isValidNeighborhood(refPoint) {
        let neighbors = new PointNeighbors(refPoint)
        let mountains = 0
        let isolated = true
        neighbors.adjacent(point => {
            let tile = this.world.get(point)
            if (this.grid.get(point) != EMPTY_VALUE) {
                isolated = false
            }
            if (tile.elevation.isHighest) {
                mountains++
            }
        })
        return isolated && (mountains == 2 || mountains == 3)
    }

    buildRiver(point) {
        let id = this.nextId++
        let river = new River(id, point)
        this.sources.push(point)
        this.idMap[id] = river
        this._setRiverPoint(id, point)
        this._flowRiver(id, point)
    }

    _flowRiver(id, startPoint) {
        let direction = Direction.randomCardinal()
        let meander = _.random(10, 30)
        this.world.get(startPoint).source = true
        while(true) {
            let nextPoint = this._getNextPoint(id, startPoint, meander, direction)
            if (this._isInvalidPoint(nextPoint))
                break
            this._setRiverPoint(id, nextPoint)
            startPoint = nextPoint
        }
    }

    _getRiverDirection(point) {
        while(true) {

        }
    }

    _isInvalidPoint(point) {
        let isAnotherRiver = this.grid.get(point) != EMPTY_VALUE
        let isWaterbody = Boolean(this.waterbodyMap.get(point))
        return isAnotherRiver || isWaterbody
    }

    _getNextPoint(id, point, meander, direction) {
        let nextPoint = Point.at(point, direction)
        if (Direction.isHorizontal(direction)) {
            let variance = this._getMeanderVariance(nextPoint.x, meander)
            nextPoint.y = point.y + variance
        }
        if (Direction.isVertical(direction)) {
            let variance = this._getMeanderVariance(nextPoint.y, meander)
            nextPoint.x = point.x + variance
        }
        this._buildIntermediaryPoints(id, point, nextPoint)
        return nextPoint
    }

    _getMeanderVariance(coordinate, rate) {
        let sineVariance = Math.cos(coordinate * _.random(10, 30))
        let variance = Math.sin(coordinate / rate) + sineVariance
        return Math.round(variance)
    }

    _buildIntermediaryPoints(id, source, target) {
        while (! source.isNeighbor(target)) {
            let point

            if (source.x < target.x) point = Point.atEast(source)
            if (source.x > target.x) point = Point.atWest(source)
            if (source.y < target.y) point = Point.atSouth(source)
            if (source.y > target.y) point = Point.atNorth(source)

            if (this._isInvalidPoint(point))
                break

            source = point
            this._setRiverPoint(id, point)
        }
    }

    _setRiverPoint(id, point) {
        this.grid.set(point, id)
        this.world.get(point).river = true
        //this._digMargins(id, point)
    }

    _digMargins(id, riverPoint) {
        let sourcePoint = this.idMap[id].sourcePoint
        let tile = this.world.get(sourcePoint)
        new PointNeighbors(riverPoint).around(point => {
            let elevation = this.world.get(point).elevation
            if (elevation.isAboveSeaLevel)
                elevation.level(tile.elevation.id)
        })
    }
}


class River {
    constructor(id, sourcePoint) {
        this.id = id
        this.name = Name.createRiverName()
        this.sourcePoint = sourcePoint
    }
}
