import {
    buildMidpointGrid,
    buildJointGrid,
 } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid
    // Float to define the midpoint in a zone grid
    #midpointGrid

    constructor(context) {
        const {rect, zoneRect} = context
        this.zoneRect = zoneRect
        this.#jointGrid = buildJointGrid(rect)
        this.#midpointGrid = buildMidpointGrid({rect, zoneRect})
    }

    get(point) {
        return {
            joint: this.#jointGrid.get(point),
            midpoint: this.#midpointGrid.get(point),
        }
    }

    getJoint(point) {
        return this.#jointGrid.get(point)
    }

    getMidpoint(point) {
        return this.#midpointGrid.get(point)
    }

    getText(point) {
        const topology = this.get(point)
        return `TopologyWorld(joint=${topology.joint},midpoint=${topology.midpoint})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
