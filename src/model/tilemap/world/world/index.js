import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { TerrainTileMap } from '/src/model/tilemap/world/surface'

import { WorldTileMapDiagram } from './diagram'


const ID = 'WorldTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('seaLevel', 'Sea Level', {default: 150, min:1, max: 255}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class WorldTileMap extends TileMap {
    static id = ID
    static diagram = WorldTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new WorldTileMap(params)
    }

    #surfaceTileMap

    #buildTerrainTileMap() {
        return new TerrainTileMap({
            rect: this.rect.hash(),
            seed: this.seed,
            seaLevel: 150,
        })
    }

    constructor(params) {
        super(params)
        this.#surfaceTileMap = this.#buildTerrainTileMap()
    }

    get(point) {
        return this.#surfaceTileMap.get(point)
    }
}
