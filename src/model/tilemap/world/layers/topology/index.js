import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { drawCity, drawCapital, drawDungeon } from './draw'

const CITY_RADIUS = 10
const WATER_CITY_CHANCE = .003
const WATER_DUNGEON_CHANCE = .02
const LAND_DUNGEON_CHANCE = .2


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #layers
    #rect
    #placeMap = new Map()
    #cityPoints
    #dungeonPoints = new PointSet()
    #capitals = new PointSet()
    #realmCount

    constructor(rect, layers, realmCount) {
        const possibleCityPoints = new PointArraySet()
        this.#rect = rect
        this.#realmCount = realmCount
        this.#layers = layers
        Matrix.fromRect(rect, point => {
            if (this.#isPossibleCity(layers, point)) {
                possibleCityPoints.add(point)
            }
            // if (this.#isDungeon(layers, point)) {
            //     this.#dungeonPoints.add(point)
            // }
        })
        this.#cityPoints = this.#buildCities(rect, possibleCityPoints)
    }

    #isPossibleCity(layers, point) {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        return isLand && (isRiver || isBorder)
    }

    #isDungeon(layers, point) {
        if (layers.surface.isLand(point)) {
            return Random.chance(LAND_DUNGEON_CHANCE)
        } else {
            return Random.chance(WATER_DUNGEON_CHANCE)
        }
    }

    #buildCities(rect, possibleCityPoints) {
        const cityPoints = new PointSet()
        let realmId = this.#realmCount
        while (possibleCityPoints.size > 0) {
            const center = possibleCityPoints.random()
            // remove candidate points around a city circle
            const radius = Math.floor(rect.width / 10)
            Point.insideCircle(center, radius, point => {
                possibleCityPoints.delete(rect.wrap(point))
            })
            cityPoints.add(center)
            if (realmId > 0)
                this.#capitals.add(center)
            realmId--
        }
        return cityPoints
    }

    isCity(point) {
        return this.#cityPoints.has(point)
    }

    isCapital(point) {
        return this.#capitals.has(point)
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
            const isCapital = this.#capitals.has(point)
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
        // if(this.isDungeon(point))
        //     drawDungeon(props)
    }
}
