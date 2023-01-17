import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildSurveyFlowMap } from './survey.fill'


export class RiverLayer {
    #rivers = new Map()
    #riverMap = new PointMap()
    #riverPoints = new PointSet()
    #riverSources = new PointSet()

    constructor(rect, reliefLayer, rainLayer, erosionLayer) {
        const context = {
            rect,
            reliefLayer,
            erosionLayer,
            rainLayer,
            riverSources: this.#riverSources,
            riverMap: this.#riverMap
        }
        buildSurveyFlowMap(context)
    }

    get(point) {

    }

    isRiver(point) {
        return this.#riverPoints.has(point)
    }
}
