import { Random } from '/lib/random'


export class GenericMap {
    constructor(params) {
        this.width = params.get('width')
        this.height = params.get('height')
        this.seed = this.#buildSeed(params.get('seed'))
    }

    #buildSeed(text='') {
        const seed = text.length ? text : String(Number(new Date()))
        Random.seed = seed
        return seed
    }
}
