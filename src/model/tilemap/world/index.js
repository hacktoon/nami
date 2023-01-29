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
        const noiseLayer = new NoiseLayer(this.rect, this.seed)
        this.surface = new SurfaceLayer(this.rect, noiseLayer)
        this.relief = new ReliefLayer(this.rect, noiseLayer, this.surface)
        this.temperature = new TemperatureLayer(
            this.rect, noiseLayer, this.relief
        )
        this.rain = new RainLayer(noiseLayer)
        this.erosion = new ErosionLayer(this.rect, this.surface, this.relief)
        this.river = new RiverLayer(
            this.rect, this.surface, this.relief, this.erosion, this.rain
        )
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        const surface = this.surface.get(wrappedPoint)
        const relief = this.relief.get(wrappedPoint)
        const temperature = this.temperature.get(wrappedPoint)
        const surfaceArea = this.surface.getArea(wrappedPoint)
        return [
            `${Point.hash(wrappedPoint)}`,
            `Surface(name:${surface.name}, area:${surfaceArea}%)`,
            `Relief(${relief.name})`,
            `Temperature(${temperature.name})`,
            this.river.getText(wrappedPoint),
        ].join('\n')
    }

    getDescription() {
        return `Rivers: ${this.river.riverCount}`
    }
}
