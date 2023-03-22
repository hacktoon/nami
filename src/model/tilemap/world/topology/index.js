import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'


const CITY_RADIUS = 3
const WATER_CITY_CHANCE = .003
const WATER_DUNGEON_CHANCE = .01
const LAND_DUNGEON_CHANCE = .08


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #placeMap = new Map()
    #cityPoints
    #dungeonPoints = new PointSet()
    #capitals = new PointSet()
    #realmCount

    constructor(rect, layers, realmCount) {
        const possibleCityPoints = new PointArraySet()
        this.#realmCount = realmCount
        Matrix.fromRect(rect, point => {
            if (this.#isPossibleCity(layers, point)) {
                possibleCityPoints.add(point)
            }
            if (this.#isDungeon(layers, point)) {
                this.#dungeonPoints.add(point)
            }
            // set matrix init value
            this.#placeMap.set(point, 1)
        })
        this.#cityPoints = this.#buildCities(rect, possibleCityPoints)
    }

    #isPossibleCity(layers, point) {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        const isLake = false //layers.river.isLake(point)
        const isWaterCity = !isLand && Random.chance(WATER_CITY_CHANCE)
        const isLandCity = isLand && (isRiver || isLake || isBorder)
        return isWaterCity || isLandCity
    }

    #isDungeon(layers, point) {
        const isLand = layers.surface.isLand(point)
        const isWaterDungeon = !isLand && Random.chance(WATER_DUNGEON_CHANCE)
        const isLandDungeon = isLand && Random.chance(LAND_DUNGEON_CHANCE)
        return isWaterDungeon || isLandDungeon
    }

    #buildCities(rect, possibleCityPoints) {
        const cityPoints = new PointSet()
        let realmId = this.#realmCount
        while (possibleCityPoints.size > 0) {
            const center = possibleCityPoints.random()
            // remove candidate points around a city circle
            Point.insideCircle(center, CITY_RADIUS, point => {
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
        return `Topo(${attrs.join(',')})`
    }
}
