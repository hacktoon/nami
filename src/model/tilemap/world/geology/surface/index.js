import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { SURFACE_RATIO, Surface } from './data'


const EMPTY = null

// Area ratios
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .12
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    // Major world bodies with area and type

    #surfaceMatrix
    #areaMap = new Map()
    #surfaceMap = new Map()
    #surfaceId = 1

    constructor(rect, layers) {
        // init matrix with empty cells
        const waterPoints = new PointSet()
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            if (SURFACE_RATIO >= layers.noise.getOutline(point)) {
                waterPoints.add(point)
            }
            return EMPTY
        })
        // detect surface regions and area
        this.#surfaceMatrix.forEach(point => {
            if (this.#isPointEmpty(point)) {
                this.#buildSurface(waterPoints, point)
            }
        })
    }

    #isPointEmpty(point) {
        return this.#surfaceMatrix.get(point) === EMPTY
    }

    #buildSurface(waterPoints, originPoint) {
        const area = this.#fillSurface(waterPoints, originPoint)
        const surfaceAreaRatio = (area * 100) / this.#surfaceMatrix.area
        let type = Surface.CONTINENT
        // area is filled; decide type
        if (waterPoints.has(originPoint)) {
            if (surfaceAreaRatio >= MINIMUN_OCEAN_RATIO)
                type = Surface.OCEAN
            else if (surfaceAreaRatio >= MINIMUN_SEA_RATIO)
                type = Surface.SEA
        } else if (surfaceAreaRatio < MINIMUN_CONTINENT_RATIO) {
            type = Surface.ISLAND
        }
        this.#surfaceMap.set(this.#surfaceId, type)
        this.#areaMap.set(this.#surfaceId, area)
        this.#surfaceId++
    }

    #fillSurface(waterPoints, originPoint) {
        let area = 0
        const isOriginWater = waterPoints.has(originPoint)
        const canFill = point => {
            const sameType = isOriginWater === waterPoints.has(point)
            return sameType && this.#isPointEmpty(point)
        }
        const onFill = point => {
            this.#surfaceMatrix.set(point, this.#surfaceId)
            area++
        }
        const wrapPoint = point => this.#surfaceMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    get(point) {
        const surfaceId = this.#surfaceMatrix.get(point)
        return Surface.fromId(this.#surfaceMap.get(surfaceId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        return `Surface(${surface.name}, area=${surfaceArea}%)`
    }

    isWater(point) {
        return this.get(point).water
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isOcean(point) {
        return this.get(point).id === Surface.OCEAN
    }

    getArea(point) {
        const surfaceId = this.#surfaceMatrix.get(point)
        return (this.#areaMap.get(surfaceId) * 100) / this.#surfaceMatrix.area
    }
}
