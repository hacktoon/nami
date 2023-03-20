import { PointMap } from '/src/lib/point/map'
import { Random } from '/src/lib/random'

import { Lake } from './data'


export class LakeLayer {
    // maps an id to a name
    #names = new Map()
    // map a point to an id
    #points = new PointMap()
    #typeMap = new Map()

    constructor(layers) {
        let lakeId = 0
        for (let point of layers.basin.getDepressions()) {
            this.#points.set(point, lakeId)
            this.#typeMap.set(point, lakeId)
            lakeId++

        }
    }

    #detectType(layers, point) {
        const rain = layers.rain.get(point)
        const temperature = layers.temperature.get(point)
        const isRiver = layers.river.has(point)
        const isRiverSource = isRiver && layers.basin.isDivide(point)
        if (isRiver && layers.river.isMouth(point)) {
            return Lake.ESTUARY
        }
        return Lake.FRESH
    }

    get count() {
        return this.#names.size
    }

    has(point) {
        return this.#points.has(point)
    }

    get(point) {
        const id = this.#points.get(point)
        return {
            id,
            name: this.#names.get(id),
        }
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const lake = this.get(point)
        const attrs = [
             `name=${lake.name}`,
        ].join(',')
        return `Lake(${attrs})`
    }
}
