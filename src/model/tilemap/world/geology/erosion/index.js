import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #requiredReliefIds = new Set()
    #nextBorders = new PointSet()

    constructor(rect, surfaceLayer, reliefLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#reliefLayer = reliefLayer
        this.#nextBorders = new PointSet(reliefLayer.landBorders)
        const reliefId = 3  // basin
        this.#fillRelief(rect, 3)
        // this.#fillRelief(rect, 4)
    }

    #fillRelief(rect, requiredReliefId) {
        const origins = []
        this.#requiredReliefIds.add(requiredReliefId)
        // filter and return actual next borders (ignore +1 higher reliefs)
        const nextBorders = new PointSet()
        this.#nextBorders.forEach(point => {
            const relief = this.#reliefLayer.get(point)
            if (relief.id === requiredReliefId) {
                origins.push(point)
            } else {
                nextBorders.add(point)
            }
        })
        this.#nextBorders = nextBorders
        const context = {
            rect,
            requiredReliefIds: this.#requiredReliefIds,
            surfaceLayer: this.#surfaceLayer,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            nextBorders: this.#nextBorders,
        }
        new ErosionFill(origins, context)
        // restart with seeds
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

    hasNextBorder(point) {
        return this.#nextBorders.has(point)
    }
}
