import { Point } from '/lib/point'
import { GenericMultiFill, GenericFloodFill } from '/lib/floodfill/generic'


const NO_REGION = null


class RegionFloodFill extends GenericFloodFill {
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
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(id, neighborId)
        this.model.borderMatrix.get(centerPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends GenericMultiFill {
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
