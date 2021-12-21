import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'

import { Deformation } from './deformation'


export class ProvinceModel {
    /**
     * Provinces are the major regions inside a plate.
     */
    #provinceLandscape = []
    #provinceToBoundaryMap = []
    #regionToProvinceMap = new Map()
    #deformationMap = new Map()
    #boundaryIds = new Set()
    #stressMap = new Map()

    constructor(realmTileMap, plateModel, boundaryModel) {
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel
        this.boundaryModel = boundaryModel
        this._buildProvinces()
    }

    _buildProvinces() {
        const borderRegions = this.realmTileMap.getBorderRegions()
        const mapFill = new ProvinceMultiFill(this, borderRegions)
        for(let id = 0; id < borderRegions.length; id ++) {
            const regionId = borderRegions[id]
            const boundary = this.boundaryModel.getRegionBoundary(regionId)
            this.#provinceLandscape.push(boundary.landscape)
            this.#provinceToBoundaryMap.push(boundary.id)
            this.#boundaryIds.add(boundary.id)
        }
        mapFill.fill()
    }

    getBoundaryIds() {
        return Array.from(this.#boundaryIds)
    }

    getBoundary(provinceId) {
        return this.#provinceToBoundaryMap[provinceId]
    }

    setProvinceByRegion(regionId, boundaryId) {
        return this.#regionToProvinceMap.set(regionId, boundaryId)
    }

    getProvinceByRegion(regionId) {
        return this.#regionToProvinceMap.get(regionId)
    }

    getBoundaryName(regionId) {
        const provinceId = this.#regionToProvinceMap.get(regionId)
        const boundaryId = this.getBoundary(provinceId)
        return this.boundaryModel.getName(boundaryId)
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

    setStress(regionId, stress) {
        return this.#stressMap.set(regionId, stress)
    }

    getStress(regionId) {
        return this.#stressMap.get(regionId)
    }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fillId, regionId, level) {
        const deformation = this.model.getDeformationByLevel(fillId, level)
        this.model.setDeformation(regionId, deformation)
        this.model.setProvinceByRegion(regionId, fillId)
        this.model.setStress(regionId, level)
    }

    isEmpty(sideRegionId) {
        return !this.model.hasDeformation(sideRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


class ProvinceMultiFill extends ConcurrentFill {
    constructor(model, borderRegions) {
        super(borderRegions, model, ProvinceFloodFill)
    }

    getChance(fillId, regionId) {
        return .5
    }

    getGrowth(fillId, regionId) {
        return 4
    }
}
