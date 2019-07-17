import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
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
        this._buildRivers()
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

    _buildRivers() {
        const MINDISTANCE = 10
        while (this.sources.length) {
            const source = this.sources.pop()
            const mouth = this._getNearestMouth(source)
            if (mouth) {
                this._buildRiver(source, mouth)
            }
        }
    }

    _getNearestMouth(source) {
        let nearestDistance = Infinity
        let nearest = undefined
        for (let point of this.mouths) {
            let pointsDistance = Point.manhattanDistance(source, point)
            if (pointsDistance < nearestDistance) {
                nearestDistance = pointsDistance
                nearest = point
            }
        }
        return nearest
    }

    _buildRiver(source, mouth) {
        let id = this.nextId++
        //this._buildRiverPoints(source, mouth)
        this.map[id] = new River(id, source)
        this._flowRiver(id, source, mouth)
    }

    _flowRiver(id, source, mouth) {
        const reachedMouth = pt => pt.x == mouth.x && pt.y == mouth.y

        let currentPoint = source
        while (! reachedMouth(currentPoint)) {
            this._setRiverPoint(id, currentPoint)
            currentPoint = this._getNextRiverPoint(currentPoint, mouth)
            if (this._reachedWater(currentPoint))
                break
        }
        this._setRiverPoint(id, currentPoint)
    }

    _reachedWater(point) {
        let hasWaterNeighbor = false
        point.adjacentPoints(p => {
            if (this.reliefMap.get(p).isWater)
                hasWaterNeighbor = true
        })
        return hasWaterNeighbor
    }

    _setRiverPoint(id, point) {
        this.grid.set(point, id)
        this.reliefMap.get(point).debug = true
    }

    _getNextRiverPoint(origin, target) {
        let points = []
        if (origin.x != target.x) {
            let nextX = origin.x + Math.sign(target.x - origin.x)
            points.push(new Point(nextX, origin.y))
        }
        if (origin.y != target.y) {
            let nextY = origin.y + Math.sign(target.y - origin.y)
            points.push(new Point(origin.x, nextY))
        }
        return this.grid.wrap(Random.choice(points))
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
