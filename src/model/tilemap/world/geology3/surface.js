import { SimplexNoise } from '/src/lib/noise'
import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_LEVEL = null
const PEAK = 0
const MOUNTAIN = 1
const HILL = 2
const PLATEAU = 3
const PLAIN = 4
const SHALLOW_SEA = 5
const SEA_PLATEAU = 6
const DEEP_SEA = 7
const ABYSS = 8

const FEATURES = {
    [PEAK]: {name: 'Peak', water: false, color: '#DDD'},
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#999'},
    [HILL]: {name: 'Hill', water: false, color: '#685'},
    [PLATEAU]: {name: 'Plateau', water: false, color: '#875'},
    [PLAIN]: {name: 'Plain', water: false, color: '#574'},
    [SHALLOW_SEA]: {name: 'Island', water: true, color: '#369'},
    [SEA_PLATEAU]: {name: 'Sea plain', water: true, color: '#147'},
    [DEEP_SEA]: {name: 'Deep sea', water: true, color: '#036'},
    [ABYSS]: {name: 'Abyss', water: true, color: '#025'},
}

export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #maxLevel

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

    #buildSurface(continentModel, noise, point) {
        const rect = this.#levelMatrix.rect
        const plate = continentModel.getPlate(point)
        const isOceanic = continentModel.isOceanic(plate)
        const maxLevel = this.#maxLevel.get(plate)
        const level = this.#levelMatrix.get(point)
        const range = (1 * level) / maxLevel
        const featNoise = noise.feature.wrappedNoise4D(rect, point)
        if (isOceanic) {
            const oceanNoise = noise.ocean.wrappedNoise4D(rect, point)
            if (range > .6)
                return oceanNoise > 250 ? PLAIN : DEEP_SEA // core
            if (range > .3)
                return oceanNoise > 150 ? SEA_PLATEAU : DEEP_SEA
            if (range > .2)
                return oceanNoise > 220 ? SHALLOW_SEA : DEEP_SEA // outer core
            if (range > .1)
                return featNoise > 180 ? ABYSS : DEEP_SEA
            return oceanNoise > 220 ? PLAIN : DEEP_SEA //border
        } else {
            if (range > .8 && featNoise > 200) {
                return PEAK
            }
            if (range > .4) {
                if (featNoise > 180)
                    return MOUNTAIN
                return featNoise > 110 ? HILL : PLAIN
            }
            if (range > .3) {
                return featNoise > 180 ? PLATEAU : PLAIN
            }
            if (range > .2) {
                if (featNoise > 180)
                    return HILL
                return featNoise > 127 ? PLAIN : SHALLOW_SEA
            }
            if (range > .1) { // island arc basins
                if (featNoise > 200)
                    return PLAIN
                return featNoise > 127 ? DEEP_SEA : SHALLOW_SEA
            }
            // default land
            const landNoise = noise.land.wrappedNoise4D(rect, point)
            return landNoise > 180 ? PLAIN : DEEP_SEA
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
