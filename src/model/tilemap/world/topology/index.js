import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { Temperature } from '../climatology/temperature/data'
import { Place } from './data'


const WATER_CITY_CHANCE = .005
const CITY_RADIUS = 3


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #placeMap = new Map()
    #cityPoints
    #realmCount

    constructor(rect, layers, realmCount) {
        const candidateCityPoints = new PointArraySet()
        Matrix.fromRect(rect, point => {
            if (this.#isCandidateCity(layers, point)) {
                candidateCityPoints.add(point)
            }
            // set matrix init value
            this.#placeMap.set(point, 1)
        })
        this.#cityPoints = this.#buildCities(rect, candidateCityPoints)
        this.#realmCount = realmCount
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
        const cityPoints = new PointSet()
        let realmId = this.#realmCount
        while (candidateCityPoints.size > 0) {
            const center = candidateCityPoints.random()
            let isCapital = false
            // remove candidate points around a city center
            Point.insideCircle(center, CITY_RADIUS, point => {
                candidateCityPoints.delete(rect.wrap(point))
            })
            isCapital = realmId > 0
            cityPoints.add(center)
            realmId--
        }
        return cityPoints
    }

    #buildCity(rect, candidateCityPoints) {

        return {}
    }

    has(point) {
        return this.#cityPoints.has(point)
    }

    get(point) {
        return this.#placeMap.get(point)
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {

    }
}
