import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #reliefLayer
    #rainLayer
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #flowOrigins = new PointSet()
    #validReliefIds = new Set()

    constructor(rect, reliefLayer, rainLayer) {
        this.#reliefLayer = reliefLayer
        this.#rainLayer = rainLayer
        this.#buildFlowMap(rect)
    }

    #buildFlowMap(rect) {
        const fillQueue = new PointSet()
        const context = {
            rect,
            fillQueue,
            validReliefIds: this.#validReliefIds,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        // start filling from land borders
        let origins = this.#reliefLayer.landBorders
        for(let reliefId of this.#reliefLayer.getIdsByErosionStep()) {
            this.#validReliefIds.add(reliefId)
            origins = this.#fillRelief(origins, fillQueue, context)
        }
    }

    #fillRelief(origins, fillQueue, context) {
        const nextOrigins = []
        // filter and return actual origins
        origins.concat(fillQueue.points).forEach(point => {
            const relief = this.#reliefLayer.get(point)
            if (this.#validReliefIds.has(relief.id)) {
                nextOrigins.push(point)
                fillQueue.delete(point)
            } else {
                fillQueue.add(point)
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
        const directionId = this.#flowMap.get(point)
        const basin = this.#basinMap.get(point)
        return basin ? {
            basin: this.#basinMap.get(point),
            flow: Direction.fromId(directionId),
        } : undefined
    }
}
