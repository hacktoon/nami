import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class PlateFloodFill extends GenericFloodFill {
    setValue(id, regionId) {
        console.log('----> ', id, regionId);
        const boundary = this.model.regionBoundaryMap.get(regionId)
        const landform = boundary.getLandform(regionId)
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
