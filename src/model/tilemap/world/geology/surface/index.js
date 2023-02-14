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
    #surfaceIdMap = new Map()
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
        const massRatio = (area * 100) / this.#surfaceMatrix.area
        let type = Surface.CONTINENT
        // area is filled; decide type
        if (waterPoints.has(originPoint)) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                type = Surface.OCEAN
            else if (massRatio >= MINIMUN_SEA_RATIO)
                type = Surface.SEA
        } else if (massRatio < MINIMUN_CONTINENT_RATIO)
            type = Surface.ISLAND
        this.#areaMap.set(this.#surfaceId, area)
        this.#surfaceIdMap.set(this.#surfaceId, type)
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
        const bodyId = this.#surfaceMatrix.get(point)
        return Surface.fromId(this.#surfaceIdMap.get(bodyId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        return `Surface(${surface.name}, area=${surfaceArea}%)`
    }

    isWater(point) {
        const bodyId = this.#surfaceMatrix.get(point)
        const surfaceId = this.#surfaceIdMap.get(bodyId)
        return Surface.isWater(surfaceId)
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isOcean(point) {
        return this.get(point).id === Surface.OCEAN
    }

    getArea(point) {
        const bodyId = this.#surfaceMatrix.get(point)
        return (this.#areaMap.get(bodyId) * 100) / this.#surfaceMatrix.area
    }
}
