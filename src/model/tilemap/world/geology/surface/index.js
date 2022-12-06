import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { BASE_NOISE, BASE_RATIO, Surface } from './data'


const EMPTY = null
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    #noiseLayer
    #bodyMatrix
    #areaMap = new Map()
    #typeMap = new Map()
    #idCount = 1

    constructor(rect, noiseLayer) {
        this.#noiseLayer = noiseLayer
        this.#bodyMatrix = Matrix.fromRect(rect, () => EMPTY)
        this.#bodyMatrix.forEach(point => this.#detectType(BASE_RATIO, point))
    }

    #isWater(point, ratio) {
        const noise = this.#noiseLayer.get(BASE_NOISE, point)
        return noise < ratio
    }

    #detectType(ratio, originPoint) {
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
        const wrapPoint = point => this.#bodyMatrix.wrap(point)
        const Fill = isWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()

        const massRatio = (area * 100) / this.#bodyMatrix.area
        const type = this.#buildType(isWater, massRatio)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, type)
        this.#idCount++
    }

    #buildType(isWater, massRatio) {
        if (isWater) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                return Surface.OCEAN
            return Surface.LAKE
        }
        // land
        if (massRatio >= MINIMUN_CONTINENT_RATIO)
            return Surface.CONTINENT
        return Surface.ISLAND
    }

    get(point) {
        const body = this.#bodyMatrix.get(point)
        return Surface.fromId(this.#typeMap.get(body))
    }

    isWater(point) {
        const body = this.#bodyMatrix.get(point)
        return Surface.isWater(this.#typeMap.get(body))
    }

    isLand(point) {
        const body = this.#bodyMatrix.get(point)
        return Surface.isLand(this.#typeMap.get(body))
    }

    getArea(point) {
        const body = this.#bodyMatrix.get(point)
        return (this.#areaMap.get(body) * 100) / this.#bodyMatrix.area
    }
}
