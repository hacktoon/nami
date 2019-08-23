import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { ScanlineFill8 } from '../../lib/flood-fill'

import { RiverMap } from './river'


const EMPTY_VALUE = 0
const DEFAULT_COLOR = 'darkgreen'

const OCEAN = 0
const SEA = 1
const LAKE = 2
const POND = 3
const RIVER = 5

const BEACH = 'B'
const CLIFF = 'C'
const BANK = 'K'
const SHORE = 'S'
const STREAM = 'T'

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
    { id: RIVER, color: "#29f25e",  name: "River" }
]


export class WaterbodyMap {
    constructor(size, reliefMap, moistureMap) {
        this.grid = new Grid(size, size, EMPTY_VALUE)
        this.moistureMap = moistureMap
        this.reliefMap = reliefMap
        this.littoralPoints = []
        this.riverSources = []
        this.size = size
        this.nextId = 1
        this.map = {}

        this._buildWaterbodies()
        this._buildRivers()
    }

    _buildWaterbodies() {
        this.grid.forEach((_, point) => this._detect(point))
    }

    _buildRivers() {
        //new RiverMap(this.reliefMap, this)
    }

    _detect(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let isEmpty = this.grid.get(point) == EMPTY_VALUE
            return this.reliefMap.isWater(point) && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.nextId)
            this._detectLittoral(point)
            this._detectRiverSource(point)
            tileCount++
        }

        if (isFillable(startPoint)) {
            new ScanlineFill8(this.grid, startPoint, onFill, isFillable).fill()
            this._buildWaterbody(startPoint, tileCount)
        }
    }

    _detectLittoral(point) {
        for (let [neighbor, _] of point.adjacentPoints()) {  // TODO: check with .pointsAround
            if (this.reliefMap.isLand(neighbor)) {
                this.littoralPoints.push(point)
                return
            }
        }
    }

    _detectRiverSource(point) {
        if (this.reliefMap.isMountain(point)) {
            this.riverSources.push(point)
        }
    }

    _buildWaterbody(startPoint, tileCount) {
        const type = this._getWaterbodyType(tileCount)
        const waterbody = new Waterbody(this.nextId, type, startPoint)
        this.add(waterbody)
    }

    _getWaterbodyType(tileCount) {
        const totalArea = Math.pow(this.size, 2)
        let type = POND
        for (let waterbody of WATERBODY_MIN_AREA_TABLE) {
            let tilePercentage = (100 * tileCount) / totalArea
            if (tilePercentage >= waterbody.percentage) {
                type = waterbody.id
                break
            }
        }
        return type
    }

    add(waterbody) {
        this.map[waterbody.id] = waterbody
        this.nextId++
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }

    getColor(point) {
        const waterbody = this.get(point)
        return waterbody ? waterbody.color : DEFAULT_COLOR
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
    get isRiver() { return this.type == RIVER }
}


class Ocean extends Waterbody {
    constructor(id, source) {
        super(id, OCEAN, source)
    }
}

class Sea extends Waterbody {
    constructor(id, source) {
        super(id, SEA, source)
    }
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

    get isTributary() {
        return this._isTributary
    }

    get mouth() {
        return _.last(this.points)
    }

    get length() {
        return this.points.length
    }
}
