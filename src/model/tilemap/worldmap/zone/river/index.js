import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { buildRiverGrid } from './model'


export class RiverZone {
    #riverGrid

    constructor(context) {
        this.#riverGrid = buildRiverGrid(context)
    }

    has(point) {
        return this.#riverGrid.has(point)
    }

    draw(props, params) {
        const {zone} = props
        zone.landmask.draw(props, params)
        this.drawRiversOnly(props, params)
    }

    drawRiversOnly(props, params, color='#2f367d') {
        const {canvas, canvasPoint, tilePoint, tileSize, world, zone} = props
        const zoneTileSize = tileSize / zone.size
        const basin = world.basin.get(tilePoint)
        if (! params.get('showRivers') || tileSize < 10) return
        for (let x=0; x < zone.size; x++) {
            const xSize = x * zoneTileSize
            for (let y=0; y < zone.size; y++) {
                const zonePoint = [y, x]
                const ySize = y * zoneTileSize
                let zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (this.has(zonePoint)) {
                    canvas.rect(zoneCanvasPoint, zoneTileSize, color)
                }
                if (Point.equals(basin.midpoint, zonePoint)) {
                    canvas.rect(zoneCanvasPoint, zoneTileSize, Color.RED.toHex())
                }
            }
        }
    }
}



