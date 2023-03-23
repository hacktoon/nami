import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './noise'
import { SurfaceLayer } from './geology/surface'
import { BasinLayer } from './geology/basin'
import { TerrainLayer } from './geology/terrain'
import { TemperatureLayer } from './climatology/temperature'
import { RainLayer } from './climatology/rain'
import { RiverLayer } from './hydrology/river'
import { LakeLayer } from './hydrology/lake'
import { BiomeLayer } from './biology/biome'
import { TopologyLayer } from './topology'

import { WorldTileMapDiagram } from './diagram'
import { WORLD_NAMES } from './names'


const SCHEMA = new Schema(
    'WorldTileMap',
    Type.rect('rect', 'Size', {default: '64x64', min:'2x2', max:'100x100'}),
    Type.text('seed', 'Seed', {default: ''}),
    Type.number('realms', 'Realms', {default: 10, min: 3, max: 16}),
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
        const realmCount = params.get('realms')
        layers.noise = new NoiseLayer(rect, this.seed)
        layers.surface = new SurfaceLayer(rect, layers)
        layers.temperature = new TemperatureLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.basin = new BasinLayer(rect, layers)
        layers.river = new RiverLayer(rect, layers)
        layers.terrain = new TerrainLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        layers.lake = new LakeLayer(layers)
        layers.topo = new TopologyLayer(rect, layers, realmCount)
        this.layers = layers
        this.name = Random.choiceFrom(WORLD_NAMES)
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.layers.surface.getText(wrappedPoint),
            this.layers.terrain.getText(wrappedPoint),
            this.layers.temperature.getText(wrappedPoint),
            this.layers.rain.getText(wrappedPoint),
            this.layers.basin.getText(wrappedPoint),
            this.layers.river.getText(wrappedPoint),
            this.layers.biome.getText(wrappedPoint),
            this.layers.lake.getText(wrappedPoint),
            this.layers.topo.getText(wrappedPoint),
        ].filter(x=>x).join('\n').trim()
    }

    getDescription() {
        return [
            `World: ${this.name}`,
            `${this.layers.surface.getWaterArea()}% water`,
            `Rivers: ${this.layers.river.count}`,
            `Cities: ${this.layers.topo.getTotalCities()}`,
        ].join(', ').trim()
    }
}
