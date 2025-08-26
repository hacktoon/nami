import { Point } from '/src/lib/geometry/point'

import { Biome } from './data'
import { buildModel } from './model'


export class BiomeZone {
    #grid

    constructor(context) {
        this.#grid = buildModel(context)

    }

    get(point) {
        let biomeId = this.#grid.get(point)
        return Biome.parse(biomeId)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, zone} = props
        const size = tileSize / zone.size
        // render zone tiles
        for (let x=0; x < zone.size; x++) {
            const xSize = x * size
            for (let y=0; y < zone.size; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = this.get(zonePoint)
                let color = type.color
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
        zone.river.drawRiversOnly(props, params, '#216384')
    }
}


