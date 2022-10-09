import { ConcurrentFillSchedule, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'


const NO_LEVEL = null
const MOUNTAIN = 1
const PLATEAU = 2
const PLAIN = 3
const SHALLOW_SEA = 4
const DEEP_SEA = 5

const FEATURES = {
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#AAA'},
    [PLATEAU]: {name: 'Hill', water: false, color: '#796'},
    [PLAIN]: {name: 'Plain', water: false, color: '#574'},
    [SHALLOW_SEA]: {name: 'Island', water: true, color: '#058'},
    [DEEP_SEA]: {name: 'Deep sea', water: true, color: '#036'},
}

export class ReliefModel {
    #shorePoints = new PointSet()
    #levelMatrix
    #reliefMatrix
    #maxLevelMap
    #landArea

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sidePlates) => {
            const plate = continentModel.getPlate(point)
            const continent = continentModel.get(plate)
            for(let sidePlate of sidePlates) {
                const sideContinent = continentModel.get(sidePlate)
                if (continent !== sideContinent) {
                    origins.push(point)
                    break
                }
            }
        })
        return origins
    }

    #buildLevelMatrix(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const matrix = Matrix.fromRect(rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            maxLevelMap: this.#maxLevelMap,
            area: rect.area,
            levelMatrix: matrix,
            continentModel,
        }).fill()
        return matrix
    }

    #buildReliefMatrix(noiseTileMap, regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        return Matrix.fromRect(rect, point => {
            const noise = noiseTileMap.getNoise(point)
            return this.#buildRelief(continentModel, noise, point)
        })
    }

    #buildRelief(continentModel, noise, point) {
        const plate = continentModel.getPlate(point)
        const isOceanic = continentModel.isOceanic(plate)
        const maxLevel = this.#maxLevelMap.get(plate)
        const level = this.#levelMatrix.get(point)
        const range = (1 * level) / maxLevel
        if (isOceanic) {
            // oceanic islands
            if (range > .3 && range < .7 && noise > .7) { return PLAIN }
            return noise > .2 ? DEEP_SEA : SHALLOW_SEA
        }
        return PLAIN
        // areas inside continents
        if (range > .3) {
            // if (range > .6 && range < .9 && noise > .55) { return MOUNTAIN }
            // if (range > .3 && noise > .5) { return PLATEAU }
        }
        // areas between continents
        if (noise > .65) return PLAIN  // islands
        // return noise > .4 ? SHALLOW_SEA : DEEP_SEA
        return DEEP_SEA
    }

    #detectShore(point) {
        for(let sidePoint of Point.adjacents(point)) {
            if (this.isWater(sidePoint)) return true
        }
        return false
    }

    constructor(noiseTileMap, regionTileMap, continentModel) {
        this.#maxLevelMap = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#reliefMatrix = this.#buildReliefMatrix(
            noiseTileMap, regionTileMap, continentModel
        )
        this.#landArea = 0
        // count land, detect shores and make adjustments to relief matrix
        Matrix.fromRect(regionTileMap.rect, point => {
            if (this.isLand(point)) {
                this.#landArea += 1
                if (this.#detectShore(point)) {
                    this.#reliefMatrix.set(point, PLAIN)
                    this.#shorePoints.add(point)
                }
            }
        })
    }

    get(point) {
        const relief = this.#reliefMatrix.get(point)
        return FEATURES[relief]
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getShorePoints() {
        return this.#shorePoints
    }

    landArea() {
        return this.#landArea
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }

    isShore(point) {
        return this.#shorePoints.has(point)
    }
}


class LevelMultiFill extends ConcurrentFillSchedule {
    constructor(origins, context) {
        super(origins, LevelFloodFill, context)
    }
    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 8 }
}


class LevelFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const {continentModel, levelMatrix, maxLevelMap} = fill.context
        const plate = continentModel.getPlate(point)
        const currentLevel = maxLevelMap.get(plate)
        if (level > currentLevel) {
            maxLevelMap.set(plate, level)
        }
        levelMatrix.set(point, level)
    }

    isEmpty(fill, point) {
        return fill.context.levelMatrix.get(point) === NO_LEVEL
    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
