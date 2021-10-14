import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class PlateFloodFill extends GenericFloodFill {
    isEmpty(neighborRegionId) {
        return !this.landformMap.has(neighborRegionId)
    }

    setValue(regionId, level) {
        const landform = this.boundary.getLandform(level)
        this.boundaryMap.set(regionId, this.boundary)
        this.landformMap.set(regionId, landform)
    }

    getNeighbors(regionId) {
        return this.realmTileMap.getNeighborRegions(regionId)
    }
}


export class PlateMultiFill extends GenericMultiFill {
    constructor(model) {
        const borderRegionIds = model.realmTileMap.getBorderRegions()
        super(borderRegionIds, model, PlateFloodFill)
    }
}
