import { Climate } from './data'


const HOT_RATIO = .65
const WARM_RATIO = .5
const TEMPERATE_RATIO = .3
const COLD_RATIO = .1


export class ClimateLayer {
    constructor(context) {
        this.world = context.world
        this.rect = context.rect
    }

    get(point) {
        const noise = this.world.noise.get4DClimate(this.rect, point)
        if (noise > HOT_RATIO)       return Climate.HOT
        if (noise > WARM_RATIO)      return Climate.WARM
        if (noise > TEMPERATE_RATIO) return Climate.TEMPERATE
        if (noise > COLD_RATIO)      return Climate.COLD
        return Climate.FROZEN
    }

    is(point, type) {
        const rain = this.get(point)
        return rain.id === type.id
    }

    getText(point) {
        const climate = this.get(point)
        return `Climate(${climate.name})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, world, tileSize, tilePoint} = props
        const isLand = world.surface.isLand(tilePoint)
        // let color = isLand ? this.get(tilePoint).color.toHex() : '#2f367d'
        let color = this.get(tilePoint).color.toHex()
        canvas.rect(canvasPoint, tileSize, color)
    }
}
