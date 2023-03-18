import { PointMap } from '/src/lib/point/map'
import { Random } from '/src/lib/random'

import { Lake } from './data'


export class LakeLayer {
    // maps an id to a name
    #names = new Map()
    // map a point to an id
    #points = new PointMap()

    constructor(layers) {
        for (let waterSource of layers.basin.getWaterSources()) {
            if (Random.chance()) {

            }
        }
    }

    #buildLake(layers, point) {

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
