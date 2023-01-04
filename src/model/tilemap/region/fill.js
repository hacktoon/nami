import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getChance(ref, origin) {
        return ref.context.chance
    }

    getGrowth(ref, origin) {
        return ref.context.growth
    }

    setValue(ref, point, level) {
        ref.context.regionMatrix.set(point, ref.id)
    }

    isEmpty(ref, point) {
        return ref.context.regionMatrix.get(point) === EMPTY
    }

    checkNeighbor(ref, neighborPoint, centerPoint) {
        if (this.isEmpty(ref, neighborPoint)) return
        const {borderMap, regionMatrix} = ref.context
        const neighborId = regionMatrix.get(neighborPoint)
        if (ref.id === neighborId) return
        const [x, y] = regionMatrix.rect.wrap(centerPoint)
        if (! borderMap.has(x, y)) {
            borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        // these operations are idempotent
        borderMap.get(x, y).add(neighborId)
        ref.context.graph.setEdge(ref.id, neighborId)
    }

    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }
}
