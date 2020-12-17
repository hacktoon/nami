import { Schema } from '/lib/schema'


export class MapDiagram {
    static schema = new Schema()

    static create(map) {
        return new MapDiagram(map)
    }

    constructor(map) {
        this.map = map
    }

    get width() {
        return this.map.size
    }

    get height() {
        return this.map.size
    }

    get(point) {
        return this.map.reliefMap.codeMap.getColor(point)
    }
}