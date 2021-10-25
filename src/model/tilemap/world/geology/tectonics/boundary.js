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
    constructor(plateMap, realmTileMap) {
        this._plateMap = plateMap
        this.realmTileMap = realmTileMap
        this._boundaryMap = new PairMap()
        this._origins = this.realmTileMap.getBorderRegions()
        this._boundaryTable = new BoundaryTable(this._plateMap, BOUNDARY_TABLE)

        realmTileMap.forEach(realmId => {
            const sideRealms = realmTileMap.getNeighborRealms(realmId)
            sideRealms.forEach(sideRealmId => {
                const boundary = this._buildRealmsBoundary(realmId, sideRealmId)
                this._boundaryMap.set(realmId, sideRealmId, boundary)
            })
        })
    }

    _buildRealmsBoundary(realmId, sideRealmId) {
        const dirToNeighbor = this.realmTileMap.getRealmDirection(realmId, sideRealmId)
        const dirFromNeighbor = this.realmTileMap.getRealmDirection(sideRealmId, realmId)
        const plateDir = this._plateMap.getDirection(realmId)
        const neighborPlateDir = this._plateMap.getDirection(sideRealmId)
        const dotTo = Direction.dotProduct(plateDir, dirToNeighbor)
        const dotFrom = Direction.dotProduct(neighborPlateDir, dirFromNeighbor)
        return this._boundaryTable.build(realmId, sideRealmId, dotTo, dotFrom)
    }

    get(realmId, sideRealmId) {
        return this._boundaryMap.get(realmId, sideRealmId)
    }
}


class BoundaryTable {
    #codeTable = new Map() // map numeric id to boundary config

    constructor(plateMap, table) {
        this.plateMap = plateMap
        table.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    build(realmId, neighborRealmId, dotTo, dotFrom) {
        const type1 = this.plateMap.isOceanic(realmId) ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = this.plateMap.isOceanic(neighborRealmId) ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const dir1 = this._parseDir(dotTo)
        const dir2 = this._parseDir(dotFrom)
        const id = type1 + type2 + dir1 + dir2
        const spec = this.#codeTable.get(id)
        return this._buildBoundary(spec, realmId, neighborRealmId)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _buildBoundary(spec, realmId, neighborRealmId) {
        const first = spec.data[0]
        const second = spec.data.length === 1 ? first : spec.data[1]
        const realmWeight = this.plateMap.getWeight(realmId)
        const neighborRealmWeight = this.plateMap.getWeight(neighborRealmId)
        const data = realmWeight > neighborRealmWeight ? first : second
        // if(realmId == 1 && neighborRealmId==16) debugger;
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
