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
        this.grid.set(point, id)
        this.idMap[id] = river
        this._flowRiver(id, point)
    }

    _flowRiver(id, point) {
        let direction = Direction.randomCardinal()

        this.world.get(point).river = true
        let meanderRate = _.random(5, 20)
        while(true) {
            point = this._getNextRiverPoint(point, meanderRate, direction)
            let waterbody = this.waterbodyMap.get(point)
            let isRiver = this.grid.get(point) != EMPTY_VALUE
            if (isRiver || (waterbody && waterbody.isOcean))
                break
            this.grid.set(point, id)
            this.world.get(point).river = true
        }
    }

    _getNextRiverPoint(point, meanderRate, direction) {
        let nextPoint = Point.at(point, direction)
        let x, y
        if (Direction.isHorizontal(direction)) {
            x = nextPoint.x
            let variance = this._getMeanderVariance(x, meanderRate)
            y = point.y + Math.round(variance)
        }
        if (Direction.isVertical(direction)) {
            y = nextPoint.y
            let variance = this._getMeanderVariance(y, meanderRate)
            x = point.x + Math.round(variance)
        }
        return new Point(x, y)
    }

    _getMeanderVariance(coordinate, rate) {
        return Math.sin(coordinate / rate)
               + Math.sin(coordinate * _.random(1, 10))
    }
}


class River {
    constructor(id, sourcepoint) {
        this.id = id
        this.name = Name.createRiverName()
        this.sourcepoint = sourcepoint
    }
}
