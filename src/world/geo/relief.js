import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Point } from '../../lib/point';
import { Random } from '../../lib/base';


export const VOLCANO_CHANCE = .01

export const TRENCH = 0
export const ABYSSAL = 1
export const DEEP = 2
export const SHALLOW = 3
export const BANKS = 4
export const BASIN = 5
export const PLAIN = 6
export const HIGHLAND = 7
export const TABLE = 8
export const HILL = 9
export const MOUNTAIN = 10

export const VOLCANO = 'V'
export const DEPRESSION = 'D'


const HEIGHT_TABLE = [
    { minHeight:   0, mapTo: _ => TRENCH },
    { minHeight:   2, mapTo: _ => ABYSSAL },
    { minHeight:  20, mapTo: _ => DEEP },
    { minHeight:  84, mapTo: _ => Random.choice([BANKS, BASIN]) },
    { minHeight:  85, mapTo: _ => DEEP },
    { minHeight: 115, mapTo: _ => SHALLOW },
    { minHeight: 151, mapTo: _ => BASIN },
    { minHeight: 152, mapTo: _ => Random.choice([BANKS, SHALLOW]) },
    { minHeight: 153, mapTo: _ => SHALLOW },
    { minHeight: 175, mapTo: _ => BASIN },
    { minHeight: 198, mapTo: _ => PLAIN },
    { minHeight: 235, mapTo: _ => HIGHLAND },
    { minHeight: 236, mapTo: _ => TABLE },
    { minHeight: 237, mapTo: _ => HIGHLAND },
    { minHeight: 252, mapTo: _ => HILL },
    { minHeight: 254, mapTo: _ => HIGHLAND },
    { minHeight: 257, mapTo: _ => MOUNTAIN },
]

const RELIEF_MAP = {
    [TRENCH]:     { id: TRENCH,     color: "#000023", name: "Trench" },
    [ABYSSAL]:    { id: ABYSSAL,    color: "#000034", name: "Abyssal" },
    [DEEP]:       { id: DEEP,       color: "#000045", name: "Deep" },
    [SHALLOW]:    { id: SHALLOW,    color: "#000078", name: "Shallow" },
    [BANKS]:      { id: BANKS,      color: "#2d3806", name: "Banks" },
    [BASIN]:      { id: BASIN,      color: "#0a5816", name: "Basin" },
    [PLAIN]:      { id: PLAIN,      color: "#31771a", name: "Plain" },
    [HIGHLAND]:   { id: HIGHLAND,   color: "#6f942b", name: "Highland" },
    [HILL]:       { id: HILL,       color: "#AAAAAA", name: "Hill" },
    [MOUNTAIN]:   { id: MOUNTAIN,   color: "#CCCCCC", name: "Mountain" },
    [TABLE]:      { id: TABLE,      color: "#766842", name: "Table" },
    [VOLCANO]:    { id: VOLCANO,    color: "#FF0000", name: "Volcano" },
    [DEPRESSION]: { id: DEPRESSION, color: "#5f5c33", name: "Depression" },
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
                map.push(code.mapTo())
            } else {
                this._pushMapSection(map, index, code)
            }
        }
        return map
    }

    _pushMapSection(map, index, code) {
        const maxHeight = this._getSectionMaxHeight(index)
        for (let i = code.minHeight; i <= maxHeight; i++) {
            map.push(code.mapTo())
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
        this.heightToReliefMap = new HeightToReliefMap()
        this.heightMap = new HeightMap(size, roughness)
        this.maskHeightMap = new HeightMap(size, roughness)
        this.grid = this._buildGrid(size, this.heightMap)
        this.maskGrid = this._buildGrid(size, this.maskHeightMap)
    }

    _buildGrid(size, heightMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            return this.heightToReliefMap.get(height)
        })
    }

    get(point) {
        const relief = this.grid.get(point)
        const maskRelief = this.maskGrid.get(point)
        return this._maskRelief(relief, maskRelief)
    }

    _maskRelief(relief, maskRelief) {
        if (relief == MOUNTAIN && Random.chance(VOLCANO_CHANCE)) {
            return VOLCANO
        }
        if (maskRelief > PLAIN) {
            relief = _.clamp(relief, ABYSSAL, HIGHLAND)
        }
        if (maskRelief == SHALLOW) {
            relief = _.clamp(relief, ABYSSAL, PLAIN)
        }
        if (maskRelief == BASIN) {
            return Math.max(ABYSSAL, relief - 1)
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

    isWater(pt) { return this.get(pt) <= SHALLOW } // TODO: remove
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
