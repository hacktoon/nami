import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid

    constructor(rect, layers) {
        this.#jointGrid = Grid.fromRect(rect, () => Random.floatRange(.2, .8))

    }

    #buildJoints(rect, layers) {
        // init points as land/water according to noise map
        return Grid.fromRect(rect, point => {

        })
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
        const topology = this.get(point)
        return `Topology(joint=${topology.joint})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
