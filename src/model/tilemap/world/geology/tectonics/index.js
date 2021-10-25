import { BoundaryModel } from './boundary'
import { BoundaryMultiFill } from './fill'


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

    getPlates() {
        return this.realmTileMap.getRealms()
    }

    getPlateDirection(realmId) {
        return this.plateModel.getDirection(realmId)
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

    getBoundary(regionId) {
        return this.regionBoundaryMap.get(regionId)
    }

    getWeight(realmId) {
        return this.plateModel.getWeight(realmId)
    }

    getBoundary(regionId) {
        return this.regionBoundaryMap.get(regionId)
    }

    getLandformByPoint(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.#landformMap.get(regionId)
    }

    isOceanic(plateId) {
        return this.plateModel.isOceanic(plateId)
    }

    get size() {
        return this.plateModel.size
    }
}
