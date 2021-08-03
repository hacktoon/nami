import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'
import { BOUNDARY_TABLE } from './table'
import { LANDFORMS } from '../landform'


const PLATE_CONTINENTAL = 0
const PLATE_OCEANIC = 100
const DIR_CONVERGE = 16
const DIR_TRANSFORM = 4
const DIR_DIVERGE = 1
const IDMAP = {
    L: PLATE_CONTINENTAL,
    W: PLATE_OCEANIC,
    C: DIR_CONVERGE,
    D: DIR_DIVERGE,
    T: DIR_TRANSFORM,
}


export class BoundaryModel {
    constructor(plates, regionGroupTileMap) {
        this.plates = plates
        this.regionGroupTileMap = regionGroupTileMap
        this._deforms = new PairMap()
        this._deformTable = new BoundaryTable(BOUNDARY_TABLE)

        regionGroupTileMap.getGroups().forEach(group => {
            const neighbors = regionGroupTileMap.getNeighborGroups(group)
            neighbors.forEach(neighborGroup => {
                const boundary = this._buildGroupDeform(group, neighborGroup)
                this._deforms.set(group.id, neighborGroup.id, boundary)
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


class BoundaryTable {
    #codeTable = new Map()

    constructor(table) {
        table.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    build(p1, p2, dotTo, dotFrom) {
        const type1 = p1.isContinental() ? PLATE_CONTINENTAL : PLATE_OCEANIC
        const type2 = p2.isContinental() ? PLATE_CONTINENTAL : PLATE_OCEANIC
        const dir1 = this._parseDir(dotTo)
        const dir2 = this._parseDir(dotFrom)
        const id = type1 + type2 + dir1 + dir2
        const spec = this.#codeTable.get(id)
        return this._buildBoundary(spec, p1, p2, dir1, dir2)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _buildBoundary(spec, p1, p2, dir1, dir2) {
        const first = spec.borders[0]
        const second = spec.borders.length === 1 ? first : spec.borders[1]
        let border = dir1 > dir2 ? first : second
        if (spec.rule === 'weight') {
            border = p1.weight > p2.weight ? first : second
        }
        return new Boundary(spec, border)
    }
}


class Boundary {
    constructor(spec, border) {
        this.id = spec.id
        this.key = spec.key
        this.spec = spec
        this.chance = border.chance ?? .5
        this.growth = border.growth ?? 6
        this.landscape = border.landscape
    }

    getLandform(level) {
        let name = this.landscape[0].name
        for(let step of this.landscape) {
            if (level <= step.level) break
            name = step.name
        }
        const landform = LANDFORMS[name]
        return {
            ...landform,
            name: name,
            id: this.id,
            key: this.key,
            color: landform.color,
            boundary: this.spec.name,
            border: landform.border ?? landform.color,
        }
    }
}
