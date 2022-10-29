import { Matrix } from '/src/lib/matrix'
import { PointMap } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { Geotype } from './data'


const EMPTY = null
// percentages
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = 0.2
const MINIMUN_CONTINENT_RATIO = 2


export class GeotypeLayer {
    // Geotypes are islands, continents, oceans, seas and lakes
    #rect
    #noiseMap
    #bodyMatrix
    #idCount = 1
    #areaMap = new Map()
    #typeMap = new Map()

    constructor(noiseMap, ratio) {
        this.#noiseMap = noiseMap
        this.#rect = noiseMap.rect
        this.#bodyMatrix = Matrix.fromRect(this.#rect, () => EMPTY)
        this.#bodyMatrix.forEach(point => this.#detectType(point, ratio))
    }

    #isWater(point, ratio) {
        const noise = this.#noiseMap.getNoise(point)
        return noise < ratio
    }

    #detectType(point, ratio) {
        if (this.#bodyMatrix.get(point) !== EMPTY)
            return
        let area = 0
        const isWater = this.#isWater(point, ratio)
        const canFill = pt => {
            const sameType = isWater === this.#isWater(pt, ratio)
            return sameType && this.#bodyMatrix.get(pt) === EMPTY
        }
        const onFill = pt => {
            this.#bodyMatrix.set(pt, this.#idCount)
            area++
        }
        const wrapPoint = pt => this.#rect.wrap(pt)
        const Fill = isWater ? ScanlineFill8 : ScanlineFill
        new Fill(point, {canFill, wrapPoint, onFill}).fill()

        const massRatio = (area * 100) / this.#rect.area
        const type = this.#buildType(isWater, massRatio)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, type)
        this.#idCount++
    }

    #buildType(isWater, massRatio) {
        if (isWater) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                return Geotype.OCEAN
            if (massRatio >= MINIMUN_SEA_RATIO)
                return Geotype.SEA
            return Geotype.LAKE
        }
        // land
        if (massRatio >= MINIMUN_CONTINENT_RATIO)
            return Geotype.CONTINENT
        return Geotype.ISLAND
    }

    get(point) {
        const body = this.#bodyMatrix.get(point)
        return Geotype.fromId(this.#typeMap.get(body))
    }

    isWater(point) {
        return this.get(point).water
    }

    getArea(point) {
        const body = this.#bodyMatrix.get(point)
        return (this.#areaMap.get(body) * 100) / this.#rect.area
    }
}
