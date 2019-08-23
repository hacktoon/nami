
import { Point } from '../../lib/point'
import { MidpointDisplacement } from '../../lib/heightmap'
import { FloodFill } from '../../lib/flood-fill'


const SOURCE_CHANCE = .2                // chance of spawning a river source
const SOURCE_ISOLATION = 15             // minimum tiles between river sources
const MEANDER_RATE = .4                 // how much the river will meander
const EROSION_START = 3                 // at which tile erosion will start
const RIVER_BANK_SPREAD = [2, 3, 4, 5]  // how much the river deposits sediment


class RiverBuilder {
    constructor(reliefMap, waterbodyMap) {
        this.size = reliefMap.size
        this.reliefMap = reliefMap
        this.waterbodyMap = waterbodyMap
        this.grid = waterbodyMap.grid

        this._buildRivers()
    }

    _buildRivers() {
        let sources = this._detectSources(this.reliefMap.mountainPoints)
        while (sources.length) {
            const id = this.waterbodyMap.nextId
            const source = sources.pop()
            const target = this._getNearestRiverTarget(source)
            let river = this._buildRiver(id, source, target)
            if (river)
                this.waterbodyMap.add(river)
        }
    }

    _detectSources(points) {
        let sources = []
        points.forEach(point => {
            if (this._isSource(point) && this._isIsolated(point, sources))
                sources.push(point)
        })
        return sources
    }

    _isSource(point) {
        return Random.chance(SOURCE_CHANCE)
    }

    _isIsolated(newPoint, sources) {
        for (let point of sources) {
            let pointsDistance = Point.manhattanDistance(newPoint, point)
            if (pointsDistance <= SOURCE_ISOLATION)
                return false
        }
        return true
    }

    _getNearestRiverTarget(source) {
        let nearestDistance = Infinity
        let nearestPoint = undefined
        _.each(this.waterbodyMap.littoralPoints, point => {
            let waterbody = this.waterbodyMap.get(point)
            if (! (waterbody.isOcean || waterbody.isSea))
                return
            const pointsDistance = Point.euclidianDistance(source, point)
            if (pointsDistance < nearestDistance) {
                nearestDistance = pointsDistance
                nearestPoint = point
            }
        })
        return nearestPoint
    }

    _buildRiver(id, source, target) {
        const river = new River(id, source)
        const midpoints = MidpointDisplacement(river.source, target, MEANDER_RATE)
        this._buildPath(river, midpoints)
        if (river.length >= 1) {
            this._digRiver(river)
            this._detectRiverbanks(river)
            return river
        }
    }

    _buildPath(river, points) {
        let index = 0
        let currentPoint = points[index]
        let currentRelief = this.reliefMap.get(currentPoint)

        this._addPoint(river, currentPoint)
        while (!this._flowShouldStop(river, currentPoint)) {
            index += currentPoint.equals(points[index]) ? 1 : 0
            if (index >= points.length)
                break
            currentPoint = this._getNextPoint(currentPoint, points[index])
            let relief = this.reliefMap.get(currentPoint)
            if (relief.id < currentRelief.id)
                currentRelief = relief
            this._addPoint(river, currentPoint, currentRelief)
        }
    }

    _flowShouldStop(river, currentPoint) {
        let flag = false

        currentPoint.adjacentPoints(neighbor => {
            const notItself = this.grid.get(neighbor) != river.id
            if (notItself && this._reachedWater(river, neighbor)) {
                flag = true
            }
        })
        return flag
    }

    _reachedWater(river, point) {
        const waterbody = this.waterbodyMap.get(point)
        if (!waterbody)
            return false
        if (waterbody.isRiver) {
            river.setTributary()
            return true
        }
        return waterbody.isOcean || waterbody.isSea
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
        return Random.choice(points)
    }

    _addPoint(river, point, currentRelief) {
        if (this.grid.get(point) != EMPTY_VALUE)
            return
        river.add(point)
        this.grid.set(point, river.id)
        this._erode(river, point, currentRelief)
    }

    _erode(river, riverPoint, reliefLevel) {
        if (river.length < EROSION_START)
            return
        riverPoint.pointsAround(point => {
            //this.reliefMap.get(point).setRiverMargin(reliefLevel)  FIXME
        })
    }

    _detectRiverbanks(river) {
        if (river.isTributary)
            return
        const onFill = point => {
            const relief = this.reliefMap.get(point)
            if (relief.isWater)
                return
            for (let [neighbor, _] of point.adjacentPoints()) {
                // FIXME
                // if (this.reliefMap.get(neighbor).isWater) {
                //     relief.setRiverBank()
                //     break
                // }
            }
        }
        const spread = Random.choice(RIVER_BANK_SPREAD)
        new FloodFill(this.grid, river.mouth, onFill).stepFill(spread)
    }

    _digRiver(river) {
        // FIXME
        // for (let point of river.points) {
        //     this.reliefMap.get(point).setRiver()
        // }
    }
}