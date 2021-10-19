import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill'


class PlateFloodFill extends GenericFloodFill {
    setValue(id, regionId, level) {
        const boundary = this.model.regionBoundaryMap.get(id)
        const landform = boundary.getLandform(level)
        this.model.deformationMap.set(regionId, boundary)
        this.model.landformMap.set(regionId, landform)
    }

    isEmpty(neighborRegionId) {
        return !this.model.landformMap.has(neighborRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getNeighborRegions(regionId)
    }
}


export class PlateMultiFill extends GenericMultiFill {
    constructor(model) {
        const regionIds = model.realmTileMap.getBorderRegions()
        super(regionIds, model, PlateFloodFill)
    }

    getChance(id, regionId) {
        const boundary = this.model.regionBoundaryMap.get(id)
        return boundary.chance
    }

    getGrowth(id, regionId) {
        const boundary = this.model.regionBoundaryMap.get(id)
        return boundary.growth
    }
}
