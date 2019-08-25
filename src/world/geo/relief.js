import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Point } from '../../lib/point';


export const ABYSSAL = 0
export const DEEP = 1
export const SHALLOW = 2
export const REEF = 3
export const BASIN = 4
export const PLAIN = 5
export const HIGHLAND = 6
export const HILL = 7
export const MOUNTAIN = 8
export const TABLE = 9


const HEIGHT_TABLE = [
    { minHeight:   0, mapTo: ABYSSAL },
    { minHeight:  20, mapTo: DEEP },
    { minHeight: 115, mapTo: SHALLOW },
    { minHeight: 152, mapTo: REEF },
    { minHeight: 153, mapTo: SHALLOW },
    { minHeight: 175, mapTo: BASIN },
    { minHeight: 198, mapTo: PLAIN },
    { minHeight: 235, mapTo: HIGHLAND },
    { minHeight: 255, mapTo: HILL },
    { minHeight: 257, mapTo: MOUNTAIN },
]

const RELIEF_TABLE = {
    [ABYSSAL]:  { id: ABYSSAL,  color: "#000034", name: "Abyssal" },
    [DEEP]:     { id: DEEP,     color: "#000045", name: "Deep" },
    [REEF]:     { id: REEF,     color: "#6e0f68", name: "Reef" },
    [SHALLOW]:  { id: SHALLOW,  color: "#000078", name: "Shallow" },
    [BASIN]:    { id: BASIN,    color: "#0a5816", name: "Basin" },
    [PLAIN]:    { id: PLAIN,    color: "#31771a", name: "Plain" },
    [HIGHLAND]: { id: HIGHLAND, color: "#6f942b", name: "Highland" },
    [HILL]:     { id: HILL,     color: "#9f908b", name: "Hill" },
    [MOUNTAIN]: { id: MOUNTAIN, color: "#AAAAAA", name: "Mountain" },
    [TABLE]:    { id: TABLE,    color: "brown",   name: "Table" },
}

// TODO:  rename everything to geo add geologic formations as
//        both shallow and shelf are filtered to one
//        valleys, depressions, tables,
//        FILTER LAYER
//        disable storing filter layers on production to speed up generation
//        maybe create generic map class
//        create "memory snapshot" usando um grid de tiles, excluindo todos os meta-dados

class HeightReliefMap {
    constructor(table) {
        this.table = table
        this.map = this._buildMap(table)
    }

    _buildMap() {
        const map = []
        const isLast = index => index == this.table.length - 1
        for (let [index, code] of this.table.entries()) {
            if (isLast(index)) {
                map.push(code.mapTo)
            } else {
                this._pushMapSection(map, index, code)
            }
        }
        return map
    }

    _pushMapSection(map, index, code) {
        const maxHeight = this._getSectionMaxHeight(index)
        for (let i = code.minHeight; i <= maxHeight; i++) {
            map.push(code.mapTo)
        }
    }

    _getSectionMaxHeight(index) {
        return this.table[index + 1].minHeight - 1
    }

    get(height) {
        return this.map[height]
    }
}


class ReliefCodeMap {
    constructor(size, roughness) {
        this.heightMap = new HeightMap(size, roughness)
        this.heightReliefMap = new HeightReliefMap(HEIGHT_TABLE)
        this.grid = this._buildGrid(size, this.heightMap, this.heightReliefMap)
    }

    _buildGrid(size, heightMap, heightReliefMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            return heightReliefMap.get(height)
        })
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

    isAbyss(pt) { return this.get(pt) == ABYSSAL }
    isDeep(pt) { return this.get(pt) == DEEP }
    isReef(pt) { return this.get(pt) == REEF }
    isShallow(pt) { return this.get(pt) == SHALLOW }
    isBasin(pt) { return this.get(pt) == BASIN }
    isPlain(pt) { return this.get(pt) == PLAIN }
    isHighland(pt) { return this.get(pt) == HIGHLAND }
    isMountain(pt) { return this.get(pt) == MOUNTAIN }

    isWater(pt) { return this.get(pt) <= SHALLOW }
    isLand(pt) { return !this.isWater(pt) }

    get(point) {
        let relief = this.grid.get(point)
        let maskedRelief = this._maskRelief(point, relief)
        return maskedRelief
    }

    _maskRelief(point, relief) {
        const maskRelief = this.maskGrid.get(point)

        // if (maskRelief > PLAIN) {
        //     relief = _.clamp(relief, ABYSSAL, HIGHLAND)
        // }
        // if (maskRelief == SHALLOW) {
        //     relief = _.clamp(relief, ABYSSAL, PLAIN)
        // }
        // if (maskRelief == BASIN) {
        //     relief = Math.max(ABYSSAL, relief - 1)
        // }
        return relief
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
