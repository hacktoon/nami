import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Random } from '../../lib/base';


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

// MASK CODES
export const CAVE = 'C'
export const VOLCANO = 'X'
export const SINKHOLE = 'V'
export const DEPRESSION = '_'


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

export const RELIEF_TABLE = {
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
    [VOLCANO]:    { id: VOLCANO,    color: "orange",  name: "Volcano" },
    [CAVE]:       { id: CAVE,       color: "#222222", name: "Cave" },
    [DEPRESSION]: { id: DEPRESSION, color: "#5f5c33", name: "Depression" },
}


export class ReliefMap {
    constructor(size, roughness) {
        this.heightCodeMap = new HeightCodeMap()
        this.heightMap     = new HeightMap(size, roughness)
        this.maskHeightMap = new HeightMap(size, roughness)
        this.grid          = this._buildGrid(size, this.heightMap)
        this.maskGrid      = this._buildGrid(size, this.maskHeightMap)
        this.size = size
    }

    _buildGrid(size, heightMap) {
        return new Grid(size, size, point => {
            const height = heightMap.get(point)
            const id = this.heightCodeMap.get(height)
            return new Relief(id)
        })
    }

    get(point) {
        const relief = this.grid.get(point)
        const maskRelief = this.maskGrid.get(point)
        return ReliefMask.apply(relief, maskRelief)
    }

    isTrench(pt) { return this.getId(pt) == TRENCH }
    isAbyss(pt) { return this.getId(pt) == ABYSSAL }
    isDeep(pt) { return this.getId(pt) == DEEP }
    isShallow(pt) { return this.getId(pt) == SHALLOW }
    isBanks(pt) { return this.getId(pt) == BANKS }
    isBasin(pt) { return this.getId(pt) == BASIN }
    isPlain(pt) { return this.getId(pt) == PLAIN }
    isHighland(pt) { return this.getId(pt) == HIGHLAND }
    isTable(pt) { return this.getId(pt) == TABLE }
    isHill(pt) { return this.getId(pt) == HILL }
    isMountain(pt) { return this.getId(pt) == MOUNTAIN }
    isVolcano(pt) { return this.getId(pt) == VOLCANO }
    isDepression(pt) { return this.getId(pt) == DEPRESSION }

    isWater(pt) { return this.getId(pt) <= BANKS }
    isLand(pt) { return !this.isWater(pt) }

    getId(point) {
        return this.get(point).id
    }

    getName(point) {
        return this.get(point).name
    }

    getColor(point) {
        const { id, mask } = this.get(point)
        if (mask) {
            return RELIEF_TABLE[mask].color
        }
        return RELIEF_TABLE[id].color
    }
}


class HeightCodeMap {
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

    get(height) {
        return this.map[height]
    }
}


class ReliefMask {
    static apply(relief, maskRelief) {
        let [id, maskId] = [relief.id, maskRelief.id]
        let mask = false

        if (maskId > PLAIN) {
            id = _.clamp(id, TRENCH, HIGHLAND)
        }
        if (maskId == SHALLOW) {
            id = _.clamp(id, TRENCH, PLAIN)
        }
        if (maskId == BASIN || maskId == BANKS) {
            id = Math.max(TRENCH, id - 1)
        }
        if (id == MOUNTAIN && Random.chance(VOLCANO_CHANCE)) {
            mask = VOLCANO
        }
        if (id >= BASIN && Random.chance(CAVE_CHANCE)) {
            mask = CAVE
        }
        return new Relief(id, mask)
    }
}


class Relief {
    constructor(id, mask=false) {
        this.id = id
        this.mask = mask
    }

    get name() {
        const name = RELIEF_TABLE[this.id].name
        const maskName = this.mask ? RELIEF_TABLE[this.mask].name : ''
        return `${name} ${maskName}`
    }
}
