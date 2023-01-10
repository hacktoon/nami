import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { ErosionFill } from './fill'


export class ErosionLayer {
    #surfaceLayer
    #reliefLayer
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #validReliefIds = new Set()
    #nextCells

    constructor(rect, surfaceLayer, reliefLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#reliefLayer = reliefLayer
        this.#build(rect)
    }

    #build(rect) {
        const origins = this.#reliefLayer.landBorders
        let nextCells = this.#fillRelief(rect, origins, 3)
        // nextCells = this.#fillRelief(rect, nextCells.points, 4)
        // this.#fillRelief(rect, 4)
        this.#nextCells = nextCells
    }

    #fillRelief(rect, origins, validReliefId) {
        const nextCells = new PointSet()
        this.#validReliefIds.add(validReliefId)
        // filter and return actual next borders (ignore +1 higher reliefs)
        const context = {
            rect,
            validReliefIds: this.#validReliefIds,
            surfaceLayer: this.#surfaceLayer,
            reliefLayer: this.#reliefLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            nextCells: nextCells,
        }
        const fill = new ErosionFill()
        fill.start(origins, context)
        return nextCells
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
        return this.#nextCells.has(point)
    }
}
