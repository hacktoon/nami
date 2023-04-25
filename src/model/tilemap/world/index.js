import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Random } from '/src/lib/random'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './noise'
import { SurfaceLayer } from './layers/surface'
import { BasinLayer } from './layers/basin'
import { ReliefLayer } from './layers/relief'
import { ClimateLayer } from './layers/climate'
import { RainLayer } from './layers/rain'
import { RiverLayer } from './layers/river'
import { LakeLayer } from './layers/lake'
import { BiomeLayer } from './layers/biome'
import { LandformLayer } from './layers/landform'
import { TopologyLayer } from './layers/topology'

import { WorldTileMapDiagram } from './diagram'
import { BlockMap } from './block'
import { WORLD_NAMES } from './names'


const BLOCK_SIZE = 16

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
        this.layers = this.#buildLayers(params)
        this.name = Random.choiceFrom(WORLD_NAMES)
        this.blockRect = new Rect(BLOCK_SIZE, BLOCK_SIZE)
    }

    #buildLayers(params) {
        const layers = {}
        const rect = this.rect
        const realmCount = params.get('realms')
        layers.noise = new NoiseLayer(rect)
        layers.surface = new SurfaceLayer(rect, layers)
        layers.climate = new ClimateLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.basin = new BasinLayer(rect, layers)
        layers.river = new RiverLayer(rect, layers)
        layers.relief = new ReliefLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        layers.lake = new LakeLayer(layers)
        layers.landform = new LandformLayer(rect, layers)
        layers.topo = new TopologyLayer(rect, layers, realmCount)
        return layers
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.layers.surface.getText(wrappedPoint),
            this.layers.climate.getText(wrappedPoint),
            this.layers.rain.getText(wrappedPoint),
            this.layers.basin.getText(wrappedPoint),
            this.layers.river.getText(wrappedPoint),
            this.layers.biome.getText(wrappedPoint),
            this.layers.lake.getText(wrappedPoint),
            this.layers.relief.getText(wrappedPoint),
            this.layers.landform.getText(wrappedPoint),
            this.layers.topo.getText(wrappedPoint),
        ].filter(x=>x).join('\n').trim()
    }

    getBlock(point) {
        const wrappedPoint = this.rect.wrap(point)
        return new BlockMap(this.layers, this.seed, this.blockRect, wrappedPoint)
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
