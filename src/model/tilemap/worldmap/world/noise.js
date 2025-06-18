import { Point } from '/src/lib/geometry/point'
import { SimplexNoise } from '/src/lib/geometry/noise'


const NOISE_SPEC = {
    'outline': {offset: [0, 0], octaves: 6, resolution: .8, scale: .02},
    'zoneOutline': {offset: [-3, -3], octaves: 7, resolution: .7, scale: .02},
    'climate': {offset: [50, 100], octaves: 6, resolution: .65, scale: .02},
    'rain': {offset: [250, 10], octaves: 6, resolution: .8, scale: .02},
    'grained': {offset: [150, 200], octaves: 6, resolution: .8, scale: .08},
}


export class NoiseLayer {
    constructor(context) {
        this.rect = context.rect
        this.noise = new SimplexNoise()
    }

    get2D(point, preset_id) {
        const specs = NOISE_SPEC[preset_id]
        const pt = Point.plus(point, specs.offset)
        return this.noise.noise2D(pt, specs)
    }

    get4D(rect, point, preset_id) {
        const specs = NOISE_SPEC[preset_id]
        const pt = Point.plus(point, specs.offset)
        return this.noise.wrapped4D(rect, pt, specs)
    }
}