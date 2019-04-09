import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'

const TRENCH = 0
const DEEP = 1
const SHELF = 2
const REEF = 3
const SHORE = 4
const BEACH = 5
const BASIN = 6
const PLAIN = 7
const HIGHLAND = 8
const MOUNTAIN = 9
const PEAK = 10

const RELIEF_TABLE = [
    { id: TRENCH, height: 0, color: "#000034", name: "Trench"},
    { id: DEEP, height: 1, color: "#000045",  name: "Deep"},
    { id: SHELF, height: 120, color: "#000078", name: "Shelf"},
    { id: REEF, height: 151, color: "#007587", name: "Reef"},
    { id: SHORE, height: 153, color: "#000078", name: "Shore" },
    { id: BEACH, height: 170, color: "#adb734", name: "Beach" },
    { id: BASIN, height: 173, color: "#0a5816", name: "Basin" },
    { id: PLAIN, height: 195, color: "#31771a", name: "Plain" },
    { id: HIGHLAND, height: 235, color: "#6f942b", name: "Highland" },
    { id: MOUNTAIN, height: 254,  color: "#AAA", name: "Mountain" },
    { id: PEAK, height: 257,  color: "#DDDDDD", name: "Peak" }
]


export class ReliefMap {
    constructor(size, roughness) {
        this.size = size
        this.mask = new HeightMap(size, roughness)
        this.grid = new Grid(size, size)

        new HeightMap(size, roughness, (height, point) => {
            let relief = this.buildRelief(point, height)
            this.grid.set(point, relief)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    buildRelief(point, height) {
        let relief = new Relief(height)
        let maskRelief = this.getMaskRelief(point)

        return this.filterRelief(relief, maskRelief)
    }

    getMaskRelief(point) {
        let height = this.mask.get(point)
        return new Relief(height)
    }

    filterRelief(relief, maskRelief) {
        // remove mountains
        if (maskRelief.id > PLAIN) {
            relief.level(HIGHLAND)
        }
        if (maskRelief.id > DEEP && relief.isPeak) {
            relief.lower()
        }
        if (maskRelief.isShelf) {
            relief.level(PLAIN)
        }
        if (maskRelief.isBasin && !relief.isBasin && !relief.isBeach && !relief.isReef) {
            relief.lower()
        }

        return relief
    }
}


class Relief {
    constructor(height) {
        let id = this._constructorId(height)
        this.data = RELIEF_TABLE[id]
        this.height = height
    }

    _constructorId(height) {
        let id = TRENCH
        for (let reliefData of RELIEF_TABLE) {
            if (height >= reliefData.height) {
                id = reliefData.id
            } else {
                break
            }
        }
        return id
    }

    get id() { return this.data.id }
    get color() { return this.data.color }
    get name() { return this.data.name }
    get isWater() { return this.data.id <= SHORE }
    get isLand() { return !this.isWater }
    get isMiddle() {
        let middle = Math.floor(RELIEF_TABLE.length / 2)
        return this.data.id == middle
    }

    raise(amount = 1) {
        let newId = this.data.id + amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        this.data = RELIEF_TABLE[id]
    }

    lower(amount = 1) {
        let newId = this.data.id - amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        this.data = RELIEF_TABLE[id]
    }

    level(newId) {
        let oldId = this.data.id
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        if (oldId > id) {
            this.data = RELIEF_TABLE[id]
        }
    }

    get isTrench() { return this.data.id == TRENCH }
    get isDeep() { return this.data.id == DEEP }
    get isReef() { return this.data.id == REEF }
    get isShelf() { return this.data.id == SHORE || this.data.id == SHELF }
    get isBeach() { return this.data.id == BEACH }
    get isBasin() { return this.data.id == BASIN }
    get isPlatform() { return this.data.id == PLAIN }
    get isHighland() { return this.data.id == HIGHLAND }
    get isMountain() { return this.data.id == MOUNTAIN }
    get isPeak() { return this.data.id == PEAK }

    get isRiverPossible() { return this.isHighland }
}
