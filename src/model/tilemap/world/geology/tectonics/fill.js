import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class PlateFloodFill extends GenericFloodFill {
    isEmpty(neighborRegionId) {
        return !this.model.landformMap.has(neighborRegionId)
    }

    setValue(regionId, level) {
        const boundary = this.model.regionBoundaryMap.get(regionId)
        const landform = boundary.getLandform(level)
        this.model.deformationMap.set(regionId, boundary)
        this.model.landformMap.set(regionId, landform)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getNeighborRegions(regionId)
    }
}


export class PlateMultiFill extends GenericMultiFill {
    constructor(model) {
        const borderRegionIds = model.realmTileMap.getBorderRegions()
        super(borderRegionIds, model, PlateFloodFill)
    }

    getChance(regionId) {
        const boundary = this.model.regionBoundaryMap.get(regionId)
        return boundary.chance
    }

    getGrowth(regionId) {
        const boundary = this.model.regionBoundaryMap.get(regionId)
        return boundary.growth
    }
}
