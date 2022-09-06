import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'
import { OutlineNoiseStep } from './layer'


const DEFAULT_TERRAIN = TerrainTypeMap.types.SEA

const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .7, scale: .02},
    feature: {id: 'feature', octaves: 5, resolution: .8, scale: .05},
    grained: {id: 'grained', octaves: 6, resolution: .8, scale: .06},
}

const PIPELINE = [
    [{
        type: 'land',
        noise: NOISE_SPEC.outline,
        value: TerrainTypeMap.types.BASIN,
        baseTerrain: DEFAULT_TERRAIN,
        ratio: .55
    }],
    [
        {
            type: 'land',
            noise: NOISE_SPEC.outline,
            value: TerrainTypeMap.types.PLAIN,
            baseTerrain: TerrainTypeMap.types.BASIN,
            ratio: .6
        },
        {
            type: 'water',
            noise: NOISE_SPEC.outline,
            value: TerrainTypeMap.types.OCEAN,
            baseTerrain: TerrainTypeMap.types.SEA,
            ratio: .5
        }
    ],
    [
        {
            type: 'land',
            noise: NOISE_SPEC.grained,
            value: TerrainTypeMap.types.PLATEAU,
            baseTerrain: TerrainTypeMap.types.PLAIN,
            ratio: .45
        },
        {
            type: 'water',
            noise: NOISE_SPEC.grained,
            value: TerrainTypeMap.types.ABYSS,
            baseTerrain: TerrainTypeMap.types.OCEAN,
            ratio: .4
        }
    ],
    [
        {
            type: 'land',
            noise: NOISE_SPEC.feature,
            value: TerrainTypeMap.types.MOUNTAIN,
            baseTerrain: TerrainTypeMap.types.PLATEAU,
            ratio: .45
        },
        {
            type: 'water',
            noise: NOISE_SPEC.feature,
            value: TerrainTypeMap.types.SHELF,
            baseTerrain: TerrainTypeMap.types.OCEAN,
            ratio: .3
        }
    ],
    [
        {// put peaks on mountains
            type: 'land',
            noise: NOISE_SPEC.grained,
            value: TerrainTypeMap.types.PEAK,
            baseTerrain: TerrainTypeMap.types.MOUNTAIN,
            ratio: .65
        },
        {// put islands on shelves
            type: 'land',
            noise: NOISE_SPEC.grained,
            value: TerrainTypeMap.types.BASIN,
            baseTerrain: TerrainTypeMap.types.SHELF,
            ratio: .55
        }
    ],
    [
        {// put basins
            type: 'land',
            noise: NOISE_SPEC.feature,
            value: TerrainTypeMap.types.BASIN,
            baseTerrain: TerrainTypeMap.types.PLAIN,
            ratio: .55
        },
    ],
]


export class TerrainModel {
    #idMap
    #typeMap

    #buildNoiseMaps(rect, seed) {
        const noiseMaps = new Map()
        for(let [id, spec] of Object.entries(NOISE_SPEC)) {
            const map = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: spec.octaves,
                resolution: spec.resolution,
                scale: spec.scale,
                seed: seed + id,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    constructor(rect, seed) {
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        let layer = Matrix.fromRect(rect, () => DEFAULT_TERRAIN)
        let borderMap = Matrix.fromRect(rect, () => false)
        for(let spec of PIPELINE) {
            const step = new OutlineNoiseStep(layer, noiseMaps)
            layer = step.buildLayer(borderMap, spec)
        }
        this.#idMap = layer
        this.#typeMap = new TerrainTypeMap()
    }

    get(point) {
        const id = this.#idMap.get(point)
        return this.#typeMap.get(id)
    }

    isBorder(point) {
        return this.#idMap.isBorder(point)
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
