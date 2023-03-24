import { Matrix } from '/src/lib/matrix'
import { PointMap } from '/src/lib/point/map'

import { Landform } from '../../data/landform'
import { Biome } from '../biome/data'



export class LandformLayer {
    // Landform is related to world feature and block layout
    #landforms = new PointMap()

    constructor(rect, layers) {
        Matrix.fromRect(rect, point => {
            const type = this.#detectType(layers, point)
            if (type) {
                this.#landforms.set(point, type.id)
            }
        })
    }

    #detectType(layers, point) {
        const biome = layers.biome.get(point)
        const isDesert = biome.is(Biome.DESERT)
        if (isDesert) {
            return Landform.DUNES
        }
        return
    }

    get(point) {
        const id = this.#landforms.get(point)
        return Landform.get(id)
    }

    is(point, type) {
        const id = this.#landforms.get(point)
        return id === type.id
    }

    getText(point) {
        const landform = this.get(point)
        return `Landform(${landform.name})`
    }

}
