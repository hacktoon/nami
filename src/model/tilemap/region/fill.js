import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getChance(ref) {
        return ref.context.chance
    }

    getGrowth(ref) {
        return ref.context.growth
    }

    canFill(ref, point, center, level) {
        return ref.context.regionMatrix.get(point) === EMPTY
    }

    onFill(ref, point, center, level) {
        // center is the seed at center
        // point is neighbor being filled
        ref.context.regionMatrix.set(point, ref.id)
        ref.context.levelMatrix.set(point, level)
    }

    onBlockedFill(ref, neighbor, center, level) {
        const {borderMap, regionMatrix, graph} = ref.context
        const neighborRegionId = regionMatrix.get(neighbor)
        // it's same fill, do nothing
        if (ref.id === neighborRegionId) { return }
        const [x, y] = regionMatrix.rect.wrap(center)
        // create new set of neighbor regions by id
        // set the center as border since the neighbor isn't same fill
        if (! borderMap.has(x, y)) {
            borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        // these operations are idempotent
        borderMap.get(x, y).add(neighborRegionId)
        graph.setEdge(ref.id, neighborRegionId)
    }

    getNeighbors(ref, point) {
        return Point.adjacents(point)
    }
}
