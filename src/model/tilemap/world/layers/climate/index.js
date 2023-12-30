import { Climate } from './data'


const COLD_RATIO = .15
const TEMPERATE_RATIO = .3
const WARM_RATIO = .4
const HOT_RATIO = .65


export class ClimateLayer {
    constructor(layers) {
        this.layers = layers
    }

    get(point) {
        const noise = this.layers.noise.get2D(point, "atmos")
        if (noise > HOT_RATIO)       return Climate.HOT
        if (noise > WARM_RATIO)      return Climate.WARM
        if (noise > TEMPERATE_RATIO) return Climate.TEMPERATE
        if (noise > COLD_RATIO)      return Climate.COLD
        return Climate.FROZEN
    }

    getColor(point) {
        return this.get(point).color
    }

    is(point, type) {
        const rain = this.get(point)
        return rain.id === type.id
    }

    getText(point) {
        const climate = this.get(point)
        return `Climate(${climate.name})`
    }
}
