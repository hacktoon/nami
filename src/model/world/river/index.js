import { PointMap } from '/src/lib/geometry/point/map'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'

import { buildRiverModel, buildMidpointGrid } from './model'
import { RiverStretch } from './data'


export class RiverLayer {
    #chunkRect
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverGrid
    // grid of river midpoints
    #midpointGrid
    // map a river point to its river type
    #stretchMap
    // map a river id to its length
    #riverLengths

    constructor(context) {
        const {rect, world, chunkRect} = context
        this.#chunkRect = chunkRect
        this.world = world
        this.#midpointGrid = buildMidpointGrid(context)
        this.#stretchMap = new PointMap(rect)
        this.#riverLengths = new Map()
        const ctx = {
            ...context,
            riverLengths: this.#riverLengths,
            riverNames: this.#riverNames,
            stretchMap: this.#stretchMap
        }
        this.#riverGrid = buildRiverModel(ctx)
    }

    get count() {
        return this.#riverNames.size
    }

    has(point) {
        return this.#riverGrid.get(point) !== null
    }

    get(point) {
        const id = this.#riverGrid.get(point)
        const stretchId = this.#stretchMap.get(point)
        const midpointIndex = this.#midpointGrid.get(point)
        return {
            id,
            length: this.#riverLengths.get(id),
            name: this.#riverNames.get(id),
            midpoint: this.#chunkRect.indexToPoint(midpointIndex),
            stretch: RiverStretch.get(stretchId),
        }
    }

    is(point, type) {
        if (this.#riverGrid.get(point) == null) {
            return false
        }
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (this.#riverGrid.get(point) == null)
            return ''
        const river = this.get(point)
        const attrs = [
            `id=${river.id}`,
            `name=${river.name}`,
            `stretch=${river.stretch.name}`,
            `midpoint=${river.midpoint}`,
            `length=${river.length}`,
        ].filter(x=>x).join(' | ')
        return `River(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint, world} = props
        world.surface.draw(props, params)
        if (! params.get('showRivers') || ! this.has(tilePoint)) {
            return
        }
        const river = this.get(tilePoint)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const meanderPoint = Point.plus(canvasPoint, [midSize, midSize])
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        const basin = world.basin.get(tilePoint)
        for(let direction of basin.directionBitmap) {
            const parentPoint = Point.atDirection(tilePoint, direction)
            const isParentLand = world.surface.isLand(parentPoint)
            if (isParentLand && ! this.has(parentPoint))
                continue
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + direction.axis[0] * midSize,
                midCanvasPoint[1] + direction.axis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, 3, hexColor)
        }
    }
}
