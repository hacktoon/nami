import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'
import { buildSurveyFlowMap } from './survey.fill'
import { buildStructMap } from './struct'


export class RiverLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()

    #rivers = new Map()
    #riverMap = new PointMap()
    #riverSources = new PointSet()
    #riverMouths = new PointSet()

    constructor(rect, reliefLayer, rainLayer) {
        const context = {
            rect,
            reliefLayer,
            rainLayer,
            rivers: this.#rivers,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            riverSources: this.#riverSources,
            riverMouths: this.#riverMouths,
            riverMap: this.#riverMap
        }
        buildFlowMap(context)
        buildSurveyFlowMap(context)
        buildStructMap(context)
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
            source: this.#riverSources.has(point),
            mouth: this.#riverMouths.has(point),
        } : undefined
    }

    isSource(point) {
        return this.#riverSources.has(point)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
