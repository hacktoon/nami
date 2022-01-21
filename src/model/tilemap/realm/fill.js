import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


class RealmFloodFill extends ConcurrentFillUnit {
    /*
    the fill id is realmId
    fill regions
    */
    setValue(realmId, regionId, level) {
        const model = this._getContext('model')
        model.regionToRealm.set(regionId, realmId)
    }

    isEmpty(regionId) {
        const model = this._getContext('model')
        return ! model.regionToRealm.has(regionId)
    }

    getArea(regionId) {
        const model = this._getContext('model')
        return model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(realmId, neighborRegionId, centerRegionId) {
        if (this.isEmpty(neighborRegionId)) return
        const model = this._getContext('model')
        const neighborRealmId = model.regionToRealm.get(neighborRegionId)
        if (realmId === neighborRealmId) return
        model.borderRegionSet.add(centerRegionId)
        model.graph.setEdge(realmId, neighborRealmId)
    }

    getNeighbors(regionId) {
        const model = this._getContext('model')
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

    getChance(id, origin) {
        return this.params.get('chance')
    }

    getGrowth(id, origin) {
        return this.params.get('growth')
    }
}
