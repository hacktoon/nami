import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'
import { OutlineNoiseStep } from './layer'


const DEFAULT_TERRAIN = TerrainTypeMap.types.SEA

const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    feature: {id: 'feature', octaves: 5, resolution: .8, scale: .05},
    grained: {id: 'grained', octaves: 4, resolution: .8, scale: .06},
}

const PIPELINE = [
    {
        noise: NOISE_SPEC.outline,
        value: TerrainTypeMap.types.BASIN,
        ratio: .55
    },
    {
        noise: NOISE_SPEC.feature,
        base: TerrainTypeMap.types.BASIN,
        value: TerrainTypeMap.types.PLAIN,
        ratio: .3
    },
    {
        noise: NOISE_SPEC.grained,
        base: TerrainTypeMap.types.PLAIN,
        value: TerrainTypeMap.types.PLATEAU,
        ratio: .4
    },
    {
        noise: NOISE_SPEC.feature,
        base: TerrainTypeMap.types.PLATEAU,
        value: TerrainTypeMap.types.MOUNTAIN,
        ratio: .4
    },
    {
        noise: NOISE_SPEC.grained,
        base: TerrainTypeMap.types.MOUNTAIN,
        value: TerrainTypeMap.types.PEAK,
        ratio: .6
    }
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
        let filledMap = Matrix.fromRect(rect, () => false)
        for(let spec of PIPELINE) {
            const step = new OutlineNoiseStep(spec, layer, noiseMaps)
            layer = step.buildLayer(filledMap)
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
