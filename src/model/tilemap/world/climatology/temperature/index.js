import { Matrix } from '/src/lib/matrix'
import { Temperature } from './data'


const COLD_RATIO = .2
const TEMPERATE_RATIO = .3
const WARM_RATIO = .5
const HOT_RATIO = .75


export class TemperatureLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const noise = layers.noise.getAtmos(point)
            let temperature = Temperature.FROZEN
            if (noise > COLD_RATIO)      temperature = Temperature.COLD
            if (noise > TEMPERATE_RATIO) temperature = Temperature.TEMPERATE
            if (noise > WARM_RATIO)      temperature = Temperature.WARM
            if (noise > HOT_RATIO)       temperature = Temperature.HOT
            return temperature.id
        })
    }

    get(point) {
        const temperature = this.#matrix.get(point)
        return Temperature.fromId(temperature)
    }

    getText(point) {
        const temperature = this.get(point)
        return `Temperature(${temperature.name})`
    }
}
