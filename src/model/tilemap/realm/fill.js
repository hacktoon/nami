import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


class RealmFloodFill extends GenericFloodFill {
    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    setValue(realmId, regionId) {
        this.model.regionToRealm.set(regionId, realmId)
    }

    getArea(regionId) {
        return this.model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(realmId, neighborRegionId, centerRegionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (neighborRealmId === realmId) return
        this.model.borderRegions.add(centerRegionId)
        this.model.graph.setEdge(realmId, neighborRealmId)
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
