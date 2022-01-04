import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'


export class ContinentModel {
    #plateModel
    #regionTileMap
    #plateContinentMap

    constructor(regionTileMap, plateModel) {
        this.#plateModel = plateModel
        this.#regionTileMap = regionTileMap
        this.#plateContinentMap = new Map()
    }

    _build() {
        const regionIds = this.#regionTileMap.getRegions()
        const visitedRegions = new Set()

    }

}


class ContinentConcurrentFill extends ConcurrentFill {
    constructor(model, params) {
        const origins = model.origins
        const regionIds = origins.map(origin => model.getRegion(origin))
        super(regionIds, model, ContinentFloodFill)
        this.params = params
    }

    getChance(id, origin) {
        return this.params.get('chance')
    }

    getGrowth(id, origin) {
        return this.params.get('growth')
    }
}


class ContinentFloodFill extends ConcurrentFillUnit {
    setValue(plateId, level) {
        this.model.regionToRealm.set(regionId, plateId)
    }

    isEmpty(regionId) {
        return ! this.model.regionToRealm.has(regionId)
    }

    getArea(regionId) {
        return this.model.regionTileMap.getRegionAreaById(regionId)
    }

    checkNeighbor(plateId, neighborRegionId, centerRegionId) {
        if (this.isEmpty(neighborRegionId)) return
        const neighborRealmId = this.model.regionToRealm.get(neighborRegionId)
        if (plateId === neighborRealmId) return
        this.model.borderRegionSet.add(centerRegionId)
        this.model.graph.setEdge(plateId, neighborRealmId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getSideRegions(regionId)
    }
}
