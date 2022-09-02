import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'
import {
    OutlineNoiseLayer,
    PlainsNoiseLayer,
 } from './layer'


const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    secondary: {id: 'secondary', octaves: 6, resolution: .8, scale: .05},
}


const PIPELINE = [
    new OutlineNoiseLayer({
        noise: NOISE_SPEC.outline,
        ratio: .55,
        aboveRatio: TerrainTypeMap.types.PLAIN,
        belowRatio: TerrainTypeMap.types.SEA,
    }),
    // new PlainsNoiseLayer({
    //     noise: NOISE_SPEC.outline,
    //     ratio: .6,
    //     aboveRatio: TerrainTypeMap.types.PLATEAU,
    //     belowRatio: TerrainTypeMap.types.BASIN,
    // }),
]


export class TerrainModel {
    #terrainMap
    #typeMap = new TerrainTypeMap()

    #buildNoiseMaps(rect, seed) {
        const noiseMaps = new Map()
        for(let [id, spec] of Object.entries(NOISE_SPEC)) {
            const map = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: spec.octaves,
                resolution: spec.resolution,
                scale: spec.scale,
                seed: seed,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    #buildMap(noiseMaps) {
        let baseMap = null
        for(let layer of PIPELINE) {
            baseMap = layer.build(noiseMaps, baseMap)
        }
        return baseMap
    }

    constructor(rect, seed) {
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        // const baseMap = Matrix.fromRect(rect, point => 3)
        const baseMap = this.#buildMap(noiseMaps)
        this.#terrainMap = baseMap
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return this.#typeMap.get(Math.abs(id))
    }

    isMargin(point) {
        const id = this.#terrainMap.get(point)
        return id >= 0
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
