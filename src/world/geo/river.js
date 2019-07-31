import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Point } from '../../lib/point';
import { Random } from '../../lib/base';


const EMPTY_VALUE = 0

const SOURCE_CHANCE = .5        // chance of spawning a river source
const MIN_SOURCE_ISOLATION = 10  // minimum tiles between river sources


export class RiverMap {
    constructor(reliefMap, moistureMap, waterbodyMap) {
        this.size = reliefMap.size
        this.reliefMap = reliefMap
        this.moistureMap = moistureMap
        this.waterbodyMap = waterbodyMap
        this.grid = new Grid(this.size, this.size, EMPTY_VALUE)
        this.nextId = 1
        this.sources = []
        this.mouths = {}
        this.map = {}

        this._detectSources(this.reliefMap.mountainPoints)
        //this._buildRivers()
    }


    /* DETECTION METHODS ========================================== */

    _detectSources(points) {
        points.forEach(point => {
            if (this._isSource(point) && this._isIsolated(point))
                this.sources.push(point)
        })
    }

    _isSource(point) {
        const isRiverPossible = this.moistureMap.get(point).isRiverPossible
        const chance = Random.chance(SOURCE_CHANCE)
        return chance && isRiverPossible
    }

    _isIsolated(newPoint) {
        for (let point of this.sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= MIN_SOURCE_ISOLATION)
                return false
        }
        return true
    }


    /* BUILDING METHODS ========================================== */

    _buildRivers() {
        while (this.sources.length) {
            const id = this.nextId++
            this._buildRiver(id, this.sources.pop())
        }
    }

    _buildRiver(id, source) {
        this._flowRiver(id, source)
        this.map[id] = new River(id, source)
    }

    _flowRiver(id, source) {
        let currentPoint = source
        while (! this._reachedWater(id, currentPoint)) {
            this._setRiverPoint(id, currentPoint)
            currentPoint = this._getNextPoint(currentPoint)
        }
        this._setRiverPoint(id, currentPoint)
    }

    _reachedWater(id, point) {
        let hasWaterNeighbor = false
        point.adjacentPoints(pt => {
            const neighborId = this.grid.get(pt)
            if (neighborId == id) return

            const neighborRiver = neighborId != EMPTY_VALUE
            const waterBody = this.reliefMap.get(pt).isWater
            if (waterBody || neighborRiver)
                hasWaterNeighbor = true
        })
        return hasWaterNeighbor
    }

    _getNextPoint(origin) {
        let lowestNeighbor = Point.atNorth(origin)
        origin.adjacentPoints(neighbor => {
            if (this.grid.get(neighbor) != EMPTY_VALUE) return
            const neighborHeight = this.reliefMap.get(neighbor).height
            const lowestHeight =  this.reliefMap.get(lowestNeighbor).height
            if (neighborHeight < lowestHeight)
                lowestNeighbor = neighbor
        })
        return this.grid.wrap(lowestNeighbor)
    }

    _setRiverPoint(id, point) {
        this.grid.set(point, id)
        this.reliefMap.get(point).debug = true
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }
}


class River {
    constructor(id, source) {
        this.id = id
        this.name = Name.createRiverName()
        this.source = source
    }
}


class RiverPoint {
    constructor(id, direction, strength) {
        this.id = id
        this.direction = direction
        this.strength = strength
        this.isSource = false
        this.isMouth = false
    }
}
