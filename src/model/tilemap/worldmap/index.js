import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'
import { FIFOCache } from '/src/lib/cache'
import { NoiseLayer } from './world/noise'
import { SurfaceLayer } from './world/surface'
import { BasinLayer } from './world/basin'
import { ReliefLayer } from './world/relief'
import { ClimateLayer } from './world/climate'
import { RainLayer } from './world/rain'
import { RiverLayer } from './world/river'
import { BiomeLayer } from './world/biome'
import { CivilLayer } from './world/civil'

import { WorldTileMapDiagram } from './diagram'

import { LandMaskZone } from './zone/landmask'
import { RiverZone } from './zone/river'
import { ClimateZone } from './zone/climate'


const SCHEMA = new Schema(
    'WorldTileMap',
    Type.number('size', 'Size', { default: 32, min: 32, max: 64 }),
    Type.text('seed', 'Seed', { default: '' }),
    Type.number('realms', 'Realms', { default: 8, min: 3, max: 8 }),
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

    #zoneCache

    constructor(params) {
        super(params)
        this.name = Random.choiceFrom(WORLD_NAMES)
        this.world = this.#buildWorld(params, this.rect)
        this.width = this.size
        this.height = this.size
        this.#zoneCache = new FIFOCache(256)
    }

    #buildWorld(params, rect) {
        const start = performance.now()
        // set a global struct for world
        const world = {
            rect,
            seed: this.seed,
            size: rect.width
        }
        const context = {
            world,
            rect,
            zoneSize: ZONE_SIZE,
            zoneRect: ZONE_RECT,
            realmCount: params.get('realms')
        }
        // The world creation follows order below
        world.noise = new NoiseLayer(context)
        world.surface = new SurfaceLayer(context)
        world.climate = new ClimateLayer(context)
        world.rain = new RainLayer(context)
        world.basin = new BasinLayer(context)
        world.river = new RiverLayer(context)
        world.relief = new ReliefLayer(context)
        world.biome = new BiomeLayer(context)
        world.civil = new CivilLayer(context)
        const time = (performance.now() - start) | 0
        console.info(`Generated in ${time}ms`);
        return world
    }

    get(point) {
        const wrappedPoint = this.rect.wrap(point)
        return [
            `Point(${Point.hash(point)})`,
            this.world.surface.getText(wrappedPoint),
            this.world.climate.getText(wrappedPoint),
            this.world.rain.getText(wrappedPoint),
            this.world.basin.getText(wrappedPoint),
            this.world.river.getText(wrappedPoint),
            this.world.biome.getText(wrappedPoint),
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
        const hash = Point.hash(worldPoint)
        // cache de zone grid noise
        if (this.#zoneCache.has(hash)) {
            return this.#zoneCache.get(hash)
        }
        zone.landmask = new LandMaskZone(context)
        zone.climate = new ClimateZone(context)
        zone.river = new RiverZone(context)
        this.#zoneCache.set(hash, zone)
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
