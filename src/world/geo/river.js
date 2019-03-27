import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { getChance, Direction } from '../../lib/base';
import { PointNeighbors, Point } from '../../lib/point';


const RIVER_CHANCE = 0.15
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
        let chance = getChance(RIVER_CHANCE)

        if(chance && isElevated && isProperPoint && isWetEnough) {
            this.buildRiver(point)
        }
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
        this.grid.set(point, id)
        this.idMap[id] = river
        this._flowRiver(id, point)
    }

    _flowRiver(id, point) {
        let direction = Direction.randomCardinal()

        this.world.get(point).river = true
        let meanderRate = _.random(5, 20)
        while(true) {
            point = this._getNextRiverPoint(id, point, meanderRate, direction)
            let isRiver = this.grid.get(point) != EMPTY_VALUE
            let isWaterbody = Boolean(this.waterbodyMap.get(point))
            if (isRiver || isWaterbody)
                break
            this._setRiverPoint(id, point)
        }
    }

    _getNextRiverPoint(id, point, meanderRate, direction) {
        let nextPoint = Point.at(point, direction)
        if (Direction.isHorizontal(direction)) {
            let variance = this._getMeanderVariance(nextPoint.x, meanderRate)
            nextPoint.y = point.y + variance
        }
        if (Direction.isVertical(direction)) {
            let variance = this._getMeanderVariance(nextPoint.y, meanderRate)
            nextPoint.x = point.x + variance
        }
        this._buildIntermediaryPoints(id, point, nextPoint)
        return nextPoint
    }

    _getMeanderVariance(coordinate, rate) {
        let sineVariance = Math.sin(coordinate * _.random(1, 10))
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

            source = point
            this._setRiverPoint(id, point)
        }
    }

    _setRiverPoint(id, point) {
        this._digMargins(point)
        this.grid.set(point, id)
        this.world.get(point).river = true
    }

    _digMargins(point) {
        let neighbors = new PointNeighbors(point)
    }
}


class River {
    constructor(id, sourcepoint) {
        this.id = id
        this.name = Name.createRiverName()
        this.sourcepoint = sourcepoint
    }
}
