
import { buildRoadJointGrid, buildRiverJointGrid } from './model'


export class TopologyLayer {
    // Float used to connect with adjacent tiles
    #roadJointGrid
    #riverJointGrid

    constructor(context) {
        const {rect} = context
        this.#roadJointGrid = buildRoadJointGrid(rect)
        this.#riverJointGrid = buildRiverJointGrid(rect)
    }

    get(point) {
        return {
            road: this.#roadJointGrid.get(point),
            river: this.#riverJointGrid.get(point),
        }
    }

    getText(point) {
        const road = this.#roadJointGrid.get(point).toFixed(1)
        const river = this.#riverJointGrid.get(point).toFixed(1)
        return `Topology(roadJoint=${road},riverJoint=${river})`
    }

    draw(props, params) {
        const { world } = props
        world.surface.draw(props, params)
    }
}
