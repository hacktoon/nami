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

    hasFeature(regionId) {
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


class ProvinceMultiFill extends ConcurrentFill {
    constructor(model, borderRegions) {
        super(borderRegions, ProvinceFloodFill, {model})
    }

    getChance(fill, regionId) {
        return .5
    }

    getGrowth(fill, regionId) {
        return 4
    }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fill, regionId, level) {
        const model = fill.context.model
        const deformation = model.getDeformationByLevel(fill.id, level)
        model.setDeformation(regionId, deformation)
        model.setProvinceByRegion(regionId, fill.id)
        model.setStress(regionId, level)
    }

    isEmpty(fill, sideRegionId) {
        const model = fill.context.model
        return !model.hasFeature(sideRegionId)
    }

    getNeighbors(fill, regionId) {
        const model = fill.context.model
        return model.realmTileMap.getSideRegions(regionId)
    }
}
