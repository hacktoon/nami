import { Grid } from '/src/lib/grid'

import { Rain } from './data'


const WET_RATIO = .2
const SEASONAL_RATIO = .4
const DRY_RATIO = .6
const ARID_RATIO = .8


// TODO: rain is dynamic, make noise offset and loop

export class RainLayer {
    #grid

    constructor(context) {
        const {world, rect} = context
        this.world = world
        this.#grid = Grid.fromRect(rect, point => {
            const noise = world.noise.get4DRain(rect, point)
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

    canCreateRiver(point) {
        const rain = this.get(point)
        const riverSourceOpts = [
            Rain.HUMID.id, Rain.WET.id, Rain.SEASONAL.id
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

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
