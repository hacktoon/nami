import { Grid } from '/src/lib/grid'
import { Color } from '/src/lib/color'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const REGION_SCALE = [2, 3]  // distance between region origins
const REGION_GROWTH = [2, 1]
const REGION_CHANCE = .1


export function buildRegionGridMap(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, Random.choiceFrom(REGION_SCALE))
    const originMap = new Map()
    const regionColorMap = new Map()
    // region ids that must be land
    const landRegions = new Set()
    // region ids that must be water
    const waterRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const regionIdMap = new Map(origins.map((origin, id) => {
        regionColorMap.set(id, new Color())
        originMap.set(id, origin)
        return [id, {origin}]
    }))
    const fillContext = {...context, regionIdMap, regionGrid, landRegions, waterRegions}
    new RegionFloodFill(regionIdMap, fillContext).complete()
    return {regionGrid, originMap, regionColorMap}
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        if (Point.equals(fillPoint, [39, 8])) {

        }
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }
}