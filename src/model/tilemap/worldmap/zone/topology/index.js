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

    getText(point) {
        const region = this.getRegion(point)
        return `Topology(region=${region})`
    }

    draw(props, params) {
        const {canvas, tilePoint, canvasPoint, tileSize, world, zone} = props
        const regionId = this.#regionGrid.get(tilePoint)
        const size = tileSize / this.size
        // render zone tiles
        const midpoint = world.topology.getMidpoint(tilePoint)
        const isBorder = world.surface.isBorder(tilePoint)
        const worldSurface = world.surface.get(tilePoint)
        const zoneMod = Point.multiplyScalar(midpoint, size)
        const zoneCanvasPoint = Point.plus(canvasPoint, zoneMod)
        let color = worldSurface.color.brighten(40)
        if (worldSurface.isWater) {
            color = isBorder ? Color.BLUE : Color.PURPLE
        } else {
            color = isBorder ? Color.RED : Color.DARKRED
        }
        zone.surface.draw(props, params)
        canvas.rect(zoneCanvasPoint, size, color.toHex())
    }
}
