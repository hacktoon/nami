import { SimplexNoise } from '/src/lib/noise'
import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_LEVEL = null
const MOUNTAIN = 1
const HILL = 2
const PLAIN = 3
const SHALLOW_SEA = 4
const DEEP_SEA = 5
const ABYSS = 6

const FEATURES = {
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#AAA'},
    [HILL]: {name: 'Hill', water: false, color: '#796'},
    [PLAIN]: {name: 'Plain', water: false, color: '#574'},
    [SHALLOW_SEA]: {name: 'Island', water: false, color: '#368'},
    [DEEP_SEA]: {name: 'Deep sea', water: true, color: '#047'},
    [ABYSS]: {name: 'Abyss', water: true, color: '#036'},
}

export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #maxLevel

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sideContinents) => {
            const continent = continentModel.get(point)
            for(let sideContinent of sideContinents) {
                continentModel.isOceanic()
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

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const landSimplex = new SimplexNoise(6, .8, .05)
        const featSimplex = new SimplexNoise(5, .9, .07)
        const oceanSimplex = new SimplexNoise(6, .8, .1)
        this.#maxLevel = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const isOceanic = continentModel.isOceanic(continent)
            const maxLevel = this.#maxLevel.get(continent)
            const level = this.#levelMatrix.get(point)
            const range = (1 * level) / maxLevel
            if (isOceanic) {
                const noise = oceanSimplex.wrappedNoise4D(rect, point)
                const featNoise = featSimplex.wrappedNoise4D(rect, point)
                if (range > .6)
                    return noise > 250 ? PLAIN : DEEP_SEA // core
                if (range > .2)
                    return noise > 220 ? SHALLOW_SEA : DEEP_SEA // outer core
                if (range > .1)
                    return featNoise > 170 ? ABYSS : DEEP_SEA
                return noise > 220 ? PLAIN : DEEP_SEA //border
            } else {
                const landNoise = landSimplex.wrappedNoise4D(rect, point)
                const featNoise = featSimplex.wrappedNoise4D(rect, point)
                if (range > .5) {
                    if (featNoise > 180)
                        return MOUNTAIN
                    if (featNoise > 60)
                        return HILL
                }
                if (range > .4) {
                    return featNoise > 100 ? HILL : PLAIN
                }
                if (range > .2) // [.2, .5)
                    return landNoise > 127 ? PLAIN : SHALLOW_SEA
                return landNoise > 200 ? PLAIN : DEEP_SEA
            }
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
    getChance(fill, origin) { return .1 }
    getGrowth(fill, origin) { return 10 }
}


class LevelFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const {continentModel, levelMatrix, maxLevel} = fill.context
        const continent = continentModel.get(point)
        const currentLevel = maxLevel.get(continent)
        if (level > currentLevel) {
            maxLevel.set(continent, level)
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
