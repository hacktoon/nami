import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'

import { BoundaryModel } from './boundary'


export class TectonicsModel {
    #regionBoundaryMap = new Map()
    #landformMap = new Map()

    constructor(realmTileMap, plateModel) {
        const borderRegions = realmTileMap.getBorderRegions()
        this.boundaryModel = new BoundaryModel(borderRegions, plateModel, realmTileMap)
        this.borderRegions = borderRegions
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel
        new BoundaryMultiFill(this).fill()
    }

    getBoundaries() {
        return this.boundaryModel.getBoundaries()
    }

    setBoundaryByRegion(regionId, id) {
        const boundaryId = this.boundaryModel.getId(id)
        return this.#regionBoundaryMap.set(regionId, boundaryId)
    }

    getBoundaryByRegion(regionId) {
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
}


class BoundaryFloodFill extends GenericFloodFill {
    setValue(fillId, regionId, level) {
        const landform = this.model.boundaryModel.getLandformByLevel(fillId, level)
        this.model.setLandform(regionId, landform)
        this.model.setBoundaryByRegion(regionId, fillId)
    }

    isEmpty(sideRegionId) {
        return !this.model.hasLandform(sideRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


class BoundaryMultiFill extends GenericMultiFill {
    constructor(model) {
        super(model.borderRegions, model, BoundaryFloodFill)
    }

    getChance(fillId, regionId) {
        return .5
    }

    getGrowth(fillId, regionId) {
        return 5
    }
}
