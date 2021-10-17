import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RealmFloodFill extends GenericFloodFill {
    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    setValue(id, regionId) {
        this.model.regionToRealm.set(regionId, id)
    }

    getArea(regionId) {
        return this.model.regionTileMap.getRegionAreaById(regionId)
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
    constructor(model, params) {
        const origins = model.origins
        const regionIds = origins.map(origin => model.getRegion(origin))
        super(regionIds, model, RealmFloodFill)
        this.params = params
    }

    getChance(origin) {
        return this.params.get('chance')
    }

    getGrowth(origin) {
        return this.params.get('growth')
    }
}
