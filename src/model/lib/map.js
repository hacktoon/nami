import { Random } from '/lib/random'


export class BaseMap {
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


export class BaseMapDiagram {
    constructor(map) {
        this.map = map
        this.width = map.width
        this.height = map.height
    }
}