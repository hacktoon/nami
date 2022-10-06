import { Random } from '/src/lib/random'


export class TileMap {
    #buildSeed(text='') {
        const seed = text.length ? text : String(Number(new Date()))
        Random.seed = seed
        return seed
    }

    constructor(params) {
        this.rect = params.get('rect')
        this.seed = this.#buildSeed(params.get('seed'))
    }

    get area() {
        return this.rect.area
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
        this.rect = tileMap.rect
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