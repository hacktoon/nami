import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class PlateFloodFill extends GenericFloodFill {
    setValue(id, regionId) {
        const bId = this.model.origins[id]
        // if (bId != regionId)
        //     console.log('----> ', id, bId, regionId)
        const boundary = this.model.regionBoundaryMap.get(bId)
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
        const regionIds = model.realmTileMap.getBorderRegions()
        super(regionIds, model, PlateFloodFill)
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
