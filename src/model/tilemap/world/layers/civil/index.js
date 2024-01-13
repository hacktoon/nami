import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { drawCity, drawCapital } from './draw'
import { buildRealmGrid } from './fill'

const CITY_RATIO = .08


export class CivilLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #locationMap = new Map()
    #realmGrid
    #cityPoints
    #capitalPoints
    #realmCount

    constructor(rect, layers, realmCount) {
        this.#realmCount = realmCount
        this.#cityPoints = this.#buildCities(rect, layers)
        this.#capitalPoints = this.#buildCapitals(layers, this.#cityPoints)
        this.#realmGrid = buildRealmGrid(rect, layers, this.#capitalPoints)
    }

    #buildCities(rect, layers) {
        const candidates = new PointArraySet()
        const cityPoints = new PointSet()
        Grid.fromRect(rect, point => {
            if (this.#isPossibleCity(layers, point)) {
                candidates.add(point)
            }
        })
        while (candidates.size > 0) {
            const center = candidates.random()
            // remove candidate points in a circle area
            const radius = Math.floor(rect.width * CITY_RATIO)
            Point.insideCircle(center, radius, point => {
                candidates.delete(rect.wrap(point))
            })
            cityPoints.add(center)
        }
        return cityPoints
    }

    #isPossibleCity(layers, point) {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        return isLand && (isRiver || isBorder)
    }

    #buildCapitals(layers, cityPoints) {
        const capitalPoints = new PointSet()
        let realmId = this.#realmCount
        cityPoints.forEach(point => {
            // random city will become a capital
            if (realmId >= 0)
                capitalPoints.add(point)
            realmId--
        })
        return capitalPoints
    }

    isCity(point) {
        return this.#cityPoints.has(point)
    }

    isCapital(point) {
        return this.#capitalPoints.has(point)
    }

    get(point) {
        return this.#locationMap.get(point)
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const realm = this.#realmGrid.get(point)
        if (this.#cityPoints.has(point)) {
            const isCapital = this.#capitalPoints.has(point)
            const cap = isCapital ? 'capital' : 'city'
            return `Civil(${cap},realm=${realm})`
        }
        return `Civil(realm=${realm})`
    }

    draw(point, props) {
        if (this.isCity(point)) {
            if (this.isCapital(point)) {
                drawCapital(props)
            } else {
                drawCity(props)
            }
        }
    }
}
