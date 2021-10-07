import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RealmFloodFill extends GenericFloodFill {
    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    setValue(regionId) {
        this.model.regionToRealm.set(regionId, this.id)
        this.area += this.model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(neighborRegionId, regionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (neighborRealmId === this.id) return
        this.model.borderRegions.add(regionId)
        this.model.graph.setEdge(this.id, neighborRealmId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getNeighborRegions(regionId)
    }
}


export class RealmMultiFill extends GenericMultiFill {
    constructor(model) {
        super(model.origins, model, RealmFloodFill)
    }
}
