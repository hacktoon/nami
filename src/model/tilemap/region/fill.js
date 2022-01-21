import { Point } from '/lib/point'
import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'


const NO_REGION = null


class RegionFloodFill extends ConcurrentFillUnit {
    setValue(id, point, level) {
        const model = this._getContext('model')
        model.regionMatrix.set(point, id)
        model.levelMatrix.set(point, level)
    }

    isEmpty(point) {
        const model = this._getContext('model')
        return model.regionMatrix.get(point) === NO_REGION
    }

    checkNeighbor(id, neighborPoint, centerPoint) {
        if (this.isEmpty(neighborPoint)) return
        const model = this._getContext('model')
        const neighborId = model.regionMatrix.get(neighborPoint)
        if (id === neighborId) return
        const [x, y] = model.regionMatrix.rect.wrap(centerPoint)
        if (! model.borderMap.has(x, y)) {
            model.borderMap.set(x, y, new Set())
        }
        // mark region when neighbor point belongs to another region
        model.borderMap.get(x, y).add(neighborId)
        model.graph.setEdge(id, neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends ConcurrentFill {
    constructor(model, params) {
        super(model.origins, RegionFloodFill, {model})
        this.params = params
    }

    getChance(id, origin) {
        return this.params.get('chance')
    }

    getGrowth(id, origin) {
        return this.params.get('growth')
    }
}
