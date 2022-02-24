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
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#999'},
    [HILL]: {name: 'Hill', water: false, color: '#685'},
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
            const group = continentModel.getGroup(continent)
            for(let sideContinent of sideContinents) {
                const sideGroup = continentModel.getGroup(sideContinent)
                if (group !== sideGroup) {
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

    #buildSurface(continentModel, noise, point) {
        const rect = this.#levelMatrix.rect
        const continent = continentModel.get(point)
        const isOceanic = continentModel.isOceanic(continent)
        const maxLevel = this.#maxLevel.get(continent)
        const level = this.#levelMatrix.get(point)
        const range = (1 * level) / maxLevel
        const featNoise = noise.feature.wrappedNoise4D(rect, point)
        if (isOceanic) {
            const oceanNoise = noise.ocean.wrappedNoise4D(rect, point)
            if (range > .6)
                return oceanNoise > 250 ? PLAIN : DEEP_SEA // core
            if (range > .2)
                return oceanNoise > 220 ? SHALLOW_SEA : DEEP_SEA // outer core
            if (range > .05)
                return featNoise > 180 ? ABYSS : DEEP_SEA
            return oceanNoise > 220 ? PLAIN : DEEP_SEA //border
        } else {
            const landNoise = noise.land.wrappedNoise4D(rect, point)
            if (range > .5) {
                if (featNoise > 180)
                    return MOUNTAIN
                return featNoise > 110 ? HILL : PLAIN
            }
            if (range > .2) {
                if (featNoise > 180)
                    return HILL
                return landNoise > 127 ? PLAIN : SHALLOW_SEA
            }
            if (range > .1) // island arc basins
                return featNoise > 200 ? PLAIN : DEEP_SEA
            // default land
            return landNoise > 200 ? PLAIN : DEEP_SEA
        }
    }

    constructor(regionTileMap, continentModel) {
        this.#maxLevel = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        const noise = {
            land: new SimplexNoise(6, .8, .05),
            ocean: new SimplexNoise(6, .8, .1),
            feature: new SimplexNoise(4, .8, .07),
        }
        this.#surfaceMatrix = Matrix.fromRect(regionTileMap.rect, point => {
            return this.#buildSurface(continentModel, noise, point)
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
