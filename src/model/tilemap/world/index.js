import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './noise'
import { SurfaceLayer } from './geology/surface'
import { ReliefLayer } from './geology/relief'
import { TemperatureLayer } from './climatology/temperature'
import { ErosionLayer } from './geology/erosion'
import { RainLayer } from './climatology/rain'
import { HydrologyLayer } from './hydrology'
import { BiomeLayer } from './biology/biome'

import { WorldTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'WorldTileMap',
    Type.rect('rect', 'Size', {default: '64x64', min:'2x2', max:'100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class WorldTileMap extends TileMap {
    static diagram = WorldTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new WorldTileMap(params)
    }

    constructor(params) {
        super(params)
        const rect = this.rect
        const layers = {}
        layers.noise = new NoiseLayer(rect, this.seed)
        layers.surface = new SurfaceLayer(rect, layers)
        layers.relief = new ReliefLayer(rect, layers)
        layers.temperature = new TemperatureLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.erosion = new ErosionLayer(rect, layers)
        layers.hydro = new HydrologyLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        // layers.terrain = new TerrainLayer(rect, layers)
        this.layers = layers
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.layers.surface.getText(wrappedPoint),
            this.layers.relief.getText(wrappedPoint),
            this.layers.temperature.getText(wrappedPoint),
            this.layers.rain.getText(wrappedPoint),
            this.layers.biome.getText(wrappedPoint),
            this.layers.erosion.getText(wrappedPoint),
            this.layers.hydro.getText(wrappedPoint),
        ].join('\n').trim()
    }

    getDescription() {
        return [
            `Water: ${this.layers.relief.getWaterArea()}%`,
            `Rivers: ${this.layers.hydro.count}`,
        ].join(', ').trim()
    }
}
