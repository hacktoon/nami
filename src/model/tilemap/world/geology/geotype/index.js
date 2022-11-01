import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { BASE_NOISE, BASE_RATIO, Geotype } from './data'


const EMPTY = null
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_CONTINENT_RATIO = 1


export class GeotypeLayer {
    // Geotypes are islands, continents, oceans, seas and lakes
    #rect
    #noiseMap
    #bodyMatrix
    #idCount = 1
    #areaMap = new Map()
    #typeMap = new Map()

    constructor(noiseMapSet) {
        this.#noiseMap = noiseMapSet.get(BASE_NOISE)
        this.#rect = this.#noiseMap.rect
        this.#bodyMatrix = Matrix.fromRect(this.#rect, () => EMPTY)
        this.#bodyMatrix.forEach(point => this.#detectType(point, BASE_RATIO))
    }

    #isWater(point, ratio) {
        const noise = this.#noiseMap.getNoise(point)
        return noise < ratio
    }

    #detectType(originPoint, ratio) {
        if (this.#bodyMatrix.get(originPoint) !== EMPTY)
            return
        let area = 0
        const isWater = this.#isWater(originPoint, ratio)
        const canFill = point => {
            const sameType = isWater === this.#isWater(point, ratio)
            return sameType && this.#bodyMatrix.get(point) === EMPTY
        }
        const onFill = point => {
            this.#bodyMatrix.set(point, this.#idCount)
            area++
        }
        const wrapPoint = point => this.#rect.wrap(point)
        const Fill = isWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()

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
        const body = this.#bodyMatrix.get(point)
        return Geotype.isWater(this.#typeMap.get(body))
    }

    isLand(point) {
        const body = this.#bodyMatrix.get(point)
        return Geotype.isLand(this.#typeMap.get(body))
    }

    getArea(point) {
        const body = this.#bodyMatrix.get(point)
        return (this.#areaMap.get(body) * 100) / this.#rect.area
    }
}
