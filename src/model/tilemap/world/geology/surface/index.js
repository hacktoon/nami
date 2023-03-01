import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { SURFACE_RATIO, Surface } from './data'


const EMPTY = null

// Area ratios
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .12
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    // Major world bodies with area and type

    // stores surface id for each point
    #surfaceMatrix
    // maps a surface id to its object reference
    #bodyTypeMap = new Map()
    #bodyAreaMap = new Map()
    #borders = new PointSet()

    constructor(rect, layers) {
        const waterPoints = new PointSet()
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            // detect water points with "outline" noise map
            if (SURFACE_RATIO >= layers.noise.getOutline(point)) {
                waterPoints.add(point)
            }
            // init matrix with empty cells
            return EMPTY
        })

        // detect surface body id and area
        let bodyId = 0
        this.#surfaceMatrix.forEach(point => {
            // start a fill for each empty point in matrix
            if (!this.#isPointEmpty(point)) return
            const body = this.#buildSurface(point, waterPoints, bodyId)
            this.#bodyTypeMap.set(bodyId, body.type.id)
            this.#bodyAreaMap.set(bodyId, body.area)
            bodyId++
        })

        // detect the water/land borders
        this.#surfaceMatrix.forEach(point => {
            const isWater = this.isWater(point)
            for (let sidePoint of Point.adjacents(point)) {
                const isSideWater = this.isWater(sidePoint)
                if (isWater && ! isSideWater || ! isWater && isSideWater) {
                    this.#borders.add(point)
                }
            }
        })
    }


    #isPointEmpty(point) {
        return this.#surfaceMatrix.get(point) === EMPTY
    }

    #buildSurface(originPoint, waterPoints, surfaceId) {
        const area = this.#fillSurface(waterPoints, surfaceId, originPoint)
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
        return {type, area}
    }

    #fillSurface(waterPoints, surfaceId, originPoint) {
        // discover all points of same type ( water | land )
        let area = 0
        const isOriginWater = waterPoints.has(originPoint)
        const canFill = point => {
            const sameType = isOriginWater === waterPoints.has(point)
            return sameType && this.#isPointEmpty(point)
        }
        const onFill = point => {
            this.#surfaceMatrix.set(point, surfaceId)
            area++
        }
        const wrapPoint = point => this.#surfaceMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    get landBorders() {
        const points = []
        this.#borders.forEach(point => {
            if (this.isLand(point)) points.push(point)
        })
        return points
    }

    get(point) {
        const surfaceId = this.#surfaceMatrix.get(point)
        return Surface.fromId(this.#bodyTypeMap.get(surfaceId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const type = surface.water ? 'W' : 'L'
        return `Surface(${surface.name}(${type}), area=${surfaceArea}%)`
    }

    getArea(point) {
        const surfaceId = this.#surfaceMatrix.get(point)
        const area = (this.#bodyAreaMap.get(surfaceId) * 100) / this.#surfaceMatrix.area
        return area.toFixed(1)
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

    isBorder(point) {
        return this.#borders.has(point)
    }
}
