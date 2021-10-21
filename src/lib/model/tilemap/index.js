import { Random } from '/lib/random'
import { Rect } from '/lib/number'


export class TileMap {
    #buildSeed(text='') {
        const seed = text.length ? text : String(Number(new Date()))
        Random.seed = seed
        return seed
    }

    constructor(params) {
        this.width = params.get('width')
        this.height = params.get('height')
        this.rect = new Rect(this.width, this.height)
        this.seed = this.#buildSeed(params.get('seed'))
    }

    get area() {
        return this.width * this.height
    }

    get(point) {
        return point
    }

    getDescription() {
        return `Area: ${this.area}`
    }
}


export class TileMapDiagram {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.width = tileMap.width
        this.height = tileMap.height
    }

    get(point) {
        if ((point[0] + point[1]) % 2 === 0)
            return '#AAA'
        return '#EEE'
    }

    getText(point) {
        return
    }

    getMark(point) {
        return
    }
}