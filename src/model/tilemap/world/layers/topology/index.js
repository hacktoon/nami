import {
    buildMidpointGrid,
    buildJointGrid,
 } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid
    // Float to define the midpoint in a zone grid
    #midpointGrid

    constructor(rect, layers, zoneRect) {
        this.zoneRect = zoneRect
        this.#jointGrid = buildJointGrid(rect)
        this.#midpointGrid = buildMidpointGrid({rect, zoneRect})
    }

    get(point) {
        return {
            joint: this.#jointGrid.get(point),
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
        return `Topology(joint=${topology.joint})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
