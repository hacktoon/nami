import { Color } from '/src/lib/color.js'
import { Point } from '/src/lib/geometry/point'
import {
    buildRegionGrid,
 } from './model'


export class TopologyZone {
    #regionGrid

    constructor(context) {
        const {world, zone, zoneRect} = context
        this.world = world
        this.zone = zone
        this.size = context.zoneSize
        this.zoneRect = zoneRect
        this.#regionGrid = buildRegionGrid(context)
    }

    get(point) {
        return {
            region: this.#regionGrid.get(point),
        }
    }

    getRegion(point) {
        return this.#regionGrid.get(point)
    }

    draw(props, params) {
        // render zone tiles
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const regionId = this.getRegion(tilePoint)
        const size = tileSize / this.size
        const midpoint = world.topology.getMidpoint(tilePoint)
        const zoneMod = Point.multiplyScalar(midpoint, size)
        const zoneCanvasPoint = Point.plus(canvasPoint, zoneMod)
        const isBorder = world.surface.isBorder(tilePoint)
        let color = world.surface.isWater(tilePoint)
                    ? isBorder ? Color.BLUE : Color.PURPLE
                    : isBorder ? Color.RED : Color.DARKRED

        zone.surface.draw(props, params)

        canvas.rect(zoneCanvasPoint, size, color.toHex())
    }
}
