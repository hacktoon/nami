import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseLayer } from './world/noise'
import { SurfaceLayer } from './world/surface'
import { TopologyLayer } from './world/topology'
import { BasinLayer } from './world/basin'
import { ReliefLayer } from './world/relief'
import { ClimateLayer } from './world/climate'
import { RainLayer } from './world/rain'
import { RiverLayer } from './world/river'
import { BiomeLayer } from './world/biome'
import { CivilLayer } from './world/civil'

import { WorldTileMapDiagram } from './diagram'

import { SurfaceZone } from './zone/surface'
import { TopologyZone } from './zone/topology'
import { RiverZone } from './zone/river'


const SCHEMA = new Schema(
    'WorldTileMap',
    Type.number('size', 'Size', { default: 100, min: 64, max: 200 }),
    Type.text('seed', 'Seed', { default: '' }),
    Type.number('realms', 'Realms', { default: 10, min: 3, max: 16 }),
)


const ZONE_SIZE = 17
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
        this.world = this.#buildWorld(params, this.rect)
        this.width = this.size
        this.height = this.size
    }

    #buildWorld(params, rect) {
        const start = performance.now()
        // set a global struct for world
        const world = {}
        const context = {
            world,
            rect,
            zoneRect: ZONE_RECT,
            realmCount: params.get('realms')
        }
        // The world creation follows order below
        world.noise = new NoiseLayer(context)
        world.topology = new TopologyLayer(context)
        world.surface = new SurfaceLayer(context)
        world.climate = new ClimateLayer(context)
        world.rain = new RainLayer(context)
        world.basin = new BasinLayer(context)
        world.river = new RiverLayer(context)
        world.relief = new ReliefLayer(context)
        world.biome = new BiomeLayer(context)
        world.civil = new CivilLayer(context)
        const time = (performance.now() - start).toFixed(2)
        console.info(`generated in ${time}ms`);
        return world
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.world.topology.getText(wrappedPoint),
            this.world.surface.getText(wrappedPoint),
            this.world.climate.getText(wrappedPoint),
            this.world.rain.getText(wrappedPoint),
            this.world.basin.getText(wrappedPoint),
            this.world.river.getText(wrappedPoint),
            this.world.biome.getText(wrappedPoint),
            // this.world.lake.getText(wrappedPoint),
            this.world.relief.getText(wrappedPoint),
            // this.world.landform.getText(wrappedPoint),
            this.world.civil.getText(wrappedPoint),
        ].filter(x => x != '')
            .join('\n')
            .trim()
    }

    getZone(worldPoint) {
        // geração de seed específica para a zona
        // para evitar que zonas adjacentes tenham o mesmo conteúdo
        const seed = `${this.seed}-${Point.hash(worldPoint)}`
        const zone = {}
        const context = {
            rect: this.rect,
            world: this.world,
            zoneSize: ZONE_SIZE,
            zoneRect: ZONE_RECT,
            worldPoint,
            zone,
            seed
        }
        Random.seed = seed  // change seed for this specific zone
        zone.topology = new TopologyZone(context)
        zone.surface = new SurfaceZone(context)
        zone.river = new RiverZone(context)
        return zone
    }

    getDescription() {
        return [
            `World: ${this.name}`,
            `${this.world.surface.getWaterArea()}% water`,
            `Rivers: ${this.world.river.count}`,
            `Cities: ${this.world.civil.getTotalCities()}`,
        ].join(', ').trim()
    }
}
