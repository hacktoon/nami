import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'
import {
    OutlineNoiseLayer,
    TypeOutlineNoiseLayer,
 } from './layer'


const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    feature: {id: 'feature', octaves: 6, resolution: .8, scale: .05},
}


const PIPELINE = [
    new OutlineNoiseLayer({
        noise: NOISE_SPEC.outline,
        range: [TerrainTypeMap.types.BASIN, TerrainTypeMap.types.SEA],
        ratio: .55
    }),
    // new TypeOutlineNoiseLayer({
    //     noise: NOISE_SPEC.feature,
    //     range: [TerrainTypeMap.types.PLAIN, TerrainTypeMap.types.BASIN],
    //     ratio: .55
    // }),
    // new BaseTerrainNoiseLayer({
    //     noise: NOISE_SPEC.feature,
    //     landRange: [TerrainTypeMap.types.PLAIN, TerrainTypeMap.types.BASIN],
    //     waterRange: [TerrainTypeMap.types.SEA, TerrainTypeMap.types.OCEAN],
    //     landRatio: .4,
    //     waterRatio: .5,
    // }),
]


export class TerrainModel {
    #terrainMap
    #typeMap

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

    constructor(rect, seed) {
        const typeMap = new TerrainTypeMap()
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        let terrainMap = Matrix.fromRect(rect)
        for(let layer of PIPELINE) {
            terrainMap = layer.build(noiseMaps, typeMap, terrainMap)
        }
        this.#terrainMap = terrainMap
        this.#typeMap = typeMap
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return this.#typeMap.get(id)
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
