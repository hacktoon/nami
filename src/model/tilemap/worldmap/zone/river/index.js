import { Point } from '/src/lib/geometry/point'
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
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props

        const zoneSize = zone.surface.size
        const size = tileSize / zoneSize
        // render zone tiles
        const showRiver = params.get('showRivers') && tileSize >= 8
        const river = world.river.get(tilePoint)

        zone.surface.draw(props, params)
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (showRiver && zone.river.has(zonePoint)) {
                    let color = river.stretch.color
                    canvas.rect(zoneCanvasPoint, size, color.toHex())
                }
            }
        }
    }
}



