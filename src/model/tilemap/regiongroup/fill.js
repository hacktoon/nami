import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RegionGroupFloodFill extends GenericFloodFill {
    isEmpty(region) {
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroupId = this.model.regionToGroup.get(neighborRegion.id)
        if (neighborGroupId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborGroupId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}


export class RegionGroupMultiFill extends GenericMultiFill {
    constructor(origins, model) {
        super(origins, model, RegionGroupFloodFill)
    }
}
