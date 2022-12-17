import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { BASE_NOISE, SURFACE_RATIO, Surface } from './data'


const EMPTY = null
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .12
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    #noiseLayer
    #surfaceIdMatrix
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #areaMap = new Map()
    #typeMap = new Map()
    #idCount = 1

    constructor(noiseLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceIdMatrix = Matrix.fromRect(noiseLayer.rect, () => EMPTY)
        this.#surfaceIdMatrix.forEach(point => {
            const type = this.#detectSurfaceType(point)
            this.#detectBorders(type, point)
        })
    }

    #detectSurfaceType(originPoint) {
        if (this.#surfaceIdMatrix.get(originPoint) !== EMPTY)
            return
        let area = 0
        const isBelowRatio = this.#isBelowRatio(originPoint)
        const canFill = point => {
            const sameType = isBelowRatio === this.#isBelowRatio(point)
            return sameType && this.#surfaceIdMatrix.get(point) === EMPTY
        }
        const onFill = point => {
            this.#surfaceIdMatrix.set(point, this.#idCount)
            area++
        }
        const wrapPoint = point => this.#surfaceIdMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isBelowRatio ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()

        const massRatio = (area * 100) / this.#surfaceIdMatrix.area
        // area is filled; decide type
        const type = this.#buildType(isBelowRatio, massRatio)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, type)
        this.#idCount++
        return type
    }

    #isBelowRatio(point) {
        const noise = this.#noiseLayer.get(BASE_NOISE, point)
        return SURFACE_RATIO >= noise
    }

    #buildType(belowRatio, massRatio) {
        if (belowRatio) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                return Surface.OCEAN
            if (massRatio >= MINIMUN_SEA_RATIO)
                return Surface.SEA
        }
        // above ratio
        return Surface.CONTINENT
    }

    #detectBorders(type, point) {
        const isWater = this.#isBelowRatio(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#isBelowRatio(sidePoint)
            if (isWater) {
                if (! isSideWater) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (isSideWater) {
                    this.#landBorders.add(point)
                    break
                }
            }
        }
    }

    get landBorders() {
        return this.#landBorders
    }

    get waterBorders() {
        return this.#waterBorders
    }

    get(point) {
        const bodyId = this.#surfaceIdMatrix.get(point)
        return Surface.fromId(this.#typeMap.get(bodyId))
    }

    isWater(point) {
        const surface = this.get(point)
        return Surface.isWater(surface.id)
    }

    isLand(point) {
        const surface = this.get(point)
        return Surface.isLand(surface.id)
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }

    isWaterBorder(point) {
        return this.#waterBorders.has(point)
    }

    isBorder(point) {
        return this.#waterBorders.has(point) || this.#landBorders.has(point)
    }

    getArea(point) {
        const body = this.#surfaceIdMatrix.get(point)
        return (this.#areaMap.get(body) * 100) / this.#surfaceIdMatrix.area
    }
}
