import { NoiseTileMap } from '/src/model/tilemap/noise'


const NOISE_SPEC = [
    {id: 'atmos', octaves: 3, resolution: .7, scale: .024},
    {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    {id: 'feature', octaves: 6, resolution: .8, scale: .04},
    {id: 'grained', octaves: 6, resolution: .8, scale: .08},
]


export class NoiseLayer {
    constructor(rect, seed) {
        this.rect = rect
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

    #get(id, point) {
        return this.map.get(id).getNoise(point)
    }

    getOutline(point) {
        return this.#get('outline', point)
    }

    getFeature(point) {
        return this.#get('feature', point)
    }

    getGrained(point) {
        return this.#get('grained', point)
    }

    getAtmos(point) {
        return this.#get('atmos', point)
    }
}