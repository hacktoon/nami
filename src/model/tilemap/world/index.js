import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './layers/noise'
import { SurfaceLayer } from './layers/surface'
import { BasinLayer } from './layers/basin'
import { ReliefLayer } from './layers/relief'
import { ClimateLayer } from './layers/climate'
import { RainLayer } from './layers/rain'
import { RiverLayer } from './layers/river'
import { BiomeLayer } from './layers/biome'
import { CivilLayer } from './layers/civil'

import { WorldTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'WorldTileMap',
    Type.number('size', 'Size', {default: 100, min: 64, max: 200}),
    Type.text('seed', 'Seed', {default: ''}),
    Type.number('realms', 'Realms', {default: 10, min: 3, max: 16}),
)


const ZONE_SIZE = 16


export class WorldTileMap extends TileMap {
    static diagram = WorldTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new WorldTileMap(params)
    }

    constructor(params) {
        super(params)
        this.name = Random.choiceFrom(WORLD_NAMES)
        this.layers = this.#buildLayers(params, this.rect)
        this.width = this.size
        this.height = this.size
    }

    #buildLayers(params, rect) {
        const layers = {}
        const realmCount = params.get('realms')
        const start = performance.now()
        // The layers creation follows order below
        layers.noise = new NoiseLayer(rect)
        layers.surface = new SurfaceLayer(rect, layers)
        layers.climate = new ClimateLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.basin = new BasinLayer(rect, layers)
        layers.river = new RiverLayer(rect, layers)
        layers.relief = new ReliefLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        layers.civil = new CivilLayer(rect, layers, realmCount)
        const time = (performance.now() - start).toFixed(2)
        console.log(`generated in ${time}ms`);
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
            // this.layers.lake.getText(wrappedPoint),
            this.layers.relief.getText(wrappedPoint),
            // this.layers.landform.getText(wrappedPoint),
            this.layers.civil.getText(wrappedPoint),
        ].filter(x => x != '')
        .join('\n')
        .trim()
    }

    getZone(point) {
        const zonePoint = this.rect.wrap(point)
        const params = {
            layers: this.layers,
            seed: this.seed,
            zoneSize: ZONE_SIZE,
        }
        return this.layers.surface.getZone(zonePoint, params)
    }

    getDescription() {
        return [
            `World: ${this.name}`,
            `${this.layers.surface.getWaterArea()}% water`,
            `Rivers: ${this.layers.river.count}`,
            `Cities: ${this.layers.civil.getTotalCities()}`,
        ].join(', ').trim()
    }
}
