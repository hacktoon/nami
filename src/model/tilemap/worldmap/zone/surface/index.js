import { Point } from '/src/lib/geometry/point'

import { buildGrid } from './model'

import {
    OceanSurface,
    ContinentSurface,
} from './type'


export class SurfaceZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.world = context.world
        this.#grid = buildGrid(context)
    }

    get(point) {
        const hasSurface = this.#grid.get(point)
        return hasSurface ? ContinentSurface : OceanSurface
    }

    draw(props, params) {
        const {canvas, tilePoint, canvasPoint, tileSize, world} = props
        const zoneSize = this.size
        const size = tileSize / zoneSize
        // render zone tiles
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const surface = this.get(zonePoint)
                let color = surface.color

                // if (world.surface.isBorder(tilePoint)) {
                //     color = color.darken(20)
                // }
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }
}

