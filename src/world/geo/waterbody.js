import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { ScanlineFill8 } from '../../lib/flood-fill'
import { Name } from '../../lib/name'
import { Random } from '../../lib/base';

const MIN_OCEAN_AREA_CHANCE = 8
const MIN_SEA_AREA_CHANCE = 1
const MAX_SWAMP_AREA = 4
const SWAMP_CHANCE = .3

const EMPTY_VALUE = 0

const OCEAN = 0
const SEA = 1
const LAKE = 2
const SWAMP = 3

const WATERBODY_TABLE = {
    [OCEAN]: {color: "#0c2e63", name: "Ocean"},
    [SEA]: {color: "#8bddd4", name: "Sea"},
    [LAKE]: {color: "#29f25e", name: "Lake"},
    [SWAMP]: { color: "#916f8a", name: "Swamp"},
}


export class WaterbodyMap {
    constructor(size, reliefMap, moistureMap) {
        this.grid = new Grid(size, size, EMPTY_VALUE)
        this.moistureMap = moistureMap
        this.reliefMap = reliefMap
        this.riverSources = []
        this.size = size
        this.nextId = 1
        this.map = {}

        this._detectWaterbodies()
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
            tileCount++
        }

        if (isFillable(startPoint)) {
            new ScanlineFill8(this.grid, startPoint, onFill, isFillable).fill()
            this._buildWaterbody(this.nextId++, startPoint, tileCount)
        }
    }

    _buildWaterbody(id, point, tileCount) {
        if (tileCount == 0) return

        let type = LAKE
        if (this._isSwampArea(tileCount)) {
            type = SWAMP
        } else if (this._isOceanArea(tileCount)) {
            type = OCEAN
        } else if (this._isSeaArea(tileCount)) {
            type = SEA
        }
        this.map[id] = new Waterbody(id, type, point, tileCount)
    }

    _isOceanArea(tileCount) {
        let totalTiles = Math.pow(this.size, 2)
        let tilePercentage = (100 * tileCount) / totalTiles
        return tilePercentage >= MIN_OCEAN_AREA_CHANCE
    }

    _isSeaArea(tileCount) {
        let totalTiles = Math.pow(this.size, 2)
        let tilePercentage = (100 * tileCount) / totalTiles
        let withinPercentage = tilePercentage >= MIN_SEA_AREA_CHANCE
        return !this._isOceanArea(tileCount) && withinPercentage
    }

    _isSwampArea(tileCount) {
        return tileCount <= MAX_SWAMP_AREA && Random.chance(SWAMP_CHANCE)
    }

    get(point) {
        let id = this.grid.get(point)
        return this.map[id]
    }
}


class Waterbody {
    constructor(id, type, point, area) {
        this.id = id
        this.type = type
        this._name = Name.createWaterbodyName()
        this.point = point
        this.area = area
    }

    get name() {
        const type_name = WATERBODY_TABLE[this.type].name
        return `${this._name} ${type_name}`
    }
    get color() { return WATERBODY_TABLE[this.type].color }
    get isOcean() { return this.type == OCEAN }
    get isSea() { return this.type == SEA }
    get isLake() { return this.type == LAKE }
    get isSwamp() { return this.type == SWAMP }
}
