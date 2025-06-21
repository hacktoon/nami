import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const REGION_SCALE = [2, 2, 3]
const EMPTY = null


export function buildRegionGridMap(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, Random.choiceFrom(REGION_SCALE))
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const ctx = {...context, regionGrid}
    new RegionFloodFill(fillMap, ctx).complete()
    return regionGrid
}


export class RegionFloodFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }
}
