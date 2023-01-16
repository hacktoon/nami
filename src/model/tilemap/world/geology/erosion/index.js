import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'


export class ErosionLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #flowOriginSet = new PointSet()
    #validReliefIds = new Set()

    constructor(rect, reliefLayer) {
        const context = {
            rect,
            reliefLayer,
            flowOriginSet: this.#flowOriginSet,
            validReliefIds: this.#validReliefIds,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        buildFlowMap(context)
    }


    get basinCount() {
        return this.#basinMap.size
    }

    get(point) {
        const directionId = this.#flowMap.get(point)
        const basin = this.#basinMap.get(point)
        return basin ? {
            basin: this.#basinMap.get(point),
            flow: Direction.fromId(directionId),
        } : undefined
    }
}
