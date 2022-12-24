import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getChance(ref, origin) {
        return this.context.chance
    }

    getGrowth(ref, origin) {
        return this.context.growth
    }

    setValue(ref, point, level) {
        this.context.regionMatrix.set(point, ref.id)
    }

    isEmpty(ref, point) {
        return this.context.regionMatrix.get(point) === EMPTY
    }

    checkNeighbor(ref, neighborPoint, centerPoint) {
        if (this.isEmpty(ref, neighborPoint)) return
        const {borderMap, regionMatrix} = this.context
        const neighborId = regionMatrix.get(neighborPoint)
        if (ref.id === neighborId) return
        const [x, y] = regionMatrix.rect.wrap(centerPoint)
        if (! borderMap.has(x, y)) {
            borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        // these operations are idempotent
        borderMap.get(x, y).add(neighborId)
        this.context.graph.setEdge(ref.id, neighborId)
    }

    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }
}
