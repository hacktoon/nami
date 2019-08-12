import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'


export const ABYSSAL = 0
export const DEEP = 1
export const SHELF = 2
export const REEF = 3
export const SHALLOW = 4
export const BASIN = 5
export const PLAIN = 6
export const HIGHLAND = 7
export const MOUNTAIN = 8

export const RELIEF_TABLE = [
    { id: ABYSSAL,  height: 0,   color: "#000034", name: "Abyss" },
    { id: DEEP,     height: 20,  color: "#000045", name: "Deep" },
    { id: SHELF,    height: 115, color: "#000078", name: "Shelf" },
    { id: REEF,     height: 152, color: "#007587", name: "Reef" },
    { id: SHALLOW,  height: 153, color: "#000078", name: "Shallow" },
    { id: BASIN,    height: 175, color: "#0a5816", name: "Basin" },
    { id: PLAIN,    height: 198, color: "#31771a", name: "Plain" },
    { id: HIGHLAND, height: 235, color: "#6f942b", name: "Highland" },
    { id: MOUNTAIN, height: 255, color: "#AAAAAA", name: "Mountain" }
]


export class ReliefMap {
    constructor(size, roughness) {
        this.mask = new HeightMap(size, roughness)
        this.grid = new Grid(size, size)
        this.size = size
        this.landPoints = []
        this.waterPoints = []
        this.mountainPoints = []

        this._buildMap(size, roughness)
    }

    _buildMap(size, roughness) {
        new HeightMap(size, roughness, (height, point) => {
            let relief = this._buildRelief(height, point)
            this.grid.set(point, relief)
            if (relief.isWater) {
                this.waterPoints.push(point)
            } else {
                this.landPoints.push(point)
                if (relief.isMountain) {
                    this.mountainPoints.push(point)
                }
            }
        })
    }

    _buildRelief(height, point) {
        let relief = new Relief(height)
        let maskRelief = this._getMaskRelief(point)
        return this._filterRelief(relief, maskRelief)
    }

    _getMaskRelief(point) {
        let height = this.mask.get(point)
        return new Relief(height)
    }

    _filterRelief(relief, maskRelief) {
        if (maskRelief.id > PLAIN) {
            relief.level(HIGHLAND)
        }
        if (maskRelief.isShallow) {
            relief.level(PLAIN)
        }
        if (maskRelief.isBasin) {
            relief.lower()
        }
        return relief
    }

    get(point) {
        return this.grid.get(point)
    }

    isAbyss(pt) { return this.get(pt) == ABYSSAL }
    isDeep(pt) { return this.get(pt) == DEEP }
    isReef(pt) { return this.get(pt) == REEF }
    isShallow(pt) { return this.get(pt) == SHALLOW || this.get(pt) == SHELF }
    isBasin(pt) { return this.get(pt) == BASIN }
    isPlain(pt) { return this.get(pt) == PLAIN }
    isHighland(pt) { return this.get(pt) == HIGHLAND }
    isMountain(pt) { return this.get(pt) == MOUNTAIN }

    isWater(pt) { return this.get(pt) <= SHALLOW }
    isLand(pt) { return !this.isWater(pt) }
}


class Relief {
    constructor(height) {
        let id = this._constructorId(height)
        this.data = RELIEF_TABLE[id]
        this._isRiverBank = false
    }

    _constructorId(height) {
        let id = ABYSSAL
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
    get isWater() { return this.data.id <= SHALLOW }
    get isLand() { return !this.isWater }

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

    setRiverBank() {
        if (this.isBasin)
            this._isRiverBank = true
    }

    setRiver() {
        this.level(SHALLOW)
    }

    setRiverMargin(level) {
        let levelId = _.clamp(level.id, BASIN, PLAIN)
        this.level(levelId)
    }

    get isAbyss() { return this.data.id == ABYSSAL }
    get isDeep() { return this.data.id == DEEP }
    get isReef() { return this.data.id == REEF }
    get isShallow() { return this.data.id == SHALLOW || this.data.id == SHELF }
    get isBasin() { return this.data.id == BASIN }
    get isRiverBank() { return this._isRiverBank }
    get isPlain() { return this.data.id == PLAIN }
    get isHighland() { return this.data.id == HIGHLAND }
    get isMountain() { return this.data.id == MOUNTAIN }
}
