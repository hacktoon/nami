import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


class RealmFloodFill extends ConcurrentFillUnit {
    /*
    the fill id is realmId
    fill regions
    */
    setValue(realmId, regionId, level) {
        this.model.regionToRealm.set(regionId, realmId)
    }

    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    getArea(regionId) {
        return this.model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(realmId, neighborRegionId, centerRegionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (realmId === neighborRealmId) return
        this.model.borderRegionSet.add(centerRegionId)
        this.model.graph.setEdge(realmId, neighborRealmId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getSideRegions(regionId)
    }
}


export class RealmMultiFill extends ConcurrentFill {
    constructor(model, params) {
        const origins = model.origins
        const regionIds = origins.map(origin => model.getRegion(origin))
        super(regionIds, model, RealmFloodFill)
        this.params = params
    }

    getChance(id, origin) {
        return this.params.get('chance')
    }

    getGrowth(id, origin) {
        return this.params.get('growth')
    }
}
