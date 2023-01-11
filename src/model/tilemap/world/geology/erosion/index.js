import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #fillQueue = new PointSet()
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
            fillQueue: this.#fillQueue,
        }
        const reliefIds = [3, 4]
        for(let reliefId of reliefIds) {
            this.#validReliefIds.add(reliefId)
            origins = this.#fillRelief(origins, context)
        }
    }

    #fillRelief(origins, context) {
        const nextOrigins = []
        // filter and return actual origins
        origins.concat(this.#fillQueue.points).forEach(point => {
            const relief = this.#reliefLayer.get(point)
            if (this.#validReliefIds.has(relief.id)) {
                nextOrigins.push(point)
                this.#fillQueue.delete(point)
            } else {
                this.#fillQueue.add(point)
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
        return this.#fillQueue.has(point)
    }
}
