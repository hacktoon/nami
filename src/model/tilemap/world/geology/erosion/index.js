import { PairMap } from '/src/lib/map'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'

// const FILL_PHASES = [
//     Terrain.BASIN,
//     Terrain.PLAIN,
//     Terrain.PLATEAU,
//     Terrain.MOUNTAIN
// ]


export class ErosionLayer {
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #nextBorders

    constructor(rect, reliefLayer) {
        this.#nextBorders = []
        const context = {
            rect,
            reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            nextBorders: this.#nextBorders
        }
        // new ErosionFill(reliefLayer.landBorders, context)
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
