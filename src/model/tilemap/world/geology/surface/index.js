import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { BASE_NOISE, LAND_RATIO, Surface } from './data'


const EMPTY = null
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    #noiseLayer
    #bodyMatrix
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #areaMap = new Map()
    #typeMap = new Map()
    #idCount = 1

    constructor(noiseLayer) {
        this.#noiseLayer = noiseLayer
        this.#bodyMatrix = Matrix.fromRect(noiseLayer.rect, () => EMPTY)
        this.#bodyMatrix.forEach(point => {
            this.#detectSurfaceType(point)
            this.#detectBorders(point)
        })
    }

    #detectSurfaceType(originPoint) {
        //
        if (this.#bodyMatrix.get(originPoint) !== EMPTY)
            return
        let area = 0
        const isWater = this.#isPointWater(originPoint, LAND_RATIO)
        const canFill = point => {
            const sameType = isWater === this.#isPointWater(point, LAND_RATIO)
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

    #isPointWater(point) {
        const noise = this.#noiseLayer.get(BASE_NOISE, point)
        return noise < LAND_RATIO
    }

    #detectBorders(point) {
        const isWater = this.#isPointWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isPointWater = this.#isPointWater(sidePoint)
            if (isWater) {
                if (! isPointWater) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (isPointWater) {
                    this.#landBorders.add(point)
                    break
                }
            }
        }
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

    get landBorders() {
        return this.#landBorders
    }

    get waterBorders() {
        return this.#waterBorders
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
        const body = this.#bodyMatrix.get(point)
        return (this.#areaMap.get(body) * 100) / this.#bodyMatrix.area
    }
}
