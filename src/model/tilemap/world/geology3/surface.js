import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const NO_LEVEL = null

const DEBUG = 0
const MOUNTAIN = 1
const PLATEAU = 2
const PLAIN = 3
const SHALLOW_SEA = 4
const DEEP_SEA = 5

const FEATURES = {
    [DEBUG]: {name: 'Plain', water: false, color: '#A74'},
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#AAA'},
    [PLATEAU]: {name: 'Hill', water: false, color: '#796'},
    [PLAIN]: {name: 'Plain', water: false, color: '#574'},
    [SHALLOW_SEA]: {name: 'Island', water: true, color: '#058'},
    [DEEP_SEA]: {name: 'Deep sea', water: true, color: '#036'},
}


export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #maxLevel
    #noiseMap

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
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const matrix = Matrix.fromRect(regionTileMap.rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            maxLevel: this.#maxLevel,
            area: regionTileMap.rect.area,
            levelMatrix: matrix,
            continentModel,
        }).fill()
        return matrix
    }

    #buildOutline(continentModel, noise, point) {
        const plate = continentModel.getPlate(point)
        const isOceanic = continentModel.isOceanic(plate)
        const maxLevel = this.#maxLevel.get(plate)
        const level = this.#levelMatrix.get(point)
        const range = (1 * level) / maxLevel
        if (isOceanic) {
            return noise > .75 ? PLAIN : DEEP_SEA
        } else {
            if (range > .4) return PLAIN
            return noise > .6 ? PLAIN : DEEP_SEA
        }
    }

    constructor(seed, regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        this.#maxLevel = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#noiseMap = NoiseTileMap.fromData({
            rect: rect.hash(),
            octaves:     5,
            resolution: .8,
            scale:      .1,
            seed,
        })
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const noise = this.#noiseMap.getNoise(point)
            return this.#buildOutline(continentModel, noise, point)
        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getFeature(point) {
        const surface = this.#surfaceMatrix.get(point)
        return FEATURES[surface]
    }

    isWater(point) {
        return this.get(point) === TYPE_WATER
    }
}


class LevelMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, LevelFloodFill, context)
    }
    getChance(fill, origin) { return .5 }
    getGrowth(fill, origin) { return 4 }
}


class LevelFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const {continentModel, levelMatrix, maxLevel} = fill.context
        const plate = continentModel.getPlate(point)
        const currentLevel = maxLevel.get(plate)
        if (level > currentLevel) {
            maxLevel.set(plate, level)
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
