import { PairMap } from '/src/lib/map'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'

// const FILL_PHASES = [
//     Relief.BASIN,
//     Relief.PLAIN,
//     Relief.PLATEAU,
//     Relief.MOUNTAIN
// ]


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #nextBorders

    constructor(rect, surfaceLayer, reliefLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#reliefLayer = reliefLayer
        const reliefId = 3  // basin
        this.#fillRelief(rect, reliefId)
    }

    #fillRelief(rect, requiredReliefId) {
        this.#nextBorders = []
        const context = {
            rect,
            requiredReliefId,
            surfaceLayer: this.#surfaceLayer,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            nextBorders: this.#nextBorders,
        }
        new ErosionFill(this.#reliefLayer.landBorders, context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    getBasin(point) {
        return this.#basinMap.get(...point)
    }

    getFlow(point) {
        const id = this.#flowMap.get(...point)
        return Direction.fromId(id)
    }
}
