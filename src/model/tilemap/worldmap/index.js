import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'
import { FIFOCache } from '/src/lib/cache'
import { WORLD_NAMES } from '/src/lib/names'

import { NoiseLayer } from './world/noise'
import { SurfaceLayer } from './world/surface'
import { SurfaceChunk } from './world/surface/chunk'
import { BasinLayer } from './world/basin'
import { BasinChunk } from './world/basin/chunk'
import { ReliefLayer } from './world/relief'
import { ClimateLayer } from './world/climate'
import { ClimateChunk } from './world/climate/chunk'
import { RainLayer } from './world/rain'
import { RainChunk } from './world/rain/chunk'
import { RiverLayer } from './world/river'
import { RiverChunk } from './world/river/chunk'
import { BiomeLayer } from './world/biome'
import { BiomeChunk } from './world/biome/chunk'
import { CivilLayer } from './world/civil'
import { CivilChunk } from './world/civil/chunk'

import { WorldTileMapDiagram } from './diagram'


const WORLD_SIZE = 32
const CHUNK_SIZE = 13
const CHUNK_RECT = new Rect(CHUNK_SIZE, CHUNK_SIZE)

const SCHEMA = new Schema(
    'WorldTileMap',
    Type.number('size', 'Size', { default: WORLD_SIZE, min: WORLD_SIZE, max: WORLD_SIZE }),
    Type.text('seed', 'Seed', { default: '' }),
    Type.number('realms', 'Realms', { default: 8, min: 3, max: 8 }),
)


export class WorldTileMap extends TileMap {
    static diagram = WorldTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new WorldTileMap(params)
    }

    #chunkCache

    constructor(params) {
        super(params)
        this.name = Random.choiceFrom(WORLD_NAMES)
        this.world = this.#buildWorld(params, this.rect)
        this.#chunkCache = new FIFOCache(WORLD_SIZE * WORLD_SIZE)
    }

    #buildWorld(params, rect) {
        const start = performance.now()
        // set a global struct for world
        const world = {
            rect,
            seed: this.seed,
            size: WORLD_SIZE,
            chunkSize: CHUNK_SIZE,
        }
        const context = {
            world,
            rect,
            chunkSize: CHUNK_SIZE,
            chunkRect: CHUNK_RECT,
            realmCount: params.get('realms')
        }
        // The world creation follows order below
        world.noise = new NoiseLayer(context)
        world.surface = new SurfaceLayer(context)
        world.climate = new ClimateLayer(context)
        world.rain = new RainLayer(context)
        world.basin = new BasinLayer(context)
        world.biome = new BiomeLayer(context)
        world.river = new RiverLayer(context)
        world.civil = new CivilLayer(context)
        // world.relief = new ReliefLayer(context)
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
            // this.world.relief.getText(wrappedPoint),
            // this.world.landform.getText(wrappedPoint),
            this.world.civil.getText(wrappedPoint),
        ].filter(x => x != '')
            .join('\n')
            .trim()
    }

    getChunk(worldPoint) {
        // geração de seed específica para a zona
        // para evitar que zonas adjacentes tenham o mesmo conteúdo
        const seed = `${this.seed}-${Point.hash(worldPoint)}`
        Random.seed = seed  // change seed for this specific chunk
        // set chunk object
        const chunk = {
            size: CHUNK_SIZE
        }
        // set context for
        const context = {
            rect: this.rect,
            world: this.world,
            chunkSize: CHUNK_SIZE,
            chunkRect: CHUNK_RECT,
            worldPoint,
            chunk,
            seed
        }
        const hash = Point.hash(worldPoint)
        // cache de chunk grid noise
        if (this.#chunkCache.has(hash)) {
            return this.#chunkCache.get(hash)
        }
        chunk.surface = new SurfaceChunk(context)
        chunk.river = new RiverChunk(context)
        chunk.climate = new ClimateChunk(context)
        chunk.rain = new RainChunk(context)
        chunk.biome = new BiomeChunk(context)
        chunk.civil = new CivilChunk(context)
        this.#chunkCache.set(hash, chunk)
        return chunk
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
