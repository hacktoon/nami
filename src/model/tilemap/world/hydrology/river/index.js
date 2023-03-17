import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'

import { buildRiverMap, DIRECTION_PATTERN_MAP } from './fill'
import { RiverStretch } from './data'


export class RiverLayer {
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPoints = new PointMap()
    // map a point to a river layout code
    #layoutMap = new PointMap()
    // map a point to a fraction point [.2, .2]
    #riverMeanders = new PointMap()
    // map a river point to its river type
    #stretchMap = new PointMap()
    #riverMouths = new PointSet()

    constructor(rect, layers) {
        const context = {
            rect,
            layers,
            riverNames: this.#riverNames,
            riverPoints: this.#riverPoints,
            riverMouths: this.#riverMouths,
            layoutMap: this.#layoutMap,
            stretchMap: this.#stretchMap,
            riverMeanders: this.#riverMeanders,
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
        const stretchId = this.#stretchMap.get(point)
        return {
            id,
            flowDirections: this.#getRiverDirections(point),
            name: this.#riverNames.get(id),
            mouth: this.#riverMouths.has(point),
            stretch: RiverStretch.fromId(stretchId),
            meander: this.#riverMeanders.get(point),
        }
    }

    #getRiverDirections(point) {
        // return a list of direction axis representing a river branch
        // at given direction on a 3x3 bitmask grid (cross)
        // for each direction, draw a point to the center
        const axisOffsets = []
        const layoutId = this.#layoutMap.get(point)
        const patternBitmask = new BitMask(layoutId)
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
             `mouth=${river.mouth ? 1 : 0}`,
             `stretch=${river.stretch.name}`,
        ].join(',')
        return `River(${attrs})`
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }
}
