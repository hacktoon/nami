import { NoiseTileMap } from '/src/model/tilemap/noise'


export const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    feature: {id: 'feature', octaves: 6, resolution: .8, scale: .05},
    grained: {id: 'grained', octaves: 6, resolution: .8, scale: .06},
}


export class NoiseMapSet {
    constructor(rect, seed) {
        this.map = new Map()
        for(let noiseSpec of Object.values(NOISE_SPEC)) {
            const noiseMap = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: noiseSpec.octaves,
                resolution: noiseSpec.resolution,
                scale: noiseSpec.scale,
                seed: `${seed}${noiseSpec.id}`,
            })
            this.map.set(noiseSpec.id, noiseMap)
        }
    }

    get(spec) {
        return this.map.get(spec.id)
    }
}