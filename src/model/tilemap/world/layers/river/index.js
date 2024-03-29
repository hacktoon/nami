import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'

import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildRiverMap } from './fill'
import { RiverStretch } from './data'


export class RiverLayer {
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPoints = new PointMap()
    // map a point to a river direction mask
    #directionMaskGrid
    // map a point to a fraction point [.2, .2]
    #riverMeanders = new PointMap()
    // map a river point to its river type
    #stretchMap = new PointMap()

    #riverMouths = new PointSet()

    constructor(rect, layers) {
        this.#directionMaskGrid = new DirectionMaskGrid(rect)
        const context = {
            rect,
            layers,
            riverNames: this.#riverNames,
            riverPoints: this.#riverPoints,
            riverMouths: this.#riverMouths,
            directionMaskGrid: this.#directionMaskGrid,
            stretchMap: this.#stretchMap,
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
        }
    }

    #getRiverDirections(point) {
        // return a list of direction axis representing a river branch
        // at given direction on a 3x3 bitmask grid (cross)
        // for each direction, draw a point to the center
        const directions = this.#directionMaskGrid.get(point)
        return directions.map(dir => dir.axis)
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
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
        const attrs = [
             `${river.id}`,
             `${river.name}${river.mouth ? ' mouth' : ''}`,
             `stretch=${river.stretch.name}`,
        ].filter(x=>x).join(',')
        return `River(${attrs})`
    }

    draw(point, props, baseColor) {
        const {canvas, canvasPoint, tileSize} = props
        const river = this.get(point)
        const riverWidth = Math.round(river.stretch.width * tileSize)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meanderOffsetPoint = Point.multiplyScalar(river.meander, tileSize)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const hexColor = river.stretch.color.toHex()
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
