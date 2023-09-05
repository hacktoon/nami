import { SimplexNoise } from '/src/lib/noise'


const NOISE_SPEC = [
    {id: 'atmos', octaves: 6, resolution: .6, scale: .02},
    {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    {id: 'feature', octaves: 6, resolution: .8, scale: .04},
    {id: 'grained', octaves: 6, resolution: .8, scale: .08},
    {id: 'block', octaves: 6, resolution: .8, scale: .04},
]

// this.#landNoise = new SimplexNoise(4, .2, .04)
// this.#borderLandNoise = new SimplexNoise(4, .2, .02)
// this.#waterNoise = new SimplexNoise(4, .2, .02)


export class NoiseLayer {
    constructor(rect) {
        this.rect = rect
        this.map = new Map()
        for(let noiseSpec of Object.values(NOISE_SPEC)) {
            const noise = new SimplexNoise(
                noiseSpec.octaves,
                noiseSpec.resolution,
                noiseSpec.scale,
            )
            this.map.set(noiseSpec.id, noise)
        }
    }

    #get(id, point) {
        return this.map.get(id).wrapped4D(this.rect, point)
    }

    // use this interface
    get4D(rect, point, preset) {
        return this.map.get(preset).wrapped4D(rect, point)
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