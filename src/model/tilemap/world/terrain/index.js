import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { TerrainTileMapDiagram } from './diagram'
import { TerrainModel } from './model'


const ID = 'TerrainTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x150'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class TerrainTileMap extends TileMap {
    static id = ID
    static diagram = TerrainTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TerrainTileMap(params)
    }

    #terrainModel

    constructor(params) {
        super(params)
        this.#terrainModel = new TerrainModel(this.rect, this.seed)
    }

    get(point) {
        const outline = this.#terrainModel.get(point)
        return `Terrain=${outline.name}`
    }

    getTerrain(point) {
        return this.#terrainModel.get(point)
    }
}
