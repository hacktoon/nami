
import { buildJointGrid } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #jointGrid

    constructor(context) {
        const {rect} = context
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
