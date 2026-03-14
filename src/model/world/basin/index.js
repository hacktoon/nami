import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'

import { buildBasinModel } from './model'
import { Basin } from './type'


export class BasinLayer {
    #chunkRect
    #model

    constructor(context) {
        const {chunkRect} = context
        this.#chunkRect = chunkRect
        this.#model = buildBasinModel(context)
    }

    get(point) {
        const id = this.#model.basin.get(point)
        const typeId = this.#model.type.get(id)
        const directionId = this.#model.erosion.get(point)
        const midpointIndex = this.#model.midpoint.get(point)
        const directionBitmap = this.#model.directionBitmap.get(point)
        const riverCornerBitmap = this.#model.riverCornerBitmap.get(point)
        const waterCornerBitmap = this.#model.waterCornerBitmap.get(point)
        return {
            id,
            riverCornerBitmap,
            waterCornerBitmap,
            directionBitmap,
            type: Basin.parse(typeId),
            distance: this.#model.distance.get(point),
            joint: this.#model.joint.get(point),
            midpoint: this.#chunkRect.indexToPoint(midpointIndex),
            erosion: Direction.fromId(directionId),
            isDivide: directionBitmap.length === 1,
        }
    }

    getText(point) {
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `type=${basin.type.name}`,
            `erosion=${basin.erosion.name}`,
            `distance=${basin.distance}`,
            `joint=${basin.joint}`,
            `isDivide=${basin.isDivide}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const basin = this.get(tilePoint)
        const color = basin.type.color
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (params.get('showErosion')) {
            this.#drawErosionPath(props, basin)
            const text = basin.erosion.symbol
            const textColor = color.invert().toHex()
            canvas.text(canvasPoint, tileSize, text, textColor)
        }
    }

    #drawErosionPath(props, basin) {
        const {canvasPoint, tilePoint, tileSize} = props
        const color = basin.type.color.darken(30).toHex()
        const lineWidth = Math.round(props.tileSize / 30)
        const chunkSize = this.#chunkRect.width
        // calc midpoint point on canvas
        const pixelsPerChunkPoint = tileSize / chunkSize
        const mid = Math.floor(chunkSize / 2)
        const canvasMidpoint = Point.multiplyScalar([mid, mid], pixelsPerChunkPoint)
        const midPoint = Point.plus(canvasPoint, canvasMidpoint)
        // draw line for each neighbor with a basin connection
        const directions = this.#model.directionBitmap.get(tilePoint)
        for(let direction of directions) {
            // map the neighbor axis to a chunk edge point
            const axisModifier = direction.axis.map(coord => {
                if (coord < 0) return 0
                if (coord > 0) return tileSize
                return Math.floor(tileSize / 2)
            })
            const canvasEdgePoint = Point.plus(canvasPoint, axisModifier)
            props.canvas.line(canvasEdgePoint, midPoint, lineWidth, color)
        }
    }
}
