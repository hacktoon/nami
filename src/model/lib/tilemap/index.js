import { Random } from '/lib/base/random'


export class TileMap {
    #buildSeed(text='') {
        const seed = text.length ? text : String(Number(new Date()))
        Random.seed = seed
        return seed
    }

    constructor(params) {
        this.width = params.get('width')
        this.height = params.get('height')
        this.seed = this.#buildSeed(params.get('seed'))
    }

    get area() {
        return this.width * this.height
    }

    get(point) {
        return point
    }
}


export class TileMapDiagram {
    constructor(tilemap) {
        this.tilemap = tilemap
        this.width = tilemap.width
        this.height = tilemap.height
    }
}