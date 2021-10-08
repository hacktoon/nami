import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RealmFloodFill extends GenericFloodFill {
    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    setValue(id, regionId) {
        this.model.regionToRealm.set(regionId, id)
    }

    checkNeighbor(id, neighborRegionId, centerRegionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (neighborRealmId === id) return
        this.model.borderRegions.add(centerRegionId)
        this.model.graph.setEdge(id, neighborRealmId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getNeighborRegions(regionId)
    }
}


export class RealmMultiFill extends GenericMultiFill {
    constructor(model) {
        const regionIds = model.origins.map(origin => {
            return model.getRegion(origin)
        })
        super(regionIds, model, RealmFloodFill)
    }
}
