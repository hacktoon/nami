import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { BASE_NOISE, SURFACE_RATIO, Surface } from './data'


const EMPTY = null
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .12
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    #noiseLayer
    #bodyIdMatrix
    #areaMap = new Map()
    #surfaceIdMap = new Map()
    #bodyIdCount = 1

    constructor(rect, noiseLayer) {
        this.#noiseLayer = noiseLayer
        // init matrix with empty cells
        this.#bodyIdMatrix = Matrix.fromRect(rect, () => EMPTY)
        // detect surface regions and area
        this.#bodyIdMatrix.forEach(point => this.#fillBody(point))
    }

    #fillBody(originPoint) {
        if (this.#bodyIdMatrix.get(originPoint) !== EMPTY)
            return
        let area = 0
        const isBelowRatio = this.#isBelowRatio(originPoint)
        const canFill = point => {
            const sameType = isBelowRatio === this.#isBelowRatio(point)
            return sameType && this.#bodyIdMatrix.get(point) === EMPTY
        }
        const onFill = point => {
            this.#bodyIdMatrix.set(point, this.#bodyIdCount)
            area++
        }
        const wrapPoint = point => this.#bodyIdMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isBelowRatio ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()

        const type = this.#detectType(isBelowRatio, area)
        this.#areaMap.set(this.#bodyIdCount, area)
        this.#surfaceIdMap.set(this.#bodyIdCount, type)
        this.#bodyIdCount++
    }

    #isBelowRatio(point) {
        const noise = this.#noiseLayer.get(BASE_NOISE, point)
        return SURFACE_RATIO >= noise
    }

    #detectType(isBelowRatio, area) {
        const massRatio = (area * 100) / this.#bodyIdMatrix.area
        // area is filled; decide type
        if (isBelowRatio) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                return Surface.OCEAN
            if (massRatio >= MINIMUN_SEA_RATIO)
                return Surface.SEA
            return Surface.DEPRESSION
        }
        // above ratio
        if (massRatio >= MINIMUN_CONTINENT_RATIO)
            return Surface.CONTINENT
        return Surface.ISLAND
    }

    get(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        return Surface.fromId(this.#surfaceIdMap.get(bodyId))
    }

    isWater(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        const surfaceId = this.#surfaceIdMap.get(bodyId)
        return Surface.isWater(surfaceId)
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isDepression(point) {
        return this.get(point).id === Surface.DEPRESSION
    }

    getArea(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        return (this.#areaMap.get(bodyId) * 100) / this.#bodyIdMatrix.area
    }
}
