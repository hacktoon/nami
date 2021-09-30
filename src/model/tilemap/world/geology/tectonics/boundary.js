import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'

import { Landform } from '../landform'
import { BOUNDARY_TABLE } from './table'


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
    constructor(plates, realmTileMap) {
        this.plates = plates
        this.realmTileMap = realmTileMap
        this._boundaryMap = new PairMap()
        this._boundaryTable = new BoundaryTable(BOUNDARY_TABLE)

        realmTileMap.forEach(realm => {
            const neighbors = realmTileMap.getNeighborRealms(realm)
            neighbors.forEach(neighborGroup => {
                const boundary = this._buildGroupsBoundary(realm, neighborGroup)
                this._boundaryMap.set(realm.id, neighborGroup.id, boundary)
            })
        })
    }

    _buildGroupsBoundary(realm, neighborGroup) {
        const plate = this.plates.get(realm.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = this.realmTileMap.getGroupDirection(realm, neighborGroup)
        const dirFromNeighbor = this.realmTileMap.getGroupDirection(neighborGroup, realm)
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        return this._boundaryTable.build(plate, otherPlate, dotTo, dotFrom)
    }

    get(realm, neighborGroup) {
        return this._boundaryMap.get(realm.id, neighborGroup.id)
    }
}


class BoundaryTable {
    #codeTable = new Map() // map numeric id to boundary config

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
        return this._buildBoundary(spec, p1, p2)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _buildBoundary(spec, p1, p2) {
        const first = spec.data[0]
        const second = spec.data.length === 1 ? first : spec.data[1]
        const data = p1.weight > p2.weight ? first : second
        return new Boundary(spec, data)
    }
}


class Boundary {
    constructor(spec, data) {
        this.name = spec.name
        this.chance = data.chance ?? .5
        this.growth = data.growth ?? 6
        this.landscape = data.landscape
    }

    getLandform(level) {
        let name = this.landscape[0].name
        for(let step of this.landscape) {
            if (level <= step.level) break
            name = step.name
        }
        return Landform.get(name)
    }
}
