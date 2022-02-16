import { Point } from '/src/lib/point'
import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'


const NO_REGION = null


class RegionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const model = fill.context.model
        model.regionMatrix.set(point, fill.id)
        model.levelMatrix.set(point, level)
    }

    isEmpty(fill, point) {
        const model = fill.context.model
        return model.regionMatrix.get(point) === NO_REGION
    }

    checkNeighbor(fill, neighborPoint, centerPoint) {
        if (this.isEmpty(fill, neighborPoint)) return
        const model = fill.context.model
        const neighborId = model.regionMatrix.get(neighborPoint)
        if (fill.id === neighborId) return
        const [x, y] = model.regionMatrix.rect.wrap(centerPoint)
        if (! model.borderMap.has(x, y)) {
            model.borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        model.borderMap.get(x, y).add(neighborId)
        model.graph.setEdge(fill.id, neighborId)
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends ConcurrentFill {
    constructor(model, params) {
        super(model.origins, RegionFloodFill, {model})
        this.params = params
    }

    getChance(fill, origin) {
        return this.params.get('chance')
    }

    getGrowth(fill, origin) {
        return this.params.get('growth')
    }
}
