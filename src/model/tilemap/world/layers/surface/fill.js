import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/point/sampling'


const REGION_SCALE = 2
const GROWTH_RANGE = [1, 6]
const CHANCE_CHOICES = [.1, .3, .6]
const EMPTY = null


export function buildRegionGrid(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, REGION_SCALE)
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const ctx = {...context, regionGrid}
    new RegionFloodFill(fillMap, ctx).complete()
    return regionGrid
}


export class RegionFloodFill extends ConcurrentFill {
    getChance(fill) { return Random.choiceFrom(CHANCE_CHOICES) }

    getGrowth(fill) {
        const {layers, worldPoint} = fill.context
        // lake growth start from surrounding land tiles, avoid extra growth
        if (layers.surface.isLake(worldPoint)) { return 0 }
        return Random.int(...GROWTH_RANGE)
    }

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
