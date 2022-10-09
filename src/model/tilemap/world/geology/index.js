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
        const basin = this.getBasin(point)
        const flowTarget = this.getFlowTarget(point)
        return [
            `${Point.hash(point)}`,
            `terrain=${terrain.name}`,
            `basin=${basin}`,
            `flowsTo=${flowTarget && Point.hash(flowTarget) || ''}`,
        ].join(' | ')
    }

    getTerrain(point) {
        return this.#surfaceModel.get(point)
    }

    isShore(point) {
        return this.#surfaceModel.isShore(point)
    }

    getBasin(point) {
        return this.#surfaceModel.getBasin(point)
    }

    getBasinCount() {
        return this.#surfaceModel.getBasinCount()
    }

    getFlowTarget(point) {
        return this.#surfaceModel.getFlowTarget(point)
    }

    isOcean(point) {
        return this.#surfaceModel.isOcean(point)
    }

    erosionDebug() {
        return this.#surfaceModel.erosionDebug()
    }
}
