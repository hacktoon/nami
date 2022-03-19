import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const NO_REGION = null


class RegionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        fill.context.regionMatrix.set(point, fill.id)
    }

    isEmpty(fill, point) {
        return fill.context.regionMatrix.get(point) === NO_REGION
    }

    checkNeighbor(fill, neighborPoint, centerPoint) {
        if (this.isEmpty(fill, neighborPoint)) return
        const neighborId = fill.context.regionMatrix.get(neighborPoint)
        if (fill.id === neighborId) return
        const [x, y] = fill.context.regionMatrix.rect.wrap(centerPoint)
        if (! fill.context.borderMap.has(x, y)) {
            fill.context.borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        fill.context.borderMap.get(x, y).add(neighborId)
        fill.context.graph.setEdge(fill.id, neighborId)
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, RegionFloodFill, context)
    }

    getChance(fill, origin) {
        return this.context.chance
    }

    getGrowth(fill, origin) {
        return this.context.growth
    }
}
