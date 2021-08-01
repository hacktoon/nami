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
    LANDFORMS
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

    get(group, neighborGroup) {
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
        const first = row.boundaries[0]
        const second = row.boundaries.length === 1 ? first : row.boundaries[1]
        let boundary = dir1 > dir2 ? first : second
        if (row.rule === 'weight') {
            boundary = p1.weight > p2.weight ? first : second
        }
        return new Deform(row, boundary)
    }
}


class Deform {
    constructor(row, boundary) {
        this.id = row.id
        this.key = row.key
        this.name = row.name
        this.chance = boundary.chance ?? .5
        this.growth = boundary.growth ?? 6
        this.landscape = boundary.landscape
    }

    get(level) {
        let name = this.landscape[0].name
        for(let step of this.landscape) {
            if (step.level >= level) break
            name = step.name
        }
        const step = LANDFORMS[name]
        return {
            ...step,
            id: this.id,
            key: this.key,
            name: this.name,
            color: step.color,
            border: step.border ?? step.color,
        }
    }
}
