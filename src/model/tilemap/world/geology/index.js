import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './noise'
import { SurfaceLayer } from './surface'
import { TerrainLayer } from './terrain'
import { GeologyTileMapDiagram } from './diagram'


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

    #terrainLayer
    #surfaceLayer

    constructor(params) {
        super(params)
        const noiseLayer = new NoiseLayer(this.rect, this.seed)
        const surfaceLayer = new SurfaceLayer(noiseLayer)
        const terrainLayer = new TerrainLayer(noiseLayer, surfaceLayer)
        this.#surfaceLayer = surfaceLayer
        this.#terrainLayer = terrainLayer
    }

    get(point) {
        const surface = this.getSurface(point)
        const terrain = this.getTerrain(point)
        const surfaceArea = this.#surfaceLayer.getArea(point)
        return [
            `${Point.hash(point)}`,
            `${surface.name}(area:${surfaceArea}%)`,
            `${terrain.name}`,
        ].join(' | ')
    }

    getSurface(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#surfaceLayer.get(wrappedPoint)
    }

    getTerrain(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#terrainLayer.get(wrappedPoint)
    }

    isLandBorder(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#terrainLayer.isLandBorder(wrappedPoint)
    }

    isWaterBorder(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#terrainLayer.isWaterBorder(wrappedPoint)
    }

    getBasin(point) {
        return this.#terrainLayer.getBasin(point)
    }

    getFlow(point) {
        return this.#terrainLayer.getFlow(point)
    }
}
