import { Rain } from './data'


const WET_RATIO = .3
const SEASONAL_RATIO = .4
const DRY_RATIO = .5
const ARID_RATIO = .65


// TODO: rain is dynamic, make noise offset and loop

export class RainLayer {
    constructor(layers) {
        this.layers = layers
    }

    get(point) {
        const noise = this.layers.noise.get2D(point, "feature")
        if (noise > ARID_RATIO)     return Rain.ARID
        if (noise > DRY_RATIO)      return Rain.DRY
        if (noise > SEASONAL_RATIO) return Rain.SEASONAL
        if (noise > WET_RATIO)      return Rain.WET
        return Rain.HUMID
    }

    getColor(point) {
        return this.get(point).color
    }

    canCreateRiver(point) {
        const rain = this.get(point)
        const riverSourceOpts = [Rain.HUMID.id, Rain.WET.id, Rain.SEASONAL.id]
        return riverSourceOpts.includes(rain.id)
    }

    is(point, type) {
        const rain = this.get(point)
        return rain.id === type.id
    }

    getText(point) {
        const rain = this.get(point)
        return `Rain(${rain.name})`
    }
}
