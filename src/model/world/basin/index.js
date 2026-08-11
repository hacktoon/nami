import { Point } from '/src/lib/math/point'
import { Direction } from '/src/lib/math/direction'

import { buildBasinModel } from './model'
import { Basin, RiverStretch } from './type'


export class BasinLayer {
    #chunkRect
    #model

    constructor(context) {
        const {chunkRect} = context
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
            distance: this.#model.distance.get(point),
            joint: this.#model.joint.get(point),
            erosion: Direction.fromId(directionId),
            isDivide: erosionDirectionBitmask.length === 1,
        }
    }

    hasRiver(point) {
        // console.log(this.#model.river.riverGrid.get(point))
        return this.#model.river.riverGrid.get(point) !== null
    }

    getRiver(point) {
        const id = this.#model.river.riverGrid.get(point)
        const stretchId = this.#model.river.stretchMap.get(point)
        const erosionDirectionBitmask = this.#model.river.erosionDirectionBitmask.get(point)
        return {
            id,
            erosionDirectionBitmask,
            length: this.#model.river.riverLengths.get(id),
            name: this.#model.river.riverNames.get(id),
            stretch: RiverStretch.get(stretchId),
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
        if (params.get('showRivers')) {
            this.drawRivers(props, params)
        }
    }

    #drawErosionPath(props, basin) {
        const {canvasPoint, tilePoint, tileSize} = props
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

    drawRivers(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint } = props
        if (! this.hasRiver(tilePoint)) {
            return
        }
        const river = this.getRiver(tilePoint)
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const meanderPoint = Point.plus(canvasPoint, [midSize, midSize])
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        for(let direction of river.erosionDirectionBitmask) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + direction.axis[0] * midSize,
                midCanvasPoint[1] + direction.axis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, 12, hexColor)
        }
    }
}
