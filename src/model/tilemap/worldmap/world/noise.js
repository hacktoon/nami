import { Point } from '/src/lib/geometry/point'
import { SimplexNoise } from '/src/lib/noise'


const NOISE_SPEC = {
    'outline': {octaves: 6, resolution: .8, scale: .02},
    'zoneOutline': {octaves: 8, resolution: .8, scale: .02},
    'climate': {octaves: 6, resolution: .65, scale: .02},
    'zoneClimate': {octaves: 8, resolution: .65, scale: .02},
    'rain': {octaves: 6, resolution: .8, scale: .02},
    'grained': {octaves: 6, resolution: .8, scale: .08},
}


export class NoiseLayer {
    constructor(context) {
        this.rect = context.rect
        // this.noise = new SimplexNoise()
        this.outline = new SimplexNoise()
        this.climate = new SimplexNoise()
        this.rain = new SimplexNoise()
        this.grained = new SimplexNoise()
    }

    // get2D(point, preset_id) {
    //     const specs = NOISE_SPEC[preset_id]
    //     const pt = Point.plus(point, specs.offset)
    //     return this.noise.noise2D(pt, specs)
    // }

    get4DGrained(rect, point) {
        const specs = NOISE_SPEC['grained']
        return this.grained.wrapped4D(rect, point, specs)
    }

    get4DOutline(rect, point) {
        const specs = NOISE_SPEC['outline']
        return this.outline.wrapped4D(rect, point, specs)
    }

    get4DZoneOutline(rect, point) {
        const specs = NOISE_SPEC['zoneOutline']
        const offsetPoint = Point.plus(point, [-10, -10])
        return this.outline.wrapped4D(rect, point, specs)
    }

    get4DClimate(rect, point) {
        const specs = NOISE_SPEC['climate']
        return this.climate.wrapped4D(rect, point, specs)
    }

    get4DZoneClimate(rect, point) {
        const specs = NOISE_SPEC['zoneClimate']
        return this.climate.wrapped4D(rect, point, specs)
    }

    get4DRain(rect, point) {
        const specs = NOISE_SPEC['rain']
        return this.rain.wrapped4D(rect, point, specs)
    }
}