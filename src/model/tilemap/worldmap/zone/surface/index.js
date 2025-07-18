import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Color } from '/src/lib/color'

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
        const {landMaskGrid, regionGrid, regionDirMap} = buildModel(context)
        this.#landMaskGrid = landMaskGrid
        // DEBUG
        this._regionGrid = regionGrid
        this._regionDirMap = regionDirMap
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
                // if (Point.equals(tilePoint, [42, 4])) {
                //     const regionId = this._regionGrid.get(zonePoint)
                //     const direction = Direction.fromId(this._regionDirMap.get(regionId))
                //     const c = direction.id + 1
                //     color = new Color(c * 10, c * 20, c * 30)
                // }
                if (world.surface.isBorder(tilePoint)) {
                    if (world.surface.isWater(tilePoint)) {
                        color = color.average(Color.BLUE)
                    } else color = color.average(Color.DARKGREEN)
                    color = color.darken(20)

                }
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }
}

