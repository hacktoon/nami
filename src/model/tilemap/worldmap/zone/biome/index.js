import { Point } from '/src/lib/geometry/point'

import { Biome } from './type'
import { buildBiomeGrid } from './model'


export class BiomeZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.world = context.world
        this.#grid = buildBiomeGrid(context)
    }

    get(point) {
        let biomeId = this.#grid.get(point)
        return Biome.get(biomeId)
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


