import { Point } from '/src/lib/geometry/point'

import { buildRiverModel } from './model'
import { RiverStretch } from './data'


export class RiverLayer {
    #chunkRect
    #model

    constructor(context) {
        this.#chunkRect = context.chunkRect
        this.#model = buildRiverModel(context)
    }

    get count() {
        return this.#model.riverNames.size
    }

    has(point) {
        return this.#model.riverGrid.get(point) !== null
    }

    get(point) {
        const id = this.#model.riverGrid.get(point)
        const stretchId = this.#model.stretchMap.get(point)
        const midpointIndex = this.#model.midpointGrid.get(point)
        const directionBitmap = this.#model.directionBitmap.get(point)
        return {
            id,
            directionBitmap,
            length: this.#model.riverLengths.get(id),
            name: this.#model.riverNames.get(id),
            midpoint: this.#chunkRect.indexToPoint(midpointIndex),
            stretch: RiverStretch.get(stretchId),
        }
    }

    is(point, type) {
        if (this.#model.riverGrid.get(point) == null) {
            return false
        }
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (this.#model.riverGrid.get(point) == null)
            return ''
        const river = this.get(point)
        const attrs = [
            `id=${river.id}`,
            `name=${river.name}`,
            `directionBitmap=${river.directionBitmap}`,
            `stretch=${river.stretch.name}`,
            `midpoint=${river.midpoint}`,
            `length=${river.length}`,
        ].filter(x=>x).join(' | ')
        return `River(${attrs})`
    }

    draw(props, params) {
        const {world} = props
        world.surface.draw(props, params)
        this.drawOnlyRivers(props, params)
    }

    drawOnlyRivers(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint } = props
        if (! params.get('showRivers') || ! this.has(tilePoint)) {
            return
        }
        const river = this.get(tilePoint)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const meanderPoint = Point.plus(canvasPoint, [midSize, midSize])
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        for(let direction of river.directionBitmap) {
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
