import { Direction } from '/lib/direction'

import { Landform } from '../landform'

import { BOUNDARY_TABLE } from './table'
import { BoundaryMultiFill } from './fill'


const PLATE_CONTINENTAL = 0
const PLATE_OCEANIC = 100
const DIR_CONVERGE = 1
const DIR_TRANSFORM = 4
const DIR_DIVERGE = 16
const IDMAP = {
    L: PLATE_CONTINENTAL,
    W: PLATE_OCEANIC,
    C: DIR_CONVERGE,
    D: DIR_DIVERGE,
    T: DIR_TRANSFORM,
}


export class TectonicsModel {
    #landformMap = new Map()

    constructor(realmTileMap, plateModel) {
        this.realmTileMap = realmTileMap
        this.landformMap = new Map()
        this.deformationMap = new Map()
        this.regionBoundaryMap = new Map()
        this.origins = this.realmTileMap.getBorderRegions()
        this.plateModel = plateModel
        this.boundaryModel = new BoundaryModel(
            this.plateModel,
            this.origins,
            realmTileMap
        )
        new BoundaryMultiFill(this).fill()
    }

    getBoundary(regionId) {
        return this.regionBoundaryMap.get(regionId)
    }

    hasLandform(regionId) {
        return this.#landformMap.has(regionId)
    }

    setLandform(regionId, landform) {
        return this.#landformMap.set(regionId, landform)
    }

    getLandform(regionId) {
        return this.#landformMap.get(regionId)
    }

    getLandformByPoint(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.#landformMap.get(regionId)
    }
}


export class BoundaryModel {
    #boundaryMap = new Map()

    constructor(plateModel, origins, realmTileMap) {
        this._plateModel = plateModel
        this._realmTileMap = realmTileMap
        this._boundaryTable = new BoundaryTable(this._plateModel)

        this._buildBoundaries(origins)
    }

    _buildBoundaries(origins) {
        for(let id = 0; id < origins.length; id ++) {
            const regionId = origins[id]
            const realmId = this._realmTileMap.getRealmByRegion(regionId)
            const sideRegionIds = this._realmTileMap.getNeighborRegions(regionId)
            for(let sideRegionId of sideRegionIds) {
                const sideRealmId = this._realmTileMap.getRealmByRegion(sideRegionId)
                if (sideRealmId !== realmId) {
                    const boundary =  this._buildBoundary(realmId, sideRealmId)
                    this.#boundaryMap.set(id, boundary)
                }
            }
        }
    }

    _buildBoundary(realmId, sideRealmId) {
        const dirToSide = this._realmTileMap.getRealmDirection(realmId, sideRealmId)
        const dirFromSide = this._realmTileMap.getRealmDirection(sideRealmId, realmId)
        const plateDir = this._plateModel.getDirection(realmId)
        const neighborPlateDir = this._plateModel.getDirection(sideRealmId)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(neighborPlateDir, dirFromSide)
        return this._boundaryTable.get(realmId, sideRealmId, dotTo, dotFrom)
    }

    get(id) {
        return this.#boundaryMap.get(id)
    }
}


class BoundaryTable {
    #codeTable = new Map() // map numeric id to boundary config

    constructor(plateModel) {
        this._plateModel = plateModel
        BOUNDARY_TABLE.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    get(realmId, neighborRealmId, dotTo, dotFrom) {
        const type1 = this._plateModel.isOceanic(realmId)
                      ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = this._plateModel.isOceanic(neighborRealmId)
                      ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const dir = this._parseDir(dotTo) + this._parseDir(dotFrom)
        const id = type1 + type2 + dir
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
        const realmWeight = this._plateModel.getWeight(realmId)
        const neighborRealmWeight = this._plateModel.getWeight(neighborRealmId)
        const data = realmWeight > neighborRealmWeight ? first : second
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
