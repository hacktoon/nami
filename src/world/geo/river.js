import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Point } from '../../lib/point';
import { Random } from '../../lib/base';


const EMPTY_VALUE = 0

const SOURCE_CHANCE = .05  // chance of spawning a river source
const MOUTH_CHANCE = .05  // chance of spawning a river mouth
const MIN_SOURCE_ISOLATION = 20  // minimum tiles between river sources
const MEANDER_RATE = 5  // midpoint separation
const MEANDER_VARIANCE = 2  // meandering variance


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
        for (let point of this.sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= MIN_SOURCE_ISOLATION)
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
        const usedMouthIndexes = new Set()
        while (this.sources.length) {
            const id = this.nextId++
            const source = this.sources.pop()
            const mouth = this._getNearestMouth(source, usedMouthIndexes)
            if (mouth) {
                this._buildRiver(id, source, mouth)
            }
        }
    }

    _getNearestMouth(source, usedMouthIndexes) {
        let nearestDistance = Infinity
        let nearest = undefined
        let nearestIndex = undefined
        this.mouths.forEach((point, index) => {
            if (usedMouthIndexes.has(index)) return
            const pointsDistance = Point.manhattanDistance(source, point)
            if (pointsDistance < nearestDistance ) {
                nearestDistance = pointsDistance
                nearest = point
                nearestIndex = index
            }
        })
        usedMouthIndexes.add(nearestIndex)
        return nearest
    }

    _buildRiver(id, source, mouth) {
        this._flowRiver(id, source, mouth)
        this.map[id] = new River(id, source)
    }

    _generateRiverPoints(id, source, mouth) {
        const points = [source]
        const xDelta = Math.abs(mouth.x - source.x)
        const yDelta = Math.abs(mouth.y - source.y)
        const horizontalFlow = xDelta > yDelta
        const flowAxis = horizontalFlow ? 'x' : 'y'
        const meanderAxis = horizontalFlow ? 'y' : 'x'
        const riverLength = horizontalFlow ? xDelta : yDelta
        const flowSign = Math.sign(mouth[flowAxis] - source[flowAxis])
        const displacement = Math.ceil(riverLength / MEANDER_RATE) * flowSign
        const meanderStartAxis = Math.min(source[meanderAxis], mouth[meanderAxis])
        const meanderEndAxis = Math.max(source[meanderAxis], mouth[meanderAxis])
        let currentAxis = source[flowAxis] + displacement

        const buildPoint = currentAxis => {
            const point = new Point()
            point[flowAxis] = currentAxis
            point[meanderAxis] = Random.int(
                meanderStartAxis - MEANDER_VARIANCE,
                meanderEndAxis + MEANDER_VARIANCE
            )

            //this.reliefMap.get(point).debugBlack = true
            return point
        }

        while (flowSign > 0 && currentAxis < mouth[flowAxis] ||
            flowSign < 0 && currentAxis > mouth[flowAxis]) {
            const pt = buildPoint(currentAxis)
            points.push(pt)
            currentAxis += displacement
        }
        points.push(mouth)
        return points
    }

    _flowRiver(id, source, mouth) {
        //const points = this._generateRiverPoints(id, source, mouth)
        const reachedMouth = pt => pt.x == mouth.x && pt.y == mouth.y

        let currentPoint = source
        while (true) {
            if (reachedMouth(currentPoint) || this._reachedWater(id, currentPoint))
                break
            this._setRiverPoint(id, currentPoint)
            currentPoint = this._getNextAdjacentPoint(currentPoint, mouth)
        }
        this._setRiverPoint(id, currentPoint)
    }

    _reachedWater(id, point) {
        let hasWaterNeighbor = false
        point.adjacentPoints(pt => {
            const neighborId = this.grid.get(pt)
            if (neighborId == id) return

            const neighborRiver = neighborId != EMPTY_VALUE
            const neighborWaterbody = this.reliefMap.get(pt).isWater
            if (neighborWaterbody || neighborRiver)
                hasWaterNeighbor = true
        })
        return hasWaterNeighbor
    }

    _setRiverPoint(id, point) {
        this.grid.set(point, id)
        this.reliefMap.get(point).debug = true
    }

    _getNextAdjacentPoint(origin, target) {
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


class RiverPoint {
    constructor(id, direction, strength) {
        this.id = id
        this.direction = direction
        this.strength = strength
        this.isSource = false
        this.isMouth = false
    }
}
