import { BoundaryModel } from './boundary'
import { HotspotModel } from './hotspots'
import { PlateMultiFill } from './fill'
import { PlateModel } from './plate'


export class TectonicsModel {
    constructor(realmTileMap) {
        this.realmTileMap = realmTileMap
        this.landformMap = new Map()
        this.deformationMap = new Map()
        this.regionBoundaryMap = new Map()
        this.origins = this.realmTileMap.getBorderRegions()
        this.plateModel = new PlateModel(realmTileMap)
        this.boundaryModel = new BoundaryModel(
            this.plateModel, this.origins, realmTileMap)

        new PlateMultiFill(this).fill()

        this.hotspotModel = new HotspotModel(
            realmTileMap, this.plateModel, this.landformMap)
    }

    getPlates() {
        return this.realmTileMap.getRealms()
    }

    getPlateDirection(realmId) {
        return this.plateModel.getDirection(realmId)
    }

    getLandform(regionId) {
        return this.landformMap.get(regionId)
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
        return this.landformMap.get(regionId)
    }

    isOceanic(plateId) {
        return this.plateModel.isOceanic(plateId)
    }

    get size() {
        return this.plateModel.size
    }
}
