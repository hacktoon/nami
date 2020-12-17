import { Schema } from '/lib/schema'
import { Color } from '/lib/color'


export class MapDiagram {
    static schema = new Schema()

    static create(map) {
        return new MapDiagram(map)
    }

    constructor(map) {
        this.map = map
    }

    get width() {
        return this.map.width
    }

    get height() {
        return this.map.height
    }

    get(point) {
        const value = parseInt(this.map.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}