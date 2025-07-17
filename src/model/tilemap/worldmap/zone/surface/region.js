import { Grid } from '/src/lib/grid'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const REGION_SCALE = 3  // distance between region origins
const REGION_GROWTH = [2, 1]
const REGION_CHANCE = .1


export function buildRegionGridMap(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, REGION_SCALE)
    const originMap = new Map()
    const regionColorMap = new Map()
    // region type  {id: water | land}
    const regionTypes = new Map()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const regionIdMap = new Map(origins.map((origin, id) => {
        // set a color for each region
        regionColorMap.set(id, new Color())

        // set the origin for each region
        originMap.set(id, origin)
        return [id, {origin}]
    }))
    const fillContext = {
        ...context,
        regionIdMap,
        regionGrid,
        regionTypes,
    }
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
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }
}