import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './layers/noise'
import { SurfaceLayer } from './layers/surface'
import { TopologyLayer } from './layers/topology'
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


const ZONE_SIZE = 9
const ZONE_RECT = new Rect(ZONE_SIZE, ZONE_SIZE)


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
        layers.topology = new TopologyLayer(rect, layers, ZONE_RECT)
        layers.climate = new ClimateLayer(rect, layers)
        layers.rain = new RainLayer(rect, layers)
        layers.basin = new BasinLayer(rect, layers, ZONE_RECT)
        layers.river = new RiverLayer(rect, layers, ZONE_RECT)
        layers.relief = new ReliefLayer(rect, layers)
        layers.biome = new BiomeLayer(rect, layers)
        layers.civil = new CivilLayer(rect, layers, ZONE_RECT, realmCount)
        const time = (performance.now() - start).toFixed(2)
        console.info(`generated in ${time}ms`);
        return layers
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.layers.surface.getText(wrappedPoint),
            this.layers.topology.getText(wrappedPoint),
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
        const seed = `${this.seed}-${Point.hash(point)}`
        const zoneLayers = {}
        const params = {
            rect: this.rect,
            layers: this.layers,
            zoneSize: ZONE_SIZE,
            zoneRect: ZONE_RECT,
            zoneLayers,
            seed
        }
        Random.seed = seed  // change seed for this specific zone
        zoneLayers.surface = this.layers.surface.getZone(point, params)
        zoneLayers.river = this.layers.river.getZone(point, params)
        return zoneLayers
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
