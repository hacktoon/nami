import { NoiseTileMap } from '/src/model/tilemap/noise'


export const NOISE_SPEC = [
    {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    {id: 'feature', octaves: 6, resolution: .8, scale: .04},
    {id: 'grained', octaves: 6, resolution: .8, scale: .04},
]


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

    get(id) {
        return this.map.get(id)
    }
}