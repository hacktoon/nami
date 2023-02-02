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
import { RiverLayer } from './geology/river'
import { BiomeLayer } from './biology/biome'

import { GeologyTileMapDiagram } from './diagram'


const ID = 'WorldTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class WorldTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new WorldTileMap(params)
    }

    constructor(params) {
        super(params)
        const layers = {}
        const rect = this.rect
        layers.noise = new NoiseLayer(rect, this.seed)
        layers.surface = new SurfaceLayer(rect, layers)
        layers.relief = new ReliefLayer(rect, layers)
        layers.temperature = new TemperatureLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.erosion = new ErosionLayer(rect, layers)
        layers.river = new RiverLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        this.layer = layers
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        const surface = this.layer.surface.get(wrappedPoint)
        const relief = this.layer.relief.get(wrappedPoint)
        const temperature = this.layer.temperature.get(wrappedPoint)
        const surfaceArea = this.layer.surface.getArea(wrappedPoint)
        return [
            `(${Point.hash(wrappedPoint)})`,
            `Surface(name:${surface.name}, area:${surfaceArea}%)`,
            `Relief(${relief.name})`,
            `Temperature(${temperature.name})`,
            this.layer.rain.getText(wrappedPoint),
            this.layer.erosion.getText(wrappedPoint),
            this.layer.river.getText(wrappedPoint),
        ].join('\n').trim()
    }

    getDescription() {
        return `Rivers: ${this.layer.river.count}`
    }
}
