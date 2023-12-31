import { SimplexNoise } from '/src/lib/noise'


const NOISE_SPEC = [
    {id: 'atmos', octaves: 6, resolution: .6, scale: .02},
    {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    {id: 'feature', octaves: 6, resolution: .8, scale: .02},
    {id: 'grained', octaves: 6, resolution: .8, scale: .08},
]


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

    get2D(point, preset) {
        return this.map.get(preset).noise2D(point)
    }

    get4D(rect, point, preset) {
        return this.map.get(preset).wrapped4D(rect, point)
    }
}