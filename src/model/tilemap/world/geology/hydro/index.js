import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildSurveyFlowMap } from './survey.fill'


export class HydroLayer {
    #rivers = new Map()
    #lakes = new Map()
    #riverPoints = new PointSet()
    #riverSources = new PointSet()

    constructor(rect, reliefLayer, rainLayer, erosionLayer) {
        const context = {
            rect,
            reliefLayer,
            erosionLayer,
            rainLayer,
            riverSources: this.#riverSources
        }
        buildSurveyFlowMap(context)
    }

    get(point) {

    }

    isRiver(point) {
        return this.#riverPoints.has(point)
    }
}
