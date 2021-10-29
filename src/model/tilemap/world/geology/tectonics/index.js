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
    #regionBoundaryMap = new Map()
    #landformMap = new Map()
    #stressMap = new Map()

    constructor(realmTileMap, plateModel) {
        this.realmTileMap = realmTileMap
        this.origins = this.realmTileMap.getBorderRegions()
        this.plateModel = plateModel
        this.boundaryModel = new BoundaryModel(
            this.plateModel,
            this.origins,
            realmTileMap
        )
        new BoundaryMultiFill(this).fill()
    }

    setStress(regionId, stress) {
        return this.#stressMap.set(regionId, stress)
    }

    getStress(regionId) {
        return this.#stressMap.get(regionId)
    }

    getBoundaries() {
        return this.boundaryModel.getBoundaries()
    }

    setRegionBoundary(regionId, id) {
        const boundary = this.boundaryModel.get(id)
        return this.#regionBoundaryMap.set(regionId, boundary.id)
    }

    getRegionBoundary(regionId) {
        return this.#regionBoundaryMap.get(regionId)
    }

    getBoundaryName(regionId) {
        const boundaryId = this.#regionBoundaryMap.get(regionId)
        return this.boundaryModel.getName(boundaryId)
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

    getLandformByLevel(id, level) {
        return this.boundaryModel.getLandformByLevel(id, level)
    }
}


export class BoundaryModel {
    #boundaryMap = new Map()
    #boundaryLandscape = []
    #boundaryName = []
    #boundaries = []

    constructor(plateModel, borderRegionIds, realmTileMap) {
        this._plateModel = plateModel
        this._realmTileMap = realmTileMap
        this._boundaryTable = new BoundaryTable(plateModel)

        this._buildBoundaries(borderRegionIds)
    }

    _buildBoundaries(borderRegionIds) {
        const boundarySet = new Set()

        const getBoundary = (realmId, sideRegionIds) => {
            for(let sideRegionId of sideRegionIds) {
                const sideRealmId = this._realmTileMap.getRealmByRegion(sideRegionId)
                if (realmId !== sideRealmId) {
                    return this._buildBoundary(realmId, sideRealmId)
                }
            }
        }

        for(let id = 0; id < borderRegionIds.length; id ++) {
            const regionId = borderRegionIds[id]
            const realmId = this._realmTileMap.getRealmByRegion(regionId)
            const sideRegionIds = this._realmTileMap.getSideRegions(regionId)
            const boundary = getBoundary(realmId, sideRegionIds)

            this.#boundaryMap.set(id, boundary)
            this.#boundaryName.push(boundary.name)
            this.#boundaryLandscape.push(boundary.landscape)
            // TODO: use the set for unique ids and add to array
            if (! boundarySet.has(boundary.id)) {
                boundarySet.add(boundary.id)
                this.#boundaries.push(boundary.id)
            }
        }
    }

    _buildBoundary(realmId, sideRealmId) {
        const dirToSide = this._realmTileMap.getRealmDirection(realmId, sideRealmId)
        const dirFromSide = this._realmTileMap.getRealmDirection(sideRealmId, realmId)
        const plateDir = this._plateModel.getDirection(realmId)
        const sidePlateDir = this._plateModel.getDirection(sideRealmId)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        return this._boundaryTable.get(realmId, sideRealmId, dotTo, dotFrom)
    }

    get(id) {
        return this.#boundaryMap.get(id)
    }

    getName(id) {
        return this.#boundaryName[id]
    }

    getLandscape(id) {
        return this.#boundaryLandscape[id]
    }

    getLandformByLevel(id, level) {
        const boundary = this.get(id)
        let name = boundary.landscape[0].name
        for(let step of boundary.landscape) {
            if (level <= step.level) break
            name = step.name
        }
        return Landform.get(name)
    }

    getBoundaries() {
        return this.#boundaries
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

    get(realmId, sideRealmId, dotTo, dotFrom) {
        const type1 = this._plateModel.isOceanic(realmId)
                      ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = this._plateModel.isOceanic(sideRealmId)
                      ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const dir = this._parseDir(dotTo) + this._parseDir(dotFrom)
        const id = type1 + type2 + dir
        const spec = this.#codeTable.get(id)
        return this._buildBoundary(id, spec, realmId, sideRealmId)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _buildBoundary(id, spec, realmId, sideRealmId) {
        const first = spec.data[0]
        const second = spec.data.length === 1 ? first : spec.data[1]
        const realmWeight = this._plateModel.getWeight(realmId)
        const neighborRealmWeight = this._plateModel.getWeight(sideRealmId)
        const data = realmWeight > neighborRealmWeight ? first : second
        return new Boundary(id, spec.name, data.landscape)
    }
}


class Boundary {
    constructor(id, name, landscape) {
        this.id = id
        this.name = name
        this.landscape = landscape
    }
}
