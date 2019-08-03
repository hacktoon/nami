import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Point } from '../../lib/point'
import { Random } from '../../lib/base'
import { MidpointDisplacement } from '../../lib/heightmap';


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
        const midpoints = MidpointDisplacement(river.source, river.mouth, MEANDER_RATE)
        this._buildPath(river, midpoints)
        this._digRiver(river)
        return river
    }

    _buildPath(river, points) {
        let index = 0
        let currentPoint = points[index]
        let currentRelief = this.reliefMap.get(currentPoint)

        this._setRiverPoint(river, currentPoint)
        while (!this._flowShouldStop(river, currentPoint)) {
            index += currentPoint.equals(points[index]) ? 1 : 0
            if (index >= points.length)
                break
            currentPoint = this._getNextPoint(currentPoint, points[index])
            let relief = this.reliefMap.get(currentPoint)
            if (relief.id < currentRelief.id)
                currentRelief = relief
            this._erode(river, currentPoint, currentRelief)
            this._setRiverPoint(river, currentPoint)
        }
        river.mouth = currentPoint
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
    }

    _erode(river, point, reliefLevel) {
        if (river.length < EROSION_START)
            return
        point.pointsAround(pt => {
            this.reliefMap.get(pt).erodeByRiver(reliefLevel)
        })
    }

    _digRiver(river) {
        for (let point of river.points) {
            this.reliefMap.get(point).setRiver()
        }
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
