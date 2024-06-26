import { Grid } from '/src/lib/grid'

import { Rain } from './data'


const WET_RATIO = .3
const SEASONAL_RATIO = .4
const DRY_RATIO = .5
const ARID_RATIO = .65


// TODO: rain is dynamic, make noise offset and loop

export class RainLayer {
    #grid

    constructor(rect, layers) {
        this.layers = layers
        this.#grid = Grid.fromRect(rect, point => {
            const noise = layers.noise.get4D(rect, point, "atmos")
            if (noise > ARID_RATIO)     return Rain.ARID
            if (noise > DRY_RATIO)      return Rain.DRY
            if (noise > SEASONAL_RATIO) return Rain.SEASONAL
            if (noise > WET_RATIO)      return Rain.WET
            return Rain.HUMID
        })
    }

    get(point) {
        return this.#grid.get(point)
    }

    getColor(point) {
        const color = this.get(point).color
        if (this.layers.surface.isLand(point)) {
            return color
        }
        return this.layers.surface.getColor(point)
    }

    canCreateRiver(point) {
        const rain = this.get(point)
        const riverSourceOpts = [
            Rain.HUMID.id, Rain.WET.id, Rain.SEASONAL.id, Rain.DRY.id
        ]
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
