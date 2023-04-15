import { Matrix } from '/src/lib/matrix'
import { Climate } from './data'


const COLD_RATIO = .15
const TEMPERATE_RATIO = .4
const WARM_RATIO = .5
const HOT_RATIO = .75


export class ClimateLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const noise = layers.noise.getAtmos(point)
            let climate = Climate.FROZEN
            if (noise > COLD_RATIO)      climate = Climate.COLD
            if (noise > TEMPERATE_RATIO) climate = Climate.TEMPERATE
            if (noise > WARM_RATIO)      climate = Climate.WARM
            if (noise > HOT_RATIO)       climate = Climate.HOT
            return climate.id
        })
    }

    get(point) {
        const climate = this.#matrix.get(point)
        return Climate.get(climate)
    }

    getColor(point) {
        return this.get(point).color
    }

    is(point, type) {
        const id = this.#matrix.get(point)
        return id === type.id
    }

    getText(point) {
        const climate = this.get(point)
        return `Climate(${climate.name})`
    }
}
