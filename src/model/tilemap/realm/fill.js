import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


export class RealmMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        const regionTileMap = context.regionTileMap
        const regionIds = origins.map(origin => regionTileMap.getRegion(origin))
        super(regionIds, RealmFloodFill, context)
    }

    getChance(fill, origin) {
        return fill.context.params.get('chance')
    }

    getGrowth(fill, origin) {
        return fill.context.params.get('growth')
    }
}


class RealmFloodFill extends ConcurrentFillUnit {
    setValue(fill, regionId, level) {
        const currentArea = fill.context.areaMap.get(fill.id)
        const regionArea = fill.context.regionTileMap.getArea(regionId)
        fill.context.areaMap.set(fill.id, currentArea + regionArea)
        fill.context.regionToRealm.set(regionId, fill.id)
    }

    isEmpty(fill, regionId) {
        return ! fill.context.regionToRealm.has(regionId)
    }

    checkNeighbor(fill, neighborRegionId, centerRegionId) {
        if (this.isEmpty(fill, neighborRegionId)) return
        const regionToRealm = fill.context.regionToRealm
        const neighborRealmId = regionToRealm.get(neighborRegionId)
        if (fill.id === neighborRealmId) return
        fill.context.borderRegionSet.add(centerRegionId)
        fill.context.graph.setEdge(fill.id, neighborRealmId)
    }

    getNeighbors(fill, regionId) {
        return fill.context.regionTileMap.getSideRegions(regionId)
    }
}
