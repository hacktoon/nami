import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'
import {
    DEF_WATER,
    DEF_LAND,
    IDMAP,
    DEF_CONVERGE,
    DEF_TRANSFORM,
    DEF_DIVERGE,
    DEFORM_TABLE,
} from './table'


export class DeformMap {
    constructor(plates, regionGroupTileMap) {
        this.plates = plates
        this.regionGroupTileMap = regionGroupTileMap
        this._deforms = new PairMap()
        this._deformTable = new DeformTable(DEFORM_TABLE)

        regionGroupTileMap.getGroups().forEach(group => {
            const neighbors = regionGroupTileMap.getNeighborGroups(group)
            neighbors.forEach(neighbor => {
                const deform = this._buildGroupDeform(group, neighbor)
                this._deforms.set(group.id, neighbor.id, deform)
            })
        })
    }

    _buildGroupDeform(group, neighborGroup) {
        const rgrp = this.regionGroupTileMap
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        return this._deformTable.build(plate, otherPlate, dotTo, dotFrom)
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroupTileMap
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this._deforms.get(group.id, neighborGroup.id)
    }
}


class DeformTable {
    #codeTable = new Map()

    constructor(table) {
        table.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    build(p1, p2, dotTo, dotFrom) {
        const type1 = p1.isContinental() ? DEF_LAND : DEF_WATER
        const type2 = p2.isContinental() ? DEF_LAND : DEF_WATER
        const dir1 = this._parseDir(dotTo)
        const dir2 = this._parseDir(dotFrom)
        const id = type1 + type2 + dir1 + dir2
        const row = this.#codeTable.get(id)
        return this._buildDeform(row, p1, p2, dir1, dir2)
    }

    _parseDir(dir) {
        if (dir === 0) return DEF_TRANSFORM
        return dir > 0 ? DEF_CONVERGE : DEF_DIVERGE
    }

    _buildDeform(row, p1, p2, dir1, dir2) {
        const first = row.data[0]
        const second = row.data.length === 1 ? first : row.data[1]
        let data = dir1 > dir2 ? first : second
        if (row.rule === 'weight') {
            data = p1.weight > p2.weight ? first : second
        }
        return new Deform(row.id, row.key, row.name, data)
    }
}


class Deform {
    constructor(id, key, name, data) {
        this.id = id
        this.key = key
        this.name = name
        this.range = data.range ?? 1
        this.priority = data.priority ?? 99
        this.chance = data.chance
        this.growth = data.growth
        this.color = data.type.color
        this.border = data.type.border ?? data.type.color
    }

    hasBorder() {
        return Boolean(this.border)
    }

    inRange(level) {
        if (Number.isInteger(this.range)) {
            return level >= 0 && level < this.range
        }
        if (Array.isArray(this.range)) {
            return level >= this.range[0] && level < this.range[1]
        }
        return false
    }
}
