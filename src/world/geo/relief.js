import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Point } from '../../lib/point';


export const ABYSSAL = 0
export const DEEP = 1
export const SHALLOW = 2
export const BANKS = 3
export const BASIN = 4
export const PLAIN = 5
export const HIGHLAND = 6
export const HILL = 7
export const MOUNTAIN = 8
export const TABLE = 9
export const VOLCANO = 10


const HEIGHT_TABLE = [
    { minHeight:   0, mapTo: ABYSSAL },
    { minHeight:  20, mapTo: DEEP },
    { minHeight: 115, mapTo: SHALLOW },
    { minHeight: 152, mapTo: BANKS },
    { minHeight: 153, mapTo: SHALLOW },
    { minHeight: 175, mapTo: BASIN },
    { minHeight: 198, mapTo: PLAIN },
    { minHeight: 235, mapTo: HIGHLAND },
    { minHeight: 254, mapTo: HILL },
    { minHeight: 257, mapTo: MOUNTAIN },
]

const RELIEF_MAP = {
    [ABYSSAL]:  { id: ABYSSAL,  color: "#000034", name: "Abyssal" },
    [DEEP]:     { id: DEEP,     color: "#000045", name: "Deep" },
    [SHALLOW]:  { id: SHALLOW,  color: "#000078", name: "Shallow" },
    [BANKS]:    { id: BANKS,    color: "#6e0f68", name: "Banks" },
    [BASIN]:    { id: BASIN,    color: "#0a5816", name: "Basin" },
    [PLAIN]:    { id: PLAIN,    color: "#31771a", name: "Plain" },
    [HIGHLAND]: { id: HIGHLAND, color: "#6f942b", name: "Highland" },
    [HILL]:     { id: HILL,     color: "#9f908b", name: "Hill" },
    [MOUNTAIN]: { id: MOUNTAIN, color: "#AAAAAA", name: "Mountain" },
    [TABLE]:    { id: TABLE,    color: "brown",   name: "Table" },
    [VOLCANO]:  { id: VOLCANO,  color: "red",     name: "Volcano" },
}

// TODO:  rename everything to geo add geologic formations as
//        valleys, depressions, tables,
//        FILTER LAYER
//        disable storing filter layers on production to speed up generation
//        maybe create generic map class
//        create "memory snapshot" usando um grid de tiles, excluindo todos os meta-dados
//        on region map, build mountains up to, 4, 8 tiles p/region
//        (4 = Peak)
//        (9 = Everest)

class HeightToReliefMap {
    constructor(table = HEIGHT_TABLE) {
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

    getLower(relief) {
        return Math.max(ABYSSAL, relief - 1)
    }
}


class ReliefCodeMap {
    constructor(size, roughness) {
        this.heightToReliefMap = new HeightToReliefMap()
        this.heightMap = new HeightMap(size, roughness)
        this.maskHeightMap = new HeightMap(size, roughness)
        this.grid = this._buildGrid(size, this.heightMap, this.heightToReliefMap)
        this.maskGrid = this._buildGrid(size, this.maskHeightMap, this.heightToReliefMap)
    }

    _buildGrid(size, heightMap, heightToReliefMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            return heightToReliefMap.get(height)
        })
    }

    get(point) {
        const relief = this.grid.get(point)
        const maskRelief = this.maskGrid.get(point)
        return this._maskRelief(relief, maskRelief)
    }

    _maskRelief(relief, maskRelief) {
        if (maskRelief > PLAIN) {
            relief = _.clamp(relief, ABYSSAL, HIGHLAND)
        }
        if (maskRelief == SHALLOW) {
            relief = _.clamp(relief, ABYSSAL, PLAIN)
        }
        if (maskRelief == BASIN) {
            return this.heightToReliefMap.getLower(relief)
        }
        return relief
    }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.codeMap = new ReliefCodeMap(size, roughness)
        //TODO: this.regionMap = new RegionMap()
        this.roughness = roughness
        this.size = size
    }

    isAbyss(pt) { return this.get(pt) == ABYSSAL }
    isDeep(pt) { return this.get(pt) == DEEP }
    isShallow(pt) { return this.get(pt) == SHALLOW }
    isReef(pt) { return this.get(pt) == BANKS }
    isBasin(pt) { return this.get(pt) == BASIN }
    isPlain(pt) { return this.get(pt) == PLAIN }
    isHighland(pt) { return this.get(pt) == HIGHLAND }
    isMountain(pt) { return this.get(pt) == MOUNTAIN }

    isWater(pt) { return this.get(pt) <= SHALLOW }
    isLand(pt) { return !this.isWater(pt) }

    getName(point) {
        const code = this.get(point)
        return RELIEF_MAP[code].name
    }

    getHeight(point) {
        return this.codeMap.heightMap.get(point) // TODO: normalize height
    }

    getColor(point) {
        const code = this.get(point)
        return RELIEF_MAP[code].color
    }

    get(point) {
        return this.codeMap.get(point)
    }
}



export class TerrainMap {
    constructor(size, roughness) {
        this.relief = new ReliefMap(size, roughness)
        this.size = size
    }

    isWater(pt) { return this.get(pt) <= SHALLOW }
    isLand(pt) { return !this.isWater(pt) }

    get(point) {
        return
    }
}
