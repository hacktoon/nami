import { Grid } from '/src/lib/grid'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { FIFOCache } from '/src/lib/cache'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const REGION_SCALE = [2, 3]  // distance between region origins
const REGION_GROWTH = [2, 1]

const ZONE_CACHE = new FIFOCache(128)


export function buildRegionGridMap(context) {
    const {zoneRect, worldPoint} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, Random.choiceFrom(REGION_SCALE))
    // map a region id to its tags
    // inner | outer |
    const originMap = new Map()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const regionColorMap = new Map()
    const regionIdMap = new Map(origins.map((origin, id) => {
        regionColorMap.set(id, new Color())
        originMap.set(id, origin)
        return [id, {origin}]
    }))
    const ctx = {...context, regionIdMap, regionGrid}
    new RegionFloodFill(regionIdMap, ctx).complete()
    // const hash = Point.hash(worldPoint)
    // if (ZONE_CACHE.has(hash)) {
    //     return ZONE_CACHE.get(hash)
    // }
    // ZONE_CACHE.set(hash, regionGrid)

    return {regionGrid, originMap, regionColorMap}
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
    getChance() { return .1 }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }
}