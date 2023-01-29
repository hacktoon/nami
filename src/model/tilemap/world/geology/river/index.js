import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'
import { buildRiverSourceMap } from './source'
import { buildRiverMap, DIRECTION_PATTERN_MAP } from './pattern'


export class RiverLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #riverPatterns = new PointMap()
    #riverMeanders = new PointMap()
    #riverFlowRate = new PointMap()
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
            riverPatterns: this.#riverPatterns,
            riverFlowRate: this.#riverFlowRate,
            // TODO
            riverMeanders: this.#riverMeanders,
        }
        buildFlowMap(context)
        buildRiverSourceMap(context)
        buildRiverMap(context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    get riverCount() {
        return this.#rivers.size
    }

    has(point) {
        return this.#basinMap.has(point)
    }

    get(point) {
        const directionId = this.#flowMap.get(point)
        const direction = Direction.fromId(directionId)
        return {
            basin: this.#basinMap.get(point),
            flow: direction,
            source: this.#riverSources.has(point),
            mouth: this.#riverMouths.has(point),
            pattern: this.#riverPatterns.get(point),
        }
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const river = this.get(point)
        const attrs = [
             `basin=${river.basin}`,
             `flow=${river.flow.name}`,
             `source=${river.source}`,
             `mouth=${river.mouth}`,
             `pattern=${river.pattern}`,
        ].join(',')
        return `River(${attrs})`
    }

    getPattern(point) {
        /*
        return a list of direction axis
        for each direction, draw a point to the center
        */
       const directions = []
       const code = this.#riverPatterns.get(point)
       const patternBitmask = new BitMask(code)
        for(let [directionId, code] of DIRECTION_PATTERN_MAP.entries()) {
            if (patternBitmask.has(code)) {
                const direction = Direction.fromId(directionId)
                directions.push(direction.axis)
            }
        }
        return directions
    }

    isSource(point) {
        return this.#riverSources.has(point)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
