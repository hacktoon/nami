import { Point } from '/src/lib/geometry/point'
import { buildModel } from './model'


export class CivilZone {
    #grid

    constructor(context) {
        this.#grid = buildModel(context)
    }

    has(point) {
        return this.#grid.has(point)
    }

    draw(props, params) {
        const {zone} = props
        zone.biome.draw(props, params)
    }
}



