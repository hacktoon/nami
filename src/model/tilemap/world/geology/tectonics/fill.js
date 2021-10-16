import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class PlateFloodFill extends GenericFloodFill {
    isEmpty(neighborRegionId) {
        return !this.model.landformMap.has(neighborRegionId)
    }

    setValue(regionId, level) {
        const landform = this.model.boundary.getLandform(level)
        this.model.deformationMap.set(regionId, this.model.boundary)
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
}
