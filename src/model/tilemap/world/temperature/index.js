import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { TemperatureTileMapDiagram } from './diagram'
import { TemperatureModel } from './model'


const ID = 'TemperatureTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class TemperatureTileMap extends TileMap {
    static id = ID
    static diagram = TemperatureTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TemperatureTileMap(params)
    }

    #model

    constructor(params) {
        super(params)
        this.#model = new TemperatureModel(this.rect, this.seed)
    }

    get(point) {
        return this.#model.get(point)
    }

    getColor(point) {
        return this.get(point).color
    }
}
