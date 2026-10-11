import { Point } from '/src/lib/math/point'
import { Direction } from '/src/lib/math/direction'

import { buildBasinModel } from './model'
import { Basin, StretchType } from './type'


export class BasinLayer {
    #chunkRect
    #model

    constructor(context) {
        const { chunkRect } = context
        this.#chunkRect = chunkRect
        this.#model = buildBasinModel(context)
    }

    get riverCount() {
        return this.#model.river.riverNames.size
    }

    get(point) {
        const id = this.#model.basin.get(point)
        const typeId = this.#model.type.get(id)
        const directionId = this.#model.erosion.get(point)
        const erosionDirectionBitmask = this.#model.erosionDirectionBitmask.get(point)
        return {
            id, erosionDirectionBitmask,
            type: Basin.parse(typeId),
            joint: this.#model.joint.get(point),
            erosion: Direction.fromId(directionId),
            isDivide: erosionDirectionBitmask.length === 1,
        }
    }

    getRivers(point) {
        const { riverMap } = this.#model.river
        const rivers = []
        const directions = this.#model.erosionDirectionBitmask.get(point)
        for (let direction of directions) {
            if (riverMap.has(point, direction)) {
                const id = riverMap.get(point, direction)
                const stretchId = 1  //this.#model.river.riverStretchMap.get(point)
                const stretch = StretchType.parse(stretchId)
                rivers.push({ id, direction, stretch })
            }
        }
        return rivers
    }

    getText(point) {
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `type=${basin.type.name}`,
            `erosion=${basin.erosion.name}`,
            `joint=${basin.joint}`,
            `isDivide=${basin.isDivide}`,
        ].join(',')
        const d = this.getRivers(point).map(r => `${r.id}|${r.dir.name}| ${r.stretch.name}`)
        return `Basin(${attrs}) ${d.join(', ')}`
    }

    draw(props, params) {
        const { canvas, canvasPoint, tileSize, tilePoint } = props
        const basin = this.get(tilePoint)
        const color = basin.type.color
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (params.get('showErosion')) {
            this.#drawErosionPath(props, basin)
            const text = basin.erosion.symbol
            const textColor = color.invert().toHex()
            canvas.text(canvasPoint, tileSize, text, textColor)
        }
        if (params.get('showRivers')) {
            this.drawRivers(props, params)
        }
    }

    #drawErosionPath(props, basin) {
        const { canvasPoint, tilePoint, tileSize } = props
        const color = basin.type.color.darken(20).toHex()
        const lineWidth = Math.round(props.tileSize / 12)
        const chunkSize = this.#chunkRect.width
        // calc midpoint point on canvas
        const pixelsPerChunkPoint = tileSize / chunkSize
        const mid = Math.floor(chunkSize / 2)
        const canvasMidpoint = Point.multiplyScalar([mid, mid], pixelsPerChunkPoint)
        const midPoint = Point.plus(canvasPoint, canvasMidpoint)
        // draw line for each neighbor with a basin connection
        const directions = this.#model.erosionDirectionBitmask.get(tilePoint)
        for (let direction of directions) {
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

    drawRivers(props, params) {
        const { canvas, canvasPoint, tileSize, tilePoint } = props
        const rivers = this.getRivers(tilePoint)
        if (rivers.length == 0) {
            return
        }
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const meanderPoint = Point.plus(canvasPoint, [midSize, midSize])
        // for each neighbor with a river connection
        for (let { direction, stretch} of rivers) {
            const hexColor = stretch.color.toHex()
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + direction.axis[0] * midSize,
                midCanvasPoint[1] + direction.axis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, stretch.width, hexColor)
        }
    }
}
