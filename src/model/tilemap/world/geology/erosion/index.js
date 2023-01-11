import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #seedQueue = new PointSet()
    #validReliefIds = new Set()

    constructor(rect, surfaceLayer, reliefLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#reliefLayer = reliefLayer
        this.#validReliefIds.add(3)
        // filter and return actual next borders (ignore +1 higher reliefs)
        const origins = this.#reliefLayer.landBorders
        const context = {
            rect,
            validReliefIds: this.#validReliefIds,
            surfaceLayer: this.#surfaceLayer,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            seedQueue: this.#seedQueue,
        }
        const fill = new ErosionFill()
        fill.start(origins, context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    get(point) {
        const directionId = this.#flowMap.get(...point)
        const basin = this.#basinMap.get(...point)
        return basin ? {
            basin: this.#basinMap.get(...point),
            flow: Direction.fromId(directionId),
        } : undefined
    }

    debug(point) {
        return false
    }
}
