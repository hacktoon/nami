import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'

import { Place } from './data'


const EMPTY = null
const MIN_DISTANCE_RATIO = .1


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #matrix
    #cityCandidatePoints = []
    #cityPoints = new PointMap()

    constructor(rect, layers) {
        this.#matrix = this.#buildMatrix(rect, layers)
    }

    #buildMatrix(rect, layers) {
        return Matrix.fromRect(rect, point => {
            // detect early features
            const isLand = layers.surface.isLand(point)
            const isRiver = layers.hydro.isRiver(point)
            const isLake = layers.hydro.isLake(point)
            // const temperature = layers.temperature.get(point)
            // const isFrozen = temperature.isFrozen(point)
            if (isLand) {
                if (isRiver || isLake) {
                    this.#cityCandidatePoints.push(point)
                }
            } else {

            }
            // set matrix init value
            return EMPTY
        })
    }

    #buildType(layers, point) {

    }

    #

    has(point) {
        return this.#matrix.get(point) !== EMPTY
    }

    get(point) {
        return this.#matrix.get(point)
    }

    getText(point) {

    }
}
