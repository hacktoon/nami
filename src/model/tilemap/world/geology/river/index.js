import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'
import { buildRiverSourceMap } from './source.fill'
import { buildRiverShapeMap } from './shape'


export class RiverLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #riverPoints = new PointMap()
    #riverSources = new PointSet()
    #riverMouths = new PointSet()
    #rivers = new Map()

    constructor(rect, surfaceLayer, reliefLayer, rainLayer) {
        const context = {
            rect,
            surfaceLayer,
            reliefLayer,
            rainLayer,
            rivers: this.#rivers,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            riverSources: this.#riverSources,
            riverMouths: this.#riverMouths,
            riverPoints: this.#riverPoints
        }
        buildFlowMap(context)
        buildRiverSourceMap(context)
        // buildRiverShapeMap(context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    get riverCount() {
        return this.#rivers.size
    }

    get(point) {
        const directionId = this.#flowMap.get(point)
        const basin = this.#basinMap.get(point) ?? null
        if (basin === null) return {}
        return {
            basin: this.#basinMap.get(point),
            flow: Direction.fromId(directionId),
            source: this.#riverSources.has(point),
            mouth: this.#riverMouths.has(point),
        }
    }

    isSource(point) {
        return this.#riverSources.has(point)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
