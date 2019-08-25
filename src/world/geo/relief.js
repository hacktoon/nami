import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Point } from '../../lib/point';


export const ABYSSAL = 0
export const DEEP = 1
export const SHELF = 2
export const REEF = 3
export const SHALLOW = 4
export const BASIN = 5
export const PLAIN = 6
export const HIGHLAND = 7
export const HILL = 8
export const MOUNTAIN = 9

const CODE_TABLE = [
    { mapTo: ABYSSAL,  minHeight:   0 },
    { mapTo: DEEP,     minHeight:  20 },
    { mapTo: SHELF,    minHeight: 115 },
    { mapTo: REEF,     minHeight: 152 },
    { mapTo: SHALLOW,  minHeight: 153 },
    { mapTo: BASIN,    minHeight: 175 },
    { mapTo: PLAIN,    minHeight: 198 },
    { mapTo: HIGHLAND, minHeight: 235 },
    { mapTo: HILL,     minHeight: 255 },
    { mapTo: MOUNTAIN, minHeight: 257 }
]

const buildCodeMap = function(table) {
    const map = {}
    const isLast = index => index == table.length - 1
    for (let [index, code] of table.entries()) {
        if (isLast(index)) {

        } else {
            const next = table[index + 1]
            const upTo = next.minHeight - 1
        }
    }
    return map
}

const RELIEF_TABLE = {
    [ABYSSAL]: { id: ABYSSAL,  color: "#000034", name: "Abyssal" },
    [DEEP]: { id: DEEP,     color: "#000045", name: "Deep" },
    [SHELF]: { id: SHELF,  color: "#000078", name: "Shallow" },
    [REEF]: { id: REEF,     color: "#007587", name: "Reef" },
    [SHALLOW]: { id: SHALLOW,  color: "#000078", name: "Shallow" },
    [BASIN]: { id: BASIN,    color: "#0a5816", name: "Basin" },
    [PLAIN]: { id: PLAIN,    color: "#31771a", name: "Plain" },
    [HIGHLAND]: { id: HIGHLAND, color: "#6f942b", name: "Highland" },
    [HILL]: { id: HILL, color: "#9f908b", name: "Hill" },
    [MOUNTAIN]: { id: MOUNTAIN, color: "#AAAAAA", name: "Mountain" },
}

// TODO:  rename everything to geo add geologic formations as
//        both shallow and shelf are filtered to one
//        valleys, depressions, tables,
//        FILTER LAYER
//        disable storing filter layers on production to speed up generation
//        maybe create generic map class
//        create "memory snapshot" usando um grid de tiles, excluindo todos os meta-dados

class ReliefCodeMap {
    constructor(size, roughness) {
        this.heightMap = new HeightMap(size, roughness)
        this.grid = this._buildGrid(size, this.heightMap)
    }

    _buildGrid(size, heightMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            return this._convertHeightToRelief(height)
        })
    }

    _convertHeightToRelief(height) {
        let id = ABYSSAL
        for (let code of CODE_TABLE) {
            if (height >= code.minHeight) {
                id = code.mapTo
            } else {
                break
            }
        }
        return id
    }

    get(point) {
        return this.grid.get(point)
    }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.grid = new ReliefCodeMap(size, roughness)
        this.maskGrid = new ReliefCodeMap(size, roughness)
        //this.filterMap = new ReliefAnalysisMap(size, roughness)
        this.roughness = roughness
        this.size = size
    }

    _maskRelief(point, relief) {
        const maskRelief = this.maskGrid.get(point)

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
        let relief = this.grid.get(point)
        return this._maskRelief(point, relief)
    }

    getName(point) {
        const id = this.get(point)
        return RELIEF_TABLE[id].name
    }

    getHeight(point) {
        return this.grid.heightMap.get(point)
    }

    getColor(point) {
        const id = this.get(point)
        return RELIEF_TABLE[id].color
    }
}
