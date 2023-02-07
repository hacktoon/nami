import { Matrix } from '/src/lib/matrix'
import { Temperature } from './data'


const COLD_RATIO = .2
const TEMPERATE_RATIO = .3
const WARM_RATIO = .5
const HOT_RATIO = .75


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const noise = layers.noise.getAtmos(point)
            const isMountain = layers.relief.isMountain(point)
            let temp = Temperature.FROZEN
            if (noise > COLD_RATIO) temp = Temperature.COLD
            if (noise > TEMPERATE_RATIO) temp = Temperature.TEMPERATE
            if (noise > WARM_RATIO) temp = Temperature.WARM
            if (noise > HOT_RATIO) temp = Temperature.HOT
            if (isMountain) return Temperature.lower(temp).id
            return temp.id
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
