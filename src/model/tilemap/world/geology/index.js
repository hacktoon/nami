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

    constructor(params) {
        super(params)
        const noiseLayer = new NoiseLayer(this.rect, this.seed)
        this.surface = new SurfaceLayer(this.rect, noiseLayer)
        this.terrain = new TerrainLayer(noiseLayer, this.surface)
        // this.erosion = new ErosionLayer(this.rect, this.surface, this.terrain)
    }

    get(point) {
        const surface = this.surface.get(point)
        const terrain = this.terrain.get(point)
        // Change to erosion.getBasin(point)
        const basin = this.terrain.getBasin(point)
        const surfaceArea = this.surface.getArea(point)
        return [
            `${Point.hash(point)}`,
            `${surface.name}(area:${surfaceArea}%)`,
            `${terrain.name}`,
            `Basin: ${basin}`,
        ].join(' | ')
    }

    get basinCount() {
        return this.terrain.basinCount
    }
}
