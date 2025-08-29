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
        const {world, zone} = props
        zone.biome.draw(props, params)
    }
}



