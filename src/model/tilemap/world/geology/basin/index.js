import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { buildErosionMap } from './fill'


export class BasinLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #riverSources = new PointSet()

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            riverSources: this.#riverSources,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        buildErosionMap(context)
    }

    get count() {
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
        const basin = this.get(point)
        const attrs = [
             `basin=${basin.basin}`,
             `flow=${basin.flow.name}`,
        ].join(',')
        return `Erosion(${attrs})`
    }

    isRiverSource(point) {
        return this.#riverSources.has(point)
    }
}
