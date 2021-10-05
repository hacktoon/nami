import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RealmFloodFill extends GenericFloodFill {
    isEmpty(region) {
        return ! this.model.regionToRealm.has(region.id)
    }

    setValue(region) {
        this.model.regionToRealm.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegion.id)
        if (neighborRealmId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborRealmId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}


export class RealmMultiFill extends GenericMultiFill {
    constructor(origins, model) {
        super(origins, model, RealmFloodFill)
    }
}
