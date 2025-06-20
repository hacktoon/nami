import { Point } from '/src/lib/geometry/point'
import { SimplexNoise } from '/src/lib/geometry/noise'


const NOISE_SPEC = {
    'outline': {offset: [0, 0], octaves: 6, resolution: .8, scale: .02},
    'zoneOutline': {offset: [-9, -9], octaves: 8, resolution: .7, scale: .02},
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

    get4DGrained(rect, point) {
        return this.get4D(rect, point, "grained")
    }

    get4DOutline(rect, point) {
        return this.get4D(rect, point, "outline")
    }

    get4DZoneOutline(rect, point) {
        return this.get4D(rect, point, "zoneOutline")
    }

    get4DClimate(rect, point) {
        return this.get4D(rect, point, "climate")
    }

    get4DRain(rect, point) {
        return this.get4D(rect, point, "rain")
    }

    get4D(rect, point, preset_id) {
        const specs = NOISE_SPEC[preset_id]
        const pt = Point.plus(point, specs.offset)
        return this.noise.wrapped4D(rect, pt, specs)
    }
}