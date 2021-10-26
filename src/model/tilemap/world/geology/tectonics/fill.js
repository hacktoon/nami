import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'


class BoundaryFloodFill extends GenericFloodFill {
    setValue(id, regionId, level) {
        const boundary = this.model.boundaryModel.get(id)
        const landform = boundary.getLandform(level)
        this.model.setRegionBoundary(regionId, boundary)
        this.model.setLandform(regionId, landform)
    }

    isEmpty(neighborRegionId) {
        return !this.model.hasLandform(neighborRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getNeighborRegions(regionId)
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
