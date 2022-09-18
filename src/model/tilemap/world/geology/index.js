import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { GeologyTileMapDiagram } from './diagram'
import { TerrainModel } from './terrain'
import { ErosionModel } from './erosion'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class GeologyTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    #terrainModel
    #erosionModel

    constructor(params) {
        super(params)
        this.#terrainModel = new TerrainModel(this.rect, this.seed)
        // this.#erosionModel = new ErosionModel(this.rect, this.#terrainModel)
    }

    get(point) {
        const terrain = this.getTerrain(point)
        return `Terrain=${terrain.name}`
    }

    getTerrain(point) {
        return this.#terrainModel.get(point)
    }

    isBorder(point) {
        return this.#terrainModel.isBorder(point)
    }
}
