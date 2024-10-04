import { SimplexNoise } from '/src/lib/geometry/fractal/noise'


const NOISE_SPEC = [
    {id: 'atmos', args: {octaves: 6, resolution: .6, scale: .02}},
    {id: 'outline', args: {octaves: 6, resolution: .8, scale: .02}},
    {id: 'zone', args: {octaves: 6, resolution: .8, scale: .03}},
    {id: 'grained', args: {octaves: 6, resolution: .8, scale: .08}},
]


export class NoiseLayer {
    #presetMap = new Map()

    constructor(rect) {
        this.rect = rect
        for(let noiseSpec of Object.values(NOISE_SPEC)) {
            const noise = new SimplexNoise()
            this.#presetMap.set(noiseSpec.id, {noise, args: noiseSpec.args})
        }
    }

    get2D(point, preset_id) {
        const preset = this.#presetMap.get(preset_id)
        return preset.noise.noise2D(point, preset.args)
    }

    get4D(rect, point, preset_id) {
        const preset = this.#presetMap.get(preset_id)
        return preset.noise.wrapped4D(rect, point, preset.args)
    }
}