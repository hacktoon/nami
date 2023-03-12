import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'

import { buildRiverMap, DIRECTION_PATTERN_MAP } from './fill'


export class RiverLayer {
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPoints = new PointMap()
    // map a point to a river layout code
    #riverFlow = new PointMap()
    // map a point to a fraction point [.2, .2]
    #riverMeanders = new PointMap()
    // the amount of water in a point
    #riverFlowRate = new PointMap()
    // map a river point to its river type
    #stretchType = new PointMap()
    #riverMouths = new PointSet()
    #maxFlowRate = new Map()

    // TODO: create point map and id map
    constructor(rect, layers) {
        const context = {
            rect,
            layers,
            riverNames: this.#riverNames,
            riverPoints: this.#riverPoints,
            riverMouths: this.#riverMouths,
            riverFlow: this.#riverFlow,
            riverMeanders: this.#riverMeanders,
            flowRate: this.#riverFlowRate,
            maxFlowRate: this.#maxFlowRate,
        }
        buildRiverMap(context)
    }

    get count() {
        return this.#riverMouths.size
    }

    has(point) {
        return this.#riverPoints.has(point)
    }

    get(point) {
        const id = this.#riverPoints.get(point)
        return {
            id,
            flow: this.#riverFlow.get(point),
            flowDirections: this.#getRiverDirections(point),
            name: this.#riverNames.get(id),
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
        const river = this.get(point)
        const attrs = [
             `name=${river.name}`,
             `source=${river.source ? 1 : 0}`,
             `mouth=${river.mouth ? 1 : 0}`,
             `flowRate=${river.flowRate}`,
        ].join(',')
        return `River(${attrs})`
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
