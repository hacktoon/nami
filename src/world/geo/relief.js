import _ from 'lodash'

import { Grid } from '/lib/grid'
import { HeightMap } from '/lib/heightmap'
import { Random } from '/lib/base';

export const VOLCANO_CHANCE = .006
export const CAVE_CHANCE = .007

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

// FEATURE RELIEFS
export const CAVE = 'C'
export const VOLCANO = 'X'


const HEIGHT_TABLE = [
    { minHeight:   0, mapTo: TRENCH },
    { minHeight:   2, mapTo: ABYSSAL },
    { minHeight:  20, mapTo: DEEP },
    { minHeight:  94, mapTo: BASIN },
    { minHeight:  95, mapTo: BANKS },
    { minHeight:  96, mapTo: DEEP },
    { minHeight: 115, mapTo: SHALLOW },
    { minHeight: 150, mapTo: BASIN },
    { minHeight: 151, mapTo: BANKS },
    { minHeight: 153, mapTo: SHALLOW },
    { minHeight: 175, mapTo: BASIN },
    { minHeight: 198, mapTo: PLAIN },
    { minHeight: 235, mapTo: HIGHLAND },
    { minHeight: 236, mapTo: TABLE },
    { minHeight: 237, mapTo: HIGHLAND },
    { minHeight: 252, mapTo: HILL },
    { minHeight: 254, mapTo: HIGHLAND },
    { minHeight: 257, mapTo: MOUNTAIN },
]

const RELIEF_TABLE = {
    [TRENCH]:   { code: TRENCH,   color: "#000023", name: "Trench" },
    [ABYSSAL]:  { code: ABYSSAL,  color: "#000034", name: "Abyssal" },
    [DEEP]:     { code: DEEP,     color: "#000045", name: "Deep" },
    [SHALLOW]:  { code: SHALLOW,  color: "#000078", name: "Shallow" },
    [BANKS]:    { code: BANKS,    color: "#2d3806", name: "Banks" },
    [BASIN]:    { code: BASIN,    color: "#0a5816", name: "Basin" },
    [PLAIN]:    { code: PLAIN,    color: "#31771a", name: "Plain" },
    [HIGHLAND]: { code: HIGHLAND, color: "#6f942b", name: "Highland" },
    [HILL]:     { code: HILL,     color: "#AAAAAA", name: "Hill" },
    [MOUNTAIN]: { code: MOUNTAIN, color: "#CCCCCC", name: "Mountain" },
    [TABLE]:    { code: TABLE,    color: "#766842", name: "Table" },
    [VOLCANO]:  { code: VOLCANO,  color: "#ff620f",  name: "Volcano" },
    [CAVE]:     { code: CAVE,     color: "#766842", name: "Cave" },
}


class CodeMap {
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
                this._pushMapSegment(map, index, code)
            }
        }
        return map
    }

    _pushMapSegment(map, index, code) {
        const maxSegmentHeight = this.table[index + 1].minHeight - 1
        for (let i = code.minHeight; i <= maxSegmentHeight; i++) {
            map.push(code.mapTo)
        }
    }

    getCode(height) {
        return this.map[height]
    }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.codeMap   = new CodeMap()
        this.heightMap = new HeightMap(size, roughness)
        this.grid      = this._buildGrid(size, this.heightMap)
        this.size      = size
        this.filters   = []

        delete this.codeMap
    }

    _buildGrid(size, heightMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            return this._buildRelief(height)
        })
    }

    _buildRelief(height) {
        const code = this.codeMap.getCode(height)
        return new Relief(code, undefined)
    }

    get(point) {
        return this.grid.get(point)
    }

    getCode(point) {
        return this.get(point).code
    }

    getName(point) {
        return this.get(point).name
    }

    getColor(point) {
        return this.get(point).color
    }

    isWater(pt) { return this.getCode(pt) <= BANKS }
    isLand(pt) { return !this.isWater(pt) }
    isTrench(pt) { return this.getCode(pt) == TRENCH }
    isAbyss(pt) { return this.getCode(pt) == ABYSSAL }
    isDeep(pt) { return this.getCode(pt) == DEEP }
    isShallow(pt) { return this.getCode(pt) == SHALLOW }
    isBanks(pt) { return this.getCode(pt) == BANKS }
    isBasin(pt) { return this.getCode(pt) == BASIN }
    isPlain(pt) { return this.getCode(pt) == PLAIN }
    isHighland(pt) { return this.getCode(pt) == HIGHLAND }
    isTable(pt) { return this.getCode(pt) == TABLE }
    isHill(pt) { return this.getCode(pt) == HILL }
    isMountain(pt) { return this.getCode(pt) == MOUNTAIN }

    hasVolcano(pt) { return this.get(pt).mask == VOLCANO }
    hasCave(pt) { return this.get(pt).mask == CAVE }
}


class Relief {
    constructor(code, feature=undefined) {
        this.code    = code
        this.feature = feature
    }

    get name() {
        const [code, feature] = [this.code, this.feature]
        const name = RELIEF_TABLE[code].name
        const featureName = feature ? `, ${RELIEF_TABLE[feature].name}` : ''
        return `${name}${featureName}`
    }

    get color() {
        const [code, feature] = [this.code, this.feature]
        let color = RELIEF_TABLE[feature || code].color
        return color
    }
}
