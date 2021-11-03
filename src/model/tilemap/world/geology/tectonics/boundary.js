import { Direction } from '/lib/direction'

import { Landform } from '../landform'
import { BOUNDARY_TABLE } from './table'


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


export class BoundaryModel {
    #boundaries = []
    #boundaryName = []
    #boundaryLandscape = []

    constructor(borderRegionIds, plateModel, realmTileMap) {
        this._plateModel = plateModel
        this._realmTileMap = realmTileMap
        this._boundaryTable = new BoundaryTable(plateModel)
        this._buildBoundaries(borderRegionIds)
    }

    _buildBoundaries(borderRegionIds) {
        for(let id = 0; id < borderRegionIds.length; id ++) {
            const regionId = borderRegionIds[id]
            const [boundaryName, landscape] = this._getRegionBoundary(regionId)
            this.#boundaries.push(id)
            this.#boundaryName.push(boundaryName)
            this.#boundaryLandscape.push(landscape)
        }
    }

    _getRegionBoundary(regionId) {
        const realmId = this._realmTileMap.getRealmByRegion(regionId)
        const sideRegionIds = this._realmTileMap.getSideRegions(regionId)
        for(let sideRegionId of sideRegionIds) {
            const sideRealmId = this._realmTileMap.getRealmByRegion(sideRegionId)
            if (realmId !== sideRealmId) {
                return this._buildBoundary(realmId, sideRealmId)
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

    getBoundaries() {
        return this.#boundaries
    }

    getName(id) {
        return this.#boundaryName[id]
    }

    getLandform(id, level) {
        let name
        const landscape = this.#boundaryLandscape[id]
        for(let i=0; i<landscape.length; i++) {
            name = landscape[i]
            if (level <= i)
                break
        }
        return Landform.get(name)
    }
}


class BoundaryTable {
    /*
        Reads the boundary table and translates to manageable data.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #codeTable = new Map() // maps numeric id to boundary config

    constructor(plateModel) {
        this._plateModel = plateModel
        BOUNDARY_TABLE.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    get(realmId, sideRealmId, dotTo, dotFrom) {
        const isPlateOceanic = this._plateModel.isOceanic(realmId)
        const isSidePlateOceanic = this._plateModel.isOceanic(sideRealmId)
        const type1 = isPlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = isSidePlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const dir = this._parseDir(dotTo) + this._parseDir(dotFrom)
        const spec = this.#codeTable.get(type1 + type2 + dir)
        const landscape = this._getLandscape(spec, realmId, sideRealmId)
        return [spec.name, landscape]
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _getLandscape(spec, realmId, sideRealmId) {
        const first = spec.data[0]
        const second = spec.data.length === 1 ? first : spec.data[1]
        const realmWeight = this._plateModel.getWeight(realmId)
        const neighborRealmWeight = this._plateModel.getWeight(sideRealmId)
        const data = realmWeight > neighborRealmWeight ? first : second
        return data.landscape
    }
}
