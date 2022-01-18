import { Point } from '/lib/point'
import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


const NO_REGION = null


class RegionFloodFill extends ConcurrentFillUnit {
    setValue(id, point, level) {
        this.model.regionMatrix.set(point, id)
        this.model.levelMatrix.set(point, level)
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    checkNeighbor(id, neighborPoint, centerPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (id === neighborId) return
        const [x, y] = this.model.regionMatrix.rect.wrap(centerPoint)
        if (! this.model.borderMap.has(x, y)) {
            this.model.borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        this.model.borderMap.get(x, y).add(neighborId)
        this.model.graph.setEdge(id, neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends ConcurrentFill {
    constructor(model, params) {
        super(model.origins, model, RegionFloodFill)
        this.params = params
    }

    getChance(id, origin) {
        return this.params.get('chance')
    }

    getGrowth(id, origin) {
        return this.params.get('growth')
    }
}
