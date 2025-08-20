import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import { Climate } from './data'


const HOT_RATIO = .65
const WARM_RATIO = .5
const TEMPERATE_RATIO = .3
const COLD_RATIO = .1


export class ClimateZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.#grid = buildModel(context)
    }

    get(zonePoint) {
        return Climate.parse(this.#grid.get(zonePoint))
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, zone} = props
        const zoneSize = this.size
        const size = tileSize / zoneSize
        // render zone tiles
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = this.get(zonePoint)
                // let color = zone.landmask.isLand(zonePoint) ? type.color.toHex() : '#2f367d'
                let color = type.color.toHex()
                canvas.rect(zoneCanvasPoint, size, color)
            }
        }
    }
}


function buildModel(context) {
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneClimate(noiseRect, noisePoint)
        if (noise > HOT_RATIO)       return Climate.HOT.id
        if (noise > WARM_RATIO)      return Climate.WARM.id
        if (noise > TEMPERATE_RATIO) return Climate.TEMPERATE.id
        if (noise > COLD_RATIO)      return Climate.COLD.id
        return Climate.FROZEN.id
    })
}
