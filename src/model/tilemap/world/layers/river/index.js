import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { BitMask } from '/src/lib/bitmask'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'

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
    // water river points
    #waterPoints = new PointSet()
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
            waterPoints: this.#waterPoints,
            riverMeanders: this.#riverMeanders,
        }
        buildRiverMap(context)
    }

    get count() {
        return this.#riverNames.size
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
            stretch: RiverStretch.get(stretchId),
            meander: this.#riverMeanders.get(point),
            hasWater: this.#waterPoints.has(point),
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

    isMouth(point) {
        return this.#riverMouths.has(point)
    }

    hasWater(point) {
        return this.#waterPoints.has(point)
    }

    is(point, type) {
        if (! this.#riverPoints.has(point)) return false
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const river = this.get(point)
        if (! river.hasWater) return ''
        const attrs = [
             `${river.id}`,
             `${river.name}`,
             river.mouth ? 'mouth' : '',
             `stretch=${river.stretch.name}`,
        ].filter(x=>x).join(',')
        return `River(${attrs})`
    }

    draw(point, props, baseColor) {
        const {canvas, canvasPoint, tileSize} = props
        const river = this.get(point)
        const isWater = this.hasWater(point)
        const riverWidth = Math.round(river.stretch.width * tileSize)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meanderOffsetPoint = Point.multiplyScalar(river.meander, tileSize)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const color = isWater ? river.stretch.color : baseColor.darken(20)
        const hexColor = color.toHex()
        // for each neighbor with a river connection
        for(let axisOffset of river.flowDirections) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + axisOffset[0] * midSize,
                midCanvasPoint[1] + axisOffset[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, hexColor)
        }
    }
}
