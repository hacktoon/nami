import { buildModel } from './model'


export class CivilChunk {
    #grid

    constructor(context) {
        this.#grid = buildModel(context)
    }

    has(point) {
        return this.#grid.has(point)
    }

    draw(props, params) {
        const {world, chunk} = props
        chunk.biome.draw(props, params)
    }
}



