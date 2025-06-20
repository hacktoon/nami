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
    }

    get(point) {
        return {
            joint: this.#jointGrid.get(point),
        }
    }

    getJoint(point) {
        return this.#jointGrid.get(point)
    }

    getText(point) {
        const joint = this.#jointGrid.get(point).toFixed(2)
        return `Topology(joint=${joint})`
    }

    draw(props, params) {
        const { world } = props
        world.surface.draw(props, params)
    }
}
