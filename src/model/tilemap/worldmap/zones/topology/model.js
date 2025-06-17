import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { FIFOCache } from '/src/lib/cache'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const REGION_SCALE = [2, 3]

const ZONE_CACHE = new FIFOCache(128)


export function buildRegionGrid(context) {
    const {zoneRect, worldPoint} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, Random.choiceFrom(REGION_SCALE))
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const ctx = {...context, regionGrid}
    new RegionFloodFill(fillMap, ctx).complete()
    const hash = Point.hash(worldPoint)
    // if (ZONE_CACHE.has(hash)) {
    //     return ZONE_CACHE.get(hash)
    // }
    // ZONE_CACHE.set(hash, regionGrid)
    return regionGrid
}


class RegionFloodFill extends ConcurrentFill {
    getChance() {
        return Random.choice(.3, .2, .1)
    }

    getGrowth() {
        return Random.choice(3, 2)
    }

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