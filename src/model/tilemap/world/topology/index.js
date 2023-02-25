import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'

import { Temperature } from '../climatology/temperature/data'
import { Place } from './data'


const EMPTY = null
const LAND_CITY_RATIO = .4
const WATER_CITY_RATIO = .005
const MIN_DISTANCE_RATIO = .1


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #matrix
    // there may be cities on these points
    #citySeedPoints = []
    #cityPoints = new PointMap()

    constructor(rect, layers) {
        this.#matrix = this.#buildMatrix(rect, layers)
    }

    #buildMatrix(rect, layers) {
        return Matrix.fromRect(rect, point => {
            // detect early features
            const isBorder = layers.relief.isBorder(point)
            const isLand = layers.surface.isLand(point)
            const isRiver = layers.hydro.isRiver(point)
            const isLake = layers.hydro.isLake(point)
            const isWaterCity = !isLand && Random.chance(WATER_CITY_RATIO)
            const isLandCity = isLand && (isRiver || isLake || isBorder)
            if (isWaterCity || isLandCity) {
                this.#citySeedPoints.push(point)
                return 1
            }
            // set matrix init value
            return EMPTY
        })
    }

    #buildType(layers, point) {

    }

    has(point) {
        return this.#matrix.get(point) !== EMPTY
    }

    get(point) {
        return this.#matrix.get(point)
    }

    getTotalCities() {
        return this.#citySeedPoints.length
    }

    getText(point) {

    }
}
