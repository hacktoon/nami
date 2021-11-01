import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'
import { BoundaryModel } from './boundary'


export class TectonicsModel {
    #regionBoundaryMap = new Map()
    #landformMap = new Map()

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

    getBoundaries() {
        return this.boundaryModel.getBoundaries()
    }

    setRegionBoundary(regionId, id) {
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

    getLandformByLevel(id, level) {
        return this.boundaryModel.getLandformByLevel(id, level)
    }
}


class BoundaryFloodFill extends GenericFloodFill {
    setValue(id, regionId, level) {
        const landform = this.model.getLandformByLevel(id, level)
        this.model.setRegionBoundary(regionId, id)
        this.model.setLandform(regionId, landform)
    }

    isEmpty(neighborRegionId) {
        return !this.model.hasLandform(neighborRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


class BoundaryMultiFill extends GenericMultiFill {
    constructor(model) {
        super(model.origins, model, BoundaryFloodFill)
    }

    getChance(id, regionId) {
        return .5
    }

    getGrowth(id, regionId) {
        return 5
    }
}
