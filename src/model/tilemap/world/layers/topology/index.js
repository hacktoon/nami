import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'
import { buildMidpoint } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid
    // Float to define the midpoint
    #midpointGrid

    constructor(rect, layers, zoneRect) {
        this.zoneRect = zoneRect
        this.#jointGrid = Grid.fromRect(rect, () => Random.floatRange(.2, .8))
        this.#midpointGrid = Grid.fromRect(rect, () => buildMidpoint())
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
