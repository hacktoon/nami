import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'
import {
    DEF_WATER,
    DEF_LAND,
    IDMAP,
    DEF_CONVERGE,
    DEF_TRANSFORM,
    DEF_DIVERGE,
    DEFORM_TABLE
} from './table'


export class DeformMap {
    #table = new DeformTable(DEFORM_TABLE)

    constructor(plates, regionGroupTileMap) {
        this.plates = plates
        this.regionGroupTileMap = regionGroupTileMap
        this._deforms = new PairMap()

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
        return this.#table.get(plate, otherPlate, dotTo, dotFrom)
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroupTileMap
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this._deforms.get(group.id, neighborGroup.id)
    }
}


class DeformTable {
    constructor(table) {
        this._table = new Map()
        table.map(row => {
            const chars = Array.from(row.id)
            const code = chars.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this._table.set(code, row)
        })
    }

    get(p1, p2, dotTo, dotFrom) {
        const type1 = p1.isContinental() ? DEF_LAND : DEF_WATER
        const type2 = p2.isContinental() ? DEF_LAND : DEF_WATER
        const dir1 = this._getDir(dotTo)
        const dir2 = this._getDir(dotFrom)
        const code = type1 + type2 + dir1 + dir2
        const row = this._table.get(code)
        return this._getDeform(row, p1, p2, dir1, dir2)
    }

    _getDir(dir) {
        if (dir === 0) return DEF_TRANSFORM
        return dir > 0 ? DEF_CONVERGE : DEF_DIVERGE
    }

    _getDeform(row, p1, p2, dir1, dir2) {
        const first = row.data[0]
        const second = row.data.length === 1 ? first : row.data[1]
        let data = dir1 > dir2 ? first : second
        if (row.rule === 'weight') {
            data = p1.weight > p2.weight ? first : second
        }
        return new Deform(row.id, row.name, data)
    }
}


class Deform {
    constructor(id, name, data) {
        this.id = id
        this.name = name
        this.chance = data.chance
        this.energy = data.energy
        this.growth = data.growth
        this.depth = data.depth ?? 0
        this.height = data.height
        this.color = data.color
        this.border = data.border ?? null
    }

    hasBorder() {
        return Boolean(this.border)
    }
}
