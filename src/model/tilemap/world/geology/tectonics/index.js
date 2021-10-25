import { BoundaryModel } from './boundary'
import { HotspotModel } from './hotspots'
import { PlateMultiFill } from './fill'
import { PlateMap } from './plate'


export class TectonicsModel {
    constructor(realmTileMap) {
        this.realmTileMap = realmTileMap
        this.landformMap = new Map()
        this.deformationMap = new Map()
        this.regionBoundaryMap = new Map()
        this.origins = this.realmTileMap.getBorderRegions()
        this.boundaryModel = new BoundaryModel(this.plateMap, realmTileMap)

        for(let id = 0; id < this.origins.length; id ++) {
            const regionId = this.origins[id]

            const realmId = this.realmTileMap.getRealmByRegion(regionId)
            const neighborRegionIds = this.realmTileMap.getNeighborRegions(regionId)
            for(let neighborId of neighborRegionIds) {
                const neighborRealmId = this.realmTileMap.getRealmByRegion(neighborId)
                if (neighborRealmId !== realmId) {
                    const boundary =  this.boundaryModel.get(realmId, neighborRealmId)
                    this.boundaryModel.set(id, boundary)
                    this.regionBoundaryMap.set(id, boundary)
                }
            }
        }

        new PlateMultiFill(this).fill()

        this.hotspotModel = new HotspotModel(
            realmTileMap, this.plateMap, this.landformMap)
    }

    getPlates() {
        return this.realmTileMap.getRealms()
    }

    getPlateDirection(realmId) {
        return this.plateMap.getDirection(realmId)
    }

    getLandform(regionId) {
        return this.landformMap.get(regionId)
    }

    getDeformation(regionId) {
        return this.deformationMap.get(regionId)
    }

    getWeight(realmId) {
        return this.plateMap.getWeight(realmId)
    }

    getBoundary(regionId) {
        return this.deformationMap.get(regionId)
    }

    getLandformByPoint(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.landformMap.get(regionId)
    }

    isOceanic(plateId) {
        return this.plateMap.isOceanic(plateId)
    }

    get size() {
        return this.plateMap.size
    }
}
