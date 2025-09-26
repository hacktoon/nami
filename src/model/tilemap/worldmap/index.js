import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'
import { FIFOCache } from '/src/lib/cache'
import { WORLD_NAMES } from '/src/lib/names'

import { NoiseLayer } from '/src/model/world/noise'
import { SurfaceLayer } from '/src/model/world/surface'
import { SurfaceChunk } from '/src/model/world/surface/chunk'
import { BasinLayer } from '/src/model/world/basin'
import { BasinChunk } from '/src/model/world/basin/chunk'
// import { ReliefLayer } from '/src/model/world/relief'
import { ClimateLayer } from '/src/model/world/climate'
import { ClimateChunk } from '/src/model/world/climate/chunk'
import { RainLayer } from '/src/model/world/rain'
import { RainChunk } from '/src/model/world/rain/chunk'
import { RiverLayer } from '/src/model/world/river'
import { RiverChunk } from '/src/model/world/river/chunk'
import { BiomeLayer } from '/src/model/world/biome'
import { BiomeChunk } from '/src/model/world/biome/chunk'
import { CivilLayer } from '/src/model/world/civil'
import { CivilChunk } from '/src/model/world/civil/chunk'

import { WorldTileMapDiagram } from './diagram'


const WORLD_SIZE = 32

const SCHEMA = new Schema(
    'WorldTileMap',
    Type.number('size', 'Size', { default: WORLD_SIZE, min: 16, max: 128 }),
    Type.number('chunk', 'Chunk', {step: 2, default: 15, min: 7, max: 19}),
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
    #chunkRect

    constructor(params) {
        super(params)
        const worldSize = params.get('size')
        const chunkSize = params.get('chunk')
        this.params = params
        this.name = Random.choiceFrom(WORLD_NAMES)
        this.#chunkRect = new Rect(chunkSize, chunkSize)
        this.#chunkCache = new FIFOCache(worldSize * worldSize)
        this.world = this.#buildWorld(params, this.rect)
    }

    #buildWorld(params, rect) {
        const start = performance.now()
        const chunkSize = params.get('chunk')
        // set a global struct for world
        const world = {
            rect,
            seed: this.seed,
            size: params.get('size'),
            chunkSize,
        }
        const context = {
            rect,
            world,
            chunkSize,
            chunkRect: this.#chunkRect,
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
        const chunkSize = this.params.get('chunk')
        Random.seed = seed  // change seed for this specific chunk
        // set chunk object
        const chunk = {
            size: chunkSize,
            rect: this.#chunkRect
        }
        // set context for
        const context = {
            rect: this.rect,
            world: this.world,
            chunkSize,
            chunkRect: this.#chunkRect,
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
        chunk.basin = new BasinChunk(context)
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
