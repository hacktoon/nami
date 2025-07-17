import { Point } from '/src/lib/geometry/point'

import { buildModel } from './model'
import {
    OceanSurface,
    ContinentSurface,
} from './type'


export class SurfaceZone {
    #landMaskGrid

    constructor(context) {
        this.size = context.zoneSize
        this.world = context.world
        const {landMaskGrid, regionGrid, originMap, regionColorMap} = buildModel(context)
        this.#landMaskGrid = landMaskGrid
        // DEBUG
        this._regionGrid = regionGrid
        this._regionColorMap = regionColorMap
    }

    get(zonePoint) {
        const isLand = this.#landMaskGrid.get(zonePoint)
        const surface = isLand ? ContinentSurface : OceanSurface
        let color = surface.color
        return {
            color
        }
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
                if (Point.equals(tilePoint, [42, 4])) {
                    const regionId = this._regionGrid.get(zonePoint)
                    const regionColor = this._regionColorMap.get(regionId)
                    color = regionColor
                }

                // if (world.surface.isBorder(tilePoint)) {
                //     color = color.darken(20)
                // }
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }
}

