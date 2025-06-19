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
        const joint = this.#jointGrid.get(point).toPrecision(2)
        const midpoint = this.getMidpoint(point)
        return `Topology(joint=${joint},midpoint=${midpoint})`
    }

    draw(props, params) {
        props.world.surface.draw(props, params)
    }
}
