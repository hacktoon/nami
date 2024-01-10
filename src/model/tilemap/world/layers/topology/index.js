import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { drawCity, drawCapital, drawDungeon } from './draw'

const CITY_RADIUS = 10
const WATER_CITY_CHANCE = .003
const WATER_DUNGEON_CHANCE = .02
const LAND_DUNGEON_CHANCE = .2


export class LocationLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #placeMap = new Map()
    #cityPoints
    #capitalPoints
    #dungeonPoints = new PointSet()
    #realmCount

    constructor(rect, layers, realmCount) {
        this.#realmCount = realmCount
        this.#cityPoints = this.#buildCities(rect, layers)
        this.#capitalPoints = this.#buildCapitals(layers, this.#cityPoints)
    }

    #buildCities(rect, layers) {
        const candidates = new PointArraySet()
        Grid.fromRect(rect, point => {
            if (this.#isPossibleCity(layers, point)) {
                candidates.add(point)
            }
        })
        const cityPoints = new PointSet()
        while (candidates.size > 0) {
            const center = candidates.random()
            // remove candidate points around a city circle
            const radius = Math.floor(rect.width / 10)
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
            // random city will become a capital (avoid islands)
            if (realmId-- >= 0 && !layers.surface.isIsland(point))
                capitalPoints.add(point)
        })
        return capitalPoints
    }

    #isDungeon(layers, point) {
        if (layers.surface.isLand(point)) {
            return Random.chance(LAND_DUNGEON_CHANCE)
        } else {
            return Random.chance(WATER_DUNGEON_CHANCE)
        }
    }

    isCity(point) {
        return this.#cityPoints.has(point)
    }

    isCapital(point) {
        return this.#capitalPoints.has(point)
    }

    isDungeon(point) {
        return this.#dungeonPoints.has(point)
    }

    get(point) {
        return this.#placeMap.get(point)
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const attrs = []
        if (this.#cityPoints.has(point)) {
            const isCapital = this.#capitalPoints.has(point)
            attrs.push(isCapital ? `capital=` : `city=`)
        }
        if (this.#dungeonPoints.has(point)) {
            attrs.push(`dungeon`)
        }
        if (attrs.length > 0)
            return `Topo(${attrs.join(',')})`
        return ''
    }

    draw(point, props) {
        if (this.isCity(point)) {
            if (this.isCapital(point)) {
                drawCapital(props)
            } else {
                drawCity(props)
            }
        }
        if(this.isDungeon(point))
            drawDungeon(props)
    }
}
