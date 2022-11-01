import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'

import { GeotypeLayer } from './geotype'
import { TerrainLayer } from './terrain'
// import { ErosionLayer } from './erosion'

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
    #geotypeLayer

    constructor(params) {
        super(params)
        const noiseMapSet = new NoiseMapSet(this.rect, this.seed)
        const geotypeLayer = new GeotypeLayer(noiseMapSet)
        const terrainLayer = new TerrainLayer(
            this.rect, noiseMapSet, geotypeLayer
        )

        // this.erosionLayer = new ErosionLayer(this.#terrainLayer, props)
        this.#geotypeLayer = geotypeLayer
        this.#terrainLayer = terrainLayer
    }

    get(point) {
        const geotype = this.getGeotype(point)
        const geotypeArea = this.#geotypeLayer.getArea(point)
        return [
            `${Point.hash(point)}`,
            `${geotype.name}(area:${geotypeArea}%)`,
        ].join(' | ')
    }

    getGeotype(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#geotypeLayer.get(wrappedPoint)
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

    // getTerrain(point) {
    //     const id = this.#terrainLayer.get(point)
    //     return Terrain.fromId(id)
    // }

    // getBasin(point) {
    //     return this.erosionLayer.getBasin(point)
    // }

    // getErosionDirection(point) {
    //     return this.erosionLayer.getErosionDirection(point)
    // }
}
