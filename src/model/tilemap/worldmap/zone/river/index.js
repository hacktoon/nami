import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { buildRiverGrid } from './model'


export class RiverZone {
    #riverGrid
    #zoneSize

    constructor(context) {
        this.#zoneSize = context.zoneSize
        this.#riverGrid = buildRiverGrid(context)
    }

    has(point) {
        return this.#riverGrid.has(point)
    }

    draw(props, params) {
        const { canvas, tilePoint, canvasPoint, tileSize, world, zone } = props
        const size = tileSize / this.#zoneSize
        // render zone tiles
        const showRiver = params.get('showRivers') && tileSize >= 8
        const river = world.river.get(tilePoint)

        zone.landmask.draw(props, params)
        for (let x=0; x < this.#zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < this.#zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (showRiver && zone.river.has(zonePoint)) {
                    let color = river.stretch.color
                    if (Point.equals(river.midpoint, zonePoint)) {
                        color = Color.RED
                    }
                    canvas.rect(zoneCanvasPoint, size, color.toHex())
                }
            }
        }
    }
}



