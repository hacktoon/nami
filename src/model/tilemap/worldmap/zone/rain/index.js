import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import { Rain } from './data'


const WET_RATIO = .2
const SEASONAL_RATIO = .4
const DRY_RATIO = .6
const ARID_RATIO = .8


export class RainZone {
    #grid

    constructor(context) {
        this.size = context.zoneSize
        this.#grid = buildModel(context)
    }

    get(zonePoint) {
        return Rain.parse(this.#grid.get(zonePoint))
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
    const {worldPoint, world, rect, zoneRect, zoneSize} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneSize)
    const noiseRect = Rect.multiply(rect, zoneSize)
    return Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneRain(noiseRect, noisePoint)
        if (noise > ARID_RATIO)     return Rain.ARID.id
        if (noise > DRY_RATIO)      return Rain.DRY.id
        if (noise > SEASONAL_RATIO) return Rain.SEASONAL.id
        if (noise > WET_RATIO)      return Rain.WET.id
        return Rain.HUMID.id
    })
}
