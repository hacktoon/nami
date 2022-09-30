import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { NoiseTileMap } from '/src/model/tilemap/noise'

import { NOISE_SPEC } from './noise'
import { Terrain } from './spec'
import { LAYERS } from './layer'


export class TerrainModel {
    #borderMap
    #terrainMap
    #pointSetByType

    #buildNoiseMaps(rect, seed) {
        const noiseMaps = new Map()
        for(let [id, spec] of Object.entries(NOISE_SPEC)) {
            const map = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: spec.octaves,
                resolution: spec.resolution,
                scale: spec.scale,
                seed: `${seed}${id}`,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    #buildLayer(type, rule) {
        const terrain = Terrain.PLAIN
        const pointSet = new PointSet()
        const noiseMap = this.noiseMaps.get(rule.noise.id)
        this.#pointSetByType[type].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (this.#borderMap.has(point)) return
            if (noise < rule.ratio) return
            this.#terrainMap.set(point, terrain)
            pointSet.add(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideNoise = noiseMap.getNoise(sidePoint)
                if (sideNoise < rule.ratio) {
                    // side is different, this point is a border
                    this.#borderMap.set(point, terrain)
                    return
                }
            }
        })
        this.#pointSetByType[type] = pointSet
    }

    #buildBaseLayer() {
        const BASE_RATIO = .55
        const outlineNoiseMap = this.noiseMaps.get(NOISE_SPEC.outline.id)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getType = noise => noise >= BASE_RATIO ? 'land' : 'water'
        return Matrix.fromRect(outlineNoiseMap.rect, point => {
            const noise = outlineNoiseMap.getNoise(point)
            const type = getType(noise)
            const terrain = typeMap[type]
            this.#pointSetByType[type].add(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideNoise = outlineNoiseMap.getNoise(sidePoint)
                const sideTerrain = typeMap[getType(sideNoise)]
                if (terrain !== sideTerrain) {
                    // side is different, this point is a border
                    this.#borderMap.set(point, terrain)
                    break
                }
            }
            return terrain
        })
    }

    constructor(rect, seed) {
        this.#pointSetByType = {
            water: new PointSet(),
            land: new PointSet(),
        }
        this.noiseMaps = this.#buildNoiseMaps(rect, seed)
        this.#borderMap = new BorderMap(rect)
        this.#terrainMap = this.#buildBaseLayer()
        this.#buildLayer('land', LAYERS[0])
        // for(let rules of PIPELINE) {
        //     this.#buildLayer(rules)
        // }
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        return this.#borderMap.get(point)
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isWater(point) {
        return this.get(point).water
    }
}


class BorderMap {
    #matrix
    #borders

    constructor(rect) {
        this.#matrix = Matrix.fromRect(rect, () => false)
        this.#borders = new Map(
            Terrain.types().map(terrain => [terrain.id, []])
        )
    }

    has(point) {
        return this.#matrix.get(point) === true
    }

    get(point) {
        return this.#matrix.get(point)
    }

    set(point, terrainId) {
        this.#borders.get(terrainId).push(point)
        return this.#matrix.set(point, true)
    }

    getBorders(id) {
        return this.#borders.get(id)
    }
}
