import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildErosionMap } from './fill'


export class ErosionLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            reliefLayer: layers.relief,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        buildErosionMap(context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    has(point) {
        return this.#flowMap.has(point)
    }

    get(point) {
        const directionId = this.#flowMap.get(point)
        const direction = Direction.fromId(directionId)
        return {
            basin: this.#basinMap.get(point),
            flow: direction,
        }
    }

    getText(point) {
        if (! this.#flowMap.has(point))
            return ''
        const erosion = this.get(point)
        const attrs = [
             `basin=${erosion.basin}`,
             `flow=${erosion.flow.name}`,
        ].join(',')
        return `Erosion(${attrs})`
    }
}
