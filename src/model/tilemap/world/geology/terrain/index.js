import { Matrix } from '/src/lib/matrix'

import { Terrain } from './data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const HILL_RATIO = .55
const PLATEAU_RATIO = .4
const MOUNTAIN_RATIO = .4


export class TerrainLayer {
    // Terrain is related to large geologic features
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            return type.id
        })
    }

    #detectWaterType(layers, point) {
        // use noise to create water terrain
        const outlineNoise = layers.noise.getOutline(point)
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        if (outlineNoise > PLATFORM_RATIO) return Terrain.PLATFORM
        if (featureNoise > OCEAN_RATIO) return Terrain.OCEAN
        if (grainedNoise > TRENCH_RATIO) return Terrain.TRENCH
        return Terrain.ABYSS
    }

    #detectLandType(layers, point) {
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        const isRiverSource = layers.river.has(point) && layers.basin.isDivide(point)
        if (isRiverSource) {
            if (featureNoise > MOUNTAIN_RATIO) return Terrain.MOUNTAIN
            return Terrain.PLATEAU
        } else {
            // all depositional rives parts are plains
            if (layers.river.isDepositional(point)) return Terrain.PLAIN
            const isFastCourse = layers.river.isFastCourse(point)
            const isHeadWaters = layers.river.isHeadWaters(point)
            // define hill for other river points on the basin
            if (isFastCourse || isHeadWaters) return Terrain.HILL
        }
        // not on a river, try adding more plateaus or hills
        if (grainedNoise < PLATEAU_RATIO) return Terrain.PLATEAU
        if (grainedNoise < HILL_RATIO) return Terrain.HILL
        return Terrain.PLAIN
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }

    getText(point) {
        const terrain = this.get(point)
        return `Terrain(${terrain.name})`
    }

    isMountain(point) {
        const id = this.#matrix.get(point)
        return id === Terrain.MOUNTAIN.id
    }

    isPlatform(point) {
        const id = this.#matrix.get(point)
        return id === Terrain.PLATFORM.id
    }

    isTrench(point) {
        const id = this.#matrix.get(point)
        return id === Terrain.TRENCH.id
    }

    isPlain(point) {
        const id = this.#matrix.get(point)
        return id === Terrain.PLAIN.id
    }
}
