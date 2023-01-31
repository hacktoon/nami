import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'

import { buildSourceMap } from './source'
import { buildFlowMap, DIRECTION_PATTERN_MAP } from './flow'


export class RiverLayer {
    #riverPoints = new PointMap()
    #riverFlow = new PointMap()
    // map a point to a fraction point [.2, .2]
    #riverMeanders = new PointMap()
    // the amount of water in a point
    #flowRate = new PointMap()
    #riverSources = new PointSet()
    #riverMouths = new PointSet()
    #maxFlowRate = new Map()

    constructor(rect, surfaceLayer, reliefLayer, erosionLayer, rainLayer) {
        const context = {
            rect,
            surfaceLayer,
            reliefLayer,
            erosionLayer,
            rainLayer,
            riverPoints: this.#riverPoints,
            riverSources: this.#riverSources,
            riverMouths: this.#riverMouths,
            riverFlow: this.#riverFlow,
            flowRate: this.#flowRate,
            maxFlowRate: this.#maxFlowRate,
            riverMeanders: this.#riverMeanders,
        }
        buildSourceMap(context)
        buildFlowMap(context)
    }

    get riverCount() {
        return this.#riverSources.size
    }

    has(point) {
        return this.#flowRate.has(point)
    }

    get(point) {
        return {
            flow: this.#riverFlow.get(point),
            flowDirections: this.#getRiverDirections(point),
            source: this.#riverSources.has(point),
            mouth: this.#riverMouths.has(point),
            flowRate: this.#flowRate.get(point),
            meander: this.#riverMeanders.get(point),
        }
    }

    #getRiverDirections(point) {
        // return a list of direction axis
        // for each direction, draw a point to the center
        const axisOffsets = []
        const flowCode = this.#riverFlow.get(point)
        const patternBitmask = new BitMask(flowCode)
        for(let [directionId, code] of DIRECTION_PATTERN_MAP.entries()) {
            if (patternBitmask.has(code)) {
                const direction = Direction.fromId(directionId)
                axisOffsets.push(direction.axis)
            }
        }
        return axisOffsets
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const river = this.get(point)
        const attrs = [
             `source=${river.source}`,
             `mouth=${river.mouth}`,
             `flow=${river.flow}`,
             `flowRate=${river.flowRate}`,
        ].join(',')
        return `River(${attrs})`
    }

    getFlowRate(point) {
        return this.#flowRate.get(point)
    }

    getMaxFlowRate(point) {
        const riverId = this.#riverPoints.get(point)
        return this.#maxFlowRate.get(riverId)
    }

    isSource(point) {
        return this.#riverSources.has(point)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
