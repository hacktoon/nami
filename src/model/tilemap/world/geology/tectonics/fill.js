import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'


class BoundaryFloodFill extends GenericFloodFill {
    setValue(id, regionId, level) {
        const landform = this.model.getLandformByLevel(id, level)
        this.model.setRegionBoundary(regionId, id)
        this.model.setLandform(regionId, landform)
        this.model.setStress(regionId, level)
    }

    isEmpty(neighborRegionId) {
        return !this.model.hasLandform(neighborRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


export class BoundaryMultiFill extends GenericMultiFill {
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
