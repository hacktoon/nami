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
    { id: ABYSSAL,  height: 0,   color: "#000034", name: "Abyssal" },
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
        this.grid = new Grid(size, size, ABYSSAL)
        this.maskGrid = new HeightMap(size, roughness)
        this.size = size

        this._buildMap(size, roughness)
    }

    _buildMap(size, roughness) {
        new HeightMap(size, roughness, (height, point) => {
            let relief = this._convertHeightToRelief(height)
            this._setRelief(point, relief)
        })
    }

    _convertHeightToRelief(height) {
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

    _setRelief(point, relief) {
        relief = this._maskRelief(point, relief)
        this.grid.set(point, relief)
    }

    _maskRelief(point, relief) {
        const maskHeight = this.maskGrid.get(point)
        const maskRelief = this._convertHeightToRelief(maskHeight)

        if (maskRelief > PLAIN) {
            relief = _.clamp(relief, ABYSSAL, HIGHLAND)
        }
        if (maskRelief == SHALLOW) {
            relief = _.clamp(relief, ABYSSAL, PLAIN)
        }
        if (maskRelief == BASIN) {
            relief = Math.max(ABYSSAL, relief - 1)
        }
        return relief
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

    get(point) {
        return this.grid.get(point)
    }

    getName(point) {
        const id = this.get(point)
        return RELIEF_TABLE[id].name
    }

    getColor(point) {
        const id = this.get(point)
        return RELIEF_TABLE[id].color
    }
}
