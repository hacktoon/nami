import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { GeologyTileMapDiagram } from './diagram'
import { TerrainModel } from './terrain'


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

    constructor(params) {
        super(params)
        this.#terrainModel = new TerrainModel(this.rect, this.seed)
    }

    get(point) {
        const terrain = this.getTerrain(point)
        const erosionLevel = this.getErosionLevel(point)
        const basin = this.getBasin(point)
        return [
            `${Point.hash(point)}`,
            `terrain=${terrain.name}`,
            `basin=${basin}, level=${erosionLevel}`,
        ].join(' | ')
    }

    getTerrain(point) {
        return this.#terrainModel.get(point)
    }

    isShore(point) {
        return this.#terrainModel.isShore(point)
    }

    getErosionLevel(point) {
        return this.#terrainModel.getErosionLevel(point)
    }

    getBasin(point) {
        return this.#terrainModel.getBasin(point)
    }

    getBasinCount() {
        return this.#terrainModel.getBasinCount()
    }

    isOcean(point) {
        return this.#terrainModel.isOcean(point)
    }
}
