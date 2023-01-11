import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #detectedBorders = new PointSet()
    #validReliefIds = new Set()

    constructor(rect, surfaceLayer, reliefLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#reliefLayer = reliefLayer
        this.#build(rect)

    }

    #build(rect) {
        let origins = this.#reliefLayer.landBorders
        const context = {
            rect,
            validReliefIds: this.#validReliefIds,
            surfaceLayer: this.#surfaceLayer,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            detectedBorders: this.#detectedBorders,
        }
        this.#validReliefIds.add(3)
        origins = this.#fillRelief(origins, context)
    }

    #fillRelief(origins, context) {
        const nextOrigins = []
        // filter and return actual origins
        origins.forEach(point => {
            const relief = this.#reliefLayer.get(point)
            // if (point[0] == 73 && point[1] == 54) {
            //     console.log(relief.id);
            // }
            if (this.#validReliefIds.has(relief.id)) {
                nextOrigins.push(point)
            } else {
                this.#detectedBorders.add(point)
            }
        })
        const fill = new ErosionFill()
        fill.start(nextOrigins, context)
        return nextOrigins
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
        return this.#detectedBorders.has(point)
    }
}
