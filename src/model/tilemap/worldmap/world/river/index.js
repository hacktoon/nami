import { PointMap } from '/src/lib/geometry/point/map'
import { Point } from '/src/lib/geometry/point'

import { buildRiverModel, buildMidpointGrid } from './model'
import { RiverStretch } from './data'


export class RiverLayer {
    #zoneRect
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPointGrid
    // grid of river midpoints
    #midpointGrid
    // map a river point to its river type
    #stretchMap

    constructor(context) {
        const {rect, world, zoneRect} = context
        this.#zoneRect = zoneRect
        this.world = world
        this.#midpointGrid = buildMidpointGrid(context)
        this.#stretchMap = new PointMap(rect)
        const _context = {
            ...context,
            riverNames: this.#riverNames,
            stretchMap: this.#stretchMap
        }
        this.#riverPointGrid = buildRiverModel(_context)
    }

    get count() {
        return this.#riverNames.size
    }

    has(point) {
        return this.#riverPointGrid.get(point) !== null
    }

    get(point) {
        const id = this.#riverPointGrid.get(point)
        const stretchId = this.#stretchMap.get(point)
        const midpointIndex = this.#midpointGrid.get(point)
        return {
            id,
            name: this.#riverNames.get(id),
            midpoint: this.#zoneRect.indexToPoint(midpointIndex),
            stretch: RiverStretch.get(stretchId),
        }
    }

    is(point, type) {
        if (this.#riverPointGrid.get(point) == null) {
            return false
        }
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (this.#riverPointGrid.get(point) == null)
            return ''
        const river = this.get(point)
        const attrs = [
             `id=${river.id}`,
             `name=${river.name}`,
             `stretch=${river.stretch.name}`,
             `midpoint=${river.midpoint}`,
        ].filter(x=>x).join(',')
        return `River(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        props.world.surface.draw(props, params)
        if (! this.has(tilePoint)) {
            return
        }
        const river = this.get(tilePoint)
        const riverWidth = Math.round(river.stretch.width * tileSize)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meanderPoint = Point.plus(canvasPoint, [midSize, midSize])
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        const basin = props.world.basin.get(tilePoint)
        for(let direction of basin.directionBitmap) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + direction.axis[0] * midSize,
                midCanvasPoint[1] + direction.axis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, hexColor)
        }
    }
}
