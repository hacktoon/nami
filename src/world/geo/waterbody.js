import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { ScanlineFill8 } from '../../lib/flood-fill'
import { Name } from '../../lib/name'
import { Random } from '../../lib/base';


const EMPTY_VALUE = 0
const SWAMP_CHANCE = .3

const OCEAN = 0
const SEA = 1
const LAKE = 2
const POND = 3
const SWAMP = 4
const RIVER = 5


const WATERBODY_AREA_TABLE = [
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
    constructor(reliefMap) {
        this.size = reliefMap.size
        this.grid = new Grid(this.size, this.size, EMPTY_VALUE)
        this.reliefMap = reliefMap
        this.totalArea = Math.pow(this.size, 2)
        this.riverSources = []
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

    _buildWaterbody(id, startPoint, tileCount) {
        let type = POND
        for (let waterbody of WATERBODY_AREA_TABLE) {
            let tilePercentage = (100 * tileCount) / this.totalArea
            if (tilePercentage >= waterbody.percentage) {
                type = waterbody.id
                break
            }
        }
        if (type == POND && Random.chance(SWAMP_CHANCE)) {
            type = SWAMP
        }
        const waterbody = new Waterbody(id, type, startPoint, tileCount)
        this.map[id] = waterbody
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
    get isPond() { return this.type == POND }
    get isSwamp() { return this.type == SWAMP }
    get isRiver() { return this.type == RIVER }
}
