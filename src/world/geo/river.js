import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Direction } from '../../lib/base';
import { Point } from '../../lib/point';
import { Random } from '../../lib/base';


const EMPTY_VALUE = 0

const SOURCE_CHANCE = .05
const MOUTH_CHANCE = .05


export class RiverMap {
    constructor(reliefMap, moistureMap, waterbodyMap, landmassMap) {
        this.size = reliefMap.size
        this.reliefMap = reliefMap
        this.moistureMap = moistureMap
        this.waterbodyMap = waterbodyMap
        this.landmassMap = landmassMap
        this.grid = new Grid(this.size, this.size, EMPTY_VALUE)
        this.nextId = 1
        this.sources = []
        this.mouths = []
        this.map = {}

        this._detectSources(this.reliefMap.mountainPoints)
        this._detectMouths(this.landmassMap.litoralPoints)
    }


    /* DETECTION METHODS ========================================== */

    _detectSources(points) {
        points.forEach(point => {
            if (this._isSource(point))
                this.sources.push(point)
        })
    }

    _isSource(point) {
        const chance = Random.chance(SOURCE_CHANCE)
        return chance && this._isIsolated(point)
    }

    _isIsolated(newPoint) {
        let minDistance = 20
        for (let point of this.sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= minDistance)
                return false
        }
        return true
    }

    _detectMouths(points) {
        points.forEach(point => {
            if (Random.chance(MOUTH_CHANCE))
                this.mouths.push(point)
        })
    }


    /* BUILDING METHODS ========================================== */

    buildRiver(point) {
        let id = this.nextId++
        let river = new River(id, point)
        this.map[id] = river
        this._setRiverPoint(id, point)
        this._flowRiver(id, point)
    }

    _flowRiver(id, startPoint) {
        let direction = Direction.randomCardinal()
        let meander = Random.int(10, 30)
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
        let sineVariance = Math.cos(coordinate * Random.int(10, 30))
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
        let sourcePoint = this.map[id].sourcePoint
        let tile = this.world.get(sourcePoint)
        riverPoint.aroundPoints(point => {
            let relief = this.world.get(point).relief
            if (relief.isLand)
                relief.level(tile.relief.id)
        })
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }
}


class River {
    constructor(id, sourcePoint) {
        this.id = id
        this.name = Name.createRiverName()
        this.sourcePoint = sourcePoint
    }
}
