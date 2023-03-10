import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'

import { buildRiverFlowMap, DIRECTION_PATTERN_MAP } from './fill'


export class RiverLayer {
    #riverPoints = new PointMap()
    #riverFlow = new PointMap()
    // map a point to a fraction point [.2, .2]
    #riverMeanders = new PointMap()
    // the amount of water in a point
    #riverFlowRate = new PointMap()
    #riverSources = new PointSet()
    #riverMouths = new PointSet()
    #maxFlowRate = new Map()

    // TODO: create point map and id map
    constructor(rect, layers) {
        const context = {
            rect,
            layers,
            riverPoints: this.#riverPoints,
            riverMouths: this.#riverMouths,
            riverFlow: this.#riverFlow,
            flowRate: this.#riverFlowRate,
            maxFlowRate: this.#maxFlowRate,
            riverMeanders: this.#riverMeanders,
        }
        buildRiverFlowMap(context)
    }

    get count() {
        return this.#riverSources.size
    }

    has(point) {
        return this.#riverPoints.has(point)
    }

    get(point) {
        return {
            flow: this.#riverFlow.get(point),
            flowDirections: this.#getRiverDirections(point),
            source: this.#riverSources.has(point),
            mouth: this.#riverMouths.has(point),
            flowRate: this.#riverFlowRate.get(point),
            meander: this.#riverMeanders.get(point),
        }
    }

    #getRiverDirections(point) {
        // return a list of direction axis representing a river branch
        // at given direction on a 3x3 bitmask grid (cross)
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
        const hydro = this.get(point)
        const attrs = [
             `source=${hydro.source}`,
             `mouth=${hydro.mouth}`,
             `flowRate=${hydro.flowRate}`,
        ].join(',')
        return `Hydro(${attrs})`
    }

    isRiver(point) {
        return this.#riverPoints.has(point)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
