import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Temperature } from '../climatology/temperature/data'
import { Place } from './data'


const EMPTY = null
const WATER_CITY_CHANCE = .005
const MIN_DISTANCE_RATIO = .1


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #matrix
    // there may be cities on these points
    #cityPoints

    constructor(rect, layers) {
        const candidateCityPoints = []
        this.#matrix = Matrix.fromRect(rect, point => {
            if (this.#isCandidateCity(layers, point)) {
                candidateCityPoints.push(point)
            }
            // set matrix init value
            return EMPTY
        })
        this.#cityPoints = this.#buildCities(candidateCityPoints)
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

    #buildCities(candidateCityPoints) {
        const cities = new PointSet()
        while (candidateCityPoints.length > 0) {
            const point = dequeueRandomItem(candidateCityPoints)
            cities.add(point)
        }
        return cities
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


function dequeueRandomItem(arr) {
    const lastIndex = arr.length - 1
    const randomIndex = Random.int(0, lastIndex)
    const value = arr[randomIndex]
    // copy last item to chosen index
    arr[randomIndex] = arr[lastIndex]
    // remove last item (faster operation)
    arr.pop()
    return value
}