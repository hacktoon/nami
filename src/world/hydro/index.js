import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { Name } from '../../lib/name'
import { ScanlineFill8 } from '../../lib/flood-fill'

import { RiverMap } from './river'


const EMPTY = 0
const DEFAULT_COLOR = 'darkgreen'

const OCEAN = 0
const SEA = 1
const LAKE = 2
const POND = 3
const RIVER = 4

const RAPIDS = 'R'
const WATERFALL = 'W'
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

        // TODO: detect litorals on grid creation

        this.grid = new Grid(size, size, point => new WaterPoint(point))
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
            let isEmpty = this.grid.get(point) == EMPTY
            return this.reliefMap.isWater(point) && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.nextId)
            this._detectLittoral(point)
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

    getName(point) {
        const waterbody = this.get(point)
        const type_name = WATERBODY_TABLE[waterbody.type].name
        return `${waterbody.name} ${type_name}`
    }
    isOcean(point) { return this.get(point).type == OCEAN }
    isSea(point) { return this.get(point).type == SEA }
    isLake(point) { return this.get(point).type == LAKE }
    isPond(point) { return this.get(point).type == POND }
    isRiver(point) { return this.get(point).type == RIVER }
}


class WaterPoint {
    constructor(id=EMPTY, type=undefined) {
        this.id = id
        this.type = type
    }
}


class Waterbody {
    constructor(id, type) {
        this.id = id
        this.type = type
        this.name = Name.createWaterbodyName()
    }
}
