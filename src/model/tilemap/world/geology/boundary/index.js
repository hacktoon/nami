import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'
import {
    BD_WATER,
    BD_LAND,
    IDMAP,
    BD_CONVERGE,
    BD_TRANSFORM,
    BD_DIVERGE,
    BOUNDARY_TABLE
} from './data'


export class BoundaryMap {
    constructor(plates, regionGroupTileMap) {
        this.plates = plates
        this.regionGroupTileMap = regionGroupTileMap
        this.table = new BoundaryTable(BOUNDARY_TABLE)
        this._boundaries = new PairMap()

        regionGroupTileMap.getGroups().forEach(group => {
            const neighbors = regionGroupTileMap.getNeighborGroups(group)
            // console.log(`${group.id} = ${neighbors.map(g=>g.id).join(', ')}`);
            neighbors.forEach(neighbor => {
                const boundary = this._buildGroupBoundary(group, neighbor)
                this._boundaries.set(group.id, neighbor.id, boundary)
                // console.log(`${group.id}>${neighbor.id} = ${Boundary.getName(boundary)}`);
            })
        })
    }

    _buildGroupBoundary(group, neighborGroup) {
        const rgrp = this.regionGroupTileMap
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        return this.table.get(plate, otherPlate, dotTo, dotFrom)
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroupTileMap
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this._boundaries.get(group.id, neighborGroup.id)
    }
}


class Boundary {
    constructor(id, name, data) {
        this.id = id
        this.name = name
        this.chance = data.chance
        this.energy = data.energy
        this.growth = data.growth
        this.height = data.height
        this.color = data.color
        this.border = data.border ?? null
    }

    hasBorder() {
        return Boolean(this.border)
    }
}


class BoundaryTable {
    constructor(table=BOUNDARY_TABLE) {
        this._table = new Map()
        table.map(row => {
            const chars = Array.from(row.id)
            const code = chars.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this._table.set(code, row)
        })
    }

    get(p1, p2, dotTo, dotFrom) {
        const type1 = this._getType(p1)
        const type2 = this._getType(p2)
        const dir1 = this._getDir(dotTo)
        const dir2 = this._getDir(dotFrom)
        const code = type1 + type2 + dir1 + dir2
        const row = this._table.get(code)
        const boundary = this._getBoundary(row, p1, p2, dir1, dir2)
        // if (p1.id == 5 && p2.id == 7) {
        //     console.log(
        //         `${p1.id}=>${p2.id} [${dir1}] weight="${p1.weight}w/${p2.weight}w"`,
        //         `${row.id} color="${boundary.color}" chance="${boundary.chance}"`,
        //         `energy="${boundary.energy}"`,
        //     )
        // }
        return boundary
    }

    _getType(plate) {
        return plate.isContinental() ? BD_LAND : BD_WATER
    }

    _getDir(dir) {
        if (dir === 0) return BD_TRANSFORM
        return dir > 0 ? BD_CONVERGE : BD_DIVERGE
    }

    _getBoundary(row, p1, p2, dir1, dir2) {
        const name = row.name
        const id = row.id
        const first = row.data[0]
        const second = row.data.length === 1 ? first : row.data[1]
        let data
        if (row.rule === 'weight') {
            data = p1.weight > p2.weight ? first : second
        } else {
            data = dir1 > dir2 ? first : second
        }
        return new Boundary(id, name, data)
    }
}
