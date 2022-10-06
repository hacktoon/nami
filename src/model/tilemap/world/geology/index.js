import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { GeologyTileMapDiagram } from './diagram'
import { SurfaceModel } from './surface'


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

    #surfaceModel

    constructor(params) {
        super(params)
        this.#surfaceModel = new SurfaceModel(this.rect, this.seed)
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
        return this.#surfaceModel.get(point)
    }

    isShore(point) {
        return this.#surfaceModel.isShore(point)
    }

    getErosionLevel(point) {
        return this.#surfaceModel.getErosionLevel(point)
    }

    getBasin(point) {
        return this.#surfaceModel.getBasin(point)
    }

    getBasinCount() {
        return this.#surfaceModel.getBasinCount()
    }

    isOcean(point) {
        return this.#surfaceModel.isOcean(point)
    }
}
