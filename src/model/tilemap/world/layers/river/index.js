import { PointSet } from '/src/lib/point/set'
import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'

import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildRiverMap } from './fill'
import { RiverStretch } from './data'


export class RiverLayer {
    #zoneRect
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPoints
    // map a point to a river direction mask
    #directionMaskGrid
    // map a river point to its river type
    #stretchMap

    #riverMouths

    constructor(rect, layers, zoneRect) {
        this.#zoneRect = zoneRect
        this.layers = layers
        this.#directionMaskGrid = new DirectionMaskGrid(rect)
        this.#riverMouths = new PointSet(rect)
        this.#stretchMap = new PointMap(rect)
        const context = {
            rect,
            layers,
            riverNames: this.#riverNames,
            riverMouths: this.#riverMouths,
            directionMaskGrid: this.#directionMaskGrid,
            stretchMap: this.#stretchMap,
        }
        this.#riverPoints = buildRiverMap(context)
    }

    get count() {
        return this.#riverNames.size
    }

    has(point) {
        return this.#riverPoints.get(point) !== null
    }

    get(point) {
        const id = this.#riverPoints.get(point)
        const stretchId = this.#stretchMap.get(point)
        return {
            id,
            erosionAxis: this.layers.basin.getErosionPathAxis(point),
            name: this.#riverNames.get(id),
            mouth: this.#riverMouths.has(point),
            stretch: RiverStretch.get(stretchId),
        }
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }

    is(point, type) {
        if (this.#riverPoints.get(point) == null) {
            return false
        }
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (this.#riverPoints.get(point) == null)
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
        const offset = Math.round(tileSize / 10)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meander = this.layers.basin.getMidpoint(point)
        const meanderOffsetPoint = Point.multiplyScalar(meander, tileSize / this.#zoneRect.width)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        for(let flowAxis of river.erosionAxis) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + flowAxis[0] * midSize,
                midCanvasPoint[1] + flowAxis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, hexColor)
        }
    }
}
