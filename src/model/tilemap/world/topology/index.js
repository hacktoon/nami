import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { Temperature } from '../climatology/temperature/data'
import { Place } from './data'


const EMPTY = null
const WATER_CITY_CHANCE = .005
const CITY_MIN_DISTANCE = 3


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #matrix
    #cityPoints

    constructor(rect, layers) {
        const candidateCityPoints = new PointArraySet()
        this.#matrix = Matrix.fromRect(rect, point => {
            if (this.#isCandidateCity(layers, point)) {
                candidateCityPoints.add(point)
            }
            // set matrix init value
            return EMPTY
        })
        this.#cityPoints = this.#buildCities(rect, candidateCityPoints)
    }

    #isCandidateCity(layers, point) {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.relief.isBorder(point)
        const isRiver = layers.hydro.isRiver(point)
        const isLake = layers.hydro.isLake(point)
        const isWaterCity = !isLand && Random.chance(WATER_CITY_CHANCE)
        const isLandCity = isLand && (isRiver || isLake || isBorder)
        return isWaterCity || isLandCity
    }

    #buildCities(rect, candidateCityPoints) {
        const cities = new PointSet()
        while (candidateCityPoints.size > 0) {
            const point = candidateCityPoints.random()
            const city = this.#buildCity(rect, point, candidateCityPoints)
            cities.add(point)
        }
        return cities
    }

    #buildCity(rect, center, candidateCityPoints) {
        const radius = CITY_MIN_DISTANCE
        Point.insideCircle(center, radius, point => {
            candidateCityPoints.delete(rect.wrap(point))
        })
    }

    has(point) {
        return this.#cityPoints.has(point)
    }

    get(point) {
        return this.#matrix.get(point)
    }

    getTotalCities() {
        return this.#cityPoints.length
    }

    getText(point) {

    }
}
