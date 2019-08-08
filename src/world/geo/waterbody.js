import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { Point } from '../../lib/point'
import { Random } from '../../lib/base'
import { ScanlineFill8, FloodFill } from '../../lib/flood-fill'
import { MidpointDisplacement } from '../../lib/heightmap'


const EMPTY_VALUE = 0
const SWAMP_CHANCE = .3

const SOURCE_CHANCE = .2                // chance of spawning a river source
const SOURCE_ISOLATION = 15             // minimum tiles between river sources
const MEANDER_RATE = .4                 // how much the river will meander
const EROSION_START = 3                 // at which tile erosion will start
const RIVER_BANK_SPREAD = [2, 3, 4, 5]  // how much the river deposits sediment

const OCEAN = 0
const SEA = 1
const LAKE = 2
const POND = 3
const SWAMP = 4
const RIVER = 5

const WATERBODY_MIN_AREA_TABLE = [
    { id: OCEAN, percentage: 8 },
    { id: SEA,   percentage: 1 },
    { id: LAKE,  percentage: 0.016 },
    { id: POND,  percentage: 0 }
]

const WATERBODY_TABLE = [
    { id: OCEAN, color: "#0c2e63",  name: "Ocean" },
    { id: SEA,   color: "#8bddd4",  name: "Sea" },
    { id: LAKE,  color: "#29f25e",  name: "Lake" },
    { id: POND,  color: "#29f25e",  name: "Pond" },
    { id: SWAMP, color: "#a3358c",  name: "Swamp" },
    { id: RIVER, color: "#29f25e",  name: "River" }
]


export class WaterbodyMap {
    constructor(reliefMap, moistureMap) {
        this.size = reliefMap.size
        this.grid = new Grid(this.size, this.size, EMPTY_VALUE)
        this.totalArea = Math.pow(this.size, 2)
        this.moistureMap = moistureMap
        this.reliefMap = reliefMap
        this.littoralPoints = []
        this.nextId = 1
        this.map = {}

        this._build()
    }

    _build() {
        this._detectWaterbodies()
        new RiverBuilder(this.reliefMap, this.moistureMap, this)
    }

    _detectWaterbodies() {
        this.reliefMap.waterPoints.forEach(point => this._detect(point))
    }

    _detect(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let relief = this.reliefMap.get(point)
            let isEmpty = this.grid.get(point) == EMPTY_VALUE
            return relief.isWater && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.nextId)
            detectLittoral(point)
            tileCount++
        }
        const detectLittoral = point => {
            for (let [neighbor, _] of point.adjacentPoints()) {
                if (this.reliefMap.get(neighbor).isLand) {
                    this.littoralPoints.push(point)
                    return
                }
            }
        }

        if (isFillable(startPoint)) {
            new ScanlineFill8(this.grid, startPoint, onFill, isFillable).fill()
            this._buildWaterbody(startPoint, tileCount)
        }
    }

    _buildWaterbody(startPoint, tileCount) {
        let type = POND
        for (let waterbody of WATERBODY_MIN_AREA_TABLE) {
            let tilePercentage = (100 * tileCount) / this.totalArea
            if (tilePercentage >= waterbody.percentage) {
                type = waterbody.id
                break
            }
        }
        if (type == POND && Random.chance(SWAMP_CHANCE)) {
            type = SWAMP
        }
        const waterbody = new Waterbody(this.nextId, type, startPoint)
        this.add(waterbody)
    }

    add(waterbody) {
        this.map[waterbody.id] = waterbody
        this.nextId++
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }
}


class RiverBuilder {
    constructor(reliefMap, moistureMap, waterbodyMap) {
        this.size = reliefMap.size
        this.reliefMap = reliefMap
        this.moistureMap = moistureMap
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
            this.reliefMap.get(point).setRiverMargin(reliefLevel)
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
                if (this.reliefMap.get(neighbor).isWater) {
                    relief.setRiverBank()
                    break
                }
            }
        }
        const spread = Random.choice(RIVER_BANK_SPREAD)
        new FloodFill(this.grid, river.mouth, onFill).stepFill(spread)
    }

    _digRiver(river) {
        for (let point of river.points) {
            this.reliefMap.get(point).setRiver()
        }
    }
}


class Waterbody {
    constructor(id, type, point) {
        this.id = id
        this.type = type
        this._name = Name.createWaterbodyName()
        this.point = point
    }

    get name() {
        const type_name = WATERBODY_TABLE[this.type].name
        return `${this._name} ${type_name}`
    }
    get color() { return WATERBODY_TABLE[this.type].color }
    get isOcean() { return this.type == OCEAN }
    get isSea() { return this.type == SEA }
    get isLake() { return this.type == LAKE }
    get isPond() { return this.type == POND }
    get isSwamp() { return this.type == SWAMP }
    get isRiver() { return this.type == RIVER }
}


class River extends Waterbody {
    constructor(id, source) {
        super(id, RIVER, source)
        this.id = id
        this._name = Name.createRiverName()
        this.source = source
        this.points = []
        this._isTributary = false
    }

    add(point) {
        this.points.push(point)
    }

    setTributary() {
        this._isTributary = true
    }

    get mouth() {
        return _.last(this.points)
    }

    get isTributary() {
        return this._isTributary
    }

    get length() {
        return this.points.length
    }
}
