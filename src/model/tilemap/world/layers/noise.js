import { SimplexNoise } from '/src/lib/geometry/fractal/noise'


const NOISE_SPEC = [
    {
        id: 'outline',
        group: 1,
        args: {octaves: 6, resolution: .8, scale: .02}
    },
    {
        id: 'zone',
        group: 1,
        args: {octaves: 6, resolution: .8, scale: .02}
    },
    {
        id: 'atmos',
        group: 2,
        args: {octaves: 6, resolution: .6, scale: .02}
    },
    {
        id: 'grained',
        group: 2,
        args: {octaves: 6, resolution: .8, scale: .08}
    },
]


export class NoiseLayer {
    #presetMap = new Map()
    #permTableMap = new Map()

    constructor(rect) {
        this.rect = rect
        let permTable
        for(let noiseSpec of NOISE_SPEC) {
            if (this.#permTableMap.has(noiseSpec.group)) {
                permTable = this.#permTableMap.get(noiseSpec.group)
            } else {
                permTable = SimplexNoise.buildTable()
                this.#permTableMap.set(noiseSpec.group, permTable)
            }

            const noise = new SimplexNoise(permTable)
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