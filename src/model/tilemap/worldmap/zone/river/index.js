import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { displace } from '/src/lib/fractal/midpointdisplacement'
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
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const zoneTileSize = tileSize / this.#zoneSize
        zone.landmask.draw(props, params)
        if (! params.get('showRivers') || tileSize < 10) return
        for (let x=0; x < this.#zoneSize; x++) {
            const xSize = x * zoneTileSize
            for (let y=0; y < this.#zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * zoneTileSize
                let zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (this.has(zonePoint)) {
                    let color = '#2f367d'
                    // if (basin.isDivide) {
                    //     color = '#4c6da8'
                    // }
                    canvas.rect(zoneCanvasPoint, zoneTileSize, color)
                }
                // if (Point.equals(basin.midpoint, zonePoint)) {
                //     canvas.rect(zoneCanvasPoint, zoneTileSize, Color.RED.toHex())
                // }
            }
        }
    }
}



