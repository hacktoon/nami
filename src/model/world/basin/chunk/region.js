import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/geometry/point'
import { Grid } from '/src/lib/grid'


const EMPTY = null

const REGION_SCALE = 2  // distance between region origins
const REGION_GROWTH = 1
const REGION_CHANCE = .1


export function buildRegionModel(context) {
    // Generate a boolean grid (land or water)
    const { chunkRect, chunkSize, worldPoint } = context
    const typeMap = new Map()
    const anchorMap = new Map()
    const borderRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const origins = EvenPointSampling.create(chunkRect, REGION_SCALE)
    const fillMap = new Map(origins.map((origin, id) => {
        // get origins around the center to use as path anchors
        const [x, y] = origin
        const offset = Math.floor(chunkSize / 3)
        const middle = Math.floor(chunkSize / 2)
        const insideX = x >= middle - offset && x <= middle + offset
        const insideY = y >= middle - offset && y <= middle + offset
        if (insideX && insideY) {
            // pick any region 2 tiles inside, 2 tiles distant from center
            const regionType = id % 2 == 0
            typeMap.set(id, regionType)  // not used
            anchorMap.set(id, origin)
        }
        return [id, { origin }]
    }))
    // Each chunk point has a region ID
    const regionGrid = Grid.fromRect(chunkRect, () => EMPTY)
    const fillContext = { ...context, regionGrid, borderRegions }
    new RegionFloodFill(chunkRect, fillMap, fillContext).complete()
    return { regionGrid, borderRegions, anchorMap, typeMap }
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return REGION_GROWTH }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const { chunkRect, regionGrid, borderRegions } = fill.context
        if (chunkRect.isEdge(fillPoint)) {
            borderRegions.add(fill.id)
        }
        regionGrid.set(fillPoint, fill.id)
    }
}
