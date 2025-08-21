import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'

import { buildBasinModel } from './model'
import {
    Basin,
    WaterBasin
} from './type'


export class BasinLayer {
    #world
    #zoneRect
    #model

    constructor(context) {
        const {world, zoneRect} = context
        this.#world = world
        this.#zoneRect = zoneRect
        this.#model = buildBasinModel(context)
    }

    get(point) {
        const id = this.#model.basin.get(point)
        const typeId = this.#model.type.get(id)
        const directionId = this.#model.erosion.get(point)
        const midpointIndex = this.#model.midpoint.get(point)
        const directionBitmap = this.#model.directionBitmap.get(point)
        return {
            id,
            directionBitmap,
            type: Basin.parse(typeId),
            distance: this.#model.distance.get(point),
            joint: this.#model.joint.get(point),
            midpoint: this.#zoneRect.indexToPoint(midpointIndex),
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
        const isWater = this.#world.surface.isWater(tilePoint)
        const basinColor = basin.type.color
        const color = basin.isDivide ? basinColor.brighten(20) : basinColor
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (params.get('showErosion')) {
            this.#drawErosionPath(props, basin)
            // const text = basin.erosion.symbol
            // const textColor = color.invert().toHex()
            // canvas.text(canvasPoint, tileSize, text, textColor)
        }
    }

    #drawErosionPath(props, basin) {
        const {canvasPoint, tilePoint, tileSize} = props
        const color = basin.type.color.darken(30).toHex()
        const lineWidth = Math.round(props.tileSize / 20)
        // calc midpoint point on canvas
        const pixelsPerZonePoint = tileSize / this.#zoneRect.width
        const canvasMidpoint = Point.multiplyScalar(basin.midpoint, pixelsPerZonePoint)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)
        // draw line for each neighbor with a basin connection
        const directions = this.#model.directionBitmap.get(tilePoint)
        for(let direction of directions) {
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            const axisModifier = direction.axis.map(coord => {
                if (coord < 0) return 0
                if (coord > 0) return tileSize
                return Math.floor(tileSize * .5)
            })
            const canvasEdgePoint = Point.plus(canvasPoint, axisModifier)
            props.canvas.line(canvasEdgePoint, meanderPoint, lineWidth, color)
        }
    }
}
