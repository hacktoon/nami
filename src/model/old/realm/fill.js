import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'


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
    setValue(fill, region, level) {
        const currentArea = fill.context.areaMap.get(fill.id)
        const regionArea = fill.context.regionTileMap.getArea(region)
        fill.context.areaMap.set(fill.id, currentArea + regionArea)
        fill.context.regionToRealm.set(region, fill.id)
    }

    isEmpty(fill, region) {
        return ! fill.context.regionToRealm.has(region)
    }

    checkNeighbor(fill, sideRegion, originRegion) {
        if (this.isEmpty(fill, sideRegion)) return
        const realm = fill.id
        const regionToRealm = fill.context.regionToRealm
        const sideRealm = regionToRealm.get(sideRegion)
        if (realm === sideRealm) return
        const borders = fill.context.borderRegionMap.get(originRegion) ?? new Set()
        borders.add(sideRealm)
        const borderSizeMap = fill.context.borderSizeMap
        const borderSize = borderSizeMap.has(realm, sideRealm)
            ? borderSizeMap.get(realm, sideRealm)
            : 0
        borderSizeMap.set(realm, sideRealm, borderSize + 1)
        fill.context.borderRegionMap.set(originRegion, borders)
        fill.context.graph.setEdge(realm, sideRealm)
    }

    getNeighbors(fill, region) {
        return fill.context.regionTileMap.getSideRegions(region)
    }
}
