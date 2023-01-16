import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'


export class ErosionLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #validReliefIds = new Set()

    constructor(rect, reliefLayer) {
        const context = {
            rect,
            reliefLayer,
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
