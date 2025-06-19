import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color.js'

import {
    buildMidpointIndexGrid,
    buildJointGrid,
 } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid
    // Grid of index of the midpoint in a zone rect
    #midpointIndexGrid
    #zoneRect

    constructor(context) {
        const {rect, zoneRect} = context
        this.#zoneRect = zoneRect
        this.#jointGrid = buildJointGrid(rect)
        this.#midpointIndexGrid = buildMidpointIndexGrid({rect, zoneRect})
    }

    get(point) {
        return {
            joint: this.#jointGrid.get(point),
            midpoint: this.getMidpoint(point),
        }
    }

    getJoint(point) {
        return this.#jointGrid.get(point)
    }

    getMidpoint(point) {
        const index = this.#midpointIndexGrid.get(point)
        return this.#zoneRect.indexToPoint(index)
    }

    getText(point) {
        const joint = this.#jointGrid.get(point).toFixed(2)
        const midpoint = this.getMidpoint(point)
        return `Topology(joint=${joint},midpoint=${midpoint})`
    }

    draw(props, params) {
        const { canvas, canvasPoint, world, zone, tileSize, tilePoint } = props
        const size = tileSize / this.#zoneRect.width
        const midpoint = world.topology.getMidpoint(tilePoint)
        const isBorder = world.surface.isBorder(tilePoint)
        const worldSurface = world.surface.get(tilePoint)
        const zoneMod = Point.multiplyScalar(midpoint, size)
        const zoneCanvasPoint = Point.plus(canvasPoint, zoneMod)
        world.surface.draw(props, params)
        let color
        if (worldSurface.isWater) {
            color = isBorder ? Color.BLUE : Color.PURPLE
        } else {
            color = isBorder ? Color.RED : Color.DARKRED
        }
        canvas.rect(zoneCanvasPoint, size, color.toHex())
    }
}
