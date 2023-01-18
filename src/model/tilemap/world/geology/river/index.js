import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildSurveyFlowMap } from './survey.fill'


export class RiverLayer {
    #rect
    #rivers = new Map()
    #riverMap = new PointMap()
    #riverPoints = new PointSet()
    #riverSources = new PointSet()
    #riverMouths = new PointSet()

    constructor(rect, reliefLayer, rainLayer, erosionLayer) {
        this.#rect = rect
        const context = {
            rect,
            reliefLayer,
            erosionLayer,
            rainLayer,
            riverSources: this.#riverSources,
            riverMouths: this.#riverMouths,
            riverMap: this.#riverMap
        }
        buildSurveyFlowMap(context)
    }

    get(point) {
        return {
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
