import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Point } from '../../lib/point'
import { Random } from '../../lib/base'
import { Recoverable } from 'repl';


const EMPTY_VALUE = 0
const SOURCE_CHANCE = .2     // chance of spawning a river source
const SOURCE_ISOLATION = 15  // minimum tiles between river sources
const MEANDER_RATE = .3      // how much the river will meander
const EROSION_START = 3      // at which tile erosion will start


export class RiverMap {
    constructor(reliefMap, moistureMap, waterbodyMap, landmassMap) {
        this.size = reliefMap.size
        this.reliefMap = reliefMap
        this.moistureMap = moistureMap
        this.waterbodyMap = waterbodyMap
        this.landmassMap = landmassMap
        this.grid = new Grid(this.size, this.size, EMPTY_VALUE)
        this.map = {}

        this._buildRivers()
    }


    /* DETECTION METHODS ========================================== */

    _detectSources(points) {
        let sources = []
        points.forEach(point => {
            if (this._isSource(point) && this._isIsolated(point, sources))
                sources.push(point)
        })
        return sources
    }

    _isSource(point) {
        const isRiverPossible = this.moistureMap.get(point).isRiverPossible
        const chance = Random.chance(SOURCE_CHANCE)
        return chance && isRiverPossible
    }

    _isIsolated(newPoint, sources) {
        for (let point of sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= SOURCE_ISOLATION)
                return false
        }
        return true
    }

    _getNearestMouth(source) {
        let nearestDistance = Infinity
        let nearestPoint = undefined
        _.each(this.landmassMap.litoralPoints, point => {
            const pointsDistance = Point.euclidianDistance(source, point)
            if (pointsDistance < nearestDistance) {
                nearestDistance = pointsDistance
                nearestPoint = point
            }
        })
        return nearestPoint
    }


    /* BUILDING METHODS ========================================== */

    _buildRivers() {
        let nextId = 1
        let sources = this._detectSources(this.reliefMap.mountainPoints)
        while (sources.length) {
            const id = nextId++
            const source = sources.pop()
            const mouth = this._getNearestMouth(source)
            this.map[id] = this._buildRiver(id, source, mouth)
        }
    }

    _buildRiver(id, source, mouth) {
        const river = new River(id, source, mouth)
        this._flowRiver(river)
        this._drawRiver(river)
        return river
    }

    _flowRiver(river) {
        let points = this._generateMidpoints(river.source, river.mouth)
        let index = 0
        let currentPoint = points[index]

        this._setRiverPoint(river, currentPoint)
        while (!this._flowShouldStop(river, currentPoint)) {
            if (currentPoint.equals(points[index]))
                index++
            if (index >= points.length)
                break
            currentPoint = this._getNextPoint(currentPoint, points[index])
            this._setRiverPoint(river, currentPoint)
        }
        river.mouth = currentPoint
    }

    _generateMidpoints(source, target) {
        const deltaX = Math.abs(source.x - target.x)
        const deltaY = Math.abs(source.y - target.y)
        const fixedAxis = deltaX > deltaY ? 'x' : 'y'
        const displacedAxis = deltaX > deltaY ? 'y' : 'x'
        const size = Math.abs(target[fixedAxis] - source[fixedAxis])
        let points = []
        let displacement = MEANDER_RATE * (size / 2)

        let buildPoint = (p1, p2) => {
            if (Math.abs(p2[fixedAxis] - p1[fixedAxis]) <= 2)
                return
            let fixedValue = Math.floor((p1[fixedAxis] + p2[fixedAxis]) / 2),
                displacedValue = (p1[displacedAxis] + p2[displacedAxis]) / 2,
                variance = Random.int(-displacement, displacement)

            const point = new Point()
            point[fixedAxis] = fixedValue
            point[displacedAxis] = Math.floor(displacedValue + variance)
            return point
        }

        const midpoints = (p1, p2, size) => {
            let points = []
            let point = buildPoint(p1, p2)
            if (!point)
                return points
            displacement = MEANDER_RATE * size
            points = points.concat(midpoints(p1, point, size / 2))
            points.push(point)
            points = points.concat(midpoints(point, p2, size / 2))
            return points
        }

        points.push(source)
        points = points.concat(midpoints(source, target, size / 2))
        points.push(target)
        return points
    }

    _flowShouldStop(river, currentPoint) {
        let flag = false

        currentPoint.adjacentPoints(neighbor => {
            const neighborId = this.grid.get(neighbor)
            if (neighborId == river.id)
                return
            if (this._reachedWater(neighbor) || neighborId != EMPTY_VALUE)
                flag = true
        })
        return flag
    }

    _reachedWater(point) {
        const waterbody = this.waterbodyMap.get(point)
        return waterbody ? waterbody.isOcean || waterbody.isSea : false
    }

    _getNextPoint(origin, target) {
        const points = []
        if (origin.x != target.x) {
            const nextX = origin.x + Math.sign(target.x - origin.x)
            points.push(new Point(nextX, origin.y))
        }
        if (origin.y != target.y) {
            const nextY = origin.y + Math.sign(target.y - origin.y)
            points.push(new Point(origin.x, nextY))
        }
        const validPoints = _.filter(points, p => this.grid.get(p) == EMPTY_VALUE)
        return Random.choice(validPoints)
    }

    _setRiverPoint(river, point) {
        river.add(point)
        this.grid.set(point, river.id)
        if (river.length > EROSION_START) {
            this._erode(point)
        }
    }

    _erode(point) {
        point.adjacentPoints(pt => {
            this.reliefMap.get(pt).erodeByRiver()
        })
    }

    _drawRiver(river) {
        for (let point of river.points) {
            this.reliefMap.get(point).debug = true
        }
        // const first = _.first(river.points)
        // const last = _.last(river.points)
        // this.reliefMap.get(first).debugSource = true
        // this.reliefMap.get(last).debugMouth = true
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }
}


class River {
    constructor(id, source, mouth) {
        this.id = id
        this.name = Name.createRiverName()
        this.source = source
        this.mouth = mouth
        this.points = []
    }

    add(point) {
        this.points.push(point)
    }

    get length() {
        return this.points.length
    }
}
