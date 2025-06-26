import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/geometry/point'


const SCHEMA = new Schema(
    'Audio',
    Type.text('seed', 'Seed', {default: ''})
)


export class Audio {
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new NoiseTileMap(params)
    }

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = NoiseTileMap.schema.buildFrom(map)
        return new NoiseTileMap(params)
    }

    constructor(params) {
        super(params)
        this.params = params
    }

}
