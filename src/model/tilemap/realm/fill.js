import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


class RealmFloodFill extends ConcurrentFillUnit {
    /*
    the fill id is realmId
    fill regions
    */
    setValue(fill, regionId, level) {
        const model = fill.context.model
        model.regionToRealm.set(regionId, fill.id)
    }

    isEmpty(fill, regionId) {
        const model = fill.context.model
        return ! model.regionToRealm.has(regionId)
    }

    getArea(fill, regionId) {
        const model = fill.context.model
        return model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(fill, neighborRegionId, centerRegionId) {
        if (this.isEmpty(fill, neighborRegionId)) return
        const model = fill.context.model
        const neighborRealmId = model.regionToRealm.get(neighborRegionId)
        if (fill.id === neighborRealmId) return
        model.borderRegionSet.add(centerRegionId)
        model.graph.setEdge(fill.id, neighborRealmId)
    }

    getNeighbors(fill, regionId) {
        const model = fill.context.model
        return model.regionTileMap.getSideRegions(regionId)
    }
}


export class RealmMultiFill extends ConcurrentFill {
    constructor(model, params) {
        const origins = model.origins
        const regionIds = origins.map(origin => model.getRegion(origin))
        super(regionIds, RealmFloodFill, {model})
        this.params = params
    }

    getChance(fill, origin) {
        return this.params.get('chance')
    }

    getGrowth(fill, origin) {
        return this.params.get('growth')
    }
}
