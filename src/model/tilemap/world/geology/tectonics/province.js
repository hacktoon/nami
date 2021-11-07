import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'
import { Direction } from '/lib/direction'

import { Deformation } from './deformation'
import { BoundaryTable } from './boundary'


export class ProvinceModel {
    /**
     * Provinces are the major regions inside a plate.
     */
    #regionToProvinceMap = new Map()
    #provinceToBoundaryMap = new Map()
    #deformationMap = new Map()
    #provinceLandscape = []  // TODO: remove
    #provinceKeys = new Set()  // use ids instead

    constructor(realmTileMap, plateModel) {
        const borderRegions = realmTileMap.getBorderRegions()
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel
        this.boundaryTable = new BoundaryTable(plateModel)
        this._buildProvinces(borderRegions)
    }

    _buildProvinces(borderRegionIds) {
        const mapFill = new ProvinceMultiFill(this, borderRegionIds)
        for(let id = 0; id < borderRegionIds.length; id ++) {
            const regionId = borderRegionIds[id]
            const boundary = this._getRegionBoundary(regionId)
            this.#provinceToBoundaryMap.set(id, boundary.id)
            this.#provinceKeys.add(boundary.key)
            this.#provinceLandscape.push(boundary.landscape)
        }
        mapFill.fill()
    }

    _getRegionBoundary(regionId) {
        const realmId = this.realmTileMap.getRealmByRegion(regionId)
        const sideRegionIds = this.realmTileMap.getSideRegions(regionId)
        for(let sideRegionId of sideRegionIds) {
            const sideRealmId = this.realmTileMap.getRealmByRegion(sideRegionId)
            if (realmId !== sideRealmId) {
                return this._buildBoundary(realmId, sideRealmId)
            }
        }
    }

    _buildBoundary(realmId, sideRealmId) {
        const dirToSide = this.realmTileMap.getRealmDirection(realmId, sideRealmId)
        const dirFromSide = this.realmTileMap.getRealmDirection(sideRealmId, realmId)
        const plateDir = this.plateModel.getDirection(realmId)
        const sidePlateDir = this.plateModel.getDirection(sideRealmId)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        return this.boundaryTable.build(realmId, sideRealmId, dotTo, dotFrom)
    }

    getProvinceKeys() {
        return Array.from(this.#provinceKeys)
    }

    getProvinceKey(provinceId) {
        const boundaryId = this.#provinceToBoundaryMap.get(provinceId)
        const boundary = this.boundaryTable.get(boundaryId)
        return boundary.key
    }

    setProvinceByRegion(regionId, boundaryId) {
        return this.#regionToProvinceMap.set(regionId, boundaryId)
    }

    getProvinceByRegion(regionId) {
        return this.#regionToProvinceMap.get(regionId)
    }

    getName(regionId) {
        const provinceId = this.#regionToProvinceMap.get(regionId)
        const boundaryId = this.#provinceToBoundaryMap.get(provinceId)
        const boundary = this.boundaryTable.get(boundaryId)
        return boundary.name
    }

    getDeformationByLevel(id, level) {
        let name
        const landscape = this.#provinceLandscape[id]
        for(let i=0; i<landscape.length; i++) {
            name = landscape[i]
            if (level <= i)
                break
        }
        return Deformation.get(name)
    }

    hasDeformation(regionId) {
        return this.#deformationMap.has(regionId)
    }

    setDeformation(regionId, deformation) {
        return this.#deformationMap.set(regionId, deformation)
    }

    getDeformation(regionId) {
        return this.#deformationMap.get(regionId)
    }
}


class ProvinceFloodFill extends GenericFloodFill {
    setValue(fillId, regionId, level) {
        const deformation = this.model.getDeformationByLevel(fillId, level)
        this.model.setDeformation(regionId, deformation)
        this.model.setProvinceByRegion(regionId, fillId)
    }

    isEmpty(sideRegionId) {
        return !this.model.hasDeformation(sideRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


class ProvinceMultiFill extends GenericMultiFill {
    constructor(model, borderRegions) {
        super(borderRegions, model, ProvinceFloodFill)
    }

    getChance(fillId, regionId) {
        return .5
    }

    getGrowth(fillId, regionId) {
        return 5
    }
}
