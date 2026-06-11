import { EvenPointSampling } from '/src/lib/math/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/math/point'
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
        // get origins to use as path anchors, except for the edges
        // const middle = Math.round(chunkSize / 2)
        // const distance = Point.manhattanDistance(origin, [middle, middle])
        // if(worldPoint[0] == 19 && worldPoint[1] == 19) {
        //     // console.log(Point.chebyshevDistance(origin, [middle, middle]))
        //     console.log(origin, distance, distance < 7)
        // }
        // if (distance < 6) {
        const [x, y] = origin
        if (! chunkRect.isEdge(origin)) {
        // if (x > 1 && x < chunkSize - 2 && y > 1 && y < chunkSize - 2) {
            const regionType = id % 2 == 0
            typeMap.set(id, regionType)  // not used
            anchorMap.set(id, origin)
        }
        return [id, { origin }]  // Map entry
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
